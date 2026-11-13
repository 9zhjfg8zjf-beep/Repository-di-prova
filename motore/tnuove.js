// Contratti semantici: ogni prova isola la causa, non si affida al rumore dell'AI.
'use strict';
const assert = require('node:assert/strict');
const B = require('./bricks.js'), C = require('./core.js');
let count = 0;
function test(name, fn) { fn(); count++; console.log('ok', name); }
function world() {
  const s = C.create({ seed: 4, fame: 320 }); s.grid.fill(0); s.city.props = []; s.mobs = []; s.npcs = []; s.patrols = []; s.turrets = []; s.quest = null;
  s.player.x = 0; s.player.z = 0; s.player.yaw = 0; s.player.pitch = 0; s.player.invuln = 0; s.player.hurtT = 0; s.player.res = 100;
  s.events = []; return s;
}
const input = () => ({ mx: 0, my: 0, yaw: 0, pitch: 0, fire: false, b: [false, false, false, false, false], use: false });
function frames(s, n, inp = input()) { for (let i = 0; i < n; i++) C.step(s, 1 / 60, inp); }
function foe(s, x = 0, z = -6, kind = 'sgherro') { const e = C.mkMob(s, kind, x, z, 'e'); e.spawn = 0; e.hp = e.maxHp = 1000; e.atk = 999; return e; }
function aim(s, e) { s.aim = { kind: e.boss ? 'b' : 'e', id: e.id, x: e.x, z: e.z, d: Math.hypot(e.x - s.player.x, e.z - s.player.z) }; }
function run(s, src, e) { if (e) aim(s, e); return C.run(s, B.parseProg(src), { K: { el: '', cd: 3 }, slot: 2, depth: 0 }); }
function hit(s, e, d) { aim(s, e); return run(s, 'tgt d' + d); }
function shot(s, x = 0, z = -3, dmg = 20, vx = 0, vz = 12) { const q = { id: s.nextId++, team: 'e', x, z, dmg, vx, vz, r: 0.3, life: 5, el: '', hom: '' }; s.shots.push(q); return q; }
const close = (actual, expected, epsilon = 1e-6) => assert.ok(Math.abs(actual - expected) <= epsilon, actual + ' ≠ ' + expected);

test('parser normalizza tutte le combo storiche e rifiuta op sconosciuti anche annidati', () => {
  assert.deepEqual(B.parseProg('nth3 do(shot d8) else(shot d2)')[0].n, 3);
  assert.equal(B.parseProg('nth3 do(shot d8)')[0].op, 'nth');
  assert.throws(() => B.parseProg('buff t3; inventato d99'), /sconosciuto/);
  assert.throws(() => B.parseProg('shot then(inventato d99)'), /sconosciuto/);
  assert.deepEqual(B.errors, []);
  const s = world(); for (let i = 0; i < 3; i++) run(s, 'nth3 do(shot d8) else(shot d2)');
  assert.deepEqual(s.shots.map((q) => q.dmg), [2, 2, 8]);
});
test('assorbimento intercetta, limita banca e non ferisce il giocatore', () => {
  const s = world(); run(s, 'absorb r4 t2 cap35'); shot(s); shot(s); frames(s, 1);
  assert.equal(s.player.hp, 100); assert.equal(s.player.bank, 35); assert.equal(s.shots.length, 0);
  assert.equal(s.events.filter((e) => e.type === 'absorbHit').length, 2);
  frames(s, 125); assert.equal(s.player.absorb, null); assert.equal(s.player.bank, 35);
});
test('rilascio conserva la somma, consuma la banca e fallisce se vuota', () => {
  const s = world(); s.player.bank = 60; assert.equal(run(s, 'release n3 mul1.5'), true);
  assert.equal(s.player.bank, 0); close(s.shots.reduce((n, q) => n + q.dmg, 0), 90); assert.equal(s.shots.length, 3);
  assert.match(run(s, 'release'), /energia/); s.player.bank = 20; s.player.hp = 60; run(s, 'release heal'); close(s.player.hp, 80);
  s.player.bank = 20; run(s, 'release shield'); close(s.player.shield, 20);
});
test('magnete attrae e repelle mantenendo la velocita', () => {
  for (const repel of [false, true]) { const s = world(); run(s, 'magnet r10 t3 force20' + (repel ? ' repel' : '')); const q = shot(s, 4, -4, 10, 0, 10); frames(s, 1); assert.ok(repel ? q.vx > 0 : q.vx < 0); close(Math.hypot(q.vx, q.vz), 10); assert.equal(q.team, 'e'); }
});
test('trasmutazione converte squadra oppure risorse, senza doppio consumo', () => {
  const s = world(); const q = shot(s); run(s, 'transmute turn r10'); assert.equal(q.team, 'p'); assert.ok(q.vz < 0);
  assert.match(run(s, 'transmute'), /Nessun/); shot(s, 2, -3, 40); s.player.hp = 50; run(s, 'transmute heal mul.5'); close(s.player.hp, 70); frames(s, 1); assert.equal(s.shots.filter((q) => q.team === 'e').length, 0);
});
test('legame propaga una sola volta il danno effettivo e non il danno in eccesso', () => {
  const s = world(), a = foe(s), b = foe(s, 3, -6), c = foe(s, -3, -6); run(s, 'link @aim r8 n3 share.5', a); hit(s, a, 20); close(a.hp, 980); close(b.hp, 990); close(c.hp, 990);
  a.hp = 5; hit(s, a, 100); close(b.hp, 987.5); close(c.hp, 987.5); assert.ok(a.dead);
  const empty = world(); foe(empty); assert.match(run(empty, 'link r10'), /almeno due/);
});
test('debito registra danni reali, scade, non si autoalimenta', () => {
  const s = world(), e = foe(s); e.stun = 99; run(s, 'debt t.5 mul.5 cap12', e); hit(s, e, 40); close(e.debt.amount, 12); close(e.hp, 960); frames(s, 31); close(e.hp, 948); assert.equal(e.debt, null); assert.equal(s.events.filter((v) => v.type === 'debtPay').length, 1);
});
test('disarmo lascia camminare e impedisce attacchi base', () => {
  const s = world(), e = foe(s, 0, -3); e.atk = 0; e.aggro = 99; run(s, 'disarm t2', e); frames(s, 90); assert.ok(e.z > -3); close(s.player.hp, 100); assert.equal(s.events.filter((v) => v.type === 'mobAtk').length, 0);
  frames(s, 50); assert.ok(s.player.hp < 100);
});
test('silenzio sopprime i tiratori e non finge un effetto sui semplici melee', () => {
  const s = world(), melee = foe(s, 5, -5); assert.match(run(s, 'silence', melee), /distanza/); const e = foe(s, 0, -10, 'tiratore'); e.atk = 0; e.aggro = 99; run(s, 'silence t2', e); frames(s, 60); assert.equal(s.shots.filter((q) => q.team === 'e').length, 0); assert.ok(e.silenceT > 0);
  e.silenceT = 0; e.atk = 0; frames(s, 1); assert.ok(s.shots.some((q) => q.team === 'e'));
});
test('purificazione elimina debuff e pozze, conserva annunci boss', () => {
  const s = world(), e = C.mkMob(s, 'spirito', 2, 0, 'a'); e.spawn = 0; e.stun = 3; e.burnT = 4; e.burn = 10; s.player.hp = 50;
  s.zones.push({ team: 'e', x: 1, z: 0, r: 2 }); s.teles.push({ id: 123 }); run(s, 'cleanse r8 heal6'); close(e.stun, 0); close(e.burnT, 0); assert.equal(s.zones.length, 0); assert.equal(s.teles.length, 1); close(s.player.hp, 68); assert.match(run(s, 'cleanse'), /Nessun/);
});
test('contagio fa danno, si propaga per prossimita e ha limiti di generazione', () => {
  const s = world(), a = foe(s, 0, -6), b = foe(s, 2, -6), far = foe(s, 18, -6); for (const e of [a, b, far]) e.stun = 99;
  run(s, 'infect t4 dps10 spread4 n1', a); frames(s, 62); assert.ok(a.hp < 1000); assert.ok(b.infection && b.infection.gen === 1); assert.equal(far.infection, undefined); frames(s, 260); assert.equal(a.infection, null); assert.equal(b.infection, null); assert.equal(far.hp, 1000);
});
test('portali trasportano senza rimbalzo e scadono', () => {
  const s = world(); assert.equal(run(s, 'portal g18 r1.2 t2 shots foes'), true); const P = s.powers.portals[0]; s.player.x = P.a.x; s.player.z = P.a.z; frames(s, 1); assert.ok(Math.hypot(s.player.x - P.b.x, s.player.z - P.b.z) < 4); const z = s.player.z; frames(s, 20); close(s.player.z, z);
  const e = foe(s, P.a.x, P.a.z); e.stun = 99; frames(s, 1); assert.ok(distTo(e, P.b) < 4); const q = shot(s, P.a.x, P.a.z, 1, 0, -10); frames(s, 1); assert.ok(distTo(q, P.b) < 5); frames(s, 130); assert.equal(s.powers.portals.length, 0);
});
function distTo(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }
test('vincolo tira verso ancoraggio e si spezza oltre il limite', () => {
  const s = world(), e = foe(s); e.stun = 99; run(s, 'tether l2 break10 pull12 t5', e); e.x = 6; frames(s, 10); assert.ok(e.x < 6); e.x = 20; frames(s, 1); assert.ok(s.events.some((v) => v.type === 'tetherBreak')); frames(s, 1); assert.equal(s.powers.tethers.length, 0);
});
test('barriera blocca fisicamente e consuma resistenza con i colpi', () => {
  const s = world(); run(s, 'barrier @fwd4 l8 t5 hp30'); const b = s.powers.barriers[0], e = foe(s, 0, -7); e.aggro = 99; frames(s, 60); assert.ok(e.z <= -4.8, 'il nemico attraversa il segmento: ' + e.z);
  const q = shot(s, 1, -4.5, 20, 0, 20); frames(s, 1); assert.equal(q.life, 0); close(b.hp, 10); shot(s, -1, -4.5, 20, 0, 20); frames(s, 2); assert.equal(s.powers.barriers.length, 0);
});
test('barriera riflettente cambia velocita e squadra', () => {
  const s = world(); run(s, 'barrier @fwd4 reflect'); const q = shot(s, 0, -4.5, 10, 0, 20); frames(s, 1); assert.equal(q.team, 'p'); assert.ok(q.vz < 0); assert.ok(q.life > 0);
});
test('mimesi cambia davvero primario, mantiene sorgente originale e la ripristina', () => {
  const s = world(), e = foe(s, 0, -12, 'tiratore'), original = s.kit[0]; run(s, 'mimic t1', e); assert.notEqual(s.kit[0], original); assert.equal(s.player.mimic.attack, 'tiro'); const i = input(); i.fire = true; frames(s, 1, i); assert.ok(s.shots.some((q) => q.team === 'p'));
  run(s, 'mimic t.3', e); frames(s, 20); assert.equal(s.kit[0], original); assert.equal(s.player.mimic, null);
});
test('riavvolgimento nemico ripristina posizione senza guarirlo', () => {
  const s = world(), e = foe(s); e.stun = 99; run(s, 'rewindfoe t.5 d20', e); e.x = 4; e.hp = 900; frames(s, 31); close(e.x, 0); close(e.z, -6); close(e.hp, 880); assert.equal(e.rewind, null);
});
test('resurrezione richiede e consuma cadaveri, produce alleati temporanei', () => {
  const s = world(); assert.match(run(s, 'revive'), /cadavere/); const e = foe(s); e.hp = 10; hit(s, e, 20); assert.equal(s.powers.corpses.length, 1); run(s, 'revive n1 t1 hp70 d14'); assert.equal(s.powers.corpses.length, 0); const ally = s.mobs.find((a) => a.revived); assert.ok(ally); assert.equal(ally.team, 'a'); assert.equal(ally.maxHp, 70); assert.match(run(s, 'revive'), /cadavere/); frames(s, 90); assert.ok(ally.dead);
});
test('comando raduna e seleziona davvero un bersaglio diverso dal piu vicino', () => {
  const s = world(); assert.match(run(s, 'command rally'), /alleato/); const a = C.mkMob(s, 'spirito', 0, -10, 'a'); a.spawn = 0; const near = foe(s, 0, -8), far = foe(s, 8, -10); near.stun = far.stun = 99;
  run(s, 'command rally t1'); frames(s, 30); assert.ok(a.z > -10); assert.equal(a.tg, null); run(s, 'command t2', far); frames(s, 1); assert.equal(a.tg, far); assert.equal(a.command.target, far.id);
});
test('boss resistono ai controlli forti, silenzio conserva attacchi gia annunciati', () => {
  const s = world(); C.wakeBoss(s, 0); const b = s.boss; b.x = 0; b.z = -8; b.ax = 0; b.az = -8; b.ar = 30; b.wait = 0; b.busy = 0; s.player.invuln = 99;
  run(s, 'silence t3', b); assert.ok(b.silenceT > 0 && b.silenceT <= 1.05); frames(s, 20); assert.equal(s.teles.length, 0); b.silenceT = 0; b.wait = 0; frames(s, 1); assert.ok(s.teles.length > 0); const announced = s.teles[0]; run(s, 'silence t3', b); assert.ok(s.teles.includes(announced));
  run(s, 'rewindfoe t.3 d20', b); b.x = 4; const hp = b.hp; frames(s, 20); assert.ok(b.x > 1); assert.ok(b.hp < hp); assert.ok(b.hp >= hp - 10.01);
});
test('fallimento primo operatore non consuma ricarica o Risonanza', () => {
  const s = world(); s.kit[2] = Object.assign({}, s.kit[2], { kind: 'x', prog: B.parseProg('release'), cd: 8 }); s.kit[4] = Object.assign({}, s.kit[4], { kind: 'x', prog: B.parseProg('revive'), cd: 1 }); const i = input(); i.b[2] = i.b[4] = true; frames(s, 1, i); assert.equal(s.player.cd[2], 0); assert.equal(s.player.cd[4], 0); assert.equal(s.player.res, 100); assert.equal(s.stats.casts[2], 0); assert.equal(s.stats.casts[4], 0); assert.ok(s.events.filter((e) => e.type === 'fizzle').length >= 2);
});
test('limiti persistenti e cleanup su cambio ricetta', () => {
  const s = world(), a = foe(s), b = foe(s, 3, -6); a.stun = b.stun = 99;
  for (let i = 0; i < 20; i++) { run(s, 'magnet'); run(s, 'barrier'); run(s, 'link @aim r10', a); }
  assert.equal(s.powers.fields.length, 4); assert.equal(s.powers.barriers.length, 4); assert.equal(s.powers.links.length, 3);
  run(s, 'absorb'); s.player.bank = 50; run(s, 'debt', a); run(s, 'infect', a); run(s, 'rewindfoe', a); run(s, 'mimic', a); run(s, 'disarm', a); C.setRecipe(s, B.PRESETS[0]);
  assert.equal(s.player.absorb, null); assert.equal(s.player.bank, 0); assert.equal(s.player.mimic, null); for (const values of Object.values(s.powers)) assert.equal(values.length, 0); assert.equal(a.debt, null); assert.equal(a.infection, null); assert.equal(a.rewind, null); assert.equal(a.disarmT, 0);
});
test('morte pulisce prima del respawn e non lascia danni differiti', () => {
  const s = world(), e = foe(s, 0, -1.5); run(s, 'absorb r1'); s.player.bank = 40; run(s, 'magnet'); run(s, 'debt t2', e); run(s, 'mimic', e); const hp = e.hp; s.player.hp = 1; e.atk = 0; e.aggro = 99; frames(s, 1); assert.ok(s.player.dead > 0); assert.equal(s.player.mimic, null); assert.equal(s.player.bank, 0); assert.equal(e.debt, null); assert.equal(s.powers.fields.length, 0); frames(s, 190); assert.equal(s.player.dead, 0); close(e.hp, hp);
});
console.log(count + ' prove semantiche superate');
