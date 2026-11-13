// Il registro deriva dai risultati del Core e non assegna premi propri.
'use strict';
const assert = require('node:assert/strict');
const C = require('./core.js'), B = require('./bricks.js'), O = require('./onboarding.js'), J = require('./journal.js');
let count = 0;
function test(name, fn) { fn(); count++; console.log('ok', name); }
function world() { const s = C.create({ seed: 2, recipe: O.introRecipe() }); s.grid.fill(0); s.city.props = []; s.mobs = []; s.npcs = []; s.patrols = []; s.turrets = []; s.events = []; s.player.invuln = 99; return s; }
const input = () => ({ mx: 0, my: 0, yaw: 0, pitch: 0, fire: false, b: [false, false, false, false, false], use: false });
function step(s, journal, changes = {}) { const e0 = s.events.length; C.step(s, 1 / 60, Object.assign(input(), changes)); const events = s.events.slice(e0); journal.observe(s, events); s.events.length = 0; return events; }
function startDelivery(s, journal) { const g = s.givers.find((giver) => giver.offer && giver.offer.type === 'consegna'); assert.ok(g); s.player.x = g.x; s.player.z = g.z + 1; step(s, journal, { use: true }); assert.equal(s.quest.type, 'consegna'); }
function winDelivery(s, journal) { startDelivery(s, journal); s.player.x = s.quest.obj.x; s.player.z = s.quest.obj.z; return step(s, journal); }
function winBoss(s, journal) {
  C.wakeBoss(s, 0); const boss = s.boss; boss.hp = .1; s.player.x = boss.x; s.player.z = boss.z + 8; s.player.cd[0] = 0;
  const all = []; for (let n = 0; n < 120 && s.boss; n++) all.push(...step(s, journal, { fire: true })); assert.equal(s.boss, null); return all;
}

test('dati vuoti o vecchia Fama non diventano vittorie inventate', () => {
  const j = J.create({ saved: { fame: 320, quests: 99 } }); assert.equal(j.view().missions, 0); assert.equal(j.view().bossWins, 0); assert.equal(j.view().empty, true);
  const s = world(); s.fame = 320; j.observe(s, []); assert.equal(j.view().missions, 0);
});
test('normalizzazione limita dati e usa titoli canonici, senza campi di simulazione', () => {
  const saved = J.normalize({ version: 1, nextId: Infinity, quests: { consegna: -1, caccia: 3, corsa: '8' }, bosses: { malacoda: 2, inventato: 99 }, x: 123,
    recent: [{ id: 1, kind: 'quest', key: 'consegna', title: '<script>', city: 'dite', at: 1, fame: 8, x: 999 }, { id: 1, kind: 'boss', key: 'malacoda', city: 'dite' }, { id: 2, kind: 'boss', key: 'inesistente', city: 'dite' }] });
  assert.equal(saved.quests.consegna, 0); assert.equal(saved.quests.caccia, 3); assert.equal(saved.quests.corsa, 0); assert.equal(saved.bosses.malacoda, 2); assert.equal(saved.recent.length, 1); assert.equal(saved.recent[0].title, 'Consegna'); assert.equal(saved.nextId, 2); assert.equal(saved.x, undefined); assert.equal(saved.recent[0].x, undefined);
});
test('inizio missione, danni e tempo non sono un risultato completato', () => {
  const s = world(), j = J.create(); startDelivery(s, j); for (let n = 0; n < 60; n++) step(s, j); assert.equal(j.view().missions, 0); assert.equal(j.view().recent.length, 0);
});
test('missione conclusa registra il risultato e la Fama effettivamente concessa', () => {
  const s = world(), changes = [], j = J.create({ now: () => 123456, onChange: (value) => changes.push(value) }), before = s.fame;
  const events = winDelivery(s, j), reward = events.find((e) => e.type === 'fame' && e.why === 'missione'); assert.ok(events.some((e) => e.type === 'questDone'));
  const row = j.view().recent[0]; assert.equal(j.view().missions, 1); assert.equal(row.key, 'consegna'); assert.equal(row.at, 123456); assert.equal(row.fame, reward.n); assert.equal(s.fame, before + row.fame); assert.equal(changes.length, 1);
});
test('doppio feed dello stesso batch non duplica cronologia o premi', () => {
  const s = world(), j = J.create(), events = winDelivery(s, j), fame = s.fame;
  assert.equal(j.observe(s, events), false); assert.equal(j.view().missions, 1); assert.equal(s.fame, fame);
  const fresh = J.create(); fresh.observe(s, events.concat(events)); assert.equal(fresh.view().missions, 1);
});
test('fallimento e cambio citta non diventano completamenti', () => {
  const s = world(), j = J.create(); startDelivery(s, j); s.quest.time = .001; const events = step(s, j); assert.ok(events.some((e) => e.type === 'questFail')); assert.equal(j.view().missions, 0);
  const next = world(); j.observe(next, []); assert.equal(j.view().recent.length, 0);
});
test('vittoria boss e rivincita conservano il premio reale ridotto', () => {
  const s = world(), j = J.create(); const a = winBoss(s, j), first = j.view().recent[0], b = winBoss(s, j), second = j.view().recent[0];
  assert.equal(first.fame, a.find((e) => e.type === 'fame' && e.why === 'boss').n); assert.equal(second.fame, b.find((e) => e.type === 'fame' && e.why === 'boss').n);
  assert.ok(second.fame < first.fame); assert.equal(j.view().bossWins, 2); assert.equal(j.snapshot().bosses[first.key], 2);
});
test('boss ancora vivo o ritirata non aumentano il contatore', () => {
  const s = world(), j = J.create(); C.wakeBoss(s, 0); s.player.x = 0; s.player.z = 0; for (let n = 0; n < 320; n++) step(s, j); assert.equal(j.view().bossWins, 0);
});
test('cronologia resta entro32 risultati, mentre i contatori continuano', () => {
  let now = 0; const j = J.create({ now: () => ++now });
  for (let n = 0; n < 35; n++) winDelivery(world(), j);
  const saved = j.snapshot(); assert.equal(saved.recent.length, 32); assert.equal(j.view().missions, 35); assert.equal(saved.recent[0].id, 35); assert.equal(saved.recent.at(-1).id, 4);
  const restored = J.create({ saved }); assert.deepEqual(restored.snapshot(), saved);
});
test('lettura, serializzazione e feed non modificano Core o catalogo', () => {
  const s = world(), j = J.create(); winDelivery(s, j); const core = JSON.stringify(s), catalog = JSON.stringify(B.PRESETS), snap = j.snapshot();
  snap.quests.consegna = 999; snap.recent[0].title = 'altro'; j.view(); j.observe(s, []);
  assert.equal(j.view().missions, 1); assert.equal(j.view().recent[0].title, 'Consegna'); assert.equal(JSON.stringify(s), core); assert.equal(JSON.stringify(B.PRESETS), catalog);
});
test('ID salvati estremi non producono numeri non finiti al risultato seguente', () => {
  const j = J.create({ saved: { version: 1, nextId: Number.MAX_SAFE_INTEGER, recent: [{ id: Number.MAX_SAFE_INTEGER, kind: 'quest', key: 'consegna', city: 'dite' }] } }); winDelivery(world(), j);
  assert.ok(Number.isSafeInteger(j.snapshot().nextId)); assert.ok(j.snapshot().recent.every((row) => Number.isSafeInteger(row.id)));
});
console.log(count + ' prove registro superate');
