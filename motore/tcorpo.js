// Corpo e controllo: conseguenze fisiche, contratti di rilascio e ciclo di vita.
'use strict';
const assert = require('node:assert/strict');
const B = require('./bricks.js'), C = require('./core.js');
let count = 0;
function test(name, fn) { fn(); count++; console.log('ok', name); }
function world() {
  const s = C.create({ seed: 4, fame: 320 }); s.grid.fill(0); s.city.props = []; s.mobs = []; s.npcs = []; s.patrols = []; s.turrets = []; s.quest = null;
  Object.assign(s.player, { x: 0, z: 0, yaw: 0, pitch: 0, invuln: 0, hurtT: 0, res: 100 }); s.events = []; return s;
}
const input = () => ({ mx: 0, my: 0, yaw: 0, pitch: 0, fire: false, b: [false, false, false, false, false], use: false });
function frames(s, n, inp = input()) { for (let i = 0; i < n; i++) C.step(s, 1 / 60, inp); }
function foe(s, x = 0, z = -6, kind = 'sgherro') { const e = C.mkMob(s, kind, x, z, 'e'); e.spawn = 0; e.hp = e.maxHp = 1000; e.atk = 999; return e; }
function aim(s, e) { s.aim = { kind: e.boss ? 'b' : 'e', id: e.id, x: e.x, z: e.z, d: Math.hypot(e.x - s.player.x, e.z - s.player.z) }; }
function run(s, src, e, slot = 2) { if (e) aim(s, e); return C.run(s, B.parseProg(src), { K: { el: '', cd: 3 }, slot, depth: 0 }); }
function equip(s, src, slot = 2) { s.kit[slot] = { kind: 'x', nome: 'Prova isolata', prog: B.parseProg(src), cd: 20, el: '' }; }
function press(s, slot = 2) { const i = input(); i.b[slot] = true; frames(s, 1, i); }
function shot(s, x = 0, z = -3, dmg = 20, vx = 0, vz = 12) { const q = { id: s.nextId++, team: 'e', x, z, dmg, vx, vz, r: 0.3, life: 5, el: '', hom: '' }; s.shots.push(q); return q; }
const close = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) <= eps, a + ' != ' + b);

test('taglia modifica raggio, camera, danno e portata del cono', () => {
  const small = world(), big = world(); const a = foe(small, 0, -5), b = foe(big, 0, -5); run(small, 'cone r3 d20'); close(a.hp, 1000);
  run(big, 'form size2 t3'); close(big.player.r, 1.2); close(big.player.cam.y, 3.4); run(big, 'cone r3 d20'); close(b.hp, 1000 - 20 * Math.sqrt(2));
  frames(big, 181); close(big.player.r, 0.6); close(big.player.cam.y, C.EYE); assert.equal(big.player.form, null);
});
test('taglia cambia velocita e collisione nei passaggi stretti', () => {
  const normal = world(), tiny = world(); const i = input(); i.my = 1;
  for (const s of [normal, tiny]) s.city.props = [{ x: -1, z: -4, hx: 0.6, hz: 2 }, { x: 1, z: -4, hx: 0.6, hz: 2 }];
  run(tiny, 'form size.4 t5'); frames(normal, 30, i); frames(tiny, 30, i); assert.ok(normal.player.z > -2); assert.ok(tiny.player.z < -4);
  press(tiny); assert.equal(tiny.player.form, null); assert.ok(tiny.player.z > -2, 'ritorno normale incastrato nel passaggio');
});
test('ingrandimento fallisce se manca spazio e non consuma il cast', () => {
  const s = world(); s.city.props = [{ x: 1.2, z: 0, hx: 0.2, hz: 1 }]; equip(s, 'form size2.2'); press(s); assert.equal(s.player.form, null); assert.ok(s.events.some((v) => v.type === 'fizzle')); assert.ok(s.player.cd[2] <= 0);
});
test('fase attraversa ostacoli, spegne fuoco e altre abilita, poi torna al sicuro', () => {
  const s = world(); s.city.props = [{ x: 0, z: -4, hx: 4, hz: 2 }]; equip(s, 'phase t5'); equip(s, 'shot d90', 3); press(s); const i = input(); i.my = 1; i.fire = true; i.b[3] = true; frames(s, 25, i);
  assert.ok(s.player.z < -3); assert.equal(s.shots.length, 0); assert.ok(s.player.cd[3] <= 0); const cooldown = s.player.cd[2]; press(s); assert.equal(s.player.phase, null); assert.ok(s.player.z >= -1.41); assert.ok(s.player.cd[2] < cooldown);
});
test('fase annulla danni e ripristina collisione alla scadenza', () => {
  const s = world(); run(s, 'phase t.3'); shot(s, 0, -0.3, 50); frames(s, 1); close(s.player.hp, 100); frames(s, 19); assert.equal(s.player.phase, null); shot(s, 0, -0.3, 50); frames(s, 1); close(s.player.hp, 50);
});
test('volo sale e scende con pitch/movimento, resta limitato e atterra con lo stesso tasto', () => {
  const s = world(); equip(s, 'flight t10 h6 speed1.2'); press(s); const i = input(); i.my = 1; i.pitch = 0.8; frames(s, 60, i); close(s.player.flight.y, 6); close(s.player.cam.y, 6);
  i.pitch = -0.8; frames(s, 20, i); assert.ok(s.player.flight.y < 6 && s.player.flight.y > C.EYE); press(s); assert.equal(s.player.flight, null); close(s.player.cam.y, C.EYE);
});
test('volo evita pozze e melee ma non attraversa edifici', () => {
  const s = world(); run(s, 'flight t4'); const e = foe(s, 0, -1); e.atk = 0; e.aggro = 99; s.zones.push({ team: 'e', x: 0, z: 0, r: 20, dps: 20, t: 0, dur: 5, tick: 0 }); frames(s, 50); close(s.player.hp, 100);
  s.city.props = [{ x: 0, z: -4, hx: 5, hz: 1 }]; const i = input(); i.my = 1; frames(s, 50, i); assert.ok(s.player.z > -2.5); assert.match(run(s, 'dash l10'), /Non ora/);
});
test('proiettili in volo hanno quota e possono colpire a terra', () => {
  const s = world(), e = foe(s, 0, -10); e.stun = 99; run(s, 'flight t4'); s.player.flight.y = 6; aim(s, e); run(s, 'shot d20 v20', e); frames(s, 1); const q = s.shots[0]; assert.equal(q.alt, true); assert.ok(q.y > 5 && q.vy < 0); frames(s, 35); assert.ok(e.hp < 1000);
});
test('colpi alti mancano bersagli bassi, nemici possono mirare verso il volo', () => {
  const s = world(), e = foe(s, 0, -6); e.stun = 99; run(s, 'flight t5'); s.player.flight.y = 7; s.aim = { kind: '', d: 0 }; run(s, 'shot d30 v20'); frames(s, 25); close(e.hp, 1000);
  const q = shot(s, 0, -4, 20, 0, 15); frames(s, 1); assert.ok(q.alt && q.vy > 0); frames(s, 20); assert.ok(s.player.hp < 100, 'volo non deve dare immunita universale');
});
test('possesso muove ospite lasciando corpo fermo e camera segue', () => {
  const s = world(), e = foe(s, 0, -8); equip(s, 'possess g18 t5'); press(s); assert.equal(s.player.possession.id, e.id); assert.equal(e.team, 'a'); const i = input(); i.mx = 1; frames(s, 20, i); assert.ok(e.x > 1); close(s.player.x, 0); close(s.player.z, 0); close(s.player.cam.x, e.x); close(s.player.cam.z, e.z);
  press(s); assert.equal(s.player.possession, null); assert.equal(e.possessed, false); assert.equal(e.team, 'e'); close(s.player.cam.x, 0); assert.ok(s.events.some((v) => v.type === 'possessBodyEnd')); assert.ok(!s.events.some((v) => v.type === 'possess'));
});
test('possesso spara dal tiratore e colpisce con melee dello sgherro', () => {
  for (const kind of ['tiratore', 'sgherro']) { const s = world(), host = foe(s, 0, -6, kind), victim = foe(s, 0, kind === 'tiratore' ? -12 : -8); victim.stun = 99; run(s, 'possess t3 mul2', host); host.atk = 0; const i = input(); i.fire = true; frames(s, 1, i); assert.ok((host.attackSerial || 0) > 0); if (kind === 'tiratore') assert.ok(s.shots.some((q) => q.team === 'p' && q.z < -6)); frames(s, 25); assert.ok(victim.hp < 1000); }
});
test('possesso mantiene vulnerabile il corpo e blocca altri cast', () => {
  const s = world(), e = foe(s, 0, -8); run(s, 'possess t3', e); equip(s, 'buff t3 shield100', 3); press(s, 3); assert.ok(s.player.cd[3] <= 0); shot(s, 0, -0.3, 30); frames(s, 1); close(s.player.hp, 70);
});
test('possesso rilascia alla morte ospite e alla scadenza', () => {
  const s = world(), e = foe(s); run(s, 'possess t.3', e); frames(s, 20); assert.equal(s.player.possession, null); assert.equal(e.team, 'e'); run(s, 'possess t4', e); e.dead = true; frames(s, 1); assert.equal(s.player.possession, null); close(s.player.cam.z, s.player.z);
});
test('forme sono incompatibili e pesanti/boss resistono al possesso e stasi', () => {
  const s = world(), heavy = foe(s, 0, -8, 'bruto'); assert.match(run(s, 'possess', heavy), /leggero/); assert.match(run(s, 'stasis', heavy), /leggero/); run(s, 'form size2'); for (const op of ['phase', 'flight', 'possess']) assert.match(run(s, op, heavy), /impegnato/);
  C.setRecipe(s, s.recipe); C.wakeBoss(s, 0); s.boss.x = 0; s.boss.z = -6; assert.match(run(s, 'possess', s.boss), /leggero/); assert.match(run(s, 'stasis', s.boss), /leggero/);
});
test('patto movimento punisce una sola volta dopo la soglia', () => {
  const s = world(), e = foe(s); e.stun = 99; run(s, 'pact move l2 d30 root1', e); e.x = 1.9; frames(s, 1); close(e.hp, 1000); e.x = 2.1; frames(s, 1); close(e.hp, 970); assert.ok(e.root > 0); assert.equal(e.pact, null); frames(s, 5); close(e.hp, 970); assert.equal(s.events.filter((v) => v.type === 'pactBreak').length, 1);
});
test('patto attacco distingue attacchi reali da attesa e scade senza danno', () => {
  const s = world(), e = foe(s, 0, -1.5); run(s, 'pact attack t.3 d50', e); frames(s, 20); close(e.hp, 1000); assert.equal(e.pact, null);
  run(s, 'pact attack t3 d30 root1', e); e.atk = 0; e.aggro = 99; frames(s, 2); close(e.hp, 970); assert.equal(e.pact, null); assert.ok(s.player.hp < 100);
});
test('patto su boss limita danno e non lo immobilizza', () => {
  const s = world(); C.wakeBoss(s, 0); const b = s.boss; b.x = 0; b.z = -6; b.ax = 0; b.az = -6; b.ar = 30; b.wait = 99; s.player.invuln = 99; const hp = b.hp;
  run(s, 'pact move l2 d100 root3', b); b.x = 3; frames(s, 1); close(b.hp, hp - 35); assert.ok(!b.root);
});
test('stasi sospende AI, danni, stati e contagio; rilascio infligge danno reale', () => {
  const s = world(), e = foe(s); run(s, 'infect t4 dps10', e); run(s, 'stasis t3 d30', e); const z = e.z, inf = e.infection.t; run(s, 'circ r20 d100 burn20'); frames(s, 60); close(e.hp, 1000); close(e.z, z); close(e.infection.t, inf); assert.equal(e.burnT, 0); assert.equal(s.aim.kind, '');
  press(s); assert.equal(e.captive, false); assert.equal(s.player.captive, null); close(e.hp, 970); assert.ok(e.z > -5); frames(s, 35); assert.ok(e.hp < 970, 'contagio riprende dopo rilascio');
});
test('stasi nested usa bersaglio each e non la mira esterna', () => {
  const s = world(), aimed = foe(s, 12, -6), actual = foe(s, 0, -4); aim(s, aimed); run(s, 'cone r5 h.3 each(stasis t2 d0)'); assert.equal(s.player.captive.id, actual.id); assert.ok(!aimed.captive);
});
test('stasi scaglia alla scadenza, vieta una seconda cattura e toggle non paga due volte', () => {
  const s = world(), e = foe(s); equip(s, 'stasis t.3 d10 fling', 4); press(s, 4); assert.equal(s.player.res, 0); const other = foe(s, 4, -6); assert.match(run(s, 'stasis', other), /gia/); press(s, 4); assert.equal(s.player.captive, null); assert.ok(e.thrown); close(e.hp, 990); assert.ok(s.player.cd[4] > 19);
  e.thrown = null; e.stun = 0; run(s, 'stasis t.2 d20 fling', e); frames(s, 13); assert.equal(s.player.captive, null); assert.ok(e.thrown); close(e.hp, 970);
});
test('cambio ricetta pulisce forme e restituisce captive senza danni', () => {
  for (const op of ['form size.4', 'phase', 'flight', 'possess']) { const s = world(), e = foe(s); run(s, op, e); C.setRecipe(s, s.recipe); for (const k of ['form', 'phase', 'flight', 'possession']) assert.equal(s.player[k], null); close(s.player.r, 0.6); close(s.player.cam.y, C.EYE); assert.equal(e.team, 'e'); }
  const s = world(), e = foe(s); run(s, 'pact d100', e); run(s, 'stasis d100', e); C.setRecipe(s, s.recipe); assert.equal(s.player.captive, null); assert.equal(e.captive, false); assert.equal(e.pact, null); close(e.hp, 1000);
});
test('morte del corpo libera possesso e stasi prima del respawn', () => {
  const s = world(), host = foe(s, 0, -8), captive = foe(s, 4, -8); run(s, 'stasis d100', captive); run(s, 'possess', host); shot(s, 0, -0.3, 500); frames(s, 1); assert.ok(s.player.dead > 0); assert.equal(s.player.possession, null); assert.equal(s.player.captive, null); assert.equal(host.team, 'e'); assert.equal(captive.captive, false); close(captive.hp, 1000); frames(s, 185); close(s.player.r, 0.6); close(s.player.cam.y, C.EYE);
});
test('fase resta nei bordi del mondo e la scadenza dentro un ostacolo torna sicura', () => {
  const s = world(); s.player.x = C.HALF - 1; run(s, 'phase t3'); const i = input(); i.mx = 1; frames(s, 60, i); assert.ok(s.player.x <= C.HALF - s.player.r); frames(s, 125); assert.equal(s.player.phase, null); assert.ok(!C.solidAt(s, s.player.x, s.player.z));
  const q = world(); q.city.props = [{ x: 0, z: -4, hx: 4, hz: 2 }]; run(q, 'phase t.6'); const forward = input(); forward.my = 1; frames(q, 25, forward); assert.ok(q.player.z < -3); frames(q, 12); assert.equal(q.player.phase, null); assert.ok(q.player.z >= -1.41);
});
test('Eco prenotata non genera attacchi durante fase o possesso', () => {
  for (const body of ['phase t4', 'possess t4']) { const s = world(), e = foe(s, 0, -10); equip(s, 'shot d20 v10 t3', 2); s.kit[2].m = 'eco'; equip(s, body, 3); press(s, 2); press(s, 3); assert.ok(s.player.phase || s.player.possession); frames(s, 55); assert.equal(s.events.filter((v) => v.type === 'cast' && v.slot === 2).length, 1); frames(s, 120); assert.equal(s.echo.length, 0); }
});
test("volo evita attacchi al suolo ma non pioggia dall'alto", () => {
  const s = world(); C.wakeBoss(s, 0); const b = s.boss; b.x = 0; b.z = -8; b.ax = 0; b.az = -8; b.ar = 30; b.wait = 99; run(s, 'flight t5 h2.5');
  const tele = (atk) => ({ id: s.nextId++, t: 0, dmg: 30, atk, shape: 'circle', x: 0, z: 0, r: 3, wind: 0.001, then: '' });
  s.teles.push(tele('schianto')); frames(s, 1); close(s.player.hp, 100); s.teles.push(tele('pioggia')); frames(s, 1); close(s.player.hp, 70);
});
test('proiettili fissano quota alla nascita e non cambiano traiettoria cambiando mira', () => {
  const s = world(), e = foe(s, 0, -10); run(s, 'flight t5'); s.player.flight.y = 6; run(s, 'shot d20', e); const q = s.shots[0], vy = q.vy; assert.ok(vy < 0); s.aim = { kind: '', d: 0 }; const i = input(); i.yaw = 2; i.pitch = 0.8; frames(s, 1, i); close(q.vy, vy);
});
test('taglia scala anche il cono continuo dei primari originali', () => {
  const s = world(), e = foe(s, 0, -5); e.stun = 99; s.kit[0] = { kind: 'cone', range: 3, half: 0.4, dps: 100, el: '' }; const i = input(); i.fire = true; frames(s, 1, i); close(e.hp, 1000); run(s, 'form size2 t3'); s.player.tick = 0; frames(s, 1, i); close(e.hp, 1000 - 12 * Math.sqrt(2));
});
test('rampino originale non introduce uno scatto durante il volo', () => {
  const s = world(); C.wakeBoss(s, 0); const b = s.boss; b.x = 0; b.z = -8; b.ax = 0; b.az = -8; b.ar = 30; b.wait = 99; const hp = b.hp; run(s, 'flight t5'); s.kit[3] = { kind: 'pull', range: 30, dmg: 20, cd: 8, el: '' }; press(s, 3); assert.equal(s.player.dash, null); assert.ok(s.player.flight); assert.ok(s.player.cd[3] <= 0); close(b.hp, hp); assert.ok(s.events.some((v) => v.type === 'fizzle' && v.why === 'Atterra prima'));
});
console.log(count + ' prove corpo superate');
