'use strict';
const assert = require('node:assert/strict'), M = require('./mobile.js'), S = require('./storage.js'), B = require('./bricks.js');
const feed = (q, seconds, fps) => { const changes = []; for (let i = 0; i < seconds * fps; i++) { const next = q.sample(1 / fps); if (next) changes.push(next); } return changes; };
for (const radius of [36, 46, 64]) {
  assert.deepEqual(M.stick(0, 0, radius), { x: 0, y: 0 });
  assert.deepEqual(M.stick(radius * .05, 0, radius), { x: 0, y: 0 });
  const half = M.stick(radius * .54, 0, radius); assert.ok(Math.abs(half.x - .5) < 1e-10); assert.equal(half.y, 0);
  const diagonal = M.stick(radius * 3, -radius * 3, radius); assert.ok(Math.abs(Math.hypot(diagonal.x, diagonal.y) - 1) < 1e-10); assert.ok(diagonal.x > 0 && diagonal.y < 0);
}
const profile = S.normalize({ controlScale: 8, controlOpacity: -3, stickRadius: '64' }, B);
assert.equal(profile.controlScale, 1.15); assert.equal(profile.controlOpacity, .55); assert.equal(profile.stickRadius, 46);
for (const value of [NaN, Infinity, null, [], {}]) assert.equal(S.normalize({ controlScale: value }, B).controlScale, 1);
const prior = S.normalize({ fame: 80, recipe: B.PRESETS[0] }, B);
assert.equal(prior.controlScale, 1); assert.equal(prior.stickRadius, 46); assert.equal(prior.fame, 80);
const saved = S.normalize({ ...prior, controlScale: .95, controlOpacity: .75, stickRadius: 60 }, B);
assert.deepEqual(S.normalize(JSON.parse(JSON.stringify(saved)), B), saved);
for (const dpr of [1, 1.5, 2]) {
  const q = M.quality(dpr), original = q.snapshot();
  assert.deepEqual(feed(q, 20, 60), []);
  // Una singola pausa lunga non abbassa il dettaglio.
  q.sample(15); assert.deepEqual(q.snapshot(), original);
  const down = feed(q, 35, 20); assert.ok(down.length >= 3);
  assert.equal(q.snapshot().ratio, .7); assert.equal(q.snapshot().bloom, false);
  assert.deepEqual(feed(q, 30, 20), []); // pavimento stabile, nessuna riallocazione continua
  const low = q.snapshot(); q.reset(); assert.deepEqual(q.snapshot(), low);
  assert.deepEqual(feed(q, 5, 60), []); // non risale immediatamente dopo la ripresa
  const up = feed(q, 120, 60); assert.ok(up.length >= 3); assert.deepEqual(q.snapshot(), original);
  for (const state of [...down, ...up]) assert.ok(state.ratio >= .7 && state.ratio <= dpr);
}
const q = M.quality(1.5);
feed(q, 30, 20); const low = q.snapshot();
feed(q, 16, 60); assert.ok(q.snapshot().level < low.level);
feed(q, 5, 20); const rejected = q.snapshot();
assert.deepEqual(feed(q, 16, 60), [], 'Una risalita fallita allunga il tempo di recupero');
assert.deepEqual(q.snapshot(), rejected);
for (const value of [NaN, Infinity, -1, 0]) assert.equal(q.sample(value), null);
console.log('mobile: joystick senza deriva, profili persistenti, discesa/recupero 3 DPR, pausa e anti-oscillazione verificati');
