// Collaudo del motore senza grafica: prove casuali, bot che fanno missioni, bot che affrontano i boss.
const B = require('./bricks.js'), City = require('./city.js'), Core = require('./core.js');
const DT = 1 / 30, THEMES = ['dite', 'cocito', 'malebolge'];
const rng = City.rng;
const mkInp = () => ({ mx: 0, my: 0, yaw: 0, pitch: 0, fire: false, b: [false, false, false, false, false], use: false });
function check(s, where) {
  const p = s.player, bad = (v) => !Number.isFinite(v);
  if (bad(p.x) || bad(p.z) || bad(p.hp) || bad(p.res) || bad(p.cam.y)) throw new Error('NaN giocatore ' + where);
  if (!p.ride && !p.leap && Core.solidAt(s, p.x, p.z)) throw new Error('giocatore dentro un muro ' + where + ' ' + p.x.toFixed(1) + ',' + p.z.toFixed(1));
  for (const e of s.mobs) if (bad(e.x) || bad(e.z) || bad(e.hp)) throw new Error('NaN mob ' + e.kind + ' ' + where);
  for (const c of s.npcs) if (bad(c.x) || bad(c.z)) throw new Error('NaN abitante ' + where);
  if (s.boss && (bad(s.boss.x) || bad(s.boss.hp))) throw new Error('NaN boss ' + where);
  if (s.mobs.length > 80 || s.shots.length > 300 || s.zones.length > 60 || s.teles.length > 60 || s.lobs.length > 80) throw new Error('troppe entita ' + where + ' ' + [s.mobs.length, s.shots.length, s.zones.length, s.teles.length, s.lobs.length]);
}

// ---------- 1. Prove casuali ----------
function fuzz(n) {
  let steps = 0; const t0 = Date.now(), evTypes = new Set(), kinds = new Set();
  for (let run = 0; run < n; run++) {
    const r = rng(run + 1), level = Math.floor(r() * 7), recipe = B.randomRecipe(r, B.budgetFor(level));
    const s = Core.create({ seed: 1 + Math.floor(r() * 500), theme: THEMES[run % 3], recipe, fame: B.FAME_STEPS[level] });
    const inp = mkInp(); let mode = 0;
    recipe.slots.forEach((b) => kinds.add(b.id));
    try {
      for (let f = 0; f < 30 * 70; f++) {
        if (f % 20 === 0) { inp.mx = r() * 2 - 1; inp.my = r() * 2 - 0.6; inp.yaw += (r() - 0.5) * 1.5; inp.pitch = (r() - 0.6) * 0.8; inp.fire = r() < 0.6; mode = r(); }
        for (let i = 1; i < 5; i++) inp.b[i] = r() < 0.03;
        inp.use = r() < 0.05;
        if (f === 300 && run % 4 === 0) { const A = s.city.arenas[0]; s.player.x = A.x; s.player.z = A.z + 4; Core.wakeBoss(s, 0); s.player.res = 100; }
        if (f === 200 && run % 4 === 1) { const g = s.givers[run % s.givers.length]; if (g.offer) Core.acceptQuest(s, g); }
        if (f === 900 && run % 5 === 2) Core.setRecipe(s, B.randomRecipe(r, 24));
        if (mode < 0.25 && s.mobs.length) { const e = s.mobs[0]; inp.yaw = Math.atan2(-(e.x - s.player.x), -(e.z - s.player.z)); }
        if (f % 400 === 0) s.player.res = 100;
        Core.step(s, DT, inp); steps++;
        for (const e of s.events) evTypes.add(e.type); s.events.length = 0;
        check(s, 'run ' + run + ' f ' + f + ' ricetta ' + recipe.slots.map((b) => b.id).join(','));
      }
    } catch (e) { console.log('ERRORE', e.message, '\n', (e.stack || '').split('\n').slice(1, 4).join('\n')); return false; }
  }
  console.log('prove casuali:', n, 'partite,', steps, 'passi,', ((Date.now() - t0) / steps * 1000).toFixed(1), 'microsecondi a passo | mattoncini provati', kinds.size, 'di', B.LIST.length, '| tipi di evento', evTypes.size);
  return true;
}

// ---------- Bot che sa camminare ----------
function mkBot(s) {
  const bot = { path: null, pi: 0, goal: null, rep: 0 };
  bot.goto = (inp, x, z, stopAt) => { // cammina fino a (x,z); true quando e' arrivato
    const p = s.player, d = Math.hypot(x - p.x, z - p.z);
    if (d < (stopAt || 1.5)) { inp.mx = 0; inp.my = 0; return true; }
    bot.rep -= DT;
    if (!bot.path || !bot.goal || Math.hypot(bot.goal.x - x, bot.goal.z - z) > 3 || bot.rep <= 0) { bot.path = Core.pathCells(s, p.x, p.z, x, z) || []; bot.pi = 0; bot.goal = { x, z }; bot.rep = 2; }
    while (bot.pi < bot.path.length - 1 && Math.hypot(bot.path[bot.pi].x - p.x, bot.path[bot.pi].z - p.z) < 2.2) bot.pi++;
    const c = bot.pi < bot.path.length - 1 ? bot.path[bot.pi] : { x, z };
    inp.yaw = Math.atan2(-(c.x - p.x), -(c.z - p.z)); inp.mx = 0; inp.my = 1; return false;
  };
  return bot;
}
function fight(s, inp, tg, opts) { // guarda il bersaglio, spara, usa tutto
  const p = s.player, d = Math.hypot(tg.x - p.x, tg.z - p.z);
  inp.yaw = Math.atan2(-(tg.x - p.x), -(tg.z - p.z)); inp.pitch = -Math.atan2(1.7, Math.max(2, d)); inp.fire = true;
  const k0 = s.kit[0].kind, want = k0 === 'melee' ? 2.2 + tg.r : k0 === 'cone' ? 5 + tg.r : (opts && opts.keep) || 9;
  inp.my = d > want + 1 ? 1 : d < want - 2 ? -1 : 0; inp.mx = (opts && opts.strafe) || 0;
  for (let i = 1; i < 5; i++) inp.b[i] = s.ready[i] && s.act[i] <= 0 && (i !== 1 || s.kit[1].kind !== 'cable');
}

// ---------- 2. Missioni ----------
function questRun(seed, theme, recipe, maxT) {
  const s = Core.create({ seed, theme, recipe }), inp = mkInp(), bot = mkBot(s), res = {}; let invited = 0;
  for (let f = 0; f < maxT * 30; f++) {
    const p = s.player; inp.fire = false; inp.use = false; inp.mx = 0; inp.my = 0; for (let i = 1; i < 5; i++) inp.b[i] = false;
    if (p.dead > 0) { /* aspetta */ }
    else {
      let foe = null, fd = 14; for (const e of s.mobs) if (e.team === 'e' && e.spawn <= 0) { const d = Math.hypot(e.x - p.x, e.z - p.z); if (d < fd && Core.los(s, p.x, p.z, e.x, e.z)) { fd = d; foe = e; } }
      const q = s.quest;
      if (foe && (!q || q.type !== 'corsa')) fight(s, inp, foe);
      else if (!q) { let g = null, gd = 1e9; for (const o of s.givers) if (o.offer) { const d = Math.hypot(o.x - p.x, o.z - p.z); if (d < gd) { gd = d; g = o; } } if (g && bot.goto(inp, g.x, g.z, 3)) inp.use = !!(s.hint.use && s.hint.use.kind === 'giver'); }
      else if (q.type === 'pubblico') {
        const fol = s.npcs.filter((c) => c.st === 'follow').length;
        if (fol < q.need) { let c = null, cd = 1e9; for (const o of s.npcs) if (o.st !== 'follow') { const d = Math.hypot(o.x - p.x, o.z - p.z); if (d < cd) { cd = d; c = o; } } if (c && bot.goto(inp, c.x, c.z, 2.5)) { inp.yaw = Math.atan2(-(c.x - p.x), -(c.z - p.z)); inp.use = !!(s.hint.use && s.hint.use.kind === 'npc' && s.hint.use.label[0] === 'I'); if (inp.use) invited++; } }
        else bot.goto(inp, q.obj.x, q.obj.z, 2);
      } else if (q.type === 'scorta') { const o = q.obj2 || q.obj; bot.goto(inp, o.x, o.z, 4); }
      else if (q.obj) bot.goto(inp, q.obj.x, q.obj.z, q.type === 'caccia' ? 8 : 1.2);
    }
    Core.step(s, DT, inp);
    for (const e of s.events) { if (e.type === 'questDone') res[e.titolo] = (res[e.titolo] || [0, 0]), res[e.titolo][0]++; if (e.type === 'questFail') res[e.titolo] = (res[e.titolo] || [0, 0]), res[e.titolo][1]++, res['!' + e.why] = (res['!' + e.why] || 0) + 1; }
    s.events.length = 0; check(s, 'missioni seme ' + seed);
  }
  return { res, fame: s.fame, level: s.level, deaths: s.stats.deaths };
}

// ---------- 3. Boss ----------
function bossRun(seed, theme, arena, recipe, dodge, level) {
  const s = Core.create({ seed, theme, recipe, fame: B.FAME_STEPS[level || 0] }), inp = mkInp(), A = s.city.arenas[arena], p = s.player;
  p.x = A.x; p.z = A.z + 8; p.res = 60; Core.wakeBoss(s, arena); const key = s.boss.key; let t = 0, hits = 0;
  for (let f = 0; f < 30 * 240; f++, t += DT) {
    inp.use = false; for (let i = 1; i < 5; i++) inp.b[i] = false; inp.fire = false; inp.mx = 0; inp.my = 0;
    if (!s.boss) break;
    const b = s.boss; let adds = null, ad = 9; for (const e of s.mobs) if (e.team === 'e' && e.spawn <= 0) { const d = Math.hypot(e.x - p.x, e.z - p.z); if (d < ad) { ad = d; adds = e; } }
    fight(s, inp, adds || b, { keep: 10 });
    if (dodge) { // esci dalle zone segnate: prova otto direzioni e prendi la prima sicura
      let danger = null; for (const tl of s.teles) if (tl.dmg > 0 && Core.inTele(tl, p.x, p.z, 1.4)) { danger = tl; break; }
      const zn = s.zones.find((z) => z.team === 'e' && Math.hypot(z.x - p.x, z.z - p.z) < z.r + 1);
      if (danger || zn) {
        let best = null, bs = -1e9;
        for (let k = 0; k < 16; k++) { const a = (k / 16) * 6.283; for (const R of [4, 8]) { const x = p.x + Math.sin(a) * R, z = p.z + Math.cos(a) * R; if (Core.solidAt(s, x, z) || Math.hypot(x - b.ax, z - b.az) > b.ar - 1.5) continue; let sc = -R * 0.2; for (const tl of s.teles) if (tl.dmg > 0 && Core.inTele(tl, x, z, 1.2)) sc -= 10; for (const z2 of s.zones) if (z2.team === 'e' && Math.hypot(z2.x - x, z2.z - z) < z2.r + 1) sc -= 6; if (Math.hypot(x - b.x, z - b.z) < b.r + 2) sc -= 8; if (sc > bs) { bs = sc; best = { x, z }; } } }
        if (best) { const wx = best.x - p.x, wz = best.z - p.z, cy = Math.cos(inp.yaw), sy = Math.sin(inp.yaw); inp.mx = cy * wx - sy * wz; inp.my = -sy * wx - cy * wz; const m = Math.hypot(inp.mx, inp.my) || 1; inp.mx /= m; inp.my /= m; }
      }
    }
    Core.step(s, DT, inp);
    for (const e of s.events) if (e.type === 'playerHit') hits++;
    const ev = s.events.slice(); s.events.length = 0; check(s, 'boss ' + key);
    if (ev.some((e) => e.type === 'bossDown')) return { key, win: true, t, hp: p.hp, hits };
    if (ev.some((e) => e.type === 'down')) return { key, win: false, t, hp: 0, hits, left: b.hp / b.maxHp };
  }
  return { key, win: false, t, hp: p.hp, hits, left: s.boss ? s.boss.hp / s.boss.maxHp : 0, timeout: true };
}

const mode = process.argv[2] || 'tutto', n = +process.argv[3] || 0;
if (mode === 'fuzz' || mode === 'tutto') { if (!fuzz(n || 240)) process.exit(1); }
if (mode === 'missioni' || mode === 'tutto') {
  const tot = {}; let fame = 0, deaths = 0, runs = 0;
  for (let i = 0; i < (n || 16); i++) { const r = questRun(11 + i * 3, THEMES[i % 3], B.PRESETS[i % B.PRESETS.length], 600); runs++; fame += r.fame; deaths += r.deaths; for (const k in r.res) { if (k[0] === '!') tot[k] = (tot[k] || 0) + r.res[k]; else { tot[k] = tot[k] || [0, 0]; tot[k][0] += r.res[k][0]; tot[k][1] += r.res[k][1]; } } }
  console.log('missioni (10 minuti a partita, ' + runs + ' partite): fama media', (fame / runs).toFixed(0), '| cadute medie', (deaths / runs).toFixed(1));
  for (const k in tot) console.log('  ', k.padEnd(28), Array.isArray(tot[k]) ? 'riuscite ' + tot[k][0] + '  fallite ' + tot[k][1] : tot[k]);
}
if (mode === 'boss' || mode === 'tutto') {
  for (const dodge of [true, false]) {
    console.log(dodge ? 'boss, bot che schiva:' : 'boss, bot che resta fermo sui colpi:');
    for (let a = 0; a < 3; a++) {
      let line = ''; let key = '';
      for (let pi = 0; pi < B.PRESETS.length; pi++) { let w = 0, T = 0, H = 0, N2 = n || 4; for (let k = 0; k < N2; k++) { const r = bossRun(5 + k * 7 + pi, 'dite', a, B.PRESETS[pi], dodge, 0); key = r.key; H += r.hits; if (r.win) { w++; T += r.t; } } line += ' ' + B.PRESETS[pi].nome.slice(0, 6).padEnd(6) + ' ' + w + '/' + N2 + (w ? ' ' + (T / w).toFixed(0).padStart(3) + 's' : '     ') + ' c' + (H / N2).toFixed(0).padStart(2) + ' |'; }
      console.log('  ', key.padEnd(9), line);
    }
  }
}
