// Stima del danno: 20 secondi contro un bersaglio e contro un gruppo, non una prova del valore di controllo o utilita.
// Non misura correttamente protezione, mobilita, informazione, cura o condizioni rare: servono prove semantiche e partite dedicate.
// node tbal.js [scrivi] [nuovi]: nuovi misura solo edition 3.2 e conserva tutti i fattori precedenti degli altri poteri.
const B = require('./bricks.js'), Core = require('./core.js'), fs = require('fs');
const BASE = ['dardo', 'corsa', 'scudo', 'cura', 'tempo'];
const args = process.argv.slice(2), onlyNew = args.includes('nuovi');
if (args.some((arg) => arg !== 'scrivi' && arg !== 'nuovi')) throw new Error('Uso: node tbal.js [scrivi] [nuovi]');
const catalog = onlyNew ? B.LIST.filter((a) => a.edition === '3.2') : B.LIST;
function pressMeasured(s, slot, frame, controls) {
  const p = s.player;
  if (p.captive !== controls.captive) { controls.captive = p.captive; controls.capturedAt = frame; }
  // ready include il rilascio: per questi stati non significa che vada rilanciata l'abilita.
  if (['form', 'phase', 'flight', 'possession'].some((key) => p[key] && p[key].slot === slot)) return false;
  if (p.captive && p.captive.slot === slot) return frame - controls.capturedAt >= 120;
  if (slot === 4) { if (frame !== 30) return false; p.res = 100; return true; }
  return !!(s.ready[slot] || (s.act[slot] > 0 && frame % 45 === 0)); // conserva i rilasci dei vecchi grab/toggle
}
function measure(id, slot, group) {
  const ids = BASE.slice(), si = slot === 'P' ? 0 : slot === 'M' ? 1 : slot === 'S' ? 2 : slot === 'U' ? 4 : -1; if (si >= 0) ids[si] = id;
  const s = Core.create({ seed: 4, recipe: { nome: 't', slots: ids.map((x) => ({ id: x, el: 'fuoco', t: 2 })) }, fame: 320 }); for (const e of s.mobs) e.dead = true; s.npcs.length = 0; s.turrets.length = 0;
  const p = s.player, inp = { mx: 0, my: 0, yaw: Math.PI / 2, pitch: -0.1, fire: true, b: [false, false, false, false, false], use: false };
  const spots = group ? [[-7, 0], [-8.5, 1.6], [-8.5, -1.6], [-10, 0.6], [-6, -1]] : [[-7, 0]], foes = spots.map(([dx, dz]) => { const e = Core.mkMob(s, 'sgherro', p.x + dx, p.z + dz, 'e'); e.spawn = 0; e.atk = 1.5; e.hp = e.maxHp = 420; return e; });
  const x0 = p.x, z0 = p.z, controls = { captive: null, capturedAt: 0 }; let casts = 0;
  for (let f = 0; f < 1200; f++) {
    if (f % 30 === 0) { p.hp = 100; if (Math.hypot(p.x - x0, p.z - z0) > 30) { p.x = x0; p.z = z0; } }
    for (let k = 0; k < foes.length; k++) if (foes[k].dead) { const e = Core.mkMob(s, 'sgherro', p.x + spots[k][0], p.z + spots[k][1], 'e'); e.spawn = 0.3; e.atk = 1.5; e.hp = e.maxHp = 420; foes[k] = e; }
    const eye = p.possession ? s.mobs.find((e) => e.id === p.possession.id) || p : p;
    let tg = null, td = 1e9; for (const e of foes) { if (e.team !== 'e' || e.dead || e.captive) continue; const d = Math.hypot(e.x - eye.x, e.z - eye.z); if (d < td) { td = d; tg = e; } }
    if (tg) { inp.yaw = Math.atan2(-(tg.x - eye.x), -(tg.z - eye.z)); inp.pitch = -Math.atan2(p.flight ? p.flight.y - 1.2 : 1.7, Math.max(2, td)); }
    for (let i = 1; i < 5; i++) inp.b[i] = false;
    if (si > 0) inp.b[si] = pressMeasured(s, si, f, controls);
    const c0 = s.stats.casts[si > 0 ? si : 0]; Core.step(s, 1 / 60, inp); s.events.length = 0; if (si > 0 && s.stats.casts[si] > c0) casts++;
  }
  return s.stats.dmg;
}
const base1 = measure('', '', false), base5 = measure('', '', true);
const TGT = { P: { 1: 34, 2: 40, 3: 46 }, M: { 1: 5, 2: 7, 3: 9 }, S: { 2: 9, 3: 12, 4: 15, 1: 7 }, U: { 3: 300, 4: 380, 5: 460 } };
const rows = [];
for (const a of catalog) {
  const d1 = measure(a.id, a.slot, false), d5 = measure(a.id, a.slot, true), c2 = a.cost[1];
  let score, tgt;
  if (a.slot === 'P') { score = 0.6 * d1 / 20 + 0.4 * d5 / 20 / 2.2; tgt = TGT.P[c2] || 40; }
  else { const e1 = d1 - base1, e5 = d5 - base5, raw = 0.6 * e1 + 0.4 * e5 / 2.2; if (a.slot === 'U') { score = raw; tgt = TGT.U[c2] || 380; } else { score = raw / 20; tgt = (TGT[a.slot][c2] || 9); } }
  rows.push({ id: a.id, slot: a.slot, score, tgt, rel: score / tgt });
}
const dmgRows = rows.filter((r) => r.rel > 0.3), spread = (L) => { const v = L.map((r) => r.rel).sort((x, y) => x - y); if (!v.length) return { n: 0 }; return { n: v.length, p10: v[Math.floor(v.length * 0.1)].toFixed(2), med: v[Math.floor(v.length / 2)].toFixed(2), p90: v[Math.floor(v.length * 0.9)].toFixed(2), max: v[v.length - 1].toFixed(2) }; };
console.log('meccaniche misurate', rows.length, onlyNew ? '(edition 3.2)' : '(tutte)', '| contributo di danno misurabile', dmgRows.length, '| rapporto col bersaglio:', JSON.stringify(spread(dmgRows)));
console.log('Questa stima del danno non valida il bilanciamento di controllo, mobilita, cura e utilita.');
for (const sl of 'PMSU') console.log('  ', sl, JSON.stringify(spread(dmgRows.filter((r) => r.slot === sl))));
if (args.includes('scrivi')) {
  const out = Object.assign({}, B.BAL); let n = 0;
  for (const r of dmgRows) { const cur = out[r.id] || 1, f = Math.max(0.3, Math.min(3, cur / Math.pow(r.rel, 0.85))); if (Math.abs(r.rel - 1) > 0.12) { out[r.id] = Math.round(f * 100) / 100; n++; } }
  fs.writeFileSync(__dirname + '/mec99.js', '// Generato da tbal.js: correzioni di danno misurate dai bot. Non si scrive a mano.\nBricks.balance(' + JSON.stringify(out) + ');\n'); console.log('correzioni scritte:', n);
}
