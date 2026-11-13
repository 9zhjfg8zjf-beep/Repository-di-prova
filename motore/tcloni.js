// Repliche dirette e percezione: nessun mero conteggio di eventi senza conseguenze.
'use strict';
const assert = require('node:assert/strict');
const B = require('./bricks.js'), C = require('./core.js');
let count = 0;
function test(name, fn) { fn(); count++; console.log('ok', name); }
function world() {
  const s = C.create({ seed: 4, fame: 320 }); s.grid.fill(0); s.city.props = []; s.mobs = []; s.npcs = []; s.patrols = []; s.turrets = []; s.quest = null;
  Object.assign(s.player, { x: 0, z: 0, yaw: 0, pitch: 0, invuln: 0, hurtT: 0, res: 100 }); s.events = []; equip(s, 'shot d20 v20 t1', 0); return s;
}
const input = () => ({ mx: 0, my: 0, yaw: 0, pitch: 0, fire: false, b: [false, false, false, false, false], use: false });
function frames(s, n, inp = input()) { for (let i = 0; i < n; i++) C.step(s, 1 / 60, inp); }
function foe(s, x = 0, z = -6, kind = 'sgherro') { const e = C.mkMob(s, kind, x, z, 'e'); e.spawn = 0; e.hp = e.maxHp = 1000; e.atk = 999; return e; }
function aim(s, e) { s.aim = { kind: e.boss ? 'b' : 'e', id: e.id, x: e.x, z: e.z, d: Math.hypot(e.x - s.player.x, e.z - s.player.z) }; }
function run(s, src, e, slot = 2) { if (e) aim(s, e); return C.run(s, B.parseProg(src), { K: { el: '', cd: 3 }, slot, depth: 0 }); }
function equip(s, src, slot = 2) { s.kit[slot] = { kind: 'x', nome: 'Prova isolata', prog: B.parseProg(src), cd: 2, el: '' }; }
function press(s, slot = 2) { const i = input(); i.b[slot] = true; frames(s, 1, i); }
function fire(s, n = 1) { const i = input(); i.fire = true; frames(s, n, i); }
function copies(s) { return s.mobs.filter((e) => e.cloned && !e.dead); }
const close = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) <= eps, a + ' != ' + b);

test('compatibilita esplicita e fallimento senza consumo per primario non replicabile', () => {
  const s = world(); assert.equal(C.canClone(s), true); equip(s, 'sum n1 spirito t5', 0); assert.equal(C.canClone(s), false); equip(s, 'clone n2', 4); press(s, 4); assert.equal(copies(s).length, 0); assert.equal(s.player.res, 100); assert.ok(s.player.cd[4] <= 0); assert.ok(s.events.some((v) => v.type === 'fizzle'));
  for (const prog of ['wait t1; shot d10', 'rep n3 do(shot d10)', 'cone r5 in1 d20', 'shot d0 then(circ d100 r5)']) { equip(s, prog, 0); assert.equal(C.canClone(s), false); }
});
test('due copie emettono due attacchi per ogni primario da origini distinte', () => {
  const s = world(); run(s, 'clone n2 mul.5 hp40 t5'); const cs = copies(s); assert.equal(cs.length, 2); const x = cs.map((c) => c.x); fire(s); assert.equal(s.shots.length, 3); const qs = s.shots.filter((q) => q.clone); assert.equal(qs.length, 2); assert.deepEqual(qs.map((q) => q.x), x); for (const q of qs) { close(q.dmg, 10); close(q.vx, 0); close(q.vz, -20); assert.equal(q.team, 'a'); }
  fire(s, 10); assert.equal(s.events.filter((v) => v.type === 'cloneFire').length, 2, 'non devono attaccare tra due primari');
});
test('cloni sono corpi vulnerabili scelti come bersagli dai nemici', () => {
  const s = world(); run(s, 'clone n1 hp10'); const c = copies(s)[0], e = foe(s, c.x, c.z + 1.4); e.atk = 0; e.aggro = 99; frames(s, 60); assert.equal(c.dead, true); assert.equal(copies(s).length, 0); assert.ok(s.events.some((v) => v.type === 'kill' && v.id === c.id));
});
test('cloni seguono il movimento ma non combattono in autonomia', () => {
  const s = world(); run(s, 'clone n1'); const c = copies(s)[0], before = c.x, e = foe(s, c.x, c.z - 2); e.stun = 99; const i = input(); i.mx = 1; frames(s, 40, i); assert.ok(c.x > before + 2); close(e.hp, 1000); assert.equal(s.shots.length, 0);
});
test('cap, parametri e durata sono limitati anche con dati avversariali', () => {
  const s = world(); run(s, 'clone n999 t999 hp999 mul999'); assert.equal(copies(s).length, 3); for (const c of copies(s)) { close(c.life, 20); close(c.hp, 150); close(c.cloneMul, 0.8); } assert.match(run(s, 'clone'), /tre copie/);
  const q = world(); run(q, 'clone n1 t.5'); frames(q, 31); assert.equal(copies(q).length, 0);
});
test('repliche non duplicano buff costi evocazioni o callback dei proiettili', () => {
  const s = world(); equip(s, 'buff t3 shield10; cost v5; shot d10 v10 t.05 then(sum n1 spirito t3)', 0); run(s, 'clone n2'); fire(s); close(s.player.hp, 95); close(s.player.shield, 10); for (const q of s.shots.filter((q) => q.clone)) assert.equal(q.px, null); frames(s, 5); assert.equal(s.mobs.filter((e) => e.kind === 'spirito').length, 1);
});
test('uccisione da copia non attiva reazioni kill ne clona altre copie', () => {
  const s = world(); run(s, 'clone n1 mul.8'); const c = copies(s)[0], e = foe(s, c.x, -8); e.hp = 5; e.stun = 99; run(s, 'trig kill t5 do(sum n1 spirito t3)'); fire(s); frames(s, 30); assert.equal(e.dead, true); assert.equal(s.mobs.filter((e) => e.kind === 'spirito').length, 0); assert.equal(s.events.filter((v) => v.type === 'cloneFire').length, 1); assert.equal(copies(s).length, 1);
});
test('proiettili delle copie conservano stati diretti ma escludono innesti e callback', () => {
  const s = world(); equip(s, 'shot d20 burn7 v20 t1 then(sum n1 spirito)', 0); s.kit[0].el = 'gelo+esplosivo'; run(s, 'clone n1 mul.5'); const c = copies(s)[0], e = foe(s, c.x, -8), neighbor = foe(s, c.x - 2, -8); e.stun = neighbor.stun = 99; fire(s); const q = s.shots.find((v) => v.clone); assert.equal(q.el, 'gelo'); assert.equal(q.px.o.then, undefined); frames(s, 35); assert.ok(e.burnT > 0); close(neighbor.hp, 1000);
});
test('cono diretto colpisce dalla posizione del clone e non dal corpo', () => {
  const s = world(); equip(s, 'cone r2 h.4 d20', 0); run(s, 'clone n1 mul.5'); const c = copies(s)[0]; c.x = -5; c.z = 0; const e = foe(s, -5, -2.5); e.stun = 99; fire(s); close(e.hp, 990); assert.ok(s.events.some((v) => v.type === 'shape' && v.x === -5));
});
test('primario raggio e melee originali vengono replicati con danno proporzionale', () => {
  for (const kind of ['beam', 'melee', 'cone']) { const s = world(); s.kit[0] = { kind, range: 4, half: 0.5, dmg: 20, dps: 100, cd: 2, el: '' }; run(s, 'clone n1 mul.5'); const c = copies(s)[0]; c.x = -5; c.z = 0; const e = foe(s, -5, -3); e.stun = 99; fire(s); close(e.hp, 1000 - (kind === 'melee' ? 10 : 6)); }
});
test('catena diretta parte dalla copia ma richiede portata e vista', () => {
  const s = world(); equip(s, 'chain d20 n1 g20', 0); run(s, 'clone n1 mul.5'); const e = foe(s, 0, -8); e.stun = 99; fire(s); close(e.hp, 970);
  s.player.cd[0] = 0; const c = copies(s)[0]; c.x = -50; c.z = 0; fire(s); close(e.hp, 950);
});
test('stordimento disarmo e silenzio impediscono le emissioni appropriate', () => {
  for (const key of ['stun', 'disarmT', 'silenceT']) { const s = world(); run(s, 'clone n1'); copies(s)[0][key] = 3; fire(s); assert.equal(s.shots.filter((q) => q.clone).length, 0); }
  const s = world(); equip(s, 'cone d20 r4', 0); run(s, 'clone n1'); copies(s)[0].silenceT = 3; fire(s); assert.equal(s.events.filter((v) => v.type === 'cloneFire').length, 1);
});
test('scan rivela attraverso muri senza abilitare mira o danno attraverso essi', () => {
  const s = world(), e = foe(s, 0, -10); e.stun = 99; const cx = C.cellOf(0), cz = C.cellOf(-5); s.grid[cx + cz * C.N] = 1; assert.equal(C.los(s, 0, 0, e.x, e.z), false); run(s, 'scan r20 t3'); assert.ok(s.player.scan.ids.includes(e.id)); frames(s, 1); assert.equal(s.aim.kind, ''); fire(s); frames(s, 40); close(e.hp, 1000);
});
test('scan segue il giocatore, aggiorna entrate e uscite, esclude alleati e captive', () => {
  const s = world(), a = foe(s, 0, -6), b = foe(s, 24, 0); a.stun = b.stun = 99; const ally = C.mkMob(s, 'spirito', 1, 0, 'a'); ally.spawn = 0; run(s, 'scan r12'); assert.deepEqual(s.player.scan.ids, [a.id]); run(s, 'stasis t3', a); frames(s, 16); assert.ok(!s.player.scan.ids.includes(a.id)); s.player.x = 22; frames(s, 16); assert.deepEqual(s.player.scan.ids, [b.id]);
});
test('scan comprende boss e limita sessantaquattro contatti', () => {
  const s = world(); for (let k = 0; k < 75; k++) foe(s, (k % 9) - 4, -5 - Math.floor(k / 9)); run(s, 'scan r999 t999'); assert.equal(s.player.scan.ids.length, 64); close(s.player.scan.r, 50); close(s.player.scan.t, 20);
  const q = world(); C.wakeBoss(q, 0); q.boss.x = 0; q.boss.z = -8; run(q, 'scan r20'); assert.ok(q.player.scan.ids.includes(q.boss.id));
});
test('scansione vuota e scadenza hanno stato esplicito, senza effetti nascosti', () => {
  const s = world(); assert.equal(run(s, 'scan t.5'), true); assert.deepEqual(s.player.scan.ids, []); frames(s, 31); assert.equal(s.player.scan, null); assert.ok(s.events.some((v) => v.type === 'scanEnd')); assert.equal(s.shots.length, 0);
});
test('cambio ricetta e morte ripuliscono copie e scansione', () => {
  for (const die of [false, true]) { const s = world(); run(s, 'clone n2'); run(s, 'scan'); if (die) { s.shots.push({ id: s.nextId++, team: 'e', x: 0, z: -0.3, vx: 0, vz: 12, life: 1, r: 0.3, dmg: 500, hom: '' }); frames(s, 1); assert.ok(s.player.dead > 0); } else C.setRecipe(s, s.recipe); assert.equal(copies(s).length, 0); assert.equal(s.player.scan, null); }
});
test('copie non colpiscono oltre muri con forme dirette', () => {
  const s = world(); equip(s, 'cone r12 h1 d20', 0); run(s, 'clone n1 mul.5'); const c = copies(s)[0]; c.x = -12; c.z = 0; const e = foe(s, -12, -10); e.stun = 99; s.grid[C.cellOf(-12) + C.cellOf(-5) * C.N] = 1; assert.equal(C.los(s, c.x, c.z, e.x, e.z), false); fire(s); close(e.hp, 1000);
});
test('attacchi annidati di reazione non diventano nuove emissioni dei cloni', () => {
  const s = world(); equip(s, 'cone d20 r5 h1 each(shot d7 n3)', 0); run(s, 'clone n1 mul.5'); const e = foe(s, 0, -3); e.stun = 99; fire(s); assert.equal(s.events.filter((v) => v.type === 'shotEnd').length, 3); assert.ok(s.shots.every((q) => !q.clone)); assert.equal(s.events.filter((v) => v.type === 'cloneFire').length, 1);
});
console.log(count + ' prove copie e sensi superate');
