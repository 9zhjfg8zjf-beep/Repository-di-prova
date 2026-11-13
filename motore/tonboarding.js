// Percorso introduttivo: prove delle azioni reali, senza browser o DOM.
'use strict';
const assert = require('node:assert/strict');
const C = require('./core.js'), B = require('./bricks.js'), O = require('./onboarding.js');
let count = 0;
function test(name, fn) { fn(); count++; console.log('ok', name); }
function world(recipe = O.introRecipe()) {
  const s = C.create({ seed: 2, recipe }); s.grid.fill(0); s.city.props = []; s.mobs = []; s.npcs = []; s.patrols = []; s.turrets = []; s.quest = null;
  Object.assign(s.player, { x: 0, z: 0, yaw: 0, pitch: 0, invuln: 0 }); s.events = []; return s;
}
const input = () => ({ mx: 0, my: 0, yaw: 0, pitch: 0, fire: false, b: [false, false, false, false, false], use: false });
function step(s, guide, changes = {}) {
  const i = Object.assign(input(), changes), e0 = s.events.length; C.step(s, 1 / 60, i); const events = s.events.slice(e0); guide.observe(s, i, events); s.events.length = 0; return events;
}
function guide(s, n = 0, extra = {}) { const g = O.create(Object.assign({ saved: { version: 1, step: n, skipped: false } }, extra)); g.start(s); return g; }

test('ricetta introduttiva valida, economica e indipendente dal catalogo', () => {
  const before = JSON.stringify(B.PRESETS), a = O.introRecipe(), b = O.introRecipe();
  assert.equal(B.valid(a), true); assert.equal(B.cost(a), 8); assert.ok(B.cost(a) <= B.budgetFor(0));
  a.slots[0].id = 'nova'; assert.equal(b.slots[0].id, 'dardo'); assert.equal(JSON.stringify(B.PRESETS), before);
});
test('checkpoint normalizzato senza inventare passaggi da dati malformati', () => {
  for (const raw of [null, [], 'ok', 1, { version: 2, step: 5 }, { version: 1, step: Infinity }, { version: 1, step: -1 }, { version: 1, step: 2.5 }]) assert.deepEqual(O.normalize(raw), { version: 1, step: 0, skipped: false });
  assert.deepEqual(O.normalize({ version: 1, step: 3, skipped: true }), { version: 1, step: 3, skipped: true });
  assert.deepEqual(O.normalize({ version: 1, step: 5, skipped: true }), { version: 1, step: 5, skipped: false });
});
test('nessuna guida attiva o completamento automatico solo creando il controller', () => {
  const s = world(), g = O.create(); for (let n = 0; n < 40; n++) step(s, g, { my: 1 });
  assert.equal(g.snapshot().step, 0); assert.equal(g.view(s).visible, false);
});
test('tempo e input contro un muro non equivalgono a camminare', () => {
  const s = world(), g = guide(s); for (let n = 0; n < 120; n++) step(s, g); assert.equal(g.snapshot().step, 0);
  s.city.props = [{ x: 0, z: -1.7, hx: 3, hz: 1 }]; for (let n = 0; n < 90; n++) step(s, g, { my: 1 }); assert.equal(g.snapshot().step, 0);
});
test('camminata reale supera il primo passo e salva un solo checkpoint', () => {
  const changes = [], s = world(), g = guide(s, 0, { onChange: (value) => changes.push(value) });
  for (let n = 0; n < 20; n++) step(s, g, { my: 1 }); assert.equal(g.snapshot().step, 1); assert.equal(changes.length, 1);
  for (let n = 0; n < 20; n++) step(s, g, { my: 1 }); assert.equal(changes.length, 1);
});
test('teletrasporto e movimento senza input non danno credito alla camminata', () => {
  const s = world(), g = guide(s); s.player.x = 50; step(s, g, { mx: 1 }); assert.equal(g.snapshot().step, 0);
  for (let n = 0; n < 10; n++) { s.player.x += .3; step(s, g); } assert.equal(g.snapshot().step, 0);
});
test('lo yaw di ingresso non completa la mira; una rotazione successiva si', () => {
  const s = world(), g = guide(s, 1); step(s, g, { yaw: Math.PI / 2 });
  for (let n = 0; n < 20; n++) step(s, g, { yaw: Math.PI / 2 }); assert.equal(g.snapshot().step, 1);
  step(s, g, { yaw: Math.PI / 2 + .4 }); assert.equal(g.snapshot().step, 2);
});
test('mira conta il movimento angolare anche attraversando meno/piu pi greco', () => {
  const s = world(), g = guide(s, 1); step(s, g, { yaw: Math.PI - .1 }); step(s, g, { yaw: -Math.PI + .3 }); assert.equal(g.snapshot().step, 2);
});
test('il Dardo deve essere emesso con input di fuoco', () => {
  const s = world(), g = guide(s, 2); step(s, g); assert.equal(g.snapshot().step, 2);
  step(s, g, { fire: true }); assert.ok(s.shots.some((q) => q.team === 'p')); assert.equal(g.snapshot().step, 3);
});
test('Catena senza bersaglio non supera il passo con il solo contatore cast', () => {
  const s = world(B.PRESETS[0]), g = guide(s, 2); const ev = step(s, g, { fire: true });
  assert.ok(ev.some((e) => e.type === 'miss')); assert.ok(s.stats.casts[0] > 0); assert.equal(g.snapshot().step, 2);
});
test('raggio e soffio continui valgono per emissioni reali senza evento cast0', () => {
  for (const preset of [B.PRESETS[1], B.PRESETS[5]]) { const s = world(preset), g = guide(s, 2); const ev = step(s, g, { fire: true }); assert.ok(s.player.beam.on || s.player.cone); assert.ok(!ev.some((e) => e.type === 'cast' && e.slot === 0)); assert.equal(g.snapshot().step, 3); }
});
test('abilita richiede un cast accettato; cooldown e fizzle non bastano', () => {
  const s = world(), g = guide(s, 3), b = [false, false, true, false, false]; s.player.cd[2] = 99;
  step(s, g, { b }); assert.equal(g.snapshot().step, 3); s.player.cd[2] = 0; step(s, g, { b }); assert.ok(s.player.shield > 0); assert.equal(g.snapshot().step, 4);
  const bad = world(B.PRESETS[0]), h = guide(bad, 3); const ev = step(bad, h, { b }); assert.ok(ev.some((e) => e.type === 'fizzle')); assert.equal(h.snapshot().step, 3);
});
test('ultimo passo soltanto dopo accettazione di una missione vera, senza premio tutorial', () => {
  let done = 0; const s = world(), g = guide(s, 4, { onDone: () => done++ }); step(s, g, { use: true }); assert.equal(g.snapshot().step, 4);
  const giver = s.givers[0]; s.player.x = giver.x; s.player.z = giver.z + 1; const fame = s.fame;
  const ev = step(s, g, { use: true }); assert.ok(ev.some((e) => e.type === 'questStart')); assert.ok(s.quest); assert.equal(s.fame, fame); assert.equal(g.snapshot().step, 5); assert.equal(done, 1);
  step(s, g, { use: true }); assert.equal(done, 1); assert.equal(g.view(s).visible, false);
});
test('saltare conserva il passo, riprendere e riavviare hanno significati distinti', () => {
  const s = world(), g = guide(s, 2); assert.equal(g.skip(), true); step(s, g, { fire: true }); assert.deepEqual(g.snapshot(), { version: 1, step: 2, skipped: true });
  const resumed = O.create({ saved: g.snapshot() }); assert.equal(resumed.view(s).visible, false); resumed.start(s); assert.equal(resumed.snapshot().step, 2); assert.equal(resumed.snapshot().skipped, false);
  resumed.start(s, { restart: true }); assert.equal(resumed.snapshot().step, 0);
});
test('cambio citta ribasa posizione e mira senza cancellare checkpoint', () => {
  const s = world(), g = guide(s, 1); step(s, g); const next = world(); next.player.x = 90; step(next, g, { yaw: 2 }); assert.equal(g.snapshot().step, 1);
});
test('morte, snapshot e lettura del modello non alterano il Core', () => {
  const s = world(), g = guide(s, 2); s.player.dead = 1; step(s, g, { fire: true }); assert.equal(g.snapshot().step, 2);
  const before = JSON.stringify(s); g.view(s, { kind: 'touch' }); g.observe(s, input(), []); g.snapshot().step = 5; assert.equal(g.snapshot().step, 2); assert.equal(JSON.stringify(s), before);
});
test('testi riflettono tastiera e lato effettivo del movimento', () => {
  const s = world(), g = guide(s); assert.match(g.view(s, { kind: 'touch', movementSide: 'right' }).text, /destra/); assert.match(g.view(s, { kind: 'keyboard' }).text, /W A S D/);
  const h = guide(s, 1); assert.match(h.view(s, { kind: 'touch', movementSide: 'right' }).text, /sinistra/);
});
console.log(count + ' prove onboarding superate');
