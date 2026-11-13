// Ogni meccanica scritta a mano viene lanciata contro dei bersagli: deve fare qualcosa di misurabile e non rompere nulla.
const B = require('./bricks.js'), Core = require('./core.js');
if (B.errors.length) { console.log('ERRORI DI CARICAMENTO:\n  ' + B.errors.join('\n  ')); }
const DEF = { P: 'dardo', M: 'scatto', S: 'nova', S2: 'zona', U: 'ira' };
const snap = (s, foes) => { const p = s.player; return JSON.stringify([foes.map((e) => [Math.round(e.hp), e.dead ? 1 : 0, e.stun > 0 ? 1 : 0, e.root > 0 ? 1 : 0, e.slowT > 0 ? 1 : 0, e.burnT > 0 ? 1 : 0, e.poisT > 0 ? 1 : 0, e.weakT > 0 ? 1 : 0, e.fearT > 0 ? 1 : 0, e.markT > 0 ? 1 : 0, e.chill !== 0 ? 1 : 0, e.team, e.poly > 0 ? 1 : 0, e.lift > 0 ? 1 : 0, Math.round(e.x), Math.round(e.z)]),
  Math.round(p.x), Math.round(p.z), Math.round(p.hp), Math.round(p.shield), p.haste > 0, p.veil > 0, p.hot > 0, p.fury > 0, p.reflect > 0, p.orbit > 0, p.invuln > 0.2, p.lsT > 0, p.armT > 0, p.cdrT > 0, p.rrT > 0, p.trigs.length, !!p.mem, s.freeze > 0, s.mobs.filter((e) => e.team === 'a').length, s.zones.length, Math.round(p.res), p.cd.slice(1, 4).map((c) => Math.round(c))]); };
let bad = 0, n = 0; const perSlot = { P: 0, M: 0, S: 0, U: 0 }, slow = [];
for (const a of B.LIST) {
  perSlot[a.slot]++; if (a.kind !== 'x') continue; n++;
  for (const tier of [1, 3]) {
    const ids = [DEF.P, DEF.M, DEF.S, DEF.S2, DEF.U], si = a.slot === 'P' ? 0 : a.slot === 'M' ? 1 : a.slot === 'S' ? 2 : 4; ids[si] = a.id;
    const recipe = { nome: 't', slots: ids.map((id, i) => ({ id, el: 'fuoco', t: i === si ? tier : 1 })) };
    let changed = false, err = '';
    try {
      const s = Core.create({ seed: 4, recipe, fame: 320 }); for (const e of s.mobs) e.dead = true; s.npcs.length = 0;
      const p = s.player, inp = { mx: 0, my: 0, yaw: Math.PI / 2, pitch: -0.12, fire: false, b: [false, false, false, false, false], use: false };
      const foes = [[-7, 0, 'sgherro'], [-9, 1.6, 'sgherro'], [-8.5, -1.8, 'tiratore'], [-12, 0.5, 'bruto'], [-4, 0.8, 'sgherro']].map(([dx, dz, k]) => { const e = Core.mkMob(s, k, p.x + dx, p.z + dz, 'e'); e.spawn = 0; e.atk = 99; e.hp = e.maxHp = 900; return e; });
      foes[4].atk = 0.6; p.res = 100; p.hp = 70; p.cd[2] = p.cd[3] = 6; p.cd[1] = 6;
      const run = (k) => { for (let f = 0; f < k; f++) { Core.step(s, 1 / 60, inp); s.events.length = 0; const q = s.player; if (!Number.isFinite(q.x) || !Number.isFinite(q.hp)) throw new Error('NaN'); } };
      run(6); if (a.slot !== 'P') p.cd[si] = 0; const before = snap(s, foes), t0 = Date.now();
      if (a.slot === 'P') { inp.fire = true; run(150); inp.fire = false; }
      else { inp.b[si] = true; run(1); inp.b[si] = false; const mid = snap(s, foes); if (mid !== before) changed = true; inp.fire = true; run(200); inp.fire = false; }
      if (snap(s, foes) !== before) changed = true; run(240);
      if (Date.now() - t0 > 400) slow.push(a.nome);
      if (s.mobs.length > 70 || s.shots.length > 230 || s.zones.length > 50) err = 'troppe entita';
    } catch (e) { err = e.message + ' ' + (e.stack || '').split('\n')[1]; }
    if (err || !changed) { bad++; console.log('  NO  ' + a.slot + ' ' + a.nome + ' (grado ' + tier + '): ' + (err || 'non cambia nulla') + '  [' + a.src + ']'); break; }
  }
}
console.log('meccaniche in tutto:', B.LIST.length, JSON.stringify(perSlot), '| scritte nel linguaggio:', n, '| non riuscite:', bad, '| errori di caricamento:', B.errors.length, slow.length ? '| lente: ' + slow.join(', ') : '');
