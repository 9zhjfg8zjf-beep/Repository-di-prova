// Prove mirate sulle meccaniche nuove: non basta che non si rompano, devono fare quello che dicono.
const B = require('./bricks.js'), Core = require('./core.js');
const mk = (ids, mods) => ({ nome: 't', slots: ids.map((id, i) => ({ id, el: 'fuoco', t: 2, m: mods && mods[i] || undefined })) });
const inp = () => ({ mx: 0, my: 0, yaw: Math.PI / 2, pitch: -0.1, fire: false, b: [false, false, false, false, false], use: false });
function world(recipe) { const s = Core.create({ seed: 4, recipe, fame: 320 }); for (const e of s.mobs) e.dead = true; s.npcs.length = 0; const p = s.player; p.invuln = 999; return s; }
const foe = (s, dx, dz, kind) => { const p = s.player, e = Core.mkMob(s, kind || 'sgherro', p.x + dx, p.z + dz, 'e'); e.spawn = 0; e.atk = 99; e.hp = e.maxHp = 500; return e; };
const run = (s, i, n, f) => { for (let k = 0; k < n; k++) { Core.step(s, 1 / 60, i); if (f) f(k); s.events.length = 0; } };
const ok = (name, cond, extra) => console.log((cond ? '  ok  ' : '  NO  ') + name + (extra ? '  ' + extra : ''));
{ // tentacolo: afferra, tiene, scaglia, fa male all'impatto anche ai vicini
  const s = world(mk(['dardo', 'scatto', 'tentacolo', 'nova', 'ira'])), i = inp(), a = foe(s, -8, 0), b2 = foe(s, -16, 0.5);
  run(s, i, 5); i.b[2] = true; run(s, i, 1); i.b[2] = false; run(s, i, 30);
  ok('tentacolo afferra', a.held === true && Math.hypot(a.x - s.player.x, a.z - s.player.z) < 4, 'distanza ' + Math.hypot(a.x - s.player.x, a.z - s.player.z).toFixed(1));
  i.b[2] = true; run(s, i, 1); i.b[2] = false; run(s, i, 60);
  ok('tentacolo scaglia e ferisce', !a.held && a.hp < 500 && b2.hp < 500, 'vite ' + Math.round(a.hp) + ' ' + Math.round(b2.hp) + ' ricarica ' + s.player.cd[2].toFixed(1));
}
{ const s = world(mk(['dardo', 'scatto', 'scambio', 'pozzo', 'ira'])), i = inp(), a = foe(s, -9, 0), x0 = s.player.x;
  run(s, i, 5); i.b[2] = true; run(s, i, 1); i.b[2] = false; run(s, i, 3);
  ok('scambio di posto', Math.abs(a.x - x0) < 1.5 && Math.abs(s.player.x - (x0 - 9)) < 1.5);
  const c = foe(s, -10, 3); i.b[3] = true; run(s, i, 1); i.b[3] = false; const d0 = Math.hypot(c.x - s.gp.x, c.z - s.gp.z); run(s, i, 120);
  ok('pozzo risucchia', Math.hypot(c.x - s.zones.concat([{ x: s.gp.x, z: s.gp.z }])[0].x, c.z - s.zones.concat([{ x: s.gp.x, z: s.gp.z }])[0].z) < d0, 'vita ' + Math.round(c.hp)); }
{ const s = world(mk(['boomerang', 'riavvolgi', 'specchio', 'levita', 'fenice'])), i = inp(), a = foe(s, -7, 0), p = s.player;
  i.fire = true; let hits = 0; run(s, i, 90, () => { for (const e of s.events) if (e.type === 'hit') hits++; }); i.fire = false;
  ok('boomerang colpisce andata e ritorno', hits >= 3, 'colpi ' + hits);
  const x0 = p.x; i.mx = 0; i.my = -1; run(s, i, 120); i.my = 0; const x1 = p.x; i.b[1] = true; run(s, i, 1); i.b[1] = false; run(s, i, 2);
  ok('riavvolgi riporta indietro', Math.abs(p.x - x1) > 3, 'da ' + x1.toFixed(1) + ' a ' + p.x.toFixed(1));
  const hp0 = a.hp; i.b[3] = true; run(s, i, 1); i.b[3] = false; run(s, i, 10); const lifted = a.lift > 0; run(s, i, 200);
  ok('levitazione solleva e fa cadere', lifted && a.hp < hp0);
  p.res = 100; p.invuln = 0; i.b[4] = true; run(s, i, 1); i.b[4] = false; p.hp = 1; a.atk = 0; a.stun = 0; a.x = p.x - 1.2; a.z = p.z; run(s, i, 120);
  ok('fenice rialza', p.dead <= 0 && p.hp > 20, 'vita ' + Math.round(p.hp)); }
{ const s = world(mk(['razzo', 'ancora', 'polimorfo', 'gabbia', 'singolarita'], ['esplosivo', '', '', '', ''])), i = inp(), a = foe(s, -9, 0), b2 = foe(s, -10.5, 1.5), p = s.player;
  i.fire = true; run(s, i, 50); i.fire = false; ok('razzo esplode anche sul vicino', a.hp < 500 && b2.hp < 500, Math.round(a.hp) + ' ' + Math.round(b2.hp));
  const x0 = p.x; i.b[1] = true; run(s, i, 1); i.b[1] = false; i.my = -1; run(s, i, 60); i.my = 0; i.b[1] = true; run(s, i, 1); i.b[1] = false; run(s, i, 2);
  ok('ancora riporta al segno', Math.abs(p.x - x0) < 0.6);
  i.b[2] = true; run(s, i, 1); i.b[2] = false; ok('polimorfo', a.poly > 0 || b2.poly > 0);
  i.b[3] = true; run(s, i, 1); i.b[3] = false; ok('gabbia blocca', a.root > 0 || b2.root > 0);
  p.res = 100; const h0 = a.hp + b2.hp; i.b[4] = true; run(s, i, 1); i.b[4] = false; run(s, i, 330); ok('singolarita risucchia ed esplode', a.hp + b2.hp < h0 - 150 || a.dead || b2.dead, 'tolti ' + Math.round(h0 - a.hp - b2.hp)); }
{ // innesti: stesso potere con e senza
  const dmgOf = (mod) => { const s = world(mk(['dardo', 'scatto', 'nova', 'zona', 'ira'], [mod])), i = inp(), a = foe(s, -8, 0), b2 = foe(s, -9.5, 1.2); i.fire = true; run(s, i, 240); return [Math.round(500 - a.hp), Math.round(500 - b2.hp), Math.round(s.player.res), s.zones.length]; };
  const base = dmgOf('');
  for (const m of ['esplosivo', 'rimbalzo', 'critico', 'possente', 'rapido', 'risonante', 'persistente', 'falciante']) { const r = dmgOf(m); console.log('      innesto', m.padEnd(12), 'bersaglio', r[0], 'vicino', r[1], 'risonanza', r[2], 'chiazze', r[3], '  (senza: ' + base.join(' ') + ')'); } }
