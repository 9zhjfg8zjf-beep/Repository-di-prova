// Le schermate non possiedono il gioco: sessione e impedimenti lo governano insieme.
'use strict';
const assert = require('node:assert/strict'), App = require('./app-state.js');
let passed = 0, failed = 0;
function check(name, fn) { try { fn(); passed++; console.log('ok ' + name); } catch (e) { failed++; console.error('NO ' + name + '\n' + e.stack); } }
const active = () => { const a = App.create(); a.go('lobby'); a.setSession(true); a.go('playing'); return a; };
check('non si gioca senza sessione e rimuoverla ferma il gioco', () => {
  const a = App.create(); assert.equal(a.snapshot().screen, 'boot'); assert.equal(a.snapshot().playing, false); a.go('playing'); assert.equal(a.snapshot().screen, 'lobby');
  a.setSession(true); assert.equal(a.snapshot().playing, false); a.go('playing'); assert.equal(a.snapshot().playing, true); a.setSession(false); assert.equal(a.snapshot().screen, 'lobby'); assert.equal(a.snapshot().playing, false);
});
check('guida e impostazioni annidate tornano al chiamante senza riprendere la partita', () => {
  const a = active(); a.go('pause'); a.go('settings'); a.go('guide'); assert.equal(a.snapshot().returnTo, 'settings'); assert.deepEqual(a.snapshot().history, ['pause', 'settings']); assert.equal(a.snapshot().playing, false);
  a.back(); assert.equal(a.snapshot().screen, 'settings'); assert.equal(a.snapshot().playing, false); a.back(); assert.equal(a.snapshot().screen, 'pause'); assert.equal(a.snapshot().playing, false); a.go('playing'); assert.equal(a.snapshot().playing, true);
});
check('officina dalla lobby torna alla lobby, dalla pausa torna alla pausa', () => {
  for (const origin of ['lobby', 'pause']) {
    const a = active(); a.go(origin); a.go('loadout'); a.go('forge'); a.go('guide');
    for (const expected of ['forge', 'loadout', origin]) { a.back(); assert.equal(a.snapshot().screen, expected); assert.equal(a.snapshot().playing, false); }
  }
});
check('destinazione esplicita e doppio tap non duplicano lo storico', () => {
  const a = active(); a.go('guide', { returnTo: 'pause' }); a.go('guide', { returnTo: 'pause' }); assert.deepEqual(a.snapshot().history, ['pause']); a.back(); assert.equal(a.snapshot().screen, 'pause');
});
check('impedimenti multipli sono indipendenti e la loro rimozione non riprende', () => {
  const a = active();
  for (const reason of ['portrait', 'hidden', 'native', 'context']) { a.setBlocker(reason, true); assert.equal(a.snapshot().screen, 'pause'); assert.equal(a.snapshot().playing, false); }
  assert.equal(a.snapshot().blockers.length, 4); a.setBlocker('hidden', true); assert.equal(a.snapshot().blockers.length, 4);
  for (const reason of ['portrait', 'hidden', 'native', 'context']) { a.go('playing'); assert.equal(a.snapshot().playing, false); a.setBlocker(reason, false); assert.equal(a.snapshot().screen, 'pause'); assert.equal(a.snapshot().playing, false); }
  assert.deepEqual(a.snapshot().blockers, []); a.go('playing'); assert.equal(a.snapshot().playing, true);
});
check('sospendere un pannello conserva la bozza e toglie il ritorno automatico al gioco', () => {
  const a = active(); a.go('settings'); a.go('guide'); a.setBlocker('hidden', true); assert.equal(a.snapshot().screen, 'guide'); assert.deepEqual(a.snapshot().history, ['pause', 'settings']);
  a.setBlocker('hidden', false); a.back(); assert.equal(a.snapshot().screen, 'settings'); a.back(); assert.equal(a.snapshot().screen, 'pause'); assert.equal(a.snapshot().playing, false);
});
check('sessione persa dentro un pannello non può essere ripresa dallo storico', () => {
  const a = active(); a.go('pause'); a.go('settings'); a.go('guide'); a.setSession(false); a.back(); assert.equal(a.snapshot().screen, 'settings'); a.back(); assert.equal(a.snapshot().screen, 'lobby'); assert.equal(a.snapshot().hasSession, false); assert.equal(a.snapshot().playing, false);
});
check('caricamento ed errore non simulano; i nomi sconosciuti non cambiano stato', () => {
  const a = active(); for (const screen of ['loading', 'error', 'lobby']) { a.go(screen); assert.equal(a.snapshot().playing, false); const before = a.snapshot(); a.go('inesistente'); assert.deepEqual(a.snapshot(), before); }
});
check('snapshot indipendenti e unsubscribe non cambiano la macchina', () => {
  const a = active(), changes = [], off = a.subscribe(s => changes.push(s.screen)); a.go('pause'); a.go('settings'); const state = a.snapshot(); state.history.push('playing'); state.blockers.push('hidden'); state.screen = 'playing'; assert.deepEqual(a.snapshot().history, ['pause']); assert.deepEqual(a.snapshot().blockers, []); assert.equal(a.snapshot().screen, 'settings');
  off(); a.go('guide'); assert.deepEqual(changes, ['pause', 'settings']);
});
check('sequenze miste conservano gli invarianti di sessione, blocker e navigazione', () => {
  const a = App.create(); let seed = 217; const rand = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
  for (let i = 0; i < 2000; i++) {
    const action = rand(5); if (action === 0) a.go(App.SCREENS[rand(App.SCREENS.length)]); else if (action === 1) a.back(); else if (action === 2) a.setSession(!!rand(2)); else if (action === 3) a.setBlocker(['portrait', 'hidden', 'native', 'context'][rand(4)], !!rand(2)); else a.suspend('blur');
    const s = a.snapshot(); assert.ok(App.SCREENS.includes(s.screen)); assert.equal(s.playing, s.screen === 'playing' && s.hasSession && s.blockers.length === 0); assert.ok(!s.playing || s.hasSession); assert.equal(new Set(s.blockers).size, s.blockers.length); assert.ok(s.history.every(x => App.SCREENS.includes(x))); assert.ok(s.history.length <= 16);
  }
});
console.log('Router: ' + passed + ' prove verdi, ' + failed + ' fallite.'); if (failed) process.exitCode = 1;
