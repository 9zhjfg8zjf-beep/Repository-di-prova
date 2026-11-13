// Profili reali, migrazione non distruttiva e conferme di scrittura: nessun DOM.
'use strict';
const assert = require('node:assert/strict'), B = require('./bricks.js'), Storage = require('./storage.js');
const clone = (v) => JSON.parse(JSON.stringify(v));
const kit = () => clone(B.PRESETS[0]);
function memory(initial = {}) {
  const values = new Map(Object.entries(initial)), writes = [];
  return { values, writes, fail: null, getItem(key) { if (this.fail === 'read') throw Error('access denied'); return values.has(key) ? values.get(key) : null; }, setItem(key, value) { if (this.fail === 'write' || this.fail === key) throw Error('quota'); writes.push({ key, value }); values.set(key, value); } };
}
let passed = 0, failed = 0;
async function check(name, fn) { try { await fn(); passed++; console.log('ok ' + name); } catch (e) { failed++; console.error('NO ' + name + '\n' + e.stack); } }
(async () => {
  await check('un profilo assente e leggibile è nuovo; i default sono validi e indipendenti', () => {
    const disk = memory(), a = Storage.create({ bricks: B, storage: disk });
    assert.equal(a.isNew, true); assert.equal(a.status().state, 'ready'); assert.equal(B.valid(a.data.recipe), true); assert.equal(a.data.schemaVersion, 3); assert.equal(a.data.saved.length, 0); assert.equal(a.data.onboarding, null);
    const snap = a.snapshot(); snap.recipe.slots[0].id = 'inesistente'; assert.equal(B.valid(a.data.recipe), true); assert.equal(disk.writes.length, 0);
  });
  await check('valori JSON validi ma di forma errata non rompono il profilo', () => {
    for (const raw of [null, false, 3, 'testo', [], [kit()], { recipe: [], saved: {} }, { recipe: { slots: 'no' }, saved: [null, false, {}] }]) {
      const normalized = Storage.normalize(raw, B);
      assert.equal(B.valid(normalized.recipe), true); assert.deepEqual(normalized.saved, []); assert.equal(normalized.schemaVersion, 3);
    }
    const inherited = Object.create({ fame: 400, recipe: kit() }); assert.equal(Storage.normalize(inherited, B).fame, 0);
  });
  await check('numeri e preferenze vengono limitati, senza coercizioni o proprietà estranee', () => {
    const raw = { recipe: kit(), fame: Infinity, seed: -9, sens: 99, volume: -3, quality: 'turbo', muted: 'false', invertY: true, reducedFlash: true, arbitrary: 'scarta' };
    const value = Storage.normalize(raw, B);
    assert.equal(value.fame, 0); assert.equal(value.seed, 1); assert.equal(value.sens, 2.2); assert.equal(value.volume, 0); assert.equal(value.quality, 'auto'); assert.equal(value.muted, false); assert.equal(value.invertY, true); assert.equal(value.reducedFlash, true); assert.equal('arbitrary' in value, false);
    const clamped = Storage.normalize({ fame: 1e20, seed: 1e20, sens: -1, volume: 2 }, B);
    assert.equal(clamped.fame, 1e9); assert.equal(clamped.seed, 99999); assert.equal(clamped.sens, .4); assert.equal(clamped.volume, 1);
    assert.equal(Storage.normalize({ fame: '12', sens: NaN }, B).fame, 0);
    const preferred = Storage.normalize({}, B, { reducedMotion: true }); assert.equal(preferred.reducedMotion, true);
    assert.equal(Storage.normalize({ reducedMotion: false }, B, { reducedMotion: true }).reducedMotion, false);
  });
  await check('le cinque posizioni, gli elementi, i gradi e gli innesti sono validati davvero', () => {
    for (const mutate of [r => r.slots.pop(), r => r.slots.push(r.slots[0]), r => r.slots[0].id = 'fantasma', r => r.slots[0].id = 'scatto', r => r.slots[0].el = 'radioattivo', r => r.slots[0].t = 4, r => r.slots[0].t = 1.5, r => r.slots[0].m = 'inesistente']) {
      const r = kit(); mutate(r); assert.equal(Storage.recipe(r, B), null);
    }
    const r = kit(); r.nome = 'x'.repeat(200); r.desc = 'd'.repeat(1500); r.slots[0].secret = 'drop';
    const normalized = Storage.recipe(r, B); assert.equal(B.valid(normalized), true); assert.equal(normalized.nome.length, 80); assert.equal(normalized.desc.length, 1000); assert.equal('secret' in normalized.slots[0], false);
  });
  await check('kit salvati validi, copie indipendenti e limite dodici', () => {
    const recipes = Array.from({ length: 20 }, (_, i) => ({ ...kit(), nome: 'Kit ' + i, uid: 'stabile-' + i }));
    const result = Storage.normalize({ saved: [null, {}, ...recipes] }, B);
    assert.equal(result.saved.length, 12); assert.ok(result.saved.every(B.valid)); assert.equal(result.saved[0].uid, 'stabile-0'); assert.equal(new Set(result.saved.map(r => r.uid)).size, 12);
    result.saved[0].slots[0].id = 'no'; assert.equal(B.valid(recipes[0]), true);
  });
  await check('gli identificatori duplicati restano univoci anche se collidono con quelli generati', () => {
    const r = kit(), generated = Storage.normalize({ saved: [r, r] }, B).saved[1].uid;
    const result = Storage.normalize({ saved: [{ ...r, uid: generated }, { ...r, uid: generated }] }, B);
    assert.equal(new Set(result.saved.map(x => x.uid)).size, 2);
    assert.deepEqual(Storage.normalize(result, B).saved.map(x => x.uid), result.saved.map(x => x.uid));
  });
  await check('la migrazione conserva esattamente il raw precedente prima di scrivere schema 3', () => {
    const old = JSON.stringify({ recipe: kit(), fame: 72, seed: 12, theme: 'cocito', tips: 1 }), disk = memory({ [Storage.KEY]: old });
    const a = Storage.create({ bricks: B, storage: disk }), identity = a.data;
    assert.equal(a.isNew, false); assert.equal(a.data.fame, 72); assert.equal(a.data.tips, true); assert.equal(a.data.onboarding, null); assert.equal(disk.values.get(Storage.KEY), old);
    assert.deepEqual(a.save(), { ok: true, pending: false, error: null }); assert.equal(a.data, identity);
    assert.deepEqual(disk.writes.map(x => x.key), [Storage.BACKUP_KEY, Storage.KEY]); assert.equal(disk.values.get(Storage.BACKUP_KEY), old);
    assert.equal(JSON.parse(disk.values.get(Storage.KEY)).schemaVersion, 3); assert.equal(a.status().state, 'saved');
    a.data.fame = 90; a.save(); assert.equal(disk.values.get(Storage.BACKUP_KEY), old);
  });
  await check('un backup già presente non viene sovrascritto', () => {
    const old = JSON.stringify({ recipe: kit(), fame: 11 }), previous = JSON.stringify({ recipe: kit(), fame: 4 }), disk = memory({ [Storage.KEY]: old, [Storage.BACKUP_KEY]: previous });
    assert.equal(Storage.create({ bricks: B, storage: disk }).save().ok, true); assert.equal(disk.values.get(Storage.BACKUP_KEY), previous);
  });
  await check('JSON corrotto recupera backup valido e non si presenta come primo avvio', () => {
    const old = '{rotto', previous = JSON.stringify({ recipe: kit(), fame: 55 }), disk = memory({ [Storage.KEY]: old, [Storage.BACKUP_KEY]: previous }), a = Storage.create({ bricks: B, storage: disk });
    assert.equal(a.isNew, false); assert.equal(a.status().state, 'recovered'); assert.equal(a.data.fame, 55); assert.equal(disk.values.get(Storage.KEY), old);
    assert.equal(a.save().ok, true); assert.equal(disk.values.get(Storage.BACKUP_KEY), previous); assert.equal(JSON.parse(disk.values.get(Storage.KEY)).fame, 55);
  });
  await check('dati corrotti senza backup restano recuperabili e conservati fino al salvataggio', () => {
    for (const raw of ['{', 'null', '[]', 'false', '42', '{"saved":{}}']) {
      const disk = memory({ [Storage.KEY]: raw }), a = Storage.create({ bricks: B, storage: disk });
      assert.equal(a.isNew, false); assert.equal(a.status().state, 'recovered'); assert.equal(B.valid(a.data.recipe), true); assert.equal(disk.values.get(Storage.KEY), raw);
      assert.equal(a.save().ok, true); assert.equal(disk.values.get(Storage.BACKUP_KEY), raw);
    }
  });
  await check('quota piena conserva profilo precedente e kit in RAM, senza dichiarare salvato', () => {
    const prior = JSON.stringify(Storage.normalize({ recipe: kit(), fame: 16 }, B)), disk = memory({ [Storage.KEY]: prior }), a = Storage.create({ bricks: B, storage: disk });
    a.data.recipe = { ...kit(), nome: 'Bozza conservata' }; a.data.fame = 30; disk.fail = 'write';
    assert.deepEqual(a.save(), { ok: false, pending: false, error: 'unavailable' }); assert.equal(a.status().state, 'temporary'); assert.doesNotMatch(a.status().message, /^Salvato/); assert.equal(disk.values.get(Storage.KEY), prior); assert.equal(a.data.recipe.nome, 'Bozza conservata');
    disk.fail = null; assert.equal(a.save().ok, true); assert.equal(JSON.parse(disk.values.get(Storage.KEY)).recipe.nome, 'Bozza conservata');
  });
  await check('se non si può creare il backup, la migrazione non sovrascrive il vecchio raw', () => {
    const prior = JSON.stringify({ recipe: kit(), fame: 17 }), disk = memory({ [Storage.KEY]: prior }), a = Storage.create({ bricks: B, storage: disk }); disk.fail = Storage.BACKUP_KEY;
    assert.equal(a.save().ok, false); assert.equal(disk.values.get(Storage.KEY), prior); assert.equal(disk.writes.length, 0);
  });
  await check('accesso vietato o storage assente producono stato temporaneo, mai onboarding nuovo', () => {
    const disk = memory(); disk.fail = 'read';
    for (const storage of [disk, null]) { const a = Storage.create({ bricks: B, storage }); assert.equal(a.isNew, false); assert.equal(a.status().state, 'temporary'); assert.equal(B.valid(a.data.recipe), true); }
  });
  await check('sottoscrizione e unsubscribe osservano risultati reali delle scritture', () => {
    const disk = memory(), a = Storage.create({ bricks: B, storage: disk }), events = [], off = a.subscribe(s => events.push(s.state));
    a.save(); disk.fail = 'write'; a.save(); off(); disk.fail = null; a.save(); assert.deepEqual(events, ['saved', 'temporary']);
  });
  await check('native: solo ack della scrittura pendente rende il profilo salvato', () => {
    const sent = [], a = Storage.create({ bricks: B, hostStorage: { recipe: kit() }, postNative: x => sent.push(x) });
    assert.equal(a.isNew, false); assert.equal(a.receiveAck({ v: 1, type: 'saveResult', id: 0, ok: true }), false); assert.notEqual(a.status().state, 'saved');
    assert.deepEqual(a.save(), { ok: false, pending: true, error: null }); assert.equal(sent.length, 1); assert.equal(sent[0].v, 1); assert.equal(sent[0].type, 'save'); assert.equal(a.status().state, 'pending');
    a.data.fame = 99; a.save(); const latest = sent[1];
    assert.equal(a.receiveAck({ v: 1, type: 'saveResult', id: sent[0].id, ok: true }), false); assert.equal(a.status().state, 'pending');
    for (const msg of [{ ...latest, type: 'other', ok: true }, { v: 2, type: 'saveResult', id: latest.id, ok: true }, { v: 1, type: 'saveResult', id: latest.id, ok: 'true' }]) assert.equal(a.receiveAck(msg), false);
    assert.equal(a.receiveAck({ v: 1, type: 'saveResult', id: latest.id, ok: true }), true); assert.equal(a.status().state, 'saved'); assert.equal(a.receiveAck({ v: 1, type: 'saveResult', id: latest.id, ok: true }), false);
  });
  await check('native: rifiuto, eccezione e timeout restano temporanei con dati in RAM', async () => {
    let last; const a = Storage.create({ bricks: B, hostStorage: null, ackTimeout: 15, postNative: x => { last = x; } });
    assert.equal(a.isNew, true); a.data.recipe.nome = 'Resta qui'; a.save(); assert.equal(a.receiveAck({ v: 1, type: 'saveResult', id: last.id, ok: false, error: 'invalid' }), true); assert.equal(a.status().state, 'temporary'); assert.equal(a.status().error, 'invalid'); assert.equal(a.data.recipe.nome, 'Resta qui');
    a.save(); await new Promise(resolve => setTimeout(resolve, 35)); assert.equal(a.status().state, 'temporary'); assert.equal(a.data.recipe.nome, 'Resta qui');
    const b = Storage.create({ bricks: B, postNative() { throw Error('bridge offline'); } }); assert.equal(b.save().ok, false); assert.equal(b.status().state, 'temporary');
    const c = Storage.create({ bricks: B, hostError: 'unavailable', postNative() {} }); assert.equal(c.isNew, false); assert.equal(c.status().state, 'temporary');
  });
  await check('native: ack sincrono non lascia falsi pending e snapshot inviato indipendente', () => {
    let a, sent; a = Storage.create({ bricks: B, postNative(message) { sent = message; a.receiveAck({ v: 1, type: 'saveResult', id: message.id, ok: true }); } });
    assert.deepEqual(a.save(), { ok: true, pending: false, error: null }); a.data.fame = 12; assert.equal(sent.data.fame, 0); assert.equal(a.status().state, 'saved');
  });
  console.log('Storage: ' + passed + ' prove verdi, ' + failed + ' fallite.'); if (failed) process.exitCode = 1;
})();
