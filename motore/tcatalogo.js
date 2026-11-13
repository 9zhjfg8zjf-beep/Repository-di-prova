// Invarianti del catalogo: copertura, ricerca, novita e integrita delle ricette.
const assert = require('node:assert/strict');
const B = require('./bricks.js');
const before = B.LIST.map((a) => JSON.stringify([a.id, a.slot, a.cost, a.cd, a.p, a.prog]));
const originalPresets = JSON.stringify(B.PRESETS);
const costs = B.PRESETS.map((r) => B.cost(r));
require('./catalogo.js');
assert.deepEqual(B.LIST.map((a) => JSON.stringify([a.id, a.slot, a.cost, a.cd, a.p, a.prog])), before, 'classificare non deve modificare un potere');
assert.equal(JSON.stringify(B.PRESETS.slice(0, costs.length)), originalPresets, 'le ricette storiche mantengono contenuto e indici');
assert.deepEqual(B.PRESETS.slice(0, costs.length).map((r) => B.cost(r)), costs);
assert.ok(B.PRESETS.every(B.valid), 'tutte le ricette restano valide');
assert.equal(new Set(B.PRESETS.map((r) => B.catalogueNormalize(r.nome))).size, B.PRESETS.length, 'nomi delle ricette unici');
function programOps(a) {
  const ops = new Set(), seen = new WeakSet();
  function walk(value) {
    if (!value || typeof value !== 'object' || seen.has(value)) return;
    seen.add(value);
    if (typeof value.op === 'string') ops.add(value.op);
    for (const child of Object.values(value)) walk(child);
  }
  walk(a.prog);
  return ops;
}
const starters = B.PRESETS.filter((r) => r.edition === '3.2');
assert.ok(starters.length >= 4, 'almeno quattro ricette introduttive per i nuovi comportamenti');
for (const r of starters) {
  assert.ok(B.cost(r) <= 12, r.nome + ': disponibile al budget iniziale');
  assert.ok(r.slots.every((s) => s.t === 1), r.nome + ': tutti i gradi iniziano da uno');
  const powers = r.slots.map((s) => B.ARCH[s.id]);
  assert.ok(['proj', 'melee', 'beam', 'cone', 'lob'].includes(powers[0].kind), r.nome + ': primario affidabile anche senza risorse o bersagli speciali');
  const ops = new Set(powers.flatMap((a) => [...programOps(a)]));
  assert.ok(['form', 'phase', 'flight', 'possess'].filter((op) => ops.has(op)).length <= 1, r.nome + ': niente stati corporei incompatibili');
  assert.ok(!ops.has('release') || ops.has('absorb'), r.nome + ': il rilascio ha una fonte di accumulo');
  assert.ok(!ops.has('command') || ops.has('sum') || ops.has('revive') || powers.some((a) => ['summon', 'giant', 'decoy', 'decoys'].includes(a.kind)), r.nome + ': il comando ha una fonte di alleati');
  const ultimate = programOps(powers[4]);
  assert.ok(!ultimate.has('release') || ops.has('absorb'), r.nome + ': la suprema non richiede un potere assente');
}
const ids = new Set(B.FAMILIES.map((f) => f.id));
assert.equal(ids.size, B.FAMILIES.length);
for (const a of B.LIST) {
  assert.ok(a.families.length, a.id + ': manca una famiglia');
  assert.ok(a.families.every((id) => ids.has(id)), a.id + ': famiglia sconosciuta');
  assert.equal(new Set(a.families).size, a.families.length);
  assert.equal(B.ARCH[a.id], a);
  assert.ok(B.catalogueQuery({ query: a.nome }).includes(a), a.id + ': nome non ricercabile');
}
for (const id of ids) assert.ok(B.catalogueQuery({ family: id }).length, id + ': categoria orfana');
const normalizeIds = (list) => list.map((a) => a.id);
assert.deepEqual(normalizeIds(B.catalogueQuery({ query: 'GRAVITÀ' })), normalizeIds(B.catalogueQuery({ query: 'gravita' })));
assert.ok(B.catalogueQuery({ query: 'gravità' }).length > 0, 'la ricerca include i tag, non soltanto nomi e descrizioni');
for (const slot of ['P', 'M', 'S', 'U']) {
  const list = B.catalogueQuery({ slot });
  assert.equal(list.length, B.LIST.filter((a) => a.slot === slot).length, 'il catalogo non tronca a 70');
  assert.equal(new Set(list).size, list.length, 'nessun risultato duplicato');
  assert.ok(list.every((a) => a.slot === slot));
}
const fixture = { id: 'verifica_catalogo_annidata', nome: 'Verifica annidata', desc: 'Prova', slot: 'S', kind: 'x', prog: [{ op: 'rep', do: [{ op: 'absorb', t: 2 }] }], p: {} };
const edition = { id: 'verifica_catalogo_edizione', nome: 'Verifica edizione', desc: 'Prova', slot: 'M', kind: 'x', prog: [{ op: 'dash', l: 6 }], p: {}, edition: '3.2' };
const bodies = [['form', 'corpo'], ['phase', 'fase'], ['flight', 'volo'], ['possess', 'possessione'], ['pact', 'patti'], ['stasis', 'stasi'], ['clone', 'duplicazione'], ['scan', 'percezione']].map(([op, family]) => ({ id: 'verifica_' + op, nome: 'Verifica ' + op, desc: 'Prova', slot: 'S', kind: 'x', prog: [{ op: 'rep', do: [{ op }] }], p: {}, expectedFamily: family }));
B.LIST.push(fixture, edition, ...bodies);
B.refreshCatalogue();
assert.ok(fixture.isNew && edition.isNew, 'novita da operatore annidato oppure edizione');
assert.ok(fixture.families.includes('difesa') && fixture.families.includes('energia'));
assert.ok(B.catalogueQuery({ mode: 'new', query: 'annidata', family: 'energia', slot: 'S' }).includes(fixture));
assert.ok(!B.catalogueQuery({ mode: 'new', query: 'annidata', slot: 'P' }).length);
for (const a of bodies) {
  assert.ok(a.isNew && a.families.includes(a.expectedFamily), a.id + ': famiglia specifica, anche annidata');
  assert.ok(a.controls.length, a.id + ': istruzioni di controllo');
}
assert.ok(B.FAMILIES.length >= 25, 'le famiglie specifiche sono disponibili quando sono presenti tutti i comportamenti');
assert.match(bodies.find((a) => a.id === 'verifica_flight').controls.join(' '), /alto.*basso.*avanzi/);
assert.match(bodies.find((a) => a.id === 'verifica_possess').controls.join(' '), /corpo resta vulnerabile/);
assert.match(bodies.find((a) => a.id === 'verifica_phase').controls.join(' '), /Attacchi sospesi.*Ripremi/);
assert.match(bodies.find((a) => a.id === 'verifica_stasis').controls.join(' '), /Ripremi.*liberare/);
assert.match(bodies.find((a) => a.id === 'verifica_clone').controls.join(' '), /primario compatibile.*soltanto le emissioni/);
assert.match(bodies.find((a) => a.id === 'verifica_scan').controls.join(' '), /nemici.*attraverso gli ostacoli/);
B.LIST.splice(-(2 + bodies.length));
B.refreshCatalogue();
assert.equal(B.PRESETS.filter((r) => r.edition === '3.2').length, starters.length, 'aggiornare il catalogo non duplica le ricette');
assert.ok(B.catalogueQuery({ mode: 'new' }).every((a) => a.isNew));
assert.deepEqual(B.familiesOf('__proto__'), []);
assert.deepEqual(B.familiesOf('constructor'), []);
assert.deepEqual(B.catalogueQuery({ family: '__proto__' }), []);
assert.deepEqual(B.catalogueQuery({ query: '__proto__' }), []);
const copy = B.familiesOf(B.LIST[0]); copy.length = 0;
assert.ok(B.familiesOf(B.LIST[0]).length, 'il chiamante non puo mutare le famiglie tramite familiesOf');
assert.equal({}.families, undefined);
assert.equal({}.isNew, undefined);
console.log('catalogo: ' + B.LIST.length + ' poteri, ' + B.FAMILIES.length + ' famiglie, ' + B.catalogueQuery({ mode: 'new' }).length + ' novita, ' + starters.length + ' ricette introduttive; copertura e ricerca OK');
