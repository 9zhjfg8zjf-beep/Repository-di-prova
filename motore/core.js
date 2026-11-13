'use strict';
// MOTORE - logica pura (nessuna grafica). Esegue qualsiasi ricetta di mattoncini in qualsiasi citta' generata.
const Core = (() => {
  const B = typeof Bricks !== 'undefined' ? Bricks : require('./bricks.js');
  const CT = typeof City !== 'undefined' ? City : require('./city.js');
  const CELL = CT.CELL, N = CT.N, HALF = CT.HALF, NODE_H = CT.NODE_H, SAG = CT.SAG, EYE = 1.7, BIG = 32767;
  const MOB = {
    sgherro: { hp: 45, speed: 5.2, r: 0.7, dmg: 8, atkCd: 0.9, reach: 1.7, mass: 1 },
    tiratore: { hp: 32, speed: 4.2, r: 0.6, dmg: 7, atkCd: 2.2, reach: 1.5, keep: 11, shot: 15, mass: 0.8 },
    bruto: { hp: 240, speed: 2.8, r: 1.4, dmg: 20, atkCd: 1.6, reach: 2.5, mass: 5, heavy: true },
    spirito: { hp: 40, speed: 6.5, r: 0.55, dmg: 9, atkCd: 0.8, reach: 1.6, mass: 0.8 },
    colosso: { hp: 300, speed: 4.2, r: 1.6, dmg: 30, atkCd: 1.3, reach: 3.2, mass: 8, heavy: true },
    esca: { hp: 70, speed: 0, r: 0.6, dmg: 0, atkCd: 9, reach: 0, mass: 50, fixed: true },
    torretta: { hp: 90, speed: 0, r: 0.7, dmg: 8, atkCd: 0.45, reach: 0, mass: 50, fixed: true },
    bomba: { hp: 30, speed: 7.5, r: 0.5, dmg: 30, atkCd: 9, reach: 1.3, mass: 0.6 }, arciere: { hp: 45, speed: 4, r: 0.55, dmg: 9, atkCd: 1.1, reach: 13, mass: 0.8, shooter: true },
    guaritore: { hp: 60, speed: 6, r: 0.55, dmg: 0, atkCd: 9, reach: 0, mass: 0.8, healer: true }, muro: { hp: 160, speed: 0, r: 1.1, dmg: 0, atkCd: 9, reach: 0, mass: 50, fixed: true },
    anima: { hp: 130, speed: 3.3, r: 0.6, dmg: 0, atkCd: 9, reach: 0, mass: 2 },
  };
  const PSPEED = 7.6, NPC_N = 64;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const cellOf = (v) => Math.floor((v + HALF) / CELL), cellCenter = (c) => c * CELL - HALF + CELL / 2;
  const fwdX = (yaw) => -Math.sin(yaw), fwdZ = (yaw) => -Math.cos(yaw);
  const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

  // ---------- Mappa ----------
  // grid: 0 strada, 1 palazzo, 2 liquido, 3 ponte, 4 spiazzo
  const solidCell = (s, cx, cz) => { if (cx < 0 || cz < 0 || cx >= N || cz >= N) return true; const t = s.grid[cx + cz * N]; return t === 1 || (t === 2 && s.liqSolid); };
  const solidAt = (s, x, z) => solidCell(s, cellOf(x), cellOf(z));
  const opaqueAt = (s, x, z) => { const cx = cellOf(x), cz = cellOf(z); return cx < 0 || cz < 0 || cx >= N || cz >= N || s.grid[cx + cz * N] === 1; };
  function pushOut(o, r, bx, bz, hx, hz) {
    const qx = Math.max(bx - hx, Math.min(o.x, bx + hx)), qz = Math.max(bz - hz, Math.min(o.z, bz + hz));
    const dx = o.x - qx, dz = o.z - qz, d2 = dx * dx + dz * dz;
    if (d2 >= r * r) return;
    if (d2 < 1e-9) { const ox = hx + r - Math.abs(o.x - bx), oz = hz + r - Math.abs(o.z - bz); if (ox < oz) o.x += o.x >= bx ? ox : -ox; else o.z += o.z >= bz ? oz : -oz; }
    else { const d = Math.sqrt(d2); o.x = qx + (dx / d) * r; o.z = qz + (dz / d) * r; }
  }
  function collide(s, o, r, skipTurrets) {
    const lim = HALF - r;
    o.x = clamp(o.x, -lim, lim); o.z = clamp(o.z, -lim, lim);
    const cx = cellOf(o.x), cz = cellOf(o.z);
    for (let j = cz - 1; j <= cz + 1; j++) for (let i = cx - 1; i <= cx + 1; i++) if (solidCell(s, i, j)) pushOut(o, r, i * CELL - HALF + CELL / 2, j * CELL - HALF + CELL / 2, CELL / 2, CELL / 2);
    for (const b of s.city.props) if (Math.abs(o.x - b.x) < 4 && Math.abs(o.z - b.z) < 4) pushOut(o, r, b.x, b.z, b.hx, b.hz);
    if (!skipTurrets) for (const t of s.turrets) { const dx = o.x - t.x, dz = o.z - t.z, m = r + t.r, d2 = dx * dx + dz * dz; if (d2 < m * m && d2 > 1e-9) { const d = Math.sqrt(d2); o.x = t.x + (dx / d) * m; o.z = t.z + (dz / d) * m; } }
  }
  function los(s, x0, z0, x1, z1) {
    const dx = x1 - x0, dz = z1 - z0, n = Math.ceil(Math.hypot(dx, dz));
    for (let i = 1; i < n; i++) { const t = i / n; if (opaqueAt(s, x0 + dx * t, z0 + dz * t)) return false; }
    return true;
  }
  function angTo(p, x, z) { const dx = x - p.x, dz = z - p.z, d = Math.hypot(dx, dz) || 1; return Math.acos(clamp((fwdX(p.yaw) * dx + fwdZ(p.yaw) * dz) / d, -1, 1)); }
  function cablePoint(s, a, b, t, out) { const A = s.city.nodes[a], Bn = s.city.nodes[b]; out.x = A.x + (Bn.x - A.x) * t; out.z = A.z + (Bn.z - A.z) * t; out.y = NODE_H - SAG * 4 * t * (1 - t); return out; }
  function freeNear(s, x, z, fx, fz) { // arretra verso (fx,fz) finche' il punto e' libero
    const o = { x, z }; let dx = fx - x, dz = fz - z; const d = Math.hypot(dx, dz) || 1; dx /= d; dz /= d;
    for (let k = 0; k < d && solidAt(s, o.x, o.z); k++) { o.x += dx; o.z += dz; }
    if (solidAt(s, o.x, o.z)) { o.x = fx; o.z = fz; }
    collide(s, o, 0.6, true); return o;
  }
  function updateFlow(s) {
    const f = s.flow; f.fill(BIG);
    const cx = cellOf(s.player.x), cz = cellOf(s.player.z);
    if (solidCell(s, cx, cz)) return;
    const q = [cx + cz * N]; f[q[0]] = 0;
    for (let h = 0; h < q.length; h++) {
      const c = q[h], x = c % N, z = (c / N) | 0, d = f[c] + 1; if (d > 22) continue;
      if (!solidCell(s, x - 1, z) && f[c - 1] > d) { f[c - 1] = d; q.push(c - 1); }
      if (!solidCell(s, x + 1, z) && f[c + 1] > d) { f[c + 1] = d; q.push(c + 1); }
      if (!solidCell(s, x, z - 1) && f[c - N] > d) { f[c - N] = d; q.push(c - N); }
      if (!solidCell(s, x, z + 1) && f[c + N] > d) { f[c + N] = d; q.push(c + N); }
    }
  }
  function flowDir(s, e, out) {
    const cx = cellOf(e.x), cz = cellOf(e.z), f = s.flow;
    let best = cx >= 0 && cz >= 0 && cx < N && cz < N ? f[cx + cz * N] : BIG, bx = cx, bz = cz;
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
      if (!i && !j) continue; const x = cx + i, z = cz + j;
      if (solidCell(s, x, z) || (i && j && (solidCell(s, cx + i, cz) || solidCell(s, cx, cz + j)))) continue;
      const v = f[x + z * N] + (i && j ? 0.4 : 0); if (v < best) { best = v; bx = x; bz = z; }
    }
    if (best >= BIG) return false;
    const tx = cellCenter(bx) + (((e.id * 7) % 5) - 2) * 0.5, tz = cellCenter(bz) + (((e.id * 3) % 5) - 2) * 0.5, dx = tx - e.x, dz = tz - e.z, d = Math.hypot(dx, dz) || 1;
    out.x = dx / d; out.z = dz / d; return true;
  }
  function pathCells(s, x0, z0, x1, z1) { // cammino a celle tra due punti (per la scorta)
    const a = cellOf(x0) + cellOf(z0) * N, b = cellOf(x1) + cellOf(z1) * N, prev = new Int32Array(N * N).fill(-1), q = [a]; prev[a] = a;
    for (let h = 0; h < q.length && prev[b] < 0; h++) { const c = q[h], x = c % N, z = (c / N) | 0; for (const [i, j] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + i, Z = z + j, k = X + Z * N; if (!solidCell(s, X, Z) && prev[k] < 0) { prev[k] = c; q.push(k); } } }
    if (prev[b] < 0) return null; const out = []; for (let c = b; c !== a; c = prev[c]) out.push({ x: cellCenter(c % N), z: cellCenter((c / N) | 0) }); return out.reverse();
  }

  // ---------- Creazione ----------
  function buildKit(recipe) {
    return recipe.slots.map((b) => {
      const K = Object.assign({ id: b.id, el: b.el, t: b.t, kind: B.ARCH[b.id].kind, nome: B.ARCH[b.id].nome, ic: B.ARCH[b.id].ic, m: b.m || '' }, B.params(b));
      if (b.m) { // l'innesto viaggia insieme all'elemento: cosi' lo portano con se' proiettili, zone, mine ed evocazioni
        K.el = b.el + '+' + b.m; let dm = 1, cm = 1, sm = 1;
        if (b.m === 'rapido') { cm = 0.7; dm = K.cd ? 0.85 : 1.1; } else if (b.m === 'possente') { dm = 1.3; cm = 1.25; } else if (b.m === 'ampio') { sm = 1.3; dm = 0.92; }
        for (const k of ['dmg', 'dps', 'heal', 'abs', 'boom']) if (typeof K[k] === 'number' && k !== 'boom') K[k] *= dm;
        if (B.ARCH[b.id].slot !== 'U') K.cd *= cm;
        for (const k of ['r', 'range', 'area', 'dist', 'aura']) if (typeof K[k] === 'number') K[k] *= sm;
      }
      return K;
    });
  }
  function create(o = {}) {
    const seed = o.seed || 1, city = o.city || CT.gen(seed, o.theme || 'dite'), rand = CT.rng(seed * 7 + 13);
    const grid = new Uint8Array(N * N), code = { '.': 0, '#': 1, '~': 2, '=': 3, o: 4 };
    for (let z = 0; z < N; z++) for (let x = 0; x < N; x++) grid[x + z * N] = code[city.map[z][x]];
    const recipe = o.recipe && B.valid(o.recipe) ? o.recipe : B.PRESETS[0];
    const s = {
      t: 0, rand, city, grid, liqSolid: city.theme.liquidSolid, recipe, kit: buildKit(recipe), fame: o.fame || 0, level: B.levelFor(o.fame || 0),
      player: { x: city.spawn.x, z: city.spawn.z, yaw: Math.PI, pitch: 0, hp: 100, maxHp: 100, r: 0.6, cam: { x: city.spawn.x, y: EYE, z: city.spawn.z }, moving: false,
        cd: [0, 0, 0, 0, 0], res: 0, haste: 0, hasteMul: 1, veil: 0, veilBonus: 1, shield: 0, shieldT: 0, hot: 0, hotRate: 0, oc: 0, ocDur: 1, eclipse: 0, orbit: 0, invuln: 0,
        dash: null, leap: null, ride: null, drain: null, beam: { on: false, x: 0, y: 0, z: 0, hit: false }, cone: false, tick: 0, hurtT: 9, dead: 0, touchT: 0, fury: 0, furyMul: 1, reflect: 0, thorns: 0, reflEl: '', phoenix: 0, phK: null, grab: null, anchor: null, hist: [], histT: 0, trigs: [], cnt: {}, mem: null, lsT: 0, lsV: 0, armT: 0, armV: 1, cdrT: 0, cdrV: 1, rrT: 0, rrV: 1 },
      mobs: [], npcs: [], shots: [], zones: [], traps: [], lobs: [], teles: [], boss: null, freeze: 0,
      turrets: city.turrets.map((t, id) => ({ id, x: t.x, z: t.z, r: 1.0, yaw: 0, state: t.arena !== undefined ? 'idle' : 'hostile', idle: t.arena !== undefined, timer: 0, dur: 1, stun: 0, atk: 1 })),
      arenas: city.arenas.map((a) => ({ id: a.id, status: 'sealed', t: 0, wins: 0 })),
      givers: city.givers.map((g) => ({ id: g.id, x: g.x, z: g.z, nome: g.nome, offer: null, cool: 0, n: 0 })),
      patrols: city.patrols.map((p) => ({ x: p.x, z: p.z, t: 0, alive: 0 })),
      quest: null, done: 0, echo: [], marks: [], timers: [], firing: false, inp: null, events: [], nextId: 1, flow: new Int16Array(N * N).fill(BIG), flowT: 0,
      aim: { kind: '', id: -1, x: 0, z: 0, d: 0 }, gp: { x: 0, z: 0 }, hint: { node: -1, turret: -1, screen: -1, use: null }, act: [0, 0, 0, 0, 0], ready: [true, true, true, true, false],
      stats: { casts: [0, 0, 0, 0, 0], fizz: 0, dmg: 0, taken: 0, kills: 0, deaths: 0, quests: 0, qfail: 0, bossWins: 0, rides: 0, watch: 0 },
    };
    for (const g of s.givers) makeOffer(s, g);
    for (let i = 0; i < NPC_N; i++) {
      let x = 0, z = 0; for (let k = 0; k < 40; k++) { const cx = Math.floor(rand() * N), cz = Math.floor(rand() * N); if (grid[cx + cz * N] === 0) { x = cellCenter(cx); z = cellCenter(cz); if (!city.arenas.some((a) => Math.abs(x - a.x) < 22 && Math.abs(z - a.z) < 22)) break; } }
      s.npcs.push({ id: i, x: x + (rand() - 0.5) * 2, z: z + (rand() - 0.5) * 2, fx: 0, fz: 1, st: 'wander', t: rand() * 3, tx: x, tz: z, dx: 0, dz: 0, v: Math.floor(rand() * 4), spd: 1.3 + rand() * 0.7, off: rand() * 6.28, charm: false, moving: false });
    }
    for (const p of s.patrols) spawnPack(s, p.x, p.z, ['sgherro', 'sgherro', 'tiratore'], 'ronda', p);
    return s;
  }
  function setRecipe(s, recipe) { if (!B.valid(recipe)) return false; s.recipe = recipe; s.kit = buildKit(recipe); const p = s.player; p.cd = [0, 0, 0, 0, 0]; p.beam.on = false; p.cone = false; p.drain = null; dropGrab(s); if (p.anchor) { const z = s.zones.find((o) => o.id === p.anchor.zid); if (z) z.t = z.dur; p.anchor = null; } s.echo.length = 0; p.trigs.length = 0; p.cnt = {}; s.timers.length = 0; s.marks.length = 0; return true; }
  function dropGrab(s) { const p = s.player; if (!p.grab) return; const e = findMob(s, p.grab.id); if (e) e.held = false; p.grab = null; }

  function mkMob(s, kind, x, z, team, extra) {
    const d = MOB[kind], hostile = team === 'e', k = hostile ? 1 + 0.1 * s.level : 1, o = { x, z };
    collide(s, o, d.r, true);
    const e = Object.assign({ id: s.nextId++, kind, team, x: o.x, z: o.z, hx: o.x, hz: o.z, hp: d.hp * k, maxHp: d.hp * k, r: d.r, kx: 0, kz: 0, fx: 0, fz: 1, atk: 0.4 + s.rand() * 0.6, spawn: 0.5, life: 0,
      stun: 0, root: 0, slowT: 0, slow: 0, burnT: 0, burn: 0, pois: 0, poisT: 0, weakT: 0, fearT: 0, markT: 0, markMul: 1, chill: 0, shockCd: 0, charm: 0, dotT: 0.5, aggro: 0, tt: 0, tg: null,
      dead: false, moving: false, wasMoving: false, px: o.x, pz: o.z, pt: 0.5, dodge: 0, ds: 1, tag: '', pull: null }, extra || {});
    s.mobs.push(e); return e;
  }
  function spawnPack(s, x, z, kinds, tag, owner) {
    kinds.forEach((k, i) => { const a = (i / kinds.length) * 6.28, e = mkMob(s, k, x + Math.sin(a) * 1.8, z + Math.cos(a) * 1.8, 'e', { tag, owner: owner || null }); e.spawn = 0.4 + i * 0.12; });
    if (owner) owner.alive = kinds.length;
  }

  // ---------- Danni e stati ----------
  function gainRes(s, n) { const p = s.player; if (p.oc > 0) return; if (p.rrT > 0) n *= p.rrV; p.res = Math.min(100, p.res + n); }
  function gainFame(s, n, why) {
    s.fame += n; const l = B.levelFor(s.fame); s.events.push({ type: 'fame', n, why, fame: s.fame });
    if (l > s.level) { s.level = l; s.events.push({ type: 'level', level: l, budget: B.budgetFor(l) }); }
  }
  function healPlayer(s, n) { const p = s.player; if (p.dead > 0 || n <= 0) return; p.hp = Math.min(p.maxHp, p.hp + n); }
  // h: { dmg, el, src: 'p' | 'ally' | 'dot', knock, stun, fx, fz, tick }
  function applyHit(s, e, h) {
    if (e.dead || (e.boss && s.boss !== e)) return 0;
    const p = s.player, heavy = e.boss || MOB[e.kind].heavy; let d = h.dmg;
    let el = h.el || '', mod = ''; const plus = el.indexOf('+'); if (plus > 0) { mod = h.sub ? '' : el.slice(plus + 1); el = el.slice(0, plus); }
    if (h.src === 'p') {
      if (p.oc > 0) d *= 1.3;
      if (p.fury > 0) d *= p.furyMul;
      if (p.lsT > 0 && !h.sub) healPlayer(s, d * p.lsV);
      if (p.veil > 0 && !h.tick) { d *= p.veilBonus; p.veil = 0; s.events.push({ type: 'unveil' }); }
      if (el === 'sangue' && e.hp < e.maxHp * 0.3) d *= 1.35;
    }
    if (e.markT > 0) d *= e.markMul;
    if (mod) { if (mod === 'critico') { if (!h.tick && s.rand() < 0.25) d *= 2; } else if (mod === 'ammazzagiganti') { if (heavy) d *= 1.25; } else if (mod === 'falciante') { if (!heavy) d *= 1.3; } }
    e.hp -= d; e.aggro = 8;
    const k = h.tick ? 0.25 : 1;
    if (el && h.src !== 'dot') {
      if (el === 'folgore') { if (!heavy && e.shockCd <= 0) { e.stun = Math.max(e.stun, 0.35); e.shockCd = 1.6; } }
      else if (el === 'fuoco') { e.burnT = 3; e.burn = Math.max(e.burn, h.tick ? 7 : 4 + d * 0.2); }
      else if (el === 'gelo') { e.slowT = 2.5; e.slow = Math.max(e.slow, e.boss ? 0.2 : 0.4); e.chill += k; if (e.chill >= 4 && !heavy) { e.stun = Math.max(e.stun, 1.5); e.chill = -3; s.events.push({ type: 'freeze', id: e.id, x: e.x, z: e.z }); } }
      else if (el === 'ombra') e.weakT = 4;
      else if (el === 'veleno') { e.pois = Math.min(6, e.pois + k); e.poisT = 5; }
      else if (el === 'luce') healPlayer(s, d * 0.045);
      else if (el === 'sangue') healPlayer(s, d * 0.05);
    }
    let kn = h.knock || 0; if (el === 'vento' && h.src !== 'dot') kn += h.tick ? 1.5 : 7;
    if (kn && !e.boss && !MOB[e.kind].fixed && h.fx !== undefined) { const dx = e.x - h.fx, dz = e.z - h.fz, dd = Math.hypot(dx, dz) || 1, m = MOB[e.kind].mass; e.kx += ((dx / dd) * kn) / m; e.kz += ((dz / dd) * kn) / m; }
    if (h.stun && !e.boss && (!heavy || h.hard)) e.stun = Math.max(e.stun, heavy ? h.stun * 0.4 : h.stun);
    if (h.src !== 'ally' || e.team === 'e') { s.stats.dmg += d; if (h.src === 'p' || h.src === 'dot') gainRes(s, d * 0.045); else gainRes(s, d * 0.02); }
    s.events.push({ type: 'hit', id: e.id, x: e.x, z: e.z, dmg: d, el: el || '', boss: !!e.boss, tick: !!h.tick || h.src === 'dot', r: e.r });
    if (mod) {
      const k2 = h.tick ? 0.25 : 1, fixed = e.boss || MOB[e.kind].fixed, sub = (o, dm) => applyHit(s, o, { dmg: dm, el, src: h.src, sub: true });
      if (mod === 'vampirico') healPlayer(s, d * 0.08);
      else if (mod === 'benedetto') { p.shield = Math.min(Math.max(p.shield, 40), p.shield + d * 0.08); p.shieldT = Math.max(p.shieldT, 3); }
      else if (mod === 'risonante') gainRes(s, d * 0.045);
      else if (mod === 'frenetico') { for (let c = 1; c < 4; c++) if (p.cd[c] > 0) p.cd[c] -= 0.12 * k2; }
      else if (mod === 'marchiante') { if (e.markT <= 0) { e.markT = 3; e.markMul = 1.2; } }
      else if (mod === 'stordente') { if (!heavy && !h.tick && e.shockCd <= 0) { e.stun = Math.max(e.stun, 0.45); e.shockCd = 2; } }
      else if (mod === 'calamita') { if (!fixed) { const dx = p.x - e.x, dz = p.z - e.z, dd = Math.hypot(dx, dz) || 1; if (dd > 2.5) { e.kx += ((dx / dd) * 5 * k2) / MOB[e.kind].mass; e.kz += ((dz / dd) * 5 * k2) / MOB[e.kind].mass; } } }
      else if (!h.tick) {
        if (mod === 'esplosivo') { hostiles(s, (o) => { if (o !== e && Math.hypot(o.x - e.x, o.z - e.z) < 2.8 + o.r) sub(o, d * 0.35); }); s.events.push({ type: 'ring', x: e.x, z: e.z, r: 1.6, c: el }); }
        else if (mod === 'rimbalzo') { let nx = null, nd = 8; hostiles(s, (o) => { if (o === e || o.dead) return; const dd = Math.hypot(o.x - e.x, o.z - e.z); if (dd < nd) { nd = dd; nx = o; } }); if (nx) { s.events.push({ type: 'arc', x0: e.x, z0: e.z, x1: nx.x, z1: nx.z, el }); sub(nx, d * 0.5); } }
        else if (mod === 'persistente') { if (s.zones.length < 26 && !s.zones.some((z) => z.mini && Math.hypot(z.x - e.x, z.z - e.z) < 1.8)) s.zones.push({ id: s.nextId++, team: 'p', kind: 'dmg', x: e.x, z: e.z, r: 2, t: 0, dur: 3, dps: 8, el, tick: 0, mini: true }); }
      }
      if (mod === 'contagio' && e.hp <= 0 && !e.boss && !e.dead) { s.events.push({ type: 'boom', x: e.x, z: e.z, r: 4, el }); hostiles(s, (o) => { if (o !== e && Math.hypot(o.x - e.x, o.z - e.z) < 4 + o.r) sub(o, 25); }); }
    }
    if (h.src === 'p' && !h.tick && !h.sub && !h.trig && p.trigs.length) fire(s, 'hit', e.x, e.z, e);
    if (e.hp <= 0) { if (e.boss) bossDown(s, e); else killMob(s, e, h.src); }
    return d;
  }
  function killMob(s, e, src) {
    if (e.dead) return; e.dead = true;
    s.events.push({ type: 'kill', id: e.id, kind: e.kind, x: e.x, z: e.z, team: e.team, src: src || '' });
    if (e.kind === 'esca') explodeDecoy(s, e);
    if (e.pd) mobDie(s, e);
    if (e.team === 'e' && s.player.trigs.length) fire(s, 'kill', e.x, e.z, null);
    if (e.team === 'e' || e.charm > 0) { s.stats.kills++; gainRes(s, MOB[e.kind].heavy ? 10 : 4); if (e.owner && e.owner.alive > 0 && --e.owner.alive === 0) e.owner.t = 70; if (e.tag === 'q' && s.quest) s.quest.left = Math.max(0, (s.quest.left || 0) - 1); }
    if (e.kind === 'anima' && s.quest && s.quest.type === 'scorta') failQuest(s, 'L\'anima non ce l\'ha fatta');
  }
  function explodeDecoy(s, e) { if (e.boom) return; e.boom = true; s.events.push({ type: 'boom', x: e.x, z: e.z, r: e.br || 4, el: e.el }); areaHit(s, e.x, e.z, e.br || 4, { dmg: e.bd || 30, el: e.el, src: 'p', knock: 8, fx: e.x, fz: e.z }); }
  function damagePlayer(s, dmg, sx, sz, src, by) {
    const p = s.player;
    if (p.dead > 0 || p.ride || p.leap || p.dash || p.eclipse > 0 || p.invuln > 0) return;
    if (src && src.weakT > 0) dmg *= src.boss ? 0.8 : 0.65;
    if (p.reflect > 0 && src && !src.boss && src.kind && !src.dead) applyHit(s, src, { dmg: dmg * p.thorns, el: p.reflEl, src: 'p', sub: true });
    if (p.oc > 0) dmg *= 0.75;
    if (p.armT > 0) dmg *= p.armV;
    if (p.shield > 0) { const a = Math.min(p.shield, dmg); p.shield -= a; dmg -= a; s.events.push({ type: 'shieldHit', a }); if (p.shield <= 0) { p.shield = 0; p.shieldT = 0; s.events.push({ type: 'shieldEnd' }); } if (dmg <= 0) return; }
    p.hp -= dmg; p.hurtT = 0; s.stats.taken += dmg;
    s.events.push({ type: 'playerHit', dmg, sx, sz, by: by || '' });
    if (p.hp > 0 && p.trigs.length) fire(s, 'hurt', sx === undefined ? p.x : sx, sz === undefined ? p.z : sz, src && src.kind ? src : null);
    if (p.hp <= 0 && p.phoenix > 0) { const K = p.phK; p.phoenix = 0; p.hp = p.maxHp * 0.5; p.invuln = 1.5; areaHit(s, p.x, p.z, K.r, { dmg: K.dmg, el: K.el, src: 'p', knock: 14, stun: 1.2, fx: p.x, fz: p.z }); s.events.push({ type: 'boom', x: p.x, z: p.z, r: K.r, el: K.el, self: true, big: true }); s.events.push({ type: 'msg', text: 'La fenice ti rialza' }); return; }
    if (p.hp <= 0) {
      dropGrab(s); p.hp = 0; p.dead = 3; p.beam.on = false; p.cone = false; p.drain = null; s.stats.deaths++;
      s.events.push({ type: 'down' });
      if (s.quest) failQuest(s, 'Sei caduto');
      if (s.boss) resetBoss(s, 'Sei caduto');
    }
  }
  function hostiles(s, fn) { for (const e of s.mobs) if (e.team === 'e' && !e.dead && e.spawn <= 0) fn(e); if (s.boss && !s.boss.dead) fn(s.boss); }
  function areaHit(s, x, z, r, h) {
    let n = 0; hostiles(s, (e) => { if (Math.hypot(e.x - x, e.z - z) < r + e.r) { applyHit(s, e, h); n++; } });
    for (const t of s.turrets) if (t.state === 'hostile' && Math.hypot(t.x - x, t.z - z) < r + t.r) t.stun = 2.5;
    return n;
  }
  function coneHit(s, range, half, h, needLos) {
    const p = s.player; let n = 0;
    hostiles(s, (e) => { const d = Math.hypot(e.x - p.x, e.z - p.z); if (d > range + e.r) return; if (d > e.r + 1 && angTo(p, e.x, e.z) > half + Math.atan2(e.r, d)) return; if (needLos && !los(s, p.x, p.z, e.x, e.z)) return; applyHit(s, e, h); n++; });
    for (const t of s.turrets) if (t.state === 'hostile' && Math.hypot(t.x - p.x, t.z - p.z) < range && angTo(p, t.x, t.z) < half) t.stun = 2.5;
    return n;
  }
  const findMob = (s, id) => { for (const e of s.mobs) if (e.id === id) return e; return null; };
  function aimed(s, range) { const a = s.aim; if (!a.kind || a.d > range) return null; if (a.kind === 'b') return s.boss; if (a.kind === 'e') return findMob(s, a.id); return null; }
  function groundPoint(s, range, out) {
    const p = s.player, a = s.aim;
    if (a.kind && a.d <= range) { out.x = a.x; out.z = a.z; return out; }
    let d = p.pitch < -0.04 ? EYE / Math.tan(-p.pitch) : range; d = clamp(d, 2.5, range);
    const fx = fwdX(p.yaw), fz = fwdZ(p.yaw); let k = 0;
    for (; k < d; k += 1) if (opaqueAt(s, p.x + fx * (k + 1), p.z + fz * (k + 1))) break;
    k = Math.min(k, d); out.x = p.x + fx * k; out.z = p.z + fz * k; return out;
  }

  // ---------- Missioni ----------
  const QT = ['consegna', 'caccia', 'corsa', 'ripetitori', 'pubblico', 'scorta'];
  const QINFO = {
    consegna: { titolo: 'Consegna', testo: 'Porta il pacco prima che scada il tempo.', fama: 8 },
    caccia: { titolo: 'Caccia', testo: 'Una banda infesta il quartiere. Toglila di mezzo.', fama: 12 },
    corsa: { titolo: 'Corsa', testo: 'Passa per tutti gli anelli prima che scada il tempo.', fama: 10 },
    ripetitori: { titolo: 'Ripetitori', testo: 'Riaccendi tre ripetitori restando nel cerchio.', fama: 10 },
    pubblico: { titolo: 'Pubblico', testo: 'Porta degli abitanti in piazza, sotto lo schermo.', fama: 10 },
    scorta: { titolo: 'Scorta', testo: 'Accompagna un\'anima a destinazione e tienila viva.', fama: 14 },
  };
  function makeOffer(s, g) { const type = QT[(g.id * 2 + g.n * 5 + Math.floor(s.rand() * 2)) % QT.length]; g.n++; g.offer = { type, titolo: QINFO[type].titolo, testo: QINFO[type].testo, fama: QINFO[type].fama + 2 * s.level }; }
  function farSpot(s, x, z, dMin, dMax, list) { const L = list || s.city.crossings; for (let k = 0; k < 80; k++) { const c = L[Math.floor(s.rand() * L.length)], d = Math.hypot(c.x - x, c.z - z); if (d >= dMin && d <= dMax) return c; } let best = L[0], bd = 1e9; for (const c of L) { const e = Math.abs(Math.hypot(c.x - x, c.z - z) - (dMin + dMax) / 2); if (e < bd) { bd = e; best = c; } } return best; }
  function acceptQuest(s, g) {
    const o = g.offer, p = s.player, q = { type: o.type, giver: g.id, titolo: o.titolo, fama: o.fama, time: 0, obj: null, pts: null, i: 0, hold: 0, left: 0, need: 0, have: 0, line: '', sub: '' };
    if (o.type === 'consegna') { const c = farSpot(s, g.x, g.z, 60, 110); q.obj = { x: c.x, z: c.z }; q.time = Math.hypot(c.x - g.x, c.z - g.z) / 4.6 + 14; }
    else if (o.type === 'caccia') { const c = farSpot(s, g.x, g.z, 45, 90, s.city.spots); q.obj = { x: c.x, z: c.z }; const kinds = ['sgherro', 'sgherro', 'sgherro', 'tiratore', 'tiratore']; if (s.level >= 1) kinds.push('sgherro'); if (s.level >= 2) kinds.push('bruto'); spawnPack(s, c.x, c.z, kinds, 'q'); q.left = kinds.length; }
    else if (o.type === 'corsa') { q.pts = []; let cx = g.x, cz = g.z, len = 0; for (let k = 0; k < 7; k++) { let c = null; for (let t = 0; t < 30; t++) { c = farSpot(s, cx, cz, 20, 40); if (!q.pts.some((o2) => Math.hypot(o2.x - c.x, o2.z - c.z) < 12)) break; } len += Math.hypot(c.x - cx, c.z - cz); cx = c.x; cz = c.z; q.pts.push({ x: cx, z: cz }); } q.time = len / 4.4 + 12; q.obj = q.pts[0]; }
    else if (o.type === 'ripetitori') { q.pts = []; for (let k = 0; k < 3; k++) { let c = null; for (let t = 0; t < 30; t++) { c = farSpot(s, g.x, g.z, 28, 85, s.city.spots); if (!q.pts.some((o2) => Math.hypot(o2.x - c.x, o2.z - c.z) < 24)) break; } q.pts.push({ x: c.x, z: c.z, on: false, guard: k > 0, woke: false }); } q.obj = q.pts[0]; }
    else if (o.type === 'pubblico') { q.need = Math.min(7, 4 + Math.floor(s.level / 2)); q.obj = { x: 0, z: 9 }; }
    else if (o.type === 'scorta') {
      const c = farSpot(s, g.x, g.z, 70, 120), path = pathCells(s, g.x, g.z, c.x, c.z);
      if (!path || path.length < 6) { q.type = 'consegna'; q.titolo = QINFO.consegna.titolo; q.obj = { x: c.x, z: c.z }; q.time = 40; }
      else { const a = mkMob(s, 'anima', g.x + 1.5, g.z, 'a', { path, pi: 0, tag: 'scorta' }); a.spawn = 0; q.anima = a.id; q.obj = { x: c.x, z: c.z }; q.amb = [Math.floor(path.length * 0.3), Math.floor(path.length * 0.55), Math.floor(path.length * 0.8)]; }
    }
    s.quest = q; g.offer = null; s.events.push({ type: 'questStart', q: q.type, titolo: q.titolo, giver: g.id });
  }
  function clearQuestMobs(s) { for (const e of s.mobs) if ((e.tag === 'q' || e.tag === 'scorta') && !e.dead) { e.dead = true; s.events.push({ type: 'vanish', id: e.id, x: e.x, z: e.z }); } }
  function endQuest(s) { const q = s.quest; clearQuestMobs(s); const g = s.givers[q.giver]; g.cool = 6; s.quest = null; }
  function failQuest(s, why) { if (!s.quest) return; s.stats.qfail++; s.events.push({ type: 'questFail', why, titolo: s.quest.titolo }); endQuest(s); }
  function winQuest(s) { const q = s.quest; s.stats.quests++; s.done++; s.events.push({ type: 'questDone', titolo: q.titolo, fama: q.fama }); gainRes(s, 35); endQuest(s); gainFame(s, q.fama, 'missione'); }
  function updateQuest(s, dt) {
    for (const g of s.givers) if (!g.offer && (!s.quest || s.quest.giver !== g.id)) { g.cool -= dt; if (g.cool <= 0) makeOffer(s, g); }
    const q = s.quest, p = s.player; if (!q) return;
    if (q.time > 0) { q.time -= dt; if (q.time <= 0) return failQuest(s, 'Tempo scaduto'); }
    const near = (o, r) => !p.ride && Math.hypot(p.x - o.x, p.z - o.z) < r;
    if (q.type === 'consegna') { q.line = 'Consegna il pacco'; if (near(q.obj, 3.5)) winQuest(s); }
    else if (q.type === 'caccia') { q.line = 'Banda: ne restano ' + q.left; if (q.left <= 0) winQuest(s); }
    else if (q.type === 'corsa') { q.line = 'Anello ' + (q.i + 1) + ' di ' + q.pts.length; if (near(q.obj, 4)) { q.i++; s.events.push({ type: 'ring', x: q.obj.x, z: q.obj.z, r: 4, c: 'quest' }); s.events.push({ type: 'step' }); if (q.i >= q.pts.length) return winQuest(s); q.obj = q.pts[q.i]; } }
    else if (q.type === 'ripetitori') {
      const pt = q.pts[q.i]; q.line = 'Ripetitore ' + (q.i + 1) + ' di 3';
      if (pt.guard && !pt.woke && Math.hypot(p.x - pt.x, p.z - pt.z) < 30) { pt.woke = true; spawnPack(s, pt.x, pt.z, ['sgherro', 'sgherro', 'tiratore'], 'q'); }
      if (near(pt, 3.2)) { q.hold += dt; if (q.hold >= 1.6) { pt.on = true; q.hold = 0; q.i++; s.events.push({ type: 'ring', x: pt.x, z: pt.z, r: 5, c: 'quest' }); s.events.push({ type: 'step' }); if (q.i >= 3) return winQuest(s); q.obj = q.pts[q.i]; } } else q.hold = Math.max(0, q.hold - dt * 2);
    } else if (q.type === 'pubblico') {
      let n = 0, f = 0; for (const c of s.npcs) if (c.st === 'follow') { f++; if (Math.hypot(c.x, c.z - 2) < 16) n++; }
      q.have = n; q.line = f < q.need ? 'Abitanti al seguito: ' + f + ' di ' + q.need : 'In piazza: ' + n + ' di ' + q.need;
      if (n >= q.need && Math.hypot(p.x, p.z) < 18) { for (const c of s.npcs) if (c.st === 'follow') { c.st = 'watch'; c.t = 6; c.charm = false; } winQuest(s); }
    } else if (q.type === 'scorta') {
      const a = findMob(s, q.anima); if (!a || a.dead) return;
      q.line = 'Scorta: vita ' + Math.max(0, Math.round((a.hp / a.maxHp) * 100)) + '%'; q.obj2 = { x: a.x, z: a.z };
      while (q.amb.length && a.pi >= q.amb[0]) { q.amb.shift(); const k = Math.min(a.path.length - 1, a.pi + 4), c = a.path[k]; for (const e of [mkMob(s, 'sgherro', c.x + 1, c.z, 'e', { tag: 'q' }), mkMob(s, 'sgherro', c.x - 1, c.z, 'e', { tag: 'q' }), mkMob(s, 'tiratore', c.x, c.z + 1, 'e', { tag: 'q' })]) { e.aggro = 999; e.hunt = a.id; } s.events.push({ type: 'ambush', x: c.x, z: c.z }); }
      if (a.pi >= a.path.length) winQuest(s);
    }
  }

  // ---------- Boss ----------
  function wakeBoss(s, k) {
    const A = s.city.arenas[k], def = B.BOSSES[A.boss], st = s.arenas[k], hp = def.hp * (1 + 0.15 * st.wins);
    st.status = 'active';
    s.boss = { boss: true, id: s.nextId++, key: A.boss, def, arena: k, ax: A.x, az: A.z, ar: A.r, x: A.x, z: A.z - (def.move === 'anchor' ? 0 : 6), r: def.r, kind: 'boss', team: 'e', hp, maxHp: hp, yaw: 0, phase: 0, seqI: 0, wait: 2.2, busy: 0, dash: null, out: 0, tx: A.x, tz: A.z, mt: 0,
      stun: 0, root: 0, slowT: 0, slow: 0, burnT: 0, burn: 0, pois: 0, poisT: 0, weakT: 0, fearT: 0, markT: 0, markMul: 1, chill: 0, shockCd: 0, charm: 0, dotT: 0.5, aggro: 0, dead: false, spawn: 0, cast: '' };
    s.events.push({ type: 'bossStart', key: A.boss, nome: def.nome, titolo: def.titolo, x: s.boss.x, z: s.boss.z });
  }
  function clearBossStuff(s) { s.teles.length = 0; s.zones = s.zones.filter((z) => z.team !== 'e'); for (const e of s.mobs) if (e.tag === 'add' && !e.dead) { e.dead = true; s.events.push({ type: 'vanish', id: e.id, x: e.x, z: e.z }); } }
  function resetBoss(s, why) { const b = s.boss; if (!b) return; s.arenas[b.arena].status = 'sealed'; s.arenas[b.arena].t = 4; clearBossStuff(s); s.boss = null; s.events.push({ type: 'bossReset', why }); }
  function bossDown(s, b) {
    if (b.dead) return; b.dead = true; const st = s.arenas[b.arena]; st.status = 'cleared'; st.t = 75; st.wins++; s.stats.bossWins++;
    clearBossStuff(s); s.boss = null;
    s.events.push({ type: 'bossDown', key: b.key, nome: b.def.nome, x: b.x, z: b.z });
    healPlayer(s, 40); gainFame(s, Math.round(b.def.fame * (st.wins > 1 ? 0.4 : 1)), 'boss');
  }
  function bossCast(s, b, id) {
    const a = B.ATK[id], p = s.player, rnd = s.rand, ang = Math.atan2(p.x - b.x, p.z - b.z), dm = (a.dmg || 0) * 1.1 * (1 + 0.06 * s.level);
    const T = (o) => { s.teles.push(Object.assign({ id: s.nextId++, t: 0, dmg: dm, el: b.def.el, atk: id, shape: 'circle', x: b.x, z: b.z, ang: 0, r: 0, r0: 0, half: 0, len: 0, w: 0, wind: a.wind, then: '' }, o)); return o.wind || a.wind; };
    let end = a.wind;
    const inA = (x, z) => { const dx = x - b.ax, dz = z - b.az, d = Math.hypot(dx, dz), m = b.ar - 1.5; return d > m ? { x: b.ax + (dx / d) * m, z: b.az + (dz / d) * m } : { x, z }; };
    if (a.shape === 'circle') T({ x: p.x, z: p.z, r: a.r });
    else if (a.shape === 'line') T({ shape: 'line', ang, len: a.len, w: a.w });
    else if (a.shape === 'charge') { let len = 6; for (; len < a.len; len += 1) { const x = b.x + Math.sin(ang) * (len + 1), z = b.z + Math.cos(ang) * (len + 1); if (Math.hypot(x - b.ax, z - b.az) > b.ar - b.r) break; } T({ shape: 'line', ang, len, w: a.w, then: 'charge' }); }
    else if (a.shape === 'rain') for (let i = 0; i < a.n; i++) { const c = i === 0 ? { x: p.x, z: p.z } : inA(p.x + (rnd() - 0.5) * 2 * a.spread, p.z + (rnd() - 0.5) * 2 * a.spread); end = T({ x: c.x, z: c.z, r: a.r, wind: a.wind + i * a.gap }); }
    else if (a.shape === 'ring') T({ shape: 'donut', r0: b.r + 3.6, r: a.r1 });
    else if (a.shape === 'rings') { const st = (a.r1 - 1) / 3; for (let i = 0; i < a.n; i++) end = T(i === 0 ? { r: st + 1, wind: a.wind } : { shape: 'donut', r0: 1 + st * i, r: 1 + st * (i + 1), wind: a.wind + i * a.gap }); }
    else if (a.shape === 'summon') T({ r: b.r + 1.5, dmg: 0, then: 'summon', n: a.n });
    else if (a.shape === 'cone') { const offs = a.n === 3 ? [-a.gapA, 0, a.gapA] : [0]; for (const o of offs) T({ shape: 'cone', ang: ang + o, half: a.half, r: a.range }); }
    else if (a.shape === 'sweep') { const sg = rnd() < 0.5 ? 1 : -1; for (let i = 0; i < a.n; i++) end = T({ shape: 'line', ang: ang + sg * (-a.arc / 2 + (a.arc * i) / (a.n - 1)), len: a.len, w: a.w, wind: a.wind + i * a.gap }); }
    else if (a.shape === 'cross') for (let k = 0; k < 4; k++) T({ shape: 'line', ang: ang + (k * Math.PI) / 2, len: a.len, w: a.w });
    else if (a.shape === 'pools') for (let i = 0; i < a.n; i++) { const c = i === 0 ? { x: p.x, z: p.z } : inA(p.x + (rnd() - 0.5) * 2 * a.spread, p.z + (rnd() - 0.5) * 2 * a.spread); T({ x: c.x, z: c.z, r: a.r, dmg: 8, then: 'pool', dur: a.dur, dps: a.dps }); }
    b.busy = end + 0.4; b.cast = a.nome; b.yaw = ang;
    s.events.push({ type: 'bossCast', atk: id, nome: a.nome, wind: a.wind });
  }
  function inTele(t, x, z, pad) {
    const dx = x - t.x, dz = z - t.z, d = Math.hypot(dx, dz);
    if (t.shape === 'circle') return d < t.r + pad;
    if (t.shape === 'donut') return d > t.r0 - pad && d < t.r + pad;
    if (t.shape === 'cone') { if (d > t.r + pad) return false; if (d < 0.5) return true; let da = Math.atan2(dx, dz) - t.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); return Math.abs(da) < t.half + Math.atan2(pad, d); }
    const sx = Math.sin(t.ang), sz = Math.cos(t.ang), al = dx * sx + dz * sz, pe = Math.abs(dx * sz - dz * sx); return al > -pad && al < t.len + pad && pe < t.w / 2 + pad;
  }
  function updateBoss(s, dt) {
    const p = s.player;
    for (const st of s.arenas) if (st.status !== 'active' && st.t > 0) { st.t -= dt; if (st.t <= 0 && st.status === 'cleared') st.status = 'sealed'; }
    const b = s.boss; if (!b) return;
    const dC = Math.hypot(p.x - b.ax, p.z - b.az);
    if (dC > b.ar + 9 || p.ride) { b.out += dt; if (b.out > 5) return resetBoss(s, 'Hai lasciato l\'arena'); } else b.out = 0;
    if (s.freeze > 0) return;
    tickStatus(s, b, dt);
    if (b.dead) return;
    const frac = b.hp / b.maxHp, F = b.def.fasi; let ph = 0; while (ph < F.length - 1 && frac <= F[ph].fino) ph++;
    if (ph > b.phase) { b.phase = ph; b.seqI = 0; b.wait = Math.max(b.wait, 1.6); s.events.push({ type: 'bossPhase', phase: ph, x: b.x, z: b.z }); healPlayer(s, 30); gainRes(s, 20); }
    // i cerchi a terra: avviso, poi colpo
    for (const t of s.teles) {
      t.t += dt; if (t.t < t.wind) continue; t.done = true;
      s.events.push({ type: 'teleHit', shape: t.shape, x: t.x, z: t.z, ang: t.ang, r: t.r, r0: t.r0, half: t.half, len: t.len, w: t.w, el: t.el });
      if (t.dmg > 0) { if (!p.ride && p.dead <= 0 && inTele(t, p.x, p.z, p.r * 0.5)) damagePlayer(s, t.dmg, b.x, b.z, b, t.atk); for (const e of s.mobs) if (e.team === 'a' && !e.dead && inTele(t, e.x, e.z, e.r)) applyHit(s, e, { dmg: t.dmg * 0.6, src: 'ally' }); }
      if (t.then === 'pool') s.zones.push({ id: s.nextId++, team: 'e', kind: 'dmg', x: t.x, z: t.z, r: t.r, t: 0, dur: t.dur, dps: t.dps, el: t.el, tick: 0 });
      else if (t.then === 'summon') { const n = t.n + (b.phase > 1 ? 1 : 0); for (let i = 0; i < n; i++) { const a = s.rand() * 6.28, e = mkMob(s, i === 2 && b.phase > 0 ? 'tiratore' : 'sgherro', b.ax + Math.sin(a) * (b.ar - 3), b.az + Math.cos(a) * (b.ar - 3), 'e', { tag: 'add' }); e.aggro = 999; } }
      else if (t.then === 'charge') b.dash = { x0: b.x, z0: b.z, x1: t.x + Math.sin(t.ang) * t.len, z1: t.z + Math.cos(t.ang) * t.len, t: 0, T: 0.32 };
    }
    if (s.teles.some((t) => t.done)) s.teles = s.teles.filter((t) => !t.done);
    if (!s.boss) return;
    if (b.dash) { const d = b.dash; d.t += dt; const k = Math.min(1, d.t / d.T); b.x = d.x0 + (d.x1 - d.x0) * k; b.z = d.z0 + (d.z1 - d.z0) * k; if (k >= 1) b.dash = null; }
    else if (b.stun > 0) { /* esita */ }
    else if (b.busy > 0) b.busy -= dt;
    else {
      b.cast = '';
      const sl = b.slowT > 0 ? 1 - b.slow : 1, dx = p.x - b.x, dz = p.z - b.z, d = Math.hypot(dx, dz) || 1;
      b.yaw = Math.atan2(dx, dz);
      if (b.def.move === 'walk') { if (d > 7) { b.x += (dx / d) * b.def.speed * sl * dt; b.z += (dz / d) * b.def.speed * sl * dt; } }
      else if (b.def.move === 'fly') { b.mt -= dt; if (b.mt <= 0) { b.mt = 3.5; const a = s.rand() * 6.28; b.tx = b.ax + Math.sin(a) * 10; b.tz = b.az + Math.cos(a) * 10; } const ex = b.tx - b.x, ez = b.tz - b.z, ed = Math.hypot(ex, ez); if (ed > 0.5) { b.x += (ex / ed) * b.def.speed * sl * dt; b.z += (ez / ed) * b.def.speed * sl * dt; } }
      b.wait -= dt * sl;
      if (b.wait <= 0 && p.dead <= 0) { const seq = F[b.phase].seq; bossCast(s, b, seq[b.seqI % seq.length]); b.seqI++; b.wait = F[b.phase].pausa; }
    }
    const ex = b.x - b.ax, ez = b.z - b.az, ed = Math.hypot(ex, ez), m = b.ar - b.r - 0.5; if (ed > m) { b.x = b.ax + (ex / ed) * m; b.z = b.az + (ez / ed) * m; }
    const d = Math.hypot(p.x - b.x, p.z - b.z), min = b.r + p.r;
    if (d < min && !p.ride && !p.leap && p.dead <= 0) { const nx = (p.x - b.x) / (d || 1), nz = (p.z - b.z) / (d || 1); p.x = b.x + nx * min; p.z = b.z + nz * min; collide(s, p, p.r); p.touchT -= dt; if (p.touchT <= 0) { p.touchT = 0.7; damagePlayer(s, b.def.touch, b.x, b.z, b, 'contatto'); } }
  }
  function tickStatus(s, e, dt) {
    if (e.stun > 0) e.stun -= dt; if (e.root > 0) e.root -= dt; if (e.weakT > 0) e.weakT -= dt; if (e.fearT > 0) e.fearT -= dt; if (e.markT > 0) e.markT -= dt; if (e.shockCd > 0) e.shockCd -= dt;
    if (e.slowT > 0) { e.slowT -= dt; if (e.slowT <= 0) e.slow = 0; }
    if (e.chill > 0) e.chill = Math.max(0, e.chill - dt * 0.5); else if (e.chill < 0) e.chill = Math.min(0, e.chill + dt);
    if (e.burnT > 0 || e.poisT > 0) {
      e.dotT -= dt;
      if (e.dotT <= 0) { e.dotT = 0.5; const d = ((e.burnT > 0 ? e.burn : 0) + (e.poisT > 0 ? e.pois * 2.2 : 0)) * 0.5; if (d > 0) applyHit(s, e, { dmg: d, src: 'dot', el: e.burnT > 0 ? 'fuoco' : 'veleno' }); }
      if (e.burnT > 0) { e.burnT -= dt; if (e.burnT <= 0) e.burn = 0; } if (e.poisT > 0) { e.poisT -= dt; if (e.poisT <= 0) e.pois = 0; }
    }
  }

  // ---------- Cavi ----------
  function pickNode(s) {
    const p = s.player; let best = -1, bs = 1e9;
    for (const n of s.city.nodes) { const d = Math.hypot(n.x - p.x, n.z - p.z); let sc; if (d < 5) sc = d * 0.1; else if (d < 24) { const a = angTo(p, n.x, n.z); if (a > 0.6) continue; sc = 1 + a * 10 + d * 0.05; } else continue; if (sc < bs) { bs = sc; best = n.id; } }
    return best;
  }
  function nextNode(s, a, prev) {
    const p = s.player, A = s.city.nodes[a], adj = s.city.adj[a]; let best = -1, bd = -9;
    for (const b of adj) { if (b === prev && adj.length > 1) continue; const Bn = s.city.nodes[b], dx = Bn.x - A.x, dz = Bn.z - A.z, d = Math.hypot(dx, dz), dot = (fwdX(p.yaw) * dx + fwdZ(p.yaw) * dz) / d; if (dot > bd) { bd = dot; best = b; } }
    return best;
  }
  function updateRide(s, dt, inp) {
    const p = s.player, r = p.ride, c = p.cam, K = r.k, nodes = s.city.nodes;
    if (inp.b[1] && r.phase === 'run' && r.time > 0.25) r.wantExit = true;
    r.time += dt;
    if (r.phase === 'in') {
      r.t += dt / 0.22; const k = Math.min(1, r.t), A = nodes[r.a];
      c.x = r.sx + (A.x - r.sx) * k; c.z = r.sz + (A.z - r.sz) * k; c.y = EYE + (A.y - EYE) * k * k;
      if (r.t >= 1) { r.phase = 'run'; r.b = nextNode(s, r.a, -1); r.t = 0; s.events.push({ type: 'node', id: r.a }); }
    } else if (r.phase === 'run') {
      const A = nodes[r.a], Bn = nodes[r.b], len = Math.hypot(Bn.x - A.x, Bn.z - A.z);
      r.t += ((K.speed * (p.oc > 0 ? 1.25 : 1)) * dt) / len; healPlayer(s, 5 * dt);
      if (r.t >= 1) { const prev = r.a; r.a = r.b; r.b = nextNode(s, r.a, prev); r.t = 0; s.events.push({ type: 'node', id: r.a }); }
      cablePoint(s, r.a, r.b, r.t, c);
      if ((r.wantExit || r.time > 9) && !solidAt(s, c.x, c.z)) { r.phase = 'out'; r.t = 0; r.sx = c.x; r.sy = c.y; r.sz = c.z; s.events.push({ type: 'drop' }); }
    } else {
      r.t += dt / 0.16; const k = Math.min(1, r.t); c.x = r.sx; c.z = r.sz; c.y = r.sy + (EYE - r.sy) * k * k;
      if (r.t >= 1) {
        p.x = c.x; p.z = c.z; collide(s, p, p.r); c.x = p.x; c.z = p.z; c.y = EYE; p.ride = null; p.cd[1] = K.cd; p.invuln = Math.max(p.invuln, 0.4);
        areaHit(s, p.x, p.z, K.r, { dmg: K.dmg, el: K.el, src: 'p', knock: 12, stun: 1.2, fx: p.x, fz: p.z });
        s.events.push({ type: 'strike', x: p.x, z: p.z, r: K.r, el: K.el }); return;
      }
    }
    p.x = c.x; p.z = c.z;
  }

  // ---------- Poteri ----------
  const GP = { x: 0, z: 0 }, GENU = { zone: 1, summon: 1, strike: 1, orbit: 1, shield: 1 }, NOECHO = { cable: 1, charm: 1, possess: 1, grab: 1, anchor: 1, rewind: 1, swap: 1, reset: 1, oc: 1, rage: 1, phoenix: 1, timestop: 1, eclipse: 1, sacr: 1 };
  function audience(s) { // gli abitanti si fermano a guardare: e' cosi' che cresce la Risonanza fuori dai combattimenti
    const p = s.player; let danger = false; hostiles(s, (e) => { if (Math.hypot(e.x - p.x, e.z - p.z) < 16) danger = true; }); if (danger) return;
    let n = 0; for (const c of s.npcs) if ((c.st === 'wander' || c.st === 'watch') && Math.hypot(c.x - p.x, c.z - p.z) < 15 && los(s, c.x, c.z, p.x, p.z)) { c.st = 'watch'; c.t = 3 + s.rand() * 2; n++; }
    if (n) { gainRes(s, Math.min(8, n * 1.5)); s.stats.watch += n; s.events.push({ type: 'watch', n }); }
  }
  function scare(s, x, z, r, t) { for (const c of s.npcs) if (c.st !== 'follow' && Math.hypot(c.x - x, c.z - z) < r) { c.st = 'flee'; c.t = t; c.dx = c.x - x; c.dz = c.z - z; } }
  function primary(s, dt, fire) {
    const p = s.player, K = s.kit[0], oc = p.oc > 0, fx = fwdX(p.yaw), fz = fwdZ(p.yaw);
    p.beam.on = false; p.cone = false;
    if (!fire) return;
    const hit = (dmg, o) => Object.assign({ dmg, el: K.el, src: 'p', fx: p.x, fz: p.z }, o);
    if (K.kind === 'beam' || K.kind === 'cone') {
      p.tick -= dt; const doTick = p.tick <= 0; if (doTick) p.tick = 0.12;
      if (K.kind === 'cone') { p.cone = true; if (doTick) { coneHit(s, K.range, K.half, hit(K.dps * 0.12, { tick: true }), true); s.stats.casts[0]++; } return; }
      let bt = K.range, tgt = null, tur = null;
      for (let k = 1; k <= K.range; k++) if (opaqueAt(s, p.x + fx * k, p.z + fz * k)) { bt = k - 0.5; break; }
      hostiles(s, (e) => { const dx = e.x - p.x, dz = e.z - p.z, al = dx * fx + dz * fz; if (al < 0.3 || al > bt) return; if (Math.abs(dx * fz - dz * fx) < e.r + 0.55) { bt = al; tgt = e; } });
      for (const t of s.turrets) { if (t.state !== 'hostile') continue; const dx = t.x - p.x, dz = t.z - p.z, al = dx * fx + dz * fz; if (al < 0.3 || al > bt) continue; if (Math.abs(dx * fz - dz * fx) < t.r + 0.4) { bt = al; tgt = null; tur = t; } }
      p.beam.on = true; p.beam.x = p.x + fx * bt; p.beam.z = p.z + fz * bt; p.beam.y = tgt ? (tgt.boss ? 2.2 : 1.2) : EYE + Math.tan(clamp(p.pitch, -1, 1)) * bt; p.beam.hit = !!(tgt || tur);
      if (doTick) { if (tgt) applyHit(s, tgt, hit(K.dps * 0.12, { tick: true })); if (tur) tur.stun = 2.5; s.stats.casts[0]++; }
      return;
    }
    if (p.cd[0] > 0) return;
    if (K.kind === 'x') { const r = run(s, K.prog, { K, slot: 0, depth: 0 }); p.cd[0] = Math.max(0.08, K.cd) * (oc ? 0.7 : 1); s.stats.casts[0]++; if (typeof r === 'string') s.events.push({ type: 'miss', el: K.el }); else s.events.push({ type: 'cast', slot: 0, kind: 'proj', el: K.el }); return; }
    p.cd[0] = K.cd * (oc ? 0.7 : 1); s.stats.casts[0]++; if (K.m === 'eco' && s.rand() < 0.3) p.cd[0] = 0.07;
    if (K.kind === 'proj') {
      const a = s.aim; let dx = fx, dz = fz; if (a.kind) { dx = (a.x - p.x) / (a.d || 1); dz = (a.z - p.z) / (a.d || 1); }
      const base = Math.atan2(dx, dz);
      for (let i = 0; i < K.n; i++) { const an = base + (K.spread || 0) * (i - (K.n - 1) / 2) + (K.jit ? (s.rand() - 0.5) * 2 * K.jit : 0); s.shots.push({ id: s.nextId++, team: 'p', x: p.x + Math.sin(an) * 0.8, z: p.z + Math.cos(an) * 0.8, vx: Math.sin(an) * K.speed, vz: Math.cos(an) * K.speed, life: K.life || 26 / K.speed + (K.homing ? 0.5 : 0), dmg: K.dmg, el: K.el, r: K.aura ? 0.9 : 0.45, hom: K.homing ? a.kind + a.id : '', w: 0, hitSet: K.pierce ? new Set() : null, boom: K.boom || 0, back: K.back || 0, bnc: K.bnc || 0, aura: K.aura || 0, at: 0 }); }
      s.events.push({ type: 'cast', slot: 0, kind: K.kind, el: K.el });
    } else if (K.kind === 'chain') {
      const a = s.aim, pts = [];
      if (!a.kind || a.d > K.range) { s.events.push({ type: 'miss', el: K.el }); return; }
      if (a.kind === 't') { const t = s.turrets[a.id]; t.stun = 2.5; pts.push({ x: t.x, z: t.z, y: 1.3 }); }
      else { let cur = aimed(s, K.range), d = K.dmg; const seen = new Set(); for (let k = 0; cur && k <= K.chain + (oc ? 2 : 0); k++) { seen.add(cur.id); pts.push({ x: cur.x, z: cur.z, y: cur.boss ? 2.4 : 1.1 }); applyHit(s, cur, hit(d, { knock: k ? 1 : 2.5 })); d *= 0.65; let nx = null, nd = 7.5; hostiles(s, (e) => { if (seen.has(e.id) || e.dead) return; const dd = Math.hypot(e.x - cur.x, e.z - cur.z) - e.r; if (dd < nd) { nd = dd; nx = e; } }); cur = nx; } }
      s.events.push({ type: 'chain', pts, el: K.el }); s.events.push({ type: 'cast', slot: 0, kind: K.kind, el: K.el });
    } else if (K.kind === 'melee') {
      const n = coneHit(s, K.range, K.half, hit(K.dmg, { knock: 4, stun: K.stun || 0 }), false);
      s.events.push({ type: 'swing', el: K.el, n }); s.events.push({ type: 'cast', slot: 0, kind: K.kind, el: K.el });
    } else if (K.kind === 'mortar') {
      groundPoint(s, K.range, GP); const d = Math.hypot(GP.x - p.x, GP.z - p.z);
      s.lobs.push({ id: s.nextId++, x: GP.x, z: GP.z, x0: p.x, z0: p.z, r: K.r, t: 0, T: 0.45 + d / 45, dmg: K.dmg, el: K.el, stun: 0, arc: true });
      s.events.push({ type: 'cast', slot: 0, kind: K.kind, el: K.el });
    }
  }
  // Ritorna true se il potere e' partito (e va messo in ricarica).
  function cast(s, i, inp) {
    const p = s.player, K = s.kit[i], k = K.kind, fx = fwdX(p.yaw), fz = fwdZ(p.yaw), oc = p.oc > 0;
    const hit = (dmg, o) => Object.assign({ dmg, el: K.el, src: 'p', fx: p.x, fz: p.z }, o);
    const fizz = (why) => { s.stats.fizz++; s.events.push({ type: 'fizzle', slot: i, why }); return false; };
    const ev = (o) => s.events.push(o);
    if (k === 'x') { const r = run(s, K.prog, { K, slot: i, depth: 0 }); return typeof r === 'string' ? fizz(r) : true; }
    switch (k) {
      // --- mobilita'
      case 'dash': { let dx = fx, dz = fz; const m = Math.hypot(inp.mx, inp.my); if (m > 0.3) { const cy = Math.cos(p.yaw), sy = Math.sin(p.yaw); dx = (cy * inp.mx - sy * inp.my) / m; dz = (-sy * inp.mx - cy * inp.my) / m; } p.dash = { dx, dz, t: 0, T: K.dist > 12.5 ? 0.26 : 0.17, dist: K.dist, hit: new Set(), dmg: K.dmg, el: K.el }; if (K.trail) for (let q = 1; q <= 3; q++) { const x = p.x + dx * K.dist * (q / 3.4), z = p.z + dz * K.dist * (q / 3.4); if (!solidAt(s, x, z)) s.zones.push({ id: s.nextId++, team: 'p', kind: 'dmg', x, z, r: 2.2, t: 0, dur: 4, dps: K.trail, el: K.el, tick: 0.2 * q }); } ev({ type: 'dash', el: K.el }); return true; }
      case 'blink': { groundPoint(s, K.range, GP); const o = freeNear(s, GP.x, GP.z, p.x, p.z), x0 = p.x, z0 = p.z; if (Math.hypot(o.x - p.x, o.z - p.z) < 1.5) return fizz('Nessun punto libero'); p.x = o.x; p.z = o.z; areaHit(s, p.x, p.z, K.r, hit(K.dmg, { knock: 5 })); ev({ type: 'blink', x0, z0, x1: p.x, z1: p.z, el: K.el, r: K.r }); return true; }
      case 'leap': { groundPoint(s, K.range, GP); const o = freeNear(s, GP.x, GP.z, p.x, p.z), d = Math.hypot(o.x - p.x, o.z - p.z); if (d < 2) return fizz('Nessun punto libero'); p.leap = K.flat ? { x0: p.x, z0: p.z, x1: o.x, z1: o.z, t: 0, T: 0.12 + d / 70, h: 0.6, dmg: 0, r: 0, el: K.el } : { x0: p.x, z0: p.z, x1: o.x, z1: o.z, t: 0, T: 0.42 + d / 55, h: 2.5 + d * 0.22, dmg: K.dmg, r: K.r, el: K.el }; ev({ type: 'leap', el: K.el }); return true; }
      case 'cable': { if (s.hint.node < 0) return fizz('Nessun nodo vicino'); p.ride = { phase: 'in', a: s.hint.node, b: -1, t: 0, time: 0, sx: p.x, sz: p.z, sy: EYE, wantExit: false, k: K }; s.stats.rides++; ev({ type: 'ride', node: s.hint.node, el: K.el }); return false; }
      case 'haste': p.haste = K.dur; p.hasteMul = K.mul; ev({ type: 'buff', what: 'haste', el: K.el }); return true;
      case 'veil': p.veil = K.dur; p.veilBonus = K.bonus; for (const e of s.mobs) if (e.team === 'e') e.aggro = 0; ev({ type: 'buff', what: 'veil', el: K.el }); return true;
      // --- abilita'
      case 'nova': areaHit(s, p.x, p.z, K.r, hit(K.dmg, { knock: K.knock, stun: 0.5 })); ev({ type: 'boom', x: p.x, z: p.z, r: K.r, el: K.el, self: true }); return true;
      case 'zone': groundPoint(s, K.range, GP); s.zones.push({ id: s.nextId++, team: 'p', kind: 'dmg', x: GP.x, z: GP.z, r: K.r, t: 0, dur: K.dur, dps: K.dps, el: K.el, tick: 0, pull: K.pull || 0, heal: K.heal || 0, fury: K.fury || 0, ward: K.ward || 0, boom: K.boom || 0 }); ev({ type: 'place', what: 'zone', x: GP.x, z: GP.z, el: K.el }); return true;
      case 'trap': { groundPoint(s, 7, GP); const o = freeNear(s, GP.x, GP.z, p.x, p.z); const mine = s.traps.filter((t) => t.el !== undefined); if (mine.length >= 3) mine[0].life = 0; s.traps.push({ id: s.nextId++, x: o.x, z: o.z, r: K.r, arm: 0.6, life: 45, dmg: K.dmg, stun: K.stun, el: K.el }); ev({ type: 'place', what: 'trap', x: o.x, z: o.z, el: K.el }); return true; }
      case 'shield': p.shield = K.abs; p.shieldT = K.dur; ev({ type: 'buff', what: 'shield', el: K.el }); return true;
      case 'heal': if (p.hp >= p.maxHp - 1) return fizz('Sei gia in piena salute'); p.hot = K.dur; p.hotRate = K.heal / K.dur; ev({ type: 'buff', what: 'heal', el: K.el }); return true;
      case 'charm': {
        const ch = s.mobs.filter((e) => !e.dead && e.charm > 0), fol = s.npcs.filter((c) => c.st === 'follow' && c.charm);
        if (ch.length || fol.length) { // ripremi per rilasciare
          let left = 0; for (const e of ch) { left = Math.max(left, e.charm); e.charm = 0; e.team = 'e'; e.stun = Math.max(e.stun, 1); } for (const c of fol) { c.st = 'wander'; c.charm = false; c.t = 0; }
          p.cd[i] = Math.max(1.5, p.cd[i] - K.cd * 0.6 * Math.min(1, left / K.dur)); ev({ type: 'release', slot: i, what: 'charm' }); return false;
        }
        if (p.cd[i] > 0) return false;
        const ok = (e) => e.team === 'e' && !e.dead && e.spawn <= 0 && !MOB[e.kind].heavy; let tg = [], sc = -1;
        if (s.hint.screen >= 0) { const S = s.city.screens[s.hint.screen]; sc = s.hint.screen; tg = s.mobs.filter((e) => ok(e) && Math.hypot(e.x - S.x, e.z - S.z) < S.r + 2).slice(0, K.max + 4); }
        if (!tg.length) tg = s.mobs.filter(ok).map((e) => ({ e, d: Math.hypot(e.x - p.x, e.z - p.z) })).filter((o) => o.d < K.range && angTo(p, o.e.x, o.e.z) < 1.0 && los(s, p.x, p.z, o.e.x, o.e.z)).sort((a, b) => a.d - b.d).slice(0, K.max).map((o) => o.e);
        const dur = K.dur * (oc ? 1.4 : 1); for (const e of tg) { e.charm = dur; e.team = 'a'; e.stun = 0; e.fearT = 0; e.tg = null; }
        const R = sc >= 0 ? s.city.screens[sc].r : K.range, cx = sc >= 0 ? s.city.screens[sc].x : p.x, cz = sc >= 0 ? s.city.screens[sc].z : p.z; let nf = 0;
        for (const c of s.npcs) if (c.st !== 'follow' && nf < K.max + (sc >= 0 ? 4 : 0) && Math.hypot(c.x - cx, c.z - cz) < R && (sc >= 0 || angTo(p, c.x, c.z) < 1.1)) { c.st = 'follow'; c.t = dur * 4; c.charm = true; nf++; }
        if (!tg.length && !nf) return fizz('Nessuno a portata');
        if (s.boss && Math.hypot(s.boss.x - p.x, s.boss.z - p.z) < K.range + s.boss.r) s.boss.weakT = 4;
        gainRes(s, 3 * tg.length + nf); ev({ type: 'charm', n: tg.length, npcs: nf, screen: sc, el: K.el }); return true;
      }
      case 'fear': { let n = 0; hostiles(s, (e) => { if (Math.hypot(e.x - p.x, e.z - p.z) < K.r + e.r) { if (e.boss) e.weakT = 4; else if (!MOB[e.kind].heavy) e.fearT = K.dur; else e.slowT = K.dur, e.slow = 0.5; n++; } }); scare(s, p.x, p.z, K.r, K.dur); ev({ type: 'boom', x: p.x, z: p.z, r: K.r, el: K.el, self: true, soft: true }); return true; }
      case 'root': { const p0 = { n: 0 }; hostiles(s, (e) => { const d = Math.hypot(e.x - p.x, e.z - p.z); if (d < K.range + e.r && (d < e.r + 1 || angTo(p, e.x, e.z) < K.half) && los(s, p.x, p.z, e.x, e.z)) { applyHit(s, e, hit(K.dmg)); if (!e.dead) { if (e.boss) { e.slowT = K.dur; e.slow = 0.35; } else e.root = K.dur; ev({ type: 'rooted', id: e.id, x: e.x, z: e.z, dur: K.dur, el: K.el }); } p0.n++; } }); ev({ type: 'coneFx', range: K.range, half: K.half, el: K.el }); return true; }
      case 'pull': {
        const a = s.aim; if (!a.kind || a.d > K.range) return fizz('Nessun bersaglio');
        if (a.kind === 'b' || a.kind === 't') { const d = Math.max(0, a.d - (a.kind === 'b' ? s.boss.r + 1.5 : 2)); p.dash = { dx: (a.x - p.x) / a.d, dz: (a.z - p.z) / a.d, t: 0, T: 0.2, dist: d, hit: new Set(), dmg: 0, el: K.el }; if (a.kind === 'b') applyHit(s, s.boss, hit(K.dmg)); else s.turrets[a.id].stun = 2.5; ev({ type: 'tether', x: a.x, z: a.z, el: K.el }); return true; }
        const e = aimed(s, K.range); if (!e) return fizz('Nessun bersaglio');
        applyHit(s, e, hit(K.dmg, { stun: K.stun, hard: true })); if (!e.dead && !MOB[e.kind].fixed) e.pull = { x: p.x + fx * (1.6 + e.r), z: p.z + fz * (1.6 + e.r), t: 0 };
        ev({ type: 'tether', x: e.x, z: e.z, el: K.el }); return true;
      }
      case 'push': coneHit(s, K.range, K.half, hit(K.dmg, { knock: K.knock, stun: 0.4 }), true); ev({ type: 'coneFx', range: K.range, half: K.half, el: K.el }); return true;
      case 'summon': for (let n = 0; n < K.n; n++) { const a = p.yaw + 2.2 + n * 1.3, e = mkMob(s, 'spirito', p.x + Math.sin(a) * 2, p.z + Math.cos(a) * 2, 'a', { el: K.el, life: K.dur, bd: K.dmg }); e.hp = e.maxHp = K.hp; e.spawn = 0.25; } ev({ type: 'summon', el: K.el, n: K.n }); return true;
      case 'decoy': { const e = mkMob(s, 'esca', p.x, p.z, 'a', { el: K.el, life: K.dur, bd: K.dmg, br: K.r }); e.spawn = 0; ev({ type: 'summon', el: K.el, n: 1, decoy: true }); return true; }
      case 'possess': {
        const own = s.turrets.filter((t) => t.state === 'owned');
        if (own.length) { let f = 0; for (const t of own) { f = Math.max(f, t.timer / t.dur); t.state = 'reboot'; t.timer = 2; } p.cd[i] = Math.max(1.5, p.cd[i] - K.cd * 0.6 * Math.min(1, f)); ev({ type: 'release', slot: i, what: 'possess' }); return false; }
        if (p.cd[i] > 0) return false; if (s.hint.turret < 0) return fizz('Nessuna sentinella a portata');
        const t = s.turrets[s.hint.turret]; t.state = 'owned'; t.timer = t.dur = K.dur * (oc ? 1.4 : 1); t.stun = 0; t.atk = 0.2; t.el = K.el; gainRes(s, 5); ev({ type: 'possess', id: t.id, el: K.el }); return true;
      }
      case 'mark': { const e = aimed(s, 30); if (!e) return fizz('Nessun bersaglio'); e.markT = K.dur; e.markMul = K.mul; ev({ type: 'marked', id: e.id, x: e.x, z: e.z, dur: K.dur, el: K.el, boss: !!e.boss }); return true; }
      case 'orbit': p.orbit = K.dur; p.orbitK = K; ev({ type: 'buff', what: 'orbit', el: K.el }); return true;
      case 'strike': groundPoint(s, K.range, GP); s.lobs.push({ id: s.nextId++, x: GP.x, z: GP.z, x0: GP.x, z0: GP.z, r: K.r, t: 0, T: K.delay, dmg: K.dmg, el: K.el, stun: 0.8, arc: false }); ev({ type: 'place', what: 'strike', x: GP.x, z: GP.z, el: K.el }); return true;
      case 'drain': { const e = aimed(s, K.range); if (!e) return fizz('Nessun bersaglio'); p.drain = { id: e.id, boss: !!e.boss, t: K.dur, k: K, tick: 0 }; ev({ type: 'buff', what: 'drain', el: K.el }); return true; }
      case 'bubble': groundPoint(s, K.range, GP); s.zones.push({ id: s.nextId++, team: 'p', kind: 'slow', x: GP.x, z: GP.z, r: K.r, t: 0, dur: K.dur, dps: 0, el: K.el, tick: 0 }); ev({ type: 'place', what: 'bubble', x: GP.x, z: GP.z, el: K.el }); return true;
      case 'sentry': { const o = freeNear(s, p.x + fx * 2.2, p.z + fz * 2.2, p.x, p.z); for (const e of s.mobs) if (e.kind === 'torretta' && !e.dead) e.life = 0.01; const e = mkMob(s, 'torretta', o.x, o.z, 'a', { el: K.el, life: K.dur, bd: K.dmg }); e.spawn = 0.3; ev({ type: 'summon', el: K.el, n: 1 }); return true; }
      case 'wave': s.shots.push({ id: s.nextId++, team: 'p', x: p.x + fx, z: p.z + fz, vx: fx * 30, vz: fz * 30, life: K.range / 30, dmg: K.dmg, el: K.el, r: K.w, hom: '', w: K.w, hitSet: new Set() }); ev({ type: 'cast', slot: i, kind: 'wave', el: K.el }); return true;
      // --- seconda ondata
      case 'behind': { const e = s.aim.kind === 'b' ? s.boss : aimed(s, K.range); if (!e || s.aim.d > K.range) return fizz('Nessun bersaglio'); const dx = (e.x - p.x) / (s.aim.d || 1), dz = (e.z - p.z) / (s.aim.d || 1), o = freeNear(s, e.x + dx * (e.r + 1.5), e.z + dz * (e.r + 1.5), p.x, p.z), x0 = p.x, z0 = p.z; p.x = o.x; p.z = o.z; ev({ type: 'blink', x0, z0, x1: p.x, z1: p.z, el: K.el, r: 1.5 }); ev({ type: 'face', x: e.x, z: e.z }); applyHit(s, e, hit(K.dmg, { stun: 0.5 })); return true; }
      case 'backflip': areaHit(s, p.x, p.z, K.r, hit(K.dmg, { knock: 10, stun: 0.5 })); ev({ type: 'boom', x: p.x, z: p.z, r: K.r, el: K.el, self: true }); p.dash = { dx: -fx, dz: -fz, t: 0, T: 0.22, dist: K.dist, hit: new Set(), dmg: 0, el: K.el }; ev({ type: 'dash', el: K.el }); return true;
      case 'rewind': { const h0 = p.hist[0]; if (!h0 || solidAt(s, h0.x, h0.z)) return fizz('Niente da riavvolgere'); const x0 = p.x, z0 = p.z; p.x = h0.x; p.z = h0.z; p.hp = Math.max(p.hp, h0.hp); ev({ type: 'blink', x0, z0, x1: p.x, z1: p.z, el: K.el, r: 2 }); return true; }
      case 'anchor': {
        if (p.anchor) { const A = p.anchor, x0 = p.x, z0 = p.z, z = s.zones.find((o) => o.id === A.zid); if (z) z.t = z.dur; p.x = A.x; p.z = A.z; p.anchor = null; areaHit(s, p.x, p.z, K.r, hit(K.dmg, { knock: 6 })); ev({ type: 'blink', x0, z0, x1: p.x, z1: p.z, el: K.el, r: K.r }); p.cd[i] = K.cd; ev({ type: 'release', slot: i, what: 'anchor' }); return false; }
        if (p.cd[i] > 0) return false; const zid = s.nextId++; s.zones.push({ id: zid, team: 'p', kind: 'dmg', x: p.x, z: p.z, r: 1.3, t: 0, dur: 90, dps: 0, el: K.el, tick: 0 }); p.anchor = { x: p.x, z: p.z, zid, slot: i }; ev({ type: 'place', what: 'anchor', x: p.x, z: p.z, el: K.el }); ev({ type: 'cast', slot: i, kind: k, el: K.el }); return false;
      }
      case 'grab': {
        if (p.grab) { const e = findMob(s, p.grab.id); p.grab = null; if (e && !e.dead) { e.held = false; e.thrown = { vx: fx * 28, vz: fz * 28, t: 0.75, dmg: K.dmg, r: K.r, el: K.el }; } p.cd[i] = K.cd; ev({ type: 'release', slot: i, what: 'grab' }); return false; }
        if (p.cd[i] > 0) return false; const a = s.aim; if (!a.kind || a.d > K.range) return fizz('Nessun bersaglio');
        ev({ type: 'tether', x: a.x, z: a.z, el: K.el });
        if (a.kind === 't') { s.turrets[a.id].stun = 4; return true; }
        const e = a.kind === 'b' ? s.boss : aimed(s, K.range); if (!e) return fizz('Nessun bersaglio');
        if (e.boss || MOB[e.kind].heavy || MOB[e.kind].fixed) { applyHit(s, e, hit(K.dmg)); if (!e.dead) { e.slowT = 2.5; e.slow = Math.max(e.slow, 0.4); } return true; }
        e.held = true; e.thrown = null; e.pull = null; e.stun = Math.max(e.stun, K.hold + 0.5); p.grab = { id: e.id, t: K.hold, k: K, slot: i }; ev({ type: 'cast', slot: i, kind: k, el: K.el }); return false;
      }
      case 'swap': { const e = aimed(s, K.range); if (!e) return fizz('Nessun bersaglio'); if (e.boss || MOB[e.kind].heavy || MOB[e.kind].fixed) return fizz('Troppo pesante'); const x0 = p.x, z0 = p.z; p.x = e.x; p.z = e.z; e.x = x0; e.z = z0; collide(s, p, p.r); applyHit(s, e, hit(K.dmg, { stun: K.stun })); ev({ type: 'blink', x0, z0, x1: p.x, z1: p.z, el: K.el, r: 2 }); ev({ type: 'face', x: x0, z: z0 }); return true; }
      case 'quake': for (let n = 0; n < K.n; n++) { const x = p.x + fx * (4 + n * 3.4), z = p.z + fz * (4 + n * 3.4); if (opaqueAt(s, x, z)) break; s.lobs.push({ id: s.nextId++, x, z, x0: x, z0: z, r: K.r, t: 0, T: 0.15 + n * 0.14, dmg: K.dmg, el: K.el, stun: 0.6, arc: false, low: true }); } ev({ type: 'cast', slot: i, kind: 'wave', el: K.el }); return true;
      case 'cluster': for (let n = 0; n < K.n; n++) { const a = Math.atan2(fx, fz) + (n - (K.n - 1) / 2) * 0.55, o = freeNear(s, p.x + Math.sin(a) * 6.5, p.z + Math.cos(a) * 6.5, p.x, p.z); s.traps.push({ id: s.nextId++, x: o.x, z: o.z, r: K.r, arm: 0.6, life: 45, dmg: K.dmg, stun: K.stun, el: K.el }); ev({ type: 'place', what: 'trap', x: o.x, z: o.z, el: K.el }); } while (s.traps.length > 9) s.traps.shift(); return true;
      case 'poly': { const e = s.aim.kind === 'b' ? s.boss : aimed(s, 26); if (!e) return fizz('Nessun bersaglio'); if (e.boss || MOB[e.kind].heavy) e.weakT = K.dur + 2; else { e.poly = K.dur; e.fearT = K.dur; e.tg = null; } ev({ type: 'marked', id: e.id, x: e.x, z: e.z, dur: K.dur, el: K.el, boss: !!e.boss }); return true; }
      case 'lift': hostiles(s, (e) => { const d = Math.hypot(e.x - p.x, e.z - p.z); if (d > K.range + e.r || (d > e.r + 1 && angTo(p, e.x, e.z) > K.half) || !los(s, p.x, p.z, e.x, e.z)) return; if (e.boss || MOB[e.kind].heavy || MOB[e.kind].fixed) applyHit(s, e, hit(K.dmg * 0.6)); else { e.stun = Math.max(e.stun, K.dur); e.lift = K.dur; e.liftD = K.dmg; e.liftEl = K.el; } }); ev({ type: 'coneFx', range: K.range, half: K.half, el: K.el }); return true;
      case 'reflect': p.reflect = K.dur; p.thorns = K.thorns; p.reflEl = K.el; ev({ type: 'buff', what: 'shield', el: K.el }); return true;
      case 'snare': groundPoint(s, K.range, GP); hostiles(s, (e) => { if (Math.hypot(e.x - GP.x, e.z - GP.z) > K.r + e.r) return; if (e.boss) { e.slowT = K.dur; e.slow = Math.max(e.slow, 0.35); } else e.root = Math.max(e.root, K.dur); ev({ type: 'rooted', id: e.id, x: e.x, z: e.z, dur: K.dur, el: K.el }); }); ev({ type: 'boom', x: GP.x, z: GP.z, r: K.r, el: K.el, soft: true }); return true;
      case 'taunt': { let n = 0; hostiles(s, (e) => { if (Math.hypot(e.x - p.x, e.z - p.z) < K.r + e.r) { e.aggro = Math.max(e.aggro, 8); if (!e.boss) { e.tg = p; e.tt = 2; } n++; } }); p.shield = Math.min(90, p.shield + n * K.abs); if (n) p.shieldT = Math.max(p.shieldT, 5); ev({ type: 'boom', x: p.x, z: p.z, r: K.r, el: K.el, self: true, soft: true }); return true; }
      case 'sacr': if (p.hp <= K.hp + 5) return fizz('Troppa poca vita'); p.hp -= K.hp; p.fury = K.dur; p.furyMul = K.mul; ev({ type: 'buff', what: 'drain', el: K.el }); return true;
      case 'reset': for (let c = 1; c < 4; c++) if (c !== i) p.cd[c] = 0; ev({ type: 'buff', what: 'haste', el: K.el }); return true;
      case 'decoys': for (let n = 0; n < K.n; n++) { const a = p.yaw + (n * 6.283) / K.n, o = freeNear(s, p.x + Math.sin(a) * 3.5, p.z + Math.cos(a) * 3.5, p.x, p.z), e = mkMob(s, 'esca', o.x, o.z, 'a', { el: K.el, life: K.dur + n * 0.4, bd: K.dmg, br: K.r }); e.spawn = 0; } ev({ type: 'summon', el: K.el, n: K.n, decoy: true }); return true;
      case 'rage': p.fury = K.dur; p.furyMul = K.mul; ev({ type: 'ult', what: 'rage', el: K.el }); return true;
      case 'judge': { let n = 0; hostiles(s, (e) => { if (Math.hypot(e.x - p.x, e.z - p.z) < K.r + e.r && n < 14) { s.lobs.push({ id: s.nextId++, x: e.x, z: e.z, x0: e.x, z0: e.z, r: 3, t: 0, T: 0.8 + n * 0.08, dmg: K.dmg, el: K.el, stun: 0.8, arc: false }); n++; } }); ev({ type: 'ult', what: 'judge', el: K.el }); return true; }
      case 'phoenix': p.phoenix = K.dur; p.phK = K; ev({ type: 'ult', what: 'phoenix', el: K.el }); return true;
      // --- supreme
      case 'oc': p.oc = p.ocDur = K.dur; healPlayer(s, 25); ev({ type: 'ult', what: 'oc', el: K.el }); return true;
      case 'cata': areaHit(s, p.x, p.z, K.r, hit(K.dmg, { knock: 16, stun: 1.5, hard: true })); scare(s, p.x, p.z, K.r, 3); ev({ type: 'boom', x: p.x, z: p.z, r: K.r, el: K.el, self: true, big: true }); ev({ type: 'ult', what: 'cata', el: K.el }); return true;
      case 'storm': groundPoint(s, 20, GP); for (let n = 0; n < K.n; n++) { const a = s.rand() * 6.28, d = n === 0 ? 0 : Math.sqrt(s.rand()) * K.area; s.lobs.push({ id: s.nextId++, x: GP.x + Math.sin(a) * d, z: GP.z + Math.cos(a) * d, x0: 0, z0: 0, r: K.r, t: 0, T: 0.5 + n * 0.2, dmg: K.dmg, el: K.el, stun: 0.5, arc: false }); } ev({ type: 'ult', what: 'storm', el: K.el }); return true;
      case 'domin': { let n = 0; for (const e of s.mobs) if (e.team === 'e' && !e.dead && e.spawn <= 0 && !MOB[e.kind].heavy && Math.hypot(e.x - p.x, e.z - p.z) < K.r) { e.charm = K.dur; e.team = 'a'; e.stun = 0; e.tg = null; n++; } for (const c of s.npcs) if (Math.hypot(c.x - p.x, c.z - p.z) < K.r) { c.st = 'follow'; c.t = 60; c.charm = false; } if (s.boss && Math.hypot(s.boss.x - p.x, s.boss.z - p.z) < K.r + s.boss.r) { s.boss.stun = 2.5; s.boss.weakT = K.dur; } ev({ type: 'boom', x: p.x, z: p.z, r: K.r, el: K.el, self: true, soft: true, big: true }); ev({ type: 'ult', what: 'domin', el: K.el, n }); return true; }
      case 'timestop': s.freeze = K.dur; ev({ type: 'ult', what: 'timestop', el: K.el, dur: K.dur }); return true;
      case 'giant': { const o = freeNear(s, p.x + fx * 3, p.z + fz * 3, p.x, p.z), e = mkMob(s, 'colosso', o.x, o.z, 'a', { el: K.el, life: K.dur, bd: K.dmg }); e.hp = e.maxHp = K.hp; e.spawn = 0.5; ev({ type: 'ult', what: 'giant', el: K.el }); return true; }
      case 'eclipse': p.eclipse = K.dur; p.eclK = K; ev({ type: 'ult', what: 'eclipse', el: K.el }); return true;
    }
    return false;
  }

  // ---------- Linguaggio dei poteri: esecuzione ----------
  const SHAPE = { circ: 'circle', cone: 'cone', line: 'line', ring: 'donut', tgt: 'circle', near: 'circle' };
  const VS = ['burn', 'pois', 'slow', 'stun', 'root', 'mark', 'weak', 'fear', 'chill'], SUMK = ['spirito', 'colosso', 'torretta', 'esca', 'bomba', 'arciere', 'guaritore', 'muro'];
  const yawAng = (p) => Math.atan2(fwdX(p.yaw), fwdZ(p.yaw));
  const has = (e, k) => (k === 'burn' ? e.burnT > 0 : k === 'pois' ? e.poisT > 0 : k === 'slow' ? e.slowT > 0 : k === 'stun' ? e.stun > 0 : k === 'root' ? e.root > 0 : k === 'mark' ? e.markT > 0 : k === 'weak' ? e.weakT > 0 : k === 'fear' ? e.fearT > 0 : e.chill > 0);
  const clearSt = (e, k) => { if (k === 'burn') { e.burnT = 0; e.burn = 0; } else if (k === 'pois') { e.poisT = 0; e.pois = 0; } else if (k === 'slow') { e.slowT = 0; e.slow = 0; } else if (k === 'stun') e.stun = 0; else if (k === 'root') e.root = 0; else if (k === 'mark') e.markT = 0; else if (k === 'weak') e.weakT = 0; else if (k === 'fear') e.fearT = 0; else e.chill = 0; };
  function aimedAny(s, range) { const a = s.aim; if (!a.kind || a.d > range) return null; return a.kind === 'b' ? s.boss : a.kind === 'e' ? findMob(s, a.id) : null; }
  function nearestFoe(s, x, z, r, skip) { let best = null, bd = r; hostiles(s, (e) => { if (e === skip || e.dead) return; const d = Math.hypot(e.x - x, e.z - z) - e.r; if (d < bd) { bd = d; best = e; } }); return best; }
  function place(s, o, ctx, out) {
    const p = s.player, at = o.at || '';
    if (at === 'pt' || (!at && ctx.depth > 0 && ctx.x !== undefined)) { out.x = ctx.x; out.z = ctx.z; }
    else if (at === 'aim') groundPoint(s, o.g || 16, out);
    else if (at === 'tgt') { const e = ctx.tgt && !ctx.tgt.dead ? ctx.tgt : aimedAny(s, o.g || 26); if (e) { out.x = e.x; out.z = e.z; } else groundPoint(s, o.g || 16, out); }
    else if (at.slice(0, 3) === 'fwd' || at.slice(0, 4) === 'back') { const b = at[0] === 'b', d = +at.slice(b ? 4 : 3) || 4, fx = fwdX(p.yaw) * (b ? -1 : 1), fz = fwdZ(p.yaw) * (b ? -1 : 1); let k = 0; for (; k < d; k++) if (opaqueAt(s, p.x + fx * (k + 1), p.z + fz * (k + 1))) break; out.x = p.x + fx * Math.min(k, d); out.z = p.z + fz * Math.min(k, d); }
    else if (at.slice(0, 3) === 'rnd') { const bx = ctx.x !== undefined ? ctx.x : p.x, bz = ctx.x !== undefined ? ctx.z : p.z, a = s.rand() * 6.283, d = Math.sqrt(s.rand()) * (+at.slice(3) || 5); out.x = bx + Math.sin(a) * d; out.z = bz + Math.cos(a) * d; }
    else { out.x = p.x; out.z = p.z; }
    return out;
  }
  function applySt(s, e, o, pt, K) {
    if (e.dead) return; const p = s.player, heavy = e.boss || MOB[e.kind].heavy, fixed = e.boss || MOB[e.kind].fixed, m = e.boss ? 1 : MOB[e.kind].mass;
    if (o.stun && !e.boss) e.stun = Math.max(e.stun, heavy ? o.stun * 0.4 : o.stun);
    if (o.root) { if (e.boss) { e.slowT = Math.max(e.slowT, o.root); e.slow = Math.max(e.slow, 0.3); } else e.root = Math.max(e.root, o.root); }
    if (o.slow) { e.slowT = Math.max(e.slowT, o.slow2 || 3); e.slow = Math.max(e.slow, e.boss ? o.slow * 0.5 : o.slow); }
    if (o.burn) { e.burnT = 3; e.burn = Math.max(e.burn, o.burn); }
    if (o.pois) { e.pois = Math.min(6, e.pois + o.pois); e.poisT = 5; }
    if (o.weak) e.weakT = Math.max(e.weakT, o.weak);
    if (o.fear) { if (heavy) e.weakT = Math.max(e.weakT, o.fear); else e.fearT = Math.max(e.fearT, o.fear); }
    if (o.mark) { e.markT = Math.max(e.markT, o.mark2 || 6); e.markMul = Math.max(1.05, o.mark); }
    if (o.chill) { e.chill += o.chill; e.slowT = Math.max(e.slowT, 2); e.slow = Math.max(e.slow, e.boss ? 0.15 : 0.3); if (e.chill >= 4 && !heavy) { e.stun = Math.max(e.stun, 1.5); e.chill = -3; s.events.push({ type: 'freeze', id: e.id, x: e.x, z: e.z }); } }
    if (o.lift && !heavy && !fixed) { e.stun = Math.max(e.stun, o.lift); e.lift = o.lift; e.liftD = o.lift2 || 15; e.liftEl = K.el; }
    if (o.poly && !heavy) { e.poly = o.poly; e.fearT = o.poly; e.tg = null; }
    if (o.charm && !heavy && !fixed && e.team === 'e') { e.charm = o.charm; e.team = 'a'; e.stun = 0; e.tg = null; }
    if ((o.pull || o.push) && !fixed && !e.held) { const dx = pt.x - e.x, dz = pt.z - e.z, d = Math.hypot(dx, dz) || 1, f = (o.pull || 0) - (o.push || 0); if (d > 0.6 || f < 0) { e.kx += ((dx / d) * f) / m; e.kz += ((dz / d) * f) / m; } }
    if (o.yank && !fixed && !heavy) e.pull = { x: p.x + fwdX(p.yaw) * (1.6 + e.r), z: p.z + fwdZ(p.yaw) * (1.6 + e.r), t: 0 };
    if (o.fling && !fixed && !heavy && !e.held) e.thrown = { vx: fwdX(p.yaw) * 26, vz: fwdZ(p.yaw) * 26, t: 0.6, dmg: o.fling, r: 3, el: K.el };
  }
  const sub = (ctx, x, z, tgt, ang) => ({ K: ctx.K, slot: ctx.slot, depth: ctx.depth + 1, x, z, tgt, ang });
  function hitNow(s, o, ctx, T, tg) {
    const p = s.player, K = ctx.K; let list = [];
    if (tg) list.push(tg); else if (o.op === 'near') { const e = nearestFoe(s, T.x, T.z, T.r); if (e) list.push(e); } else hostiles(s, (e) => { if (inTele(T, e.x, e.z, e.r)) list.push(e); });
    if (o.max && list.length > o.max) list = list.sort((a, b) => Math.hypot(a.x - T.x, a.z - T.z) - Math.hypot(b.x - T.x, b.z - T.z)).slice(0, o.max);
    let tot = 0;
    for (const e of list) {
      if (e.dead) continue; let d = o.d || 0;
      if (o.hpc) d += e.hp * o.hpc * (e.boss ? 0.12 : 1);
      for (const k of VS) if (o['vs' + k] && has(e, k)) d *= o['vs' + k];
      if (o.ex && e.hp < e.maxHp * 0.3) d *= o.ex;
      if (o.far) d *= 1 + Math.min(1, Math.hypot(e.x - p.x, e.z - p.z) / 20) * (o.far - 1);
      if (o.close) d *= 1 + Math.max(0, 1 - Math.hypot(e.x - p.x, e.z - p.z) / 8) * (o.close - 1);
      if (d > 0) tot += applyHit(s, e, { dmg: d, el: K.el, src: 'p', knock: o.knock, fx: T.x, fz: T.z, tick: !!o.tk, trig: ctx.depth > 0 }); else e.aggro = Math.max(e.aggro, 8);
      applySt(s, e, o, T, K);
      if (o.res) gainRes(s, o.res); if (o.heal) healPlayer(s, o.heal); if (o.sh) { p.shield = Math.min(120, p.shield + o.sh); p.shieldT = Math.max(p.shieldT, 4); } if (o.cdr) for (let c = 1; c < 4; c++) if (p.cd[c] > 0) p.cd[c] -= o.cdr;
      if (o.swap && e === list[0] && !e.boss && !MOB[e.kind].heavy && !MOB[e.kind].fixed) { const x0 = p.x, z0 = p.z; p.x = e.x; p.z = e.z; e.x = x0; e.z = z0; collide(s, p, p.r); s.events.push({ type: 'blink', x0, z0, x1: p.x, z1: p.z, el: K.el, r: 2 }); }
      if (o.each && ctx.depth < 3) run(s, o.each, sub(ctx, e.x, e.z, e, T.ang));
    }
    if (o.op !== 'tgt' && o.op !== 'near') for (const t of s.turrets) if (t.state === 'hostile' && inTele(T, t.x, t.z, t.r)) t.stun = 2.5;
    if (o.ls) healPlayer(s, tot * o.ls);
    s.events.push({ type: 'shape', late: !!T.fr, tk: !!o.tk, shape: T.shape, x: T.x, z: T.z, ang: T.ang, r: tg || o.op === 'near' ? 1.3 : T.r, r0: T.r0, half: T.half, len: T.len, w: T.w, el: K.el, n: list.length });
    if (list.length && o.then && ctx.depth < 3) run(s, o.then, sub(ctx, T.x, T.z, list[0], T.ang));
    if (!list.length && o.miss && ctx.depth < 3) run(s, o.miss, sub(ctx, T.x, T.z, null, T.ang));
    return true;
  }
  const hasSt = (o) => !!(o.stun || o.root || o.slow || o.burn || o.pois || o.weak || o.fear || o.mark || o.chill || o.lift || o.poly || o.charm || o.pull || o.push || o.yank || o.fling);
  const OPS = {
    hit(s, o, ctx) {
      const p = s.player, pt = place(s, o, ctx, {}); let tg = null;
      if (o.op === 'tgt') { tg = ctx.tgt && !ctx.tgt.dead && ctx.depth > 0 ? ctx.tgt : aimedAny(s, o.g || 26); if (!tg) return 'Nessun bersaglio'; ctx.tgt = tg; pt.x = tg.x; pt.z = tg.z; }
      const ang = ctx.ang !== undefined && (o.at === 'pt' || (!o.at && ctx.depth > 0)) ? ctx.ang : yawAng(p);
      const T = { shape: SHAPE[o.op], x: pt.x, z: pt.z, ang, r: o.r || (o.op === 'cone' ? 8 : 3), r0: o.i || 0, half: o.h || 0.5, len: o.l || 10, w: o.w || 2, el: ctx.K.el };
      if (o.op === 'ring' && !o.i) T.r0 = T.r * 0.5;
      if (o.in && !tg) { if (s.marks.length < 40) s.marks.push(Object.assign({ id: s.nextId++, t: 0, wind: o.in, fr: true, o, ctx: Object.assign({}, ctx, { x: pt.x, z: pt.z, ang }), dmg: 0 }, T)); return true; }
      return hitNow(s, o, ctx, T, tg);
    },
    shot(s, o, ctx) {
      const p = s.player, K = ctx.K, n = o.n || 1, nested = ctx.depth > 0 && ctx.x !== undefined, fx0 = nested ? ctx.x : p.x, fz0 = nested ? ctx.z : p.z; let dir, hom = '';
      if (nested) { const e = nearestFoe(s, fx0, fz0, 16, o.skip ? ctx.tgt : null); dir = e ? Math.atan2(e.x - fx0, e.z - fz0) : ctx.ang !== undefined ? ctx.ang : yawAng(p); if (o.hom && e) hom = (e.boss ? 'b' : 'e') + e.id; }
      else { const a = s.aim; dir = a.kind ? Math.atan2(a.x - p.x, a.z - p.z) : yawAng(p); if (o.hom && a.kind) hom = a.kind + a.id; }
      const base = o.ringall ? s.rand() * 6.283 : dir, v = o.v || 30;
      for (let k = 0; k < n && s.shots.length < 220; k++) {
        const an = o.ringall ? base + (k * 6.283) / n : base + (o.sp || 0) * (k - (n - 1) / 2) + (o.jit ? (s.rand() - 0.5) * 2 * o.jit : 0), off = nested ? 0.3 : 0.8;
        s.shots.push({ id: s.nextId++, team: 'p', x: fx0 + Math.sin(an) * off, z: fz0 + Math.cos(an) * off, vx: Math.sin(an) * v, vz: Math.cos(an) * v, life: o.t || 26 / v + (o.hom ? 0.5 : 0), dmg: o.d || 0, el: K.el, r: o.wide ? o.r || 1.6 : o.aura ? 0.9 : o.r || 0.45, hom, w: o.wide ? o.r || 1.6 : 0,
          hitSet: o.pierce || o.wide || o.aura || o.back ? new Set() : null, boom: o.boom || 0, back: o.back ? 1 : 0, bnc: o.bnc || 0, aura: o.aura || 0, at: 0, tr: ctx.depth > 0, px: o.then || o.split || hasSt(o) ? { o, K, depth: ctx.depth, slot: ctx.slot } : null });
      }
      return true;
    },
    zone(s, o, ctx) {
      const p = s.player, pt = place(s, o, ctx, {}), K = ctx.K; if (s.zones.length > 44) { const k = s.zones.findIndex((z) => z.team === 'p'); if (k >= 0) s.zones.splice(k, 1); }
      s.zones.push({ id: s.nextId++, team: 'p', kind: o.dome ? 'slow' : 'dmg', x: pt.x, z: pt.z, r: o.r || 3, t: 0, dur: o.t || 4, dps: o.dps || 0, el: K.el, tick: 0, pull: o.zpull || 0, heal: o.zheal || 0, fury: o.fury || 0, ward: o.ward ? 1 : 0, boom: o.boom || 0,
        px: { o, K, acc: 0, depth: ctx.depth, slot: ctx.slot, ang: ctx.ang !== undefined ? ctx.ang : yawAng(p) } });
      if (ctx.depth === 0) s.events.push({ type: 'place', what: 'zone', x: pt.x, z: pt.z, el: K.el }); return true;
    },
    sum(s, o, ctx) {
      const p = s.player, K = ctx.K, kind = SUMK.find((k) => o[k]) || 'spirito', n = o.n || 1, pt = place(s, o, ctx, {}), ang = ctx.ang !== undefined ? ctx.ang : yawAng(p);
      const mine = s.mobs.filter((e) => e.tag === 'sum' && !e.dead); for (let k = 0; k < mine.length + n - 14; k++) if (mine[k]) mine[k].life = 0.01;
      for (let k = 0; k < n; k++) {
        let x, z; if (o.wall) { const off = (k - (n - 1) / 2) * 2.3; x = pt.x + Math.cos(ang) * off; z = pt.z - Math.sin(ang) * off; } else { const a = ang + 2.2 + (k * 6.283) / Math.max(n, 3), R = o.far || (n > 1 || !o.at ? 2.2 : 0); x = pt.x + Math.sin(a) * R; z = pt.z + Math.cos(a) * R; }
        const q = freeNear(s, x, z, p.x, p.z), e = mkMob(s, kind, q.x, q.z, 'a', { el: K.el, life: o.t || 12, bd: o.d || 0, br: o.r || 4, tag: 'sum' }); if (o.hp) e.hp = e.maxHp = o.hp; e.spawn = 0.25;
        if (o.die) e.pd = { die: o.die, K, depth: ctx.depth, slot: ctx.slot };
      }
      s.events.push({ type: 'summon', el: K.el, n }); return true;
    },
    dash(s, o, ctx) {
      const p = s.player, K = ctx.K; if (p.dash || p.leap || p.ride) return 'Non ora'; let dx = fwdX(p.yaw), dz = fwdZ(p.yaw), dist = o.l || 9;
      if (o.back) { dx = -dx; dz = -dz; } else if (o.totgt) { const e = aimedAny(s, o.g || 22); if (!e) return 'Nessun bersaglio'; const d = Math.hypot(e.x - p.x, e.z - p.z) || 1; dx = (e.x - p.x) / d; dz = (e.z - p.z) / d; dist = Math.max(0.5, d - e.r - 1.3); ctx.tgt = e; }
      else if (s.inp && Math.hypot(s.inp.mx, s.inp.my) > 0.3 && !o.fwd) { const m = Math.hypot(s.inp.mx, s.inp.my), cy = Math.cos(p.yaw), sy = Math.sin(p.yaw); dx = (cy * s.inp.mx - sy * s.inp.my) / m; dz = (-sy * s.inp.mx - cy * s.inp.my) / m; }
      p.dash = { dx, dz, t: 0, T: dist > 12.5 ? 0.26 : 0.17, dist, hit: new Set(), dmg: o.d || 0, el: K.el, then: o.then ? { prog: o.then, ctx: { K, slot: ctx.slot, depth: ctx.depth + 1, tgt: ctx.tgt, ang: Math.atan2(dx, dz) } } : null };
      if (o.trail) for (let q = 1; q <= 3; q++) { const x = p.x + dx * dist * (q / 3.4), z = p.z + dz * dist * (q / 3.4); if (!solidAt(s, x, z)) s.zones.push({ id: s.nextId++, team: 'p', kind: 'dmg', x, z, r: 2.2, t: 0, dur: 4, dps: o.trail, el: K.el, tick: 0.2 * q }); }
      s.events.push({ type: 'dash', el: K.el }); return true;
    },
    blink(s, o, ctx) {
      const p = s.player, K = ctx.K, pt = {}, x0 = p.x, z0 = p.z; if (p.ride || p.leap) return 'Non ora';
      if (o.behind) { const e = aimedAny(s, o.g || 20); if (!e) return 'Nessun bersaglio'; const d = Math.hypot(e.x - p.x, e.z - p.z) || 1; pt.x = e.x + ((e.x - p.x) / d) * (e.r + 1.5); pt.z = e.z + ((e.z - p.z) / d) * (e.r + 1.5); ctx.tgt = e; s.events.push({ type: 'face', x: e.x, z: e.z }); }
      else place(s, Object.assign({ at: 'aim' }, o), ctx, pt);
      const q = freeNear(s, pt.x, pt.z, p.x, p.z); if (Math.hypot(q.x - p.x, q.z - p.z) < 1.2 && ctx.depth === 0) return 'Nessun punto libero';
      p.x = q.x; p.z = q.z; s.events.push({ type: 'blink', x0, z0, x1: p.x, z1: p.z, el: K.el, r: 1.5 });
      if (o.then) run(s, o.then, sub(ctx, p.x, p.z, ctx.tgt)); if (o.left) run(s, o.left, sub(ctx, x0, z0, ctx.tgt)); return true;
    },
    leap(s, o, ctx) {
      const p = s.player, K = ctx.K, pt = {}; if (p.dash || p.leap || p.ride) return 'Non ora'; place(s, Object.assign({ at: 'aim' }, o), ctx, pt);
      const q = freeNear(s, pt.x, pt.z, p.x, p.z), d = Math.hypot(q.x - p.x, q.z - p.z); if (d < 2) return 'Nessun punto libero';
      p.leap = { x0: p.x, z0: p.z, x1: q.x, z1: q.z, t: 0, T: o.fast ? 0.12 + d / 70 : 0.42 + d / 55, h: o.fast ? 0.6 : 2.5 + d * 0.22, dmg: 0, r: 0, el: K.el, then: o.then ? { prog: o.then, ctx: { K, slot: ctx.slot, depth: ctx.depth + 1 } } : null };
      s.events.push({ type: 'leap', el: K.el }); return true;
    },
    buff(s, o, ctx) {
      const p = s.player, t = o.t || 5, K = ctx.K; let w = 'shield';
      if (o.haste) { p.haste = t; p.hasteMul = o.haste; w = 'haste'; } if (o.veil) { p.veil = t; p.veilBonus = o.veil === true ? 1.8 : o.veil; for (const e of s.mobs) if (e.team === 'e') e.aggro = 0; w = 'veil'; }
      if (o.shield) { p.shield = Math.min(300, p.shield + o.shield); p.shieldT = Math.max(p.shieldT, t); } if (o.hot) { p.hot = t; p.hotRate = o.hot / t; w = 'heal'; }
      if (o.fury) { p.fury = t; p.furyMul = o.fury; w = 'drain'; } if (o.reflect) { p.reflect = t; p.thorns = o.reflect; p.reflEl = K.el; } if (o.invuln) p.invuln = Math.max(p.invuln, t);
      if (o.orbit) { p.orbit = t; p.orbitK = { dps: o.orbit, r: o.r || 2.8, el: K.el }; w = 'orbit'; }
      if (o.ls) { p.lsT = t; p.lsV = o.ls; w = 'drain'; } if (o.armor) { p.armT = t; p.armV = o.armor; } if (o.cdr) { p.cdrT = t; p.cdrV = o.cdr; w = 'haste'; } if (o.resrate) { p.rrT = t; p.rrV = o.resrate; }
      s.events.push({ type: 'buff', what: w, el: K.el }); return true;
    },
    trig(s, o, ctx) {
      const p = s.player, on = ['hit', 'kill', 'hurt', 'cast', 'step', 'dashend'].find((k) => o[k]) || 'hit'; if (!o.do) return true; if (p.trigs.length >= 8) p.trigs.shift();
      p.trigs.push({ on, t: o.t || 8, n: o.n || 0, icd: o.icd || (on === 'hit' ? 0.25 : 0), cl: 0, ev: o.ev || 1, acc: 0, prog: o.do, K: ctx.K, slot: ctx.slot });
      s.events.push({ type: 'buff', what: 'orbit', el: ctx.K.el }); return true;
    },
    chain(s, o, ctx) {
      const K = ctx.K; let cur = ctx.tgt && !ctx.tgt.dead ? ctx.tgt : aimedAny(s, o.g || 24); if (!cur) { if (ctx.depth > 0) cur = nearestFoe(s, ctx.x, ctx.z, o.r || 8); if (!cur) return 'Nessun bersaglio'; }
      const seen = new Set(), pts = []; let d = o.d || 10;
      for (let k = 0; cur && k < (o.n || 3); k++) { seen.add(cur.id); pts.push({ x: cur.x, z: cur.z, y: cur.boss ? 2.4 : 1.1 }); if (d > 0) applyHit(s, cur, { dmg: d, el: K.el, src: 'p', knock: 1, trig: ctx.depth > 0 }); applySt(s, cur, o, cur, K); d *= o.fall || 0.7; let nx = null, nd = o.r || 7.5; const c0 = cur; hostiles(s, (e) => { if (seen.has(e.id) || e.dead) return; const dd = Math.hypot(e.x - c0.x, e.z - c0.z) - e.r; if (dd < nd) { nd = dd; nx = e; } }); cur = nx; }
      s.events.push({ type: 'chain', pts, el: K.el, from: ctx.depth > 0 && ctx.x !== undefined ? { x: ctx.x, z: ctx.z } : null }); return true;
    },
    pop(s, o, ctx) {
      const p = s.player, K = ctx.K, k = VS.find((v) => o[v]) || 'mark', list = []; hostiles(s, (e) => { if (has(e, k) && Math.hypot(e.x - p.x, e.z - p.z) < (o.g || 24)) list.push(e); });
      if (!list.length) return 'Nessun nemico in quello stato';
      for (const e of list) { clearSt(e, k); s.events.push({ type: 'boom', x: e.x, z: e.z, r: o.r || 3, el: K.el }); areaHit(s, e.x, e.z, o.r || 3, { dmg: o.d || 30, el: K.el, src: 'p', knock: 5, fx: e.x, fz: e.z, trig: ctx.depth > 0 }); applySt(s, e, o, e, K); if (o.then && ctx.depth < 3) run(s, o.then, sub(ctx, e.x, e.z, e)); }
      return true;
    },
    rep(s, o, ctx) { if (!o.do) return true; const n = Math.min(o.n || 3, 16), c = { K: ctx.K, slot: ctx.slot, depth: Math.max(1, ctx.depth), x: ctx.x, z: ctx.z, tgt: ctx.tgt, ang: ctx.ang }; for (let k = 0; k < n; k++) { if (k === 0) run(s, o.do, c); else if (s.timers.length < 80) s.timers.push({ t: k * (o.ev || 0.3), f: () => run(s, o.do, c) }); } return true; },
    if(s, o, ctx) {
      const p = s.player; let c = false;
      if (o.tgt) c = !!aimedAny(s, 30); else if (o.hpb) c = p.hp < (p.maxHp * o.hpb) / 100; else if (o.hpa) c = p.hp >= (p.maxHp * o.hpa) / 100; else if (o.resa) c = p.res >= o.resa; else if (o.near) c = !!nearestFoe(s, p.x, p.z, o.near); else if (o.moving) c = p.moving; else if (o.still) c = !p.moving;
      else if (o.count) { let n = 0; hostiles(s, (e) => { if (Math.hypot(e.x - p.x, e.z - p.z) < 9) n++; }); c = n >= o.count; } else if (o.shielded) c = p.shield > 0; else if (o.veiled) c = p.veil > 0;
      else { const k = VS.find((v) => o['has' + v]), e = ctx.tgt && !ctx.tgt.dead ? ctx.tgt : aimedAny(s, 30); c = !!(k && e && has(e, k)); }
      const pr = c ? o.do : o.else; return pr ? run(s, pr, ctx) : true;
    },
    nth(s, o, ctx) { const p = s.player, k = 'c' + ctx.slot; p.cnt[k] = (p.cnt[k] || 0) + 1; const pr = p.cnt[k] % (o.nth || o.n || 3) === 0 ? o.do : o.else; return pr ? run(s, pr, ctx) : true; },
    heal(s, o) { healPlayer(s, o.v || 20); s.events.push({ type: 'buff', what: 'heal', el: 'luce' }); return true; },
    res(s, o) { gainRes(s, o.v || 10); return true; },
    cost(s, o) { const p = s.player; if (p.hp <= (o.v || 10) + 3) return 'Troppa poca vita'; p.hp -= o.v || 10; return true; },
    cdr(s, o, ctx) { const p = s.player; for (let c = 1; c < 4; c++) if (c !== ctx.slot && p.cd[c] > 0) p.cd[c] = o.all ? 0 : Math.max(0, p.cd[c] - (o.v || 2)); return true; },
    freeze(s, o) { s.freeze = Math.max(s.freeze, o.t || 2); s.events.push({ type: 'ult', what: 'timestop', el: 'gelo', dur: o.t || 2, quiet: true }); return true; },
    mem(s, o, ctx) { const p = s.player; p.mem = { x: p.x, z: p.z }; s.events.push({ type: 'place', what: 'anchor', x: p.x, z: p.z, el: ctx.K.el }); return true; },
    ret(s, o, ctx) { const p = s.player; if (!p.mem) return 'Nessun segno lasciato'; const x0 = p.x, z0 = p.z; p.x = p.mem.x; p.z = p.mem.z; p.mem = null; s.events.push({ type: 'blink', x0, z0, x1: p.x, z1: p.z, el: ctx.K.el, r: 2 }); if (o.then) run(s, o.then, sub(ctx, p.x, p.z)); return true; },
    aim(s, o, ctx) { const e = aimedAny(s, o.g || 26); if (!e) return 'Nessun bersaglio'; ctx.tgt = e; return true; },
  };
  for (const k of ['circ', 'cone', 'line', 'ring', 'tgt', 'near']) OPS[k] = OPS.hit;
  function run(s, prog, ctx, i0) {
    if (!prog || ctx.depth > 3) return true;
    for (let i = i0 || 0; i < prog.length; i++) {
      const o = prog[i];
      if (o.op === 'wait') { if (s.timers.length < 80) { const c = Object.assign({}, ctx, { depth: Math.max(1, ctx.depth) }), k = i + 1; s.timers.push({ t: o.t || 0.5, f: () => run(s, prog, c, k) }); } return true; }
      const f = OPS[o.op]; if (!f) continue; const r = f(s, o, ctx);
      if (typeof r === 'string') { if (ctx.depth === 0 && i === 0) return r; if (o.op === 'tgt' || o.op === 'aim' || o.op === 'cost') return true; }
    }
    return true;
  }
  function fire(s, on, x, z, tgt, slot) {
    const p = s.player; if (s.firing || !p.trigs.length || p.dead > 0) return; s.firing = true;
    for (const T of p.trigs) { if (T.on !== on || T.cl > 0 || T.t <= 0 || (on === 'cast' && T.slot === slot)) continue; T.cl = T.icd; run(s, T.prog, { K: T.K, slot: T.slot, depth: 1, x, z, tgt, ang: yawAng(p) }); if (T.n && --T.n <= 0) T.t = 0; }
    s.firing = false;
  }
  function shotEnd(s, sh) {
    const P = sh.px, o = P.o; P.done = true;
    if (o.then && P.depth < 2) run(s, o.then, { K: P.K, slot: P.slot, depth: P.depth + 1, x: sh.x, z: sh.z, tgt: null, ang: Math.atan2(sh.vx, sh.vz) });
    if (o.split) { const b = s.rand() * 6.283; for (let k = 0; k < o.split && s.shots.length < 220; k++) { const a = b + (k * 6.283) / o.split; s.shots.push({ id: s.nextId++, team: 'p', x: sh.x, z: sh.z, vx: Math.sin(a) * 20, vz: Math.cos(a) * 20, life: 0.45, dmg: sh.dmg * 0.5, el: sh.el, r: 0.4, hom: '', w: 0, hitSet: null, boom: 0, back: 0, bnc: 0, aura: 0, at: 0, tr: true, px: null }); } }
  }
  function zoneFrame(s, z, dt) {
    const P = z.px, o = P.o, p = s.player;
    if (o.mv) { z.x += Math.sin(P.ang) * o.mv * dt; z.z += Math.cos(P.ang) * o.mv * dt; if (opaqueAt(s, z.x, z.z) || Math.abs(z.x) > HALF || Math.abs(z.z) > HALF) z.t = z.dur; }
    if (o.fol) { z.x = p.x; z.z = p.z; } if (o.seek) { const e = nearestFoe(s, z.x, z.z, 20); if (e) { const d = Math.hypot(e.x - z.x, e.z - z.z) || 1; z.x += ((e.x - z.x) / d) * o.seek * dt; z.z += ((e.z - z.z) / d) * o.seek * dt; } }
    if (o.grow) z.r = Math.min(14, z.r + o.grow * dt);
    if (o.tick && P.depth < 2) { P.acc += dt; if (P.acc >= (o.ev || 1)) { P.acc = 0; run(s, o.tick, { K: P.K, slot: P.slot, depth: P.depth + 1, x: z.x, z: z.z, tgt: null, ang: P.ang }); } }
  }
  function zoneTick(s, z) { const o = z.px.o; if (hasSt(o)) hostiles(s, (e) => { if (Math.hypot(e.x - z.x, e.z - z.z) < z.r + e.r) applySt(s, e, o, z, z.px.K); }); if (o.inv && Math.hypot(s.player.x - z.x, s.player.z - z.z) < z.r) s.player.veil = Math.max(s.player.veil, 0.6); if (o.armor && Math.hypot(s.player.x - z.x, s.player.z - z.z) < z.r) { s.player.armT = 0.6; s.player.armV = o.armor; } }
  function zoneEnd(s, z) { const P = z.px; if (P.done) return; P.done = true; if (P.o.end && P.depth < 2) run(s, P.o.end, { K: P.K, slot: P.slot, depth: P.depth + 1, x: z.x, z: z.z, tgt: null, ang: P.ang }); }
  function mobDie(s, e) { const P = e.pd; if (!P || P.done) return; P.done = true; if (P.depth < 2) run(s, P.die, { K: P.K, slot: P.slot, depth: P.depth + 1, x: e.x, z: e.z, tgt: null, ang: 0 }); }

  // ---------- Passo ----------
  function step(s, dt, inp) {
    s.t += dt; const p = s.player, oc = p.oc > 0; s.inp = inp;
    p.yaw = inp.yaw; p.pitch = inp.pitch || 0;
    const cdr = dt * (oc ? 2 : 1) * (p.cdrT > 0 ? p.cdrV : 1); for (let i = 0; i < 5; i++) if (p.cd[i] > 0) p.cd[i] -= i === 0 ? dt : cdr;
    if (s.freeze > 0) { s.freeze -= dt; if (s.freeze <= 0) { s.freeze = 0; s.events.push({ type: 'timeEnd' }); } }
    if (p.dead > 0) {
      p.dead -= dt;
      if (p.dead <= 0) { p.dead = 0; p.x = s.city.spawn.x; p.z = s.city.spawn.z; p.hp = p.maxHp; p.invuln = 2; p.res = Math.floor(p.res * 0.5); p.haste = p.veil = p.shield = p.hot = p.oc = p.eclipse = p.orbit = p.fury = p.reflect = p.phoenix = 0; p.hist.length = 0; s.echo.length = 0; p.trigs.length = 0; s.timers.length = 0; s.marks.length = 0; p.lsT = p.armT = p.cdrT = p.rrT = 0; p.dash = p.leap = p.ride = null; p.cam.x = p.x; p.cam.y = EYE; p.cam.z = p.z; s.events.push({ type: 'respawn' }); }
    }
    const dead = p.dead > 0;
    s.flowT -= dt; if (s.flowT <= 0) { s.flowT = 0.3; updateFlow(s); }
    updateQuest(s, dt); updateBoss(s, dt);
    for (const pt of s.patrols) if (pt.alive <= 0) { pt.t -= dt; if (pt.t <= 0 && Math.hypot(pt.x - p.x, pt.z - p.z) > 45) spawnPack(s, pt.x, pt.z, s.level >= 3 ? ['sgherro', 'sgherro', 'tiratore', 'bruto'] : ['sgherro', 'sgherro', 'tiratore'], 'ronda', pt); }

    // Giocatore: tempi e movimento
    if (p.haste > 0) p.haste -= dt; if (p.veil > 0) { p.veil -= dt; if (p.veil <= 0) s.events.push({ type: 'unveil' }); } if (p.invuln > 0) p.invuln -= dt;
    if (p.shieldT > 0) { p.shieldT -= dt; if (p.shieldT <= 0) { p.shield = 0; s.events.push({ type: 'shieldEnd' }); } }
    if (p.hot > 0) { p.hot -= dt; healPlayer(s, p.hotRate * dt); }
    if (p.oc > 0) { p.oc -= dt; if (p.oc <= 0) { p.oc = 0; s.events.push({ type: 'ultEnd', what: 'oc' }); } }
    p.hurtT += dt; if (p.hurtT > 6 && !dead) healPlayer(s, 3 * dt);
    if (p.lsT > 0) p.lsT -= dt; if (p.armT > 0) p.armT -= dt; if (p.cdrT > 0) p.cdrT -= dt; if (p.rrT > 0) p.rrT -= dt;
    if (p.fury > 0) p.fury -= dt; if (p.reflect > 0) p.reflect -= dt; if (p.phoenix > 0) p.phoenix -= dt;
    p.histT -= dt; if (p.histT <= 0 && !dead && !p.ride) { p.histT = 0.25; p.hist.push({ x: p.x, z: p.z, hp: p.hp }); if (p.hist.length > 12) p.hist.shift(); }
    if (!dead) {
      if (p.ride) updateRide(s, dt, inp);
      else if (p.leap) {
        const L = p.leap; L.t += dt; const k = Math.min(1, L.t / L.T);
        p.x = L.x0 + (L.x1 - L.x0) * k; p.z = L.z0 + (L.z1 - L.z0) * k; p.cam.x = p.x; p.cam.z = p.z; p.cam.y = EYE + L.h * 4 * k * (1 - k);
        if (k >= 1 && !L.r) { p.leap = null; collide(s, p, p.r); p.cam.y = EYE; if (L.then) run(s, L.then.prog, Object.assign({ x: p.x, z: p.z }, L.then.ctx)); } else if (k >= 1) { p.leap = null; collide(s, p, p.r); p.cam.y = EYE; areaHit(s, p.x, p.z, L.r, { dmg: L.dmg, el: L.el, src: 'p', knock: 9, stun: 0.6, fx: p.x, fz: p.z }); s.events.push({ type: 'boom', x: p.x, z: p.z, r: L.r, el: L.el, self: true, land: true }); }
      } else {
        if (p.dash) {
          const D = p.dash; D.t += dt; const stepLen = (D.dist / D.T) * dt, n = Math.max(1, Math.ceil(stepLen / 0.5));
          for (let k = 0; k < n; k++) { p.x += (D.dx * stepLen) / n; p.z += (D.dz * stepLen) / n; collide(s, p, p.r); }
          if (D.dmg > 0) hostiles(s, (e) => { if (!D.hit.has(e.id) && Math.hypot(e.x - p.x, e.z - p.z) < e.r + 1.5) { D.hit.add(e.id); applyHit(s, e, { dmg: D.dmg, el: D.el, src: 'p', knock: 3, fx: p.x - D.dx, fz: p.z - D.dz }); } });
          if (D.t >= D.T) { p.dash = null; if (D.then) run(s, D.then.prog, Object.assign({ x: p.x, z: p.z }, D.then.ctx)); fire(s, 'dashend', p.x, p.z, null); } p.moving = true;
        } else {
          let sx = inp.mx, fy = inp.my; const m = Math.hypot(sx, fy); if (m > 1) { sx /= m; fy /= m; }
          p.moving = m > 0.1;
          if (p.moving) { const sp = PSPEED * (oc ? 1.25 : 1) * (p.haste > 0 ? p.hasteMul : 1) * dt, cy = Math.cos(p.yaw), sy = Math.sin(p.yaw); p.x += (cy * sx - sy * fy) * sp; p.z += (-sy * sx - cy * fy) * sp; }
          collide(s, p, p.r);
        }
        p.cam.x = p.x; p.cam.y = EYE; p.cam.z = p.z;
      }
    }
    const free = !dead && !p.ride && !p.leap;
    if (p.grab) { // la creatura afferrata resta sospesa davanti a te finche' non la scagli
      const Gb = p.grab, e = findMob(s, Gb.id); Gb.t -= dt;
      if (!e || e.dead || dead || p.ride) { if (e) e.held = false; p.grab = null; p.cd[Gb.slot] = Gb.k.cd; }
      else { e.x = p.x + fwdX(p.yaw) * 3.3; e.z = p.z + fwdZ(p.yaw) * 3.3; e.fx = -fwdX(p.yaw); e.fz = -fwdZ(p.yaw); e.stun = Math.max(e.stun, 0.3); if (Gb.t <= 0) { e.held = false; e.thrown = { vx: fwdX(p.yaw) * 28, vz: fwdZ(p.yaw) * 28, t: 0.75, dmg: Gb.k.dmg, r: Gb.k.r, el: Gb.k.el }; p.grab = null; p.cd[Gb.slot] = Gb.k.cd; s.events.push({ type: 'release', slot: Gb.slot, what: 'grab' }); } }
    }
    if (p.trigs.length) { for (const T of p.trigs) { T.t -= dt; T.cl -= dt; if (T.on === 'step' && T.t > 0 && !dead) { T.acc += dt; if (T.acc >= T.ev) { T.acc = 0; run(s, T.prog, { K: T.K, slot: T.slot, depth: 1, x: p.x, z: p.z, tgt: null, ang: yawAng(p) }); } } } if (p.trigs.some((T) => T.t <= 0)) p.trigs = p.trigs.filter((T) => T.t > 0); }
    if (s.timers.length) { if (dead) s.timers.length = 0; else { const due = []; for (const T of s.timers) { T.t -= dt; if (T.t <= 0) due.push(T); } if (due.length) { s.timers = s.timers.filter((T) => T.t > 0); for (const T of due) T.f(); } } }
    if (s.marks.length) { for (const M of s.marks) { M.t += dt; if (M.t >= M.wind) { M.done = true; if (!dead) hitNow(s, M.o, M.ctx, M, null); } } s.marks = s.marks.filter((M) => !M.done); }
    if (s.echo.length) { for (const E of s.echo) { E.t -= dt; if (E.t <= 0 && free && !p.dash) { E.done = true; if (s.kit[E.i] && s.kit[E.i].m === 'eco') { cast(s, E.i, inp); s.events.push({ type: 'cast', slot: E.i, kind: s.kit[E.i].kind, el: s.kit[E.i].el }); } } else if (E.t < -2) E.done = true; } s.echo = s.echo.filter((E) => !E.done); }

    // Mira assistita e suggerimenti di contesto
    const aim = s.aim, h = s.hint; aim.kind = ''; aim.id = -1; h.node = -1; h.turret = -1; h.screen = -1; h.use = null;
    if (free) {
      let bs = 1e9;
      hostiles(s, (e) => { const d = Math.hypot(e.x - p.x, e.z - p.z); if (d > 30) return; const a = angTo(p, e.x, e.z), tol = e.boss ? 0.16 + Math.atan2(e.r, d) : d < 5 ? 0.6 : 0.19; if (a > tol || !los(s, p.x, p.z, e.x, e.z)) return; const sc = a + d * 0.004 - (e.boss ? 0.05 : 0); if (sc < bs) { bs = sc; aim.kind = e.boss ? 'b' : 'e'; aim.id = e.id; aim.x = e.x; aim.z = e.z; aim.d = d; } });
      for (const t of s.turrets) { if (t.state !== 'hostile' || t.stun > 0) continue; const d = Math.hypot(t.x - p.x, t.z - p.z); if (d > 26) continue; const a = angTo(p, t.x, t.z); if (a > 0.12 || !los(s, p.x, p.z, t.x, t.z)) continue; const sc = a + d * 0.004 + 0.06; if (sc < bs) { bs = sc; aim.kind = 't'; aim.id = t.id; aim.x = t.x; aim.z = t.z; aim.d = d; } }
      if (s.kit[1].kind === 'cable' && p.cd[1] <= 0) h.node = pickNode(s);
      let ts = 1e9; for (const t of s.turrets) { if (t.state === 'owned') continue; const d = Math.hypot(t.x - p.x, t.z - p.z); let sc = 1e9; if (d < 6) sc = d * 0.1; else if (d < 24 && los(s, p.x, p.z, t.x, t.z)) { const a = angTo(p, t.x, t.z); if (a < 0.4) sc = 1 + a * 10; } if (sc < ts) { ts = sc; h.turret = t.id; } }
      const S = s.city.screens; for (let i = 0; i < S.length; i++) if (Math.hypot(S[i].x - p.x, S[i].z - p.z) < S[i].r) { h.screen = i; break; }
      // tasto contestuale: committente, sigillo dell'arena, abitante
      for (const g of s.givers) if (Math.hypot(g.x - p.x, g.z - p.z) < 4.5) { if (g.offer && !s.quest) h.use = { kind: 'giver', id: g.id, label: 'Accetta: ' + g.offer.titolo, testo: g.offer.testo, fama: g.offer.fama }; else h.use = { kind: 'busy', id: g.id, label: s.quest ? 'Hai gia una missione' : 'Torna tra poco' }; }
      if (!h.use && !s.boss) for (const A of s.city.arenas) if (Math.hypot(A.x - p.x, A.z - p.z) < 6) { const st = s.arenas[A.id], need = A.id; if (st.status === 'sealed' && st.t <= 0) h.use = s.level >= need ? { kind: 'seal', id: A.id, label: 'Risveglia ' + B.BOSSES[A.boss].nome } : { kind: 'busy', id: A.id, label: 'Serve Fama di livello ' + need }; else h.use = { kind: 'busy', id: A.id, label: 'Il sigillo riposa' }; }
      if (!h.use) { let bd = 4.2, bn = null; for (const c of s.npcs) { const d = Math.hypot(c.x - p.x, c.z - p.z); if (d < bd && angTo(p, c.x, c.z) < 0.9) { bd = d; bn = c; } } if (bn) h.use = { kind: 'npc', id: bn.id, label: bn.st === 'follow' ? 'Congeda' : 'Invita a seguirti' }; }
      groundPoint(s, 18, s.gp);
    }

    // Poteri
    if (free) {
      if (inp.use && h.use) {
        const u = h.use;
        if (u.kind === 'giver') acceptQuest(s, s.givers[u.id]);
        else if (u.kind === 'seal') wakeBoss(s, u.id);
        else if (u.kind === 'npc') { const c = s.npcs[u.id]; if (c.st === 'follow') { c.st = 'wander'; c.t = 0; c.charm = false; } else if (s.npcs.filter((o) => o.st === 'follow').length < 8) { c.st = 'follow'; c.t = 50; c.charm = false; s.events.push({ type: 'invite', id: c.id }); } else s.events.push({ type: 'msg', text: 'Hai gia otto abitanti al seguito' }); }
        else s.events.push({ type: 'msg', text: u.label });
      }
      for (let i = 1; i < 5; i++) {
        if (!inp.b[i] || p.dash) continue; const K = s.kit[i], toggle = K.kind === 'charm' || K.kind === 'possess' || K.kind === 'grab' || K.kind === 'anchor';
        if (i === 4 && p.res < 100) { s.events.push({ type: 'fizzle', slot: 4, why: 'Risonanza non ancora piena' }); continue; }
        if (p.cd[i] > 0 && !toggle) continue;
        if (cast(s, i, inp)) { p.cd[i] = K.cd; s.stats.casts[i]++; if (i === 4) { p.res = 0; if (GENU[K.kind]) s.events.push({ type: 'ult', what: 'gen', nome: K.nome, el: K.el }); } if (K.m === 'eco' && !NOECHO[K.kind]) s.echo.push({ i, t: 0.8 }); if (p.trigs.length) fire(s, 'cast', p.x, p.z, null, i); s.events.push({ type: 'cast', slot: i, kind: K.kind, el: K.el }); audience(s); }
        if (p.ride || p.leap) break;
      }
      if (!p.ride && !p.leap && !p.dash) primary(s, dt, inp.fire); else { p.beam.on = false; p.cone = false; }
    } else { p.beam.on = false; p.cone = false; }
    // effetti continui del giocatore
    if (p.orbit > 0) { p.orbit -= dt; p.otick = (p.otick || 0) - dt; if (p.otick <= 0) { p.otick = 0.25; areaHit(s, p.x, p.z, p.orbitK.r, { dmg: p.orbitK.dps * 0.25, el: p.orbitK.el, src: 'p', tick: true, fx: p.x, fz: p.z }); } if (p.orbit <= 0) s.events.push({ type: 'buffEnd', what: 'orbit' }); }
    if (p.eclipse > 0) { p.eclipse -= dt; p.etick = (p.etick || 0) - dt; if (p.etick <= 0) { p.etick = 0.25; let tot = 0; hostiles(s, (e) => { if (Math.hypot(e.x - p.x, e.z - p.z) < 6 + e.r) tot += applyHit(s, e, { dmg: p.eclK.dps * 0.25, el: p.eclK.el, src: 'p', tick: true, fx: p.x, fz: p.z }); }); healPlayer(s, tot * p.eclK.heal); } if (p.eclipse <= 0) s.events.push({ type: 'ultEnd', what: 'eclipse' }); }
    if (p.drain) { const D = p.drain, e = D.boss ? s.boss : findMob(s, D.id); D.t -= dt; if (!e || e.dead || D.t <= 0 || dead || Math.hypot(e.x - p.x, e.z - p.z) > D.k.range * 1.3 || !los(s, p.x, p.z, e.x, e.z)) { p.drain = null; s.events.push({ type: 'buffEnd', what: 'drain' }); } else { D.x = e.x; D.z = e.z; D.y = e.boss ? 2.2 : 1.1; D.tick -= dt; if (D.tick <= 0) { D.tick = 0.2; healPlayer(s, applyHit(s, e, { dmg: D.k.dps * 0.2, el: D.k.el, src: 'p', tick: true }) * D.k.heal); } } }

    // Sentinelle
    for (const t of s.turrets) {
      if (t.state === 'hostile' && s.freeze > 0) continue;
      if (t.stun > 0) { t.stun -= dt; continue; }
      if (t.state === 'owned') {
        t.timer -= dt; if (t.timer <= 0) { t.state = 'reboot'; t.timer = 4; s.events.push({ type: 'turretFree', id: t.id }); continue; }
        let best = null, bd = 22; hostiles(s, (e) => { const d = Math.hypot(e.x - t.x, e.z - t.z); if (d < bd && los(s, t.x, t.z, e.x, e.z)) { bd = d; best = e; } });
        t.atk -= dt;
        if (best) { t.yaw = Math.atan2(best.x - t.x, best.z - t.z); if (t.atk <= 0) { t.atk = 0.3; const dx = (best.x - t.x) / bd, dz = (best.z - t.z) / bd; s.shots.push({ id: s.nextId++, team: 'a', x: t.x + dx * 1.2, z: t.z + dz * 1.2, vx: dx * 42, vz: dz * 42, life: 0.65, dmg: 12, el: t.el || 'folgore', r: 0.4, hom: '', w: 0, hitSet: null }); s.events.push({ type: 'turretShot', id: t.id }); } }
      } else if (t.state === 'reboot') { t.timer -= dt; if (t.timer <= 0) t.state = t.idle ? 'idle' : 'hostile'; }
      else if (t.state === 'idle') { /* spenta: non spara, ma si puo' possedere */ }
      else if (free && p.veil <= 0) { const d = Math.hypot(p.x - t.x, p.z - t.z); if (d < 17 && los(s, t.x, t.z, p.x, p.z)) { t.yaw = Math.atan2(p.x - t.x, p.z - t.z); t.atk -= dt; if (t.atk <= 0) { t.atk = 1.3; const dx = (p.x - t.x) / d, dz = (p.z - t.z) / d; s.shots.push({ id: s.nextId++, team: 'e', x: t.x + dx * 1.2, z: t.z + dz * 1.2, vx: dx * 20, vz: dz * 20, life: 1.2, dmg: 6, el: '', r: 0.4, hom: '', w: 0, hitSet: null }); s.events.push({ type: 'turretShot', id: t.id }); } } }
    }

    updateMobs(s, dt, free);
    updateNpcs(s, dt);

    // Proiettili
    for (const sh of s.shots) {
      if (sh.team === 'e' && s.freeze > 0) continue;
      if (sh.hom) { const e = sh.hom[0] === 'b' ? s.boss : sh.hom[0] === 'e' ? findMob(s, +sh.hom.slice(1)) : null; if (e && !e.dead) { const sp = Math.hypot(sh.vx, sh.vz), dx = e.x - sh.x, dz = e.z - sh.z, d = Math.hypot(dx, dz) || 1, k = Math.min(1, 9 * dt); sh.vx += ((dx / d) * sp - sh.vx) * k; sh.vz += ((dz / d) * sp - sh.vz) * k; const n = Math.hypot(sh.vx, sh.vz) || 1; sh.vx *= sp / n; sh.vz *= sp / n; } }
      sh.x += sh.vx * dt; sh.z += sh.vz * dt; sh.life -= dt;
      if (Math.abs(sh.x) > HALF || Math.abs(sh.z) > HALF || opaqueAt(s, sh.x, sh.z)) {
        if (sh.bnc > 0 && Math.abs(sh.x) < HALF && Math.abs(sh.z) < HALF) { const ox = sh.x - sh.vx * dt, oz = sh.z - sh.vz * dt; if (!opaqueAt(s, sh.x, oz)) sh.vz = -sh.vz; else if (!opaqueAt(s, ox, sh.z)) sh.vx = -sh.vx; else { sh.vx = -sh.vx; sh.vz = -sh.vz; } sh.x = ox; sh.z = oz; sh.bnc--; s.events.push({ type: 'ring', x: ox, z: oz, r: 0.5, c: sh.el }); continue; }
        sh.life = 0; continue;
      }
      if (sh.aura) { sh.at -= dt; if (sh.at <= 0) { sh.at = 0.2; areaHit(s, sh.x, sh.z, sh.aura, { dmg: sh.dmg, el: sh.el, src: 'p', tick: true, fx: sh.x, fz: sh.z }); if (sh.px && hasSt(sh.px.o)) hostiles(s, (e) => { if (Math.hypot(e.x - sh.x, e.z - sh.z) < sh.aura + e.r) applySt(s, e, sh.px.o, sh, sh.px.K); }); } continue; }
      if (sh.team === 'e') { let stop = false; for (const z of s.zones) if (z.ward && Math.hypot(z.x - sh.x, z.z - sh.z) < z.r) { stop = true; break; } if (stop) { sh.life = 0; continue; } }
      if (sh.team !== 'e') {
        const src = sh.team === 'p' ? 'p' : 'ally'; let stop = false;
        hostiles(s, (e) => { if (stop || (sh.hitSet && sh.hitSet.has(e.id))) return; if (Math.hypot(e.x - sh.x, e.z - sh.z) < e.r + sh.r) { if (sh.dmg > 0) applyHit(s, e, { dmg: sh.dmg, el: sh.el, src, knock: 1.5, fx: sh.x - sh.vx, fz: sh.z - sh.vz, trig: !!sh.tr }); if (sh.px) applySt(s, e, sh.px.o, sh, sh.px.K); if (sh.hitSet) sh.hitSet.add(e.id); else stop = true; } });
        if (!stop && sh.team === 'p') for (const t of s.turrets) if (t.state === 'hostile' && Math.hypot(t.x - sh.x, t.z - sh.z) < t.r + sh.r) { t.stun = 2.5; if (!sh.hitSet) stop = true; }
        if (stop) sh.life = 0;
      } else {
        if (free && p.reflect > 0 && Math.hypot(p.x - sh.x, p.z - sh.z) < p.r + sh.r + 0.6) { sh.team = 'p'; sh.vx = -sh.vx * 1.4; sh.vz = -sh.vz * 1.4; sh.life = 1.5; sh.el = p.reflEl; sh.dmg *= 2.5; continue; }
        if (free && Math.hypot(p.x - sh.x, p.z - sh.z) < p.r + sh.r) { damagePlayer(s, sh.dmg, sh.x - sh.vx, sh.z - sh.vz, sh.from, 'colpo'); sh.life = 0; continue; }
        for (const e of s.mobs) if (e.team === 'a' && !e.dead && e.spawn <= 0 && Math.hypot(e.x - sh.x, e.z - sh.z) < e.r + sh.r) { applyHit(s, e, { dmg: sh.dmg, src: 'ally' }); sh.life = 0; break; }
      }
    }
    for (const sh of s.shots) if (sh.life <= 0) {
      if (sh.back) { const dx = p.x - sh.x, dz = p.z - sh.z, d = Math.hypot(dx, dz) || 1, sp = Math.hypot(sh.vx, sh.vz); sh.back = 0; sh.vx = (dx / d) * sp; sh.vz = (dz / d) * sp; sh.life = Math.min(1.2, d / sp); sh.hitSet = new Set(); if (opaqueAt(s, sh.x, sh.z)) { sh.x -= (dx / d) * -1; sh.z -= (dz / d) * -1; } }
      else if (sh.boom) { areaHit(s, sh.x, sh.z, sh.boom, { dmg: sh.dmg * 0.7, el: sh.el, src: 'p', knock: 6, fx: sh.x, fz: sh.z, trig: !!sh.tr }); s.events.push({ type: 'boom', x: sh.x, z: sh.z, r: sh.boom, el: sh.el }); sh.boom = 0; }
      if (sh.life <= 0 && sh.px && !sh.px.done) shotEnd(s, sh);
    }
    if (s.shots.some((sh) => sh.life <= 0)) s.shots = s.shots.filter((sh) => sh.life > 0 || (s.events.push({ type: 'shotEnd', id: sh.id, x: sh.x, z: sh.z, team: sh.team, el: sh.el, w: sh.w }), false));
    // Zone, trappole, colpi in arrivo
    for (const z of s.zones) {
      if (z.team === 'e' && s.freeze > 0) continue;
      z.t += dt; if (z.px) zoneFrame(s, z, dt); z.tick -= dt; if (z.tick > 0) continue; z.tick = 0.4; if (z.px) zoneTick(s, z);
      if (z.team === 'p' && (z.pull || z.heal || z.fury)) {
        if (z.pull) hostiles(s, (e) => { const dx = z.x - e.x, dz = z.z - e.z, d = Math.hypot(dx, dz); if (d < z.r + e.r && d > 0.8 && !e.boss && !MOB[e.kind].fixed && !e.held) { e.kx += ((dx / d) * 13 * z.pull) / MOB[e.kind].mass; e.kz += ((dz / d) * 13 * z.pull) / MOB[e.kind].mass; e.slowT = 0.6; e.slow = Math.max(e.slow, 0.7); } });
        const inside = free && Math.hypot(p.x - z.x, p.z - z.z) < z.r;
        if (z.heal) { if (inside) healPlayer(s, z.heal * 0.4); for (const e of s.mobs) if (e.team === 'a' && !e.dead && Math.hypot(e.x - z.x, e.z - z.z) < z.r) e.hp = Math.min(e.maxHp, e.hp + z.heal * 0.4); }
        if (z.fury && inside) { p.furyMul = p.fury > 0.7 ? Math.max(p.furyMul, z.fury) : z.fury; p.fury = Math.max(p.fury, 0.6); }
      }
      if (z.team === 'p' && z.dps <= 0 && z.kind !== 'slow') continue;
      if (z.team === 'p') { if (z.kind === 'slow') hostiles(s, (e) => { if (Math.hypot(e.x - z.x, e.z - z.z) < z.r + e.r) { e.slowT = 0.6; e.slow = Math.max(e.slow, e.boss ? 0.35 : 0.8); } }); else areaHit(s, z.x, z.z, z.r, { dmg: z.dps * 0.4, el: z.el, src: 'p', tick: true, fx: z.x, fz: z.z }); }
      else if (free && Math.hypot(p.x - z.x, p.z - z.z) < z.r) damagePlayer(s, z.dps * 0.4, z.x, z.z, null, 'pozza');
    }
    for (const z of s.zones) if (z.t >= z.dur && z.px) zoneEnd(s, z);
    for (const z of s.zones) if (z.t >= z.dur && z.boom) { areaHit(s, z.x, z.z, z.r, { dmg: z.boom, el: z.el, src: 'p', knock: 14, stun: 1, hard: true, fx: z.x, fz: z.z }); s.events.push({ type: 'boom', x: z.x, z: z.z, r: z.r, el: z.el, big: true }); z.boom = 0; }
    if (s.zones.some((z) => z.t >= z.dur)) s.zones = s.zones.filter((z) => z.t < z.dur);
    for (const t of s.traps) {
      t.life -= dt; if (t.arm > 0) { t.arm -= dt; continue; }
      let trig = false; hostiles(s, (e) => { if (!e.boss && Math.hypot(e.x - t.x, e.z - t.z) < t.r * 0.55 + e.r) trig = true; else if (e.boss && Math.hypot(e.x - t.x, e.z - t.z) < e.r + 0.5) trig = true; });
      if (trig) { t.life = 0; areaHit(s, t.x, t.z, t.r, { dmg: t.dmg, el: t.el, src: 'p', stun: t.stun, knock: 5, fx: t.x, fz: t.z }); s.events.push({ type: 'boom', x: t.x, z: t.z, r: t.r, el: t.el }); }
    }
    if (s.traps.some((t) => t.life <= 0)) s.traps = s.traps.filter((t) => t.life > 0);
    for (const L of s.lobs) { L.t += dt; if (L.t >= L.T) { L.done = true; areaHit(s, L.x, L.z, L.r, { dmg: L.dmg, el: L.el, src: 'p', stun: L.stun, knock: 6, fx: L.x, fz: L.z }); s.events.push({ type: 'boom', x: L.x, z: L.z, r: L.r, el: L.el, sky: !L.arc }); } }
    if (s.lobs.some((L) => L.done)) s.lobs = s.lobs.filter((L) => !L.done);
    if (s.mobs.some((e) => e.dead)) s.mobs = s.mobs.filter((e) => !e.dead);

    // Per l'interfaccia: cosa e' attivo e cosa e' pronto
    const act = s.act; act[0] = act[1] = act[2] = act[3] = act[4] = 0;
    for (let i = 1; i < 5; i++) {
      const k = s.kit[i].kind;
      if (k === 'charm') { for (const e of s.mobs) if (e.charm > act[i]) act[i] = e.charm; if (!act[i] && s.npcs.some((c) => c.st === 'follow' && c.charm)) act[i] = 1; }
      else if (k === 'possess') { for (const t of s.turrets) if (t.state === 'owned' && t.timer > act[i]) act[i] = t.timer; }
      else if (k === 'haste') act[i] = p.haste; else if (k === 'veil') act[i] = p.veil; else if (k === 'shield') act[i] = p.shieldT; else if (k === 'heal') act[i] = p.hot; else if (k === 'orbit') act[i] = p.orbit;
      else if (k === 'drain') act[i] = p.drain ? p.drain.t : 0; else if (k === 'oc') act[i] = p.oc; else if (k === 'eclipse') act[i] = p.eclipse; else if (k === 'timestop') act[i] = s.freeze; else if (k === 'cable') act[i] = p.ride ? 1 : 0; else if (k === 'grab') act[i] = p.grab ? p.grab.t : 0; else if (k === 'anchor') act[i] = p.anchor ? 1 : 0; else if (k === 'reflect') act[i] = p.reflect; else if (k === 'rage' || k === 'sacr') act[i] = p.fury; else if (k === 'phoenix') act[i] = p.phoenix; else if (k === 'x') { for (const T of p.trigs) if (T.slot === i && T.t > act[i]) act[i] = T.t; }
      s.ready[i] = p.cd[i] <= 0 && (i < 4 || p.res >= 100);
    }
  }

  function updateMobs(s, dt, free) {
    const p = s.player, dir = { x: 0, z: 0 };
    let decoy = null; for (const e of s.mobs) if (e.kind === 'esca' && !e.dead) decoy = e;
    for (const e of s.mobs) {
      if (e.dead) continue;
      const def = MOB[e.kind], hostile = e.team === 'e';
      if (hostile && s.freeze > 0) continue;
      if (e.spawn > 0) { e.spawn -= dt; continue; }
      if (e.life > 0) { e.life -= dt; if (e.life <= 0) { e.dead = true; if (e.kind === 'esca') explodeDecoy(s, e); if (e.pd) mobDie(s, e); s.events.push({ type: 'vanish', id: e.id, x: e.x, z: e.z }); continue; } }
      tickStatus(s, e, dt); if (e.dead) continue;
      if (e.held) { e.moving = false; continue; }
      if (e.thrown) {
        const T = e.thrown; T.t -= dt; e.x += T.vx * dt; e.z += T.vz * dt; let hitw = T.t <= 0 || solidAt(s, e.x, e.z) || Math.abs(e.x) > HALF - 1 || Math.abs(e.z) > HALF - 1;
        if (!hitw) hostiles(s, (o) => { if (o !== e && Math.hypot(o.x - e.x, o.z - e.z) < o.r + e.r + 0.3) hitw = true; });
        if (hitw) { e.thrown = null; e.x -= T.vx * dt; e.z -= T.vz * dt; collide(s, e, e.r, true); e.stun = Math.max(e.stun, 1.2); s.events.push({ type: 'boom', x: e.x, z: e.z, r: T.r, el: T.el }); areaHit(s, e.x, e.z, T.r, { dmg: T.dmg, el: T.el, src: 'p', knock: 6, fx: e.x, fz: e.z }); }
        continue;
      }
      if (e.poly > 0) { e.poly -= dt; e.atk = Math.max(e.atk, 0.5); }
      if (e.lift > 0) { e.lift -= dt; if (e.lift <= 0) { s.events.push({ type: 'ring', x: e.x, z: e.z, r: 1.5, c: e.liftEl }); applyHit(s, e, { dmg: e.liftD, el: e.liftEl, src: 'p' }); if (e.dead) continue; } }
      if (e.charm > 0) { e.charm -= dt; if (e.charm <= 0) { e.charm = 0; e.team = 'e'; e.tg = null; s.events.push({ type: 'uncharm', id: e.id }); } }
      if (e.aggro > 0 && e.aggro < 900) e.aggro -= dt;
      const kd = Math.exp(-6 * dt); e.x += e.kx * dt; e.z += e.kz * dt; e.kx *= kd; e.kz *= kd;
      e.moving = false; if (e.atk > 0) e.atk -= dt;
      if (e.pull) { const P = e.pull; P.t += dt; const k = Math.min(1, P.t / 0.22); e.x += (P.x - e.x) * k; e.z += (P.z - e.z) * k; if (k >= 1) e.pull = null; collide(s, e, e.r, true); continue; }
      if (e.stun > 0 || def.fixed) {
        collide(s, e, e.r, true);
        if (e.kind === 'torretta' && e.stun <= 0) { let best = null, bd = 19; hostiles(s, (o) => { const d = Math.hypot(o.x - e.x, o.z - e.z); if (d < bd && los(s, e.x, e.z, o.x, o.z)) { bd = d; best = o; } }); if (best) { e.fx = (best.x - e.x) / bd; e.fz = (best.z - e.z) / bd; if (e.atk <= 0) { e.atk = def.atkCd; s.shots.push({ id: s.nextId++, team: 'a', x: e.x + e.fx, z: e.z + e.fz, vx: e.fx * 40, vz: e.fz * 40, life: 0.6, dmg: e.bd || def.dmg, el: e.el, r: 0.4, hom: '', w: 0, hitSet: null }); s.events.push({ type: 'mobAtk', id: e.id }); } } }
        continue;
      }
      const sl = (e.slowT > 0 ? 1 - e.slow : 1), sp = def.speed * sl * dt;
      // anti-incastro
      e.pt -= dt; if (e.pt <= 0) { if (e.wasMoving && Math.hypot(e.x - e.px, e.z - e.pz) < 0.3) { e.dodge = 0.7; e.ds = s.rand() < 0.5 ? 1 : -1; } e.px = e.x; e.pz = e.z; e.pt = 0.5; }
      if (e.dodge > 0 && e.root <= 0) { e.dodge -= dt; e.x += -e.fz * e.ds * sp; e.z += e.fx * e.ds * sp; e.moving = true; e.wasMoving = false; collide(s, e, e.r); continue; }
      if (e.kind === 'anima') { // la scorta cammina solo se le stai vicino
        const c = e.path[e.pi];
        if (c && Math.hypot(p.x - e.x, p.z - e.z) < 13 && e.root <= 0) { const dx = c.x - e.x, dz = c.z - e.z, d = Math.hypot(dx, dz); if (d < 0.8) e.pi++; else { e.fx = dx / d; e.fz = dz / d; e.x += e.fx * sp; e.z += e.fz * sp; e.moving = true; } }
        e.wasMoving = false; collide(s, e, e.r, true); continue;
      }
      if (hostile) {
        if (e.fearT > 0) { const dx = e.x - p.x, dz = e.z - p.z, d = Math.hypot(dx, dz) || 1; e.fx = dx / d; e.fz = dz / d; if (e.root <= 0) { e.x += e.fx * sp * 1.2; e.z += e.fz * sp * 1.2; e.moving = true; } e.wasMoving = e.moving; collide(s, e, e.r); continue; }
        // scelta del bersaglio
        e.tt -= dt;
        if (e.tt <= 0) {
          e.tt = 0.3; let tg = null, td = 1e9;
          if (decoy && Math.hypot(decoy.x - e.x, decoy.z - e.z) < 15) { tg = decoy; td = 0; }
          else {
            if (e.hunt) { const a = findMob(s, e.hunt); if (a && !a.dead) { tg = a; td = Math.hypot(a.x - e.x, a.z - e.z) * 0.6; } }
            if (free && p.veil <= 0) { const d = Math.hypot(p.x - e.x, p.z - e.z); if ((d < 19 && los(s, e.x, e.z, p.x, p.z)) || e.aggro > 0) { if (d < td) { td = d; tg = p; } } }
            for (const o of s.mobs) if (o.team === 'a' && !o.dead && o.spawn <= 0) { const d = Math.hypot(o.x - e.x, o.z - e.z); if (d < 11 && d < td) { td = d; tg = o; } }
          }
          e.tg = tg;
        }
        const tg = e.tg && !e.tg.dead && (e.tg !== p || (free && p.veil <= 0)) ? e.tg : null;
        if (!tg) { // nessuno in vista: torna al posto
          const dx = e.hx - e.x, dz = e.hz - e.z, d = Math.hypot(dx, dz);
          if (d > 2.5 && e.root <= 0) { e.fx = dx / d; e.fz = dz / d; e.x += e.fx * sp * 0.6; e.z += e.fz * sp * 0.6; e.moving = true; }
          e.wasMoving = e.moving; collide(s, e, e.r); continue;
        }
        let dx = tg.x - e.x, dz = tg.z - e.z; const d = Math.hypot(dx, dz) || 1; dx /= d; dz /= d;
        const sees = los(s, e.x, e.z, tg.x, tg.z), wk = e.weakT > 0 ? 0.65 : 1;
        if (sees) { e.fx = dx; e.fz = dz; }
        if (e.kind === 'tiratore' && sees && d < 20) {
          const side = e.id % 2 ? 1 : -1; let vx, vz;
          if (d > def.keep + 1.5) { vx = dx; vz = dz; } else if (d < def.keep - 3) { vx = -dx; vz = -dz; } else { vx = -dz * side * 0.7; vz = dx * side * 0.7; }
          if (e.root <= 0) { e.x += vx * sp; e.z += vz * sp; e.moving = true; }
          if (e.atk <= 0) { e.atk = def.atkCd; s.shots.push({ id: s.nextId++, team: 'e', x: e.x + dx * 0.8, z: e.z + dz * 0.8, vx: dx * def.shot, vz: dz * def.shot, life: 2, dmg: def.dmg * (1 + 0.05 * s.level), el: '', r: 0.4, hom: '', w: 0, hitSet: null, from: e }); s.events.push({ type: 'mobAtk', id: e.id }); }
        } else if (sees && d < 16) {
          const reach = def.reach + tg.r - 0.3;
          if (d > reach) { if (e.root <= 0) { e.x += dx * sp; e.z += dz * sp; e.moving = true; } }
          else if (e.atk <= 0) { e.atk = def.atkCd; s.events.push({ type: 'mobAtk', id: e.id, heavy: !!def.heavy }); const dm = def.dmg * (1 + 0.05 * s.level); if (tg === p) damagePlayer(s, dm, e.x, e.z, e, 'sgherro'); else applyHit(s, tg, { dmg: dm * wk, src: 'ally', knock: 2, fx: e.x, fz: e.z }); }
        } else if (e.root > 0) { /* fermo */ }
        else if (tg === p && flowDir(s, e, dir)) { e.x += dir.x * sp; e.z += dir.z * sp; e.fx = dir.x; e.fz = dir.z; e.moving = true; }
        else { e.x += dx * sp; e.z += dz * sp; e.moving = true; }
      } else { // alleati: ipnotizzati, spiriti, colosso
        if (def.healer) { e.tt = 1; e.tg = null; if (Math.hypot(p.x - e.x, p.z - e.z) < 8) healPlayer(s, (e.bd || 4) * dt); }
        e.tt -= dt;
        if (e.tt <= 0) { e.tt = 0.3; let tg = null, td = 32; hostiles(s, (o) => { const d = Math.hypot(o.x - e.x, o.z - e.z) - o.r; if (d < td) { td = d; tg = o; } }); e.tg = tg; }
        const tg = e.tg && !e.tg.dead && (!e.tg.boss || s.boss === e.tg) && e.tg.team === 'e' ? e.tg : null;
        if (tg) {
          let dx = tg.x - e.x, dz = tg.z - e.z; const d = Math.hypot(dx, dz) || 1; dx /= d; dz /= d; e.fx = dx; e.fz = dz;
          if (d > def.reach + tg.r) { if (e.root <= 0) { e.x += dx * sp * 1.2; e.z += dz * sp * 1.2; e.moving = true; } }
          else if (e.atk <= 0) { e.atk = def.atkCd * 0.8; s.events.push({ type: 'mobAtk', id: e.id, heavy: !!def.heavy }); const dm = e.bd || def.dmg * 1.7; if (e.kind === 'bomba') { s.events.push({ type: 'boom', x: e.x, z: e.z, r: 3.5, el: e.el }); areaHit(s, e.x, e.z, 3.5, { dmg: dm, el: e.el, src: 'ally', knock: 6, fx: e.x, fz: e.z }); killMob(s, e, ''); } else if (def.shooter) { s.shots.push({ id: s.nextId++, team: 'a', x: e.x + dx, z: e.z + dz, vx: dx * 34, vz: dz * 34, life: 0.6, dmg: dm, el: e.el, r: 0.4, hom: '', w: 0, hitSet: null }); } else if (e.kind === 'colosso') { hostiles(s, (o) => { if (Math.hypot(o.x - e.x, o.z - e.z) < def.reach + o.r + 0.5) applyHit(s, o, { dmg: dm, el: e.el, src: 'ally', knock: 6, fx: e.x, fz: e.z }); }); s.events.push({ type: 'ring', x: e.x, z: e.z, r: def.reach + 1, c: e.el }); } else applyHit(s, tg, { dmg: dm, el: e.el, src: 'ally', knock: 3, fx: e.x, fz: e.z }); }
        } else { const dx = p.x - e.x, dz = p.z - e.z, d = Math.hypot(dx, dz) || 1; e.fx = dx / d; e.fz = dz / d; if (d > 4.5) { if (los(s, e.x, e.z, p.x, p.z) || !flowDir(s, e, dir)) { e.x += (dx / d) * sp; e.z += (dz / d) * sp; } else { e.x += dir.x * sp; e.z += dir.z * sp; } e.moving = true; } if (d > 60 && e.life > 0) { e.x = p.x - fwdX(p.yaw) * 2; e.z = p.z - fwdZ(p.yaw) * 2; } }
      }
      e.wasMoving = e.moving; collide(s, e, e.r);
      if (s.boss && hostile === false) { /* gli alleati non attraversano il boss */ const b = s.boss, dx = e.x - b.x, dz = e.z - b.z, d = Math.hypot(dx, dz), m = e.r + b.r; if (d < m && d > 1e-6) { e.x = b.x + (dx / d) * m; e.z = b.z + (dz / d) * m; } }
    }
    const es = s.mobs;
    for (let i = 0; i < es.length; i++) {
      const a = es[i]; if (a.dead || a.spawn > 0) continue;
      for (let j = i + 1; j < es.length; j++) {
        const b = es[j]; if (b.dead || b.spawn > 0) continue;
        const dx = b.x - a.x, dz = b.z - a.z, min = a.r + b.r, d2 = dx * dx + dz * dz;
        if (d2 < min * min && d2 > 1e-6) { const d = Math.sqrt(d2), o = min - d, ma = MOB[a.kind].mass, mb = MOB[b.kind].mass, tm = ma + mb; a.x -= (dx / d) * o * (mb / tm); a.z -= (dz / d) * o * (mb / tm); b.x += (dx / d) * o * (ma / tm); b.z += (dz / d) * o * (ma / tm); }
      }
    }
  }

  function updateNpcs(s, dt) {
    const p = s.player, dir = { x: 0, z: 0 }; let threats = null;
    s.npcT = (s.npcT || 0) - dt; const scan = s.npcT <= 0; if (scan) { s.npcT = 0.4; threats = []; for (const e of s.mobs) if (e.team === 'e' && !e.dead) threats.push(e); if (s.boss) threats.push(s.boss); }
    for (const c of s.npcs) {
      c.moving = false;
      if (scan && c.st !== 'flee') for (const e of threats) { const r = e.boss ? 26 : 8; if (Math.abs(e.x - c.x) < r && Math.abs(e.z - c.z) < r) { if (c.st === 'follow' && !e.boss) continue; c.st = 'flee'; c.t = 2.5; c.dx = c.x - e.x; c.dz = c.z - e.z; c.charm = false; break; } }
      if (c.st === 'flee') {
        c.t -= dt; const d = Math.hypot(c.dx, c.dz) || 1; c.fx = c.dx / d; c.fz = c.dz / d; const ox = c.x, oz = c.z;
        c.x += c.fx * 4.6 * dt; c.z += c.fz * 4.6 * dt; collide(s, c, 0.45, true); c.moving = true;
        if (Math.hypot(c.x - ox, c.z - oz) < 2 * dt) { const t = c.dx; c.dx = -c.dz; c.dz = t; } // contro un muro: scarta di lato
        if (c.t <= 0) { c.st = 'wander'; c.t = 0; c.tx = cellCenter(cellOf(c.x)); c.tz = cellCenter(cellOf(c.z)); }
      } else if (c.st === 'watch') { c.t -= dt; const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz) || 1; c.fx = dx / d; c.fz = dz / d; if (c.t <= 0) { c.st = 'wander'; c.t = 0; } }
      else if (c.st === 'follow') {
        c.t -= dt; const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz) || 1; if (d < 12) c.t = Math.max(c.t, 50);
        if (c.t <= 0 || d > 70) { c.st = 'wander'; c.t = 0; c.charm = false; c.tx = cellCenter(cellOf(c.x)); c.tz = cellCenter(cellOf(c.z)); continue; }
        const keep = 2.2 + (c.id % 5) * 0.7;
        if (d > keep && !p.ride) { const sp = Math.min(8.2, 3 + d * 0.6) * dt; if (los(s, c.x, c.z, p.x, p.z) || !flowDir(s, c, dir)) { c.fx = dx / d; c.fz = dz / d; } else { c.fx = dir.x; c.fz = dir.z; } c.x += c.fx * sp; c.z += c.fz * sp; collide(s, c, 0.45, true); c.moving = true; } else { c.fx = dx / d; c.fz = dz / d; }
      } else {
        if (c.t > 0) { c.t -= dt; continue; }
        const dx = c.tx - c.x, dz = c.tz - c.z, d = Math.hypot(dx, dz);
        if (d < 0.3) {
          if (s.rand() < 0.12) { c.t = 1 + s.rand() * 4; continue; }
          const cx = cellOf(c.x), cz = cellOf(c.z), opts = [];
          for (const [i, j] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = cx + i, Z = cz + j; if (solidCell(s, X, Z)) continue; const g = s.grid[X + Z * N]; if (g === 4 && s.boss) continue; opts.push([i, j, i === c.dx && j === c.dz ? 5 : i === -c.dx && j === -c.dz ? 0.15 : 1]); }
          if (!opts.length) { c.t = 1; continue; }
          let tot = 0; for (const o of opts) tot += o[2]; let r = s.rand() * tot, pick = opts[0]; for (const o of opts) { r -= o[2]; if (r <= 0) { pick = o; break; } }
          c.dx = pick[0]; c.dz = pick[1]; c.tx = cellCenter(cx + pick[0]) + (((c.id * 7) % 5) - 2) * 0.55; c.tz = cellCenter(cz + pick[1]) + (((c.id * 3) % 5) - 2) * 0.55;
        } else { c.fx = dx / d; c.fz = dz / d; c.x += c.fx * c.spd * dt; c.z += c.fz * c.spd * dt; c.moving = true; }
      }
      const px = c.x - p.x, pz = c.z - p.z, pd = Math.hypot(px, pz); if (pd < 1.0 && pd > 1e-6 && !p.ride) { c.x = p.x + (px / pd) * 1.0; c.z = p.z + (pz / pd) * 1.0; }
    }
  }

  return { CELL, N, HALF, EYE, NODE_H, SAG, MOB, PSPEED, QINFO, create, step, setRecipe, cellOf, cellCenter, solidAt, opaqueAt, los, cablePoint, inTele, groundPoint, wakeBoss, bossCast, acceptQuest, pathCells, mkMob, run };
})();
if (typeof module !== 'undefined') module.exports = Core;
