// Collaudo del catalogo 3.2: input reali, controllo senza il lancio, condizioni utili.
// Non conta cooldown, consumo della suprema, tempo o semplice movimento dell'AI come effetto.
'use strict';
const assert = require('node:assert/strict'), fs = require('fs');
const B = require('./bricks.js'), C = require('./core.js'), City = require('./city.js');
const names = ['mec10.js', 'mec11.js', 'mec12.js', 'mec13.js', 'mec14.js', 'mec15.js'].flatMap((file) => fs.readFileSync(__dirname + '/' + file, 'utf8').split('\n').filter((s) => /^[PMSU]\|/.test(s)).map((s) => s.split('|')[1]));
const catalog = B.LIST.filter((a) => names.includes(a.nome));
assert.deepEqual(B.errors, []);
assert.equal(catalog.length, 336, 'Il catalogo previsto contiene 336 meccaniche');
const NEW = new Set('absorb release magnet transmute link debt disarm silence cleanse infect portal tether barrier mimic rewindfoe revive command form phase flight possess pact stasis clone scan'.split(' '));
const EVENT = { absorb: 'absorbHit', release: 'energyRelease', magnet: 'magnet', transmute: 'transmute', link: 'link', debt: 'debtPay', disarm: 'disarm', silence: 'silence', cleanse: 'cleanse', infect: 'infect', portal: 'portalTravel', tether: 'tether', barrier: 'barrierHit', mimic: 'mimic', rewindfoe: 'rewindReturn', revive: 'revive', command: 'command', form: 'form', phase: 'phase', flight: 'flight', possess: 'possessBody', pact: 'pactBreak', stasis: 'stasisEnd', clone: 'cloneFire', scan: 'scan' };
function ops(prog, out = new Set()) { for (const o of prog) { if (NEW.has(o.op)) out.add(o.op); for (const v of Object.values(o)) if (Array.isArray(v) && v[0] && typeof v[0] === 'object') ops(v, out); } return out; }
const input = () => ({ mx: 0, my: 0, yaw: 0, pitch: 0, fire: false, b: [false, false, false, false, false], use: false });
const slotOf = (a) => ({ P: 0, M: 1, S: 2, U: 4 })[a.slot];
function recipe(a, tier) { const ids = ['dardo', 'scatto', 'nova', 'nova', 'ira']; ids[slotOf(a)] = a.id; return { nome: 'Collaudo', slots: ids.map((id, k) => ({ id, el: 'luce', t: k === slotOf(a) ? tier : 1 })) }; }
function projectile(s, team, x, z, vx, vz, dmg = 2, life = 2) { const q = { id: s.nextId++, team, x, z, vx, vz, dmg, life, r: .2, el: '', hom: '', tr: false }; s.shots.push(q); return q; }
function killForCorpse(s, x, z) { const e = C.mkMob(s, 'sgherro', x, z, 'e'); e.spawn = 0; e.hp = 1; e.atk = 999; e.root = 999; projectile(s, 'p', e.x, e.z, 0, 0, 2, .2); return e; }
function fixture(a, tier, variant) {
  const s = C.create({ seed: 4, fame: 320, recipe: recipe(a, tier) });
  s.grid.fill(0); s.city.props = []; s.mobs = []; s.npcs = []; s.patrols = []; s.turrets = []; s.givers = []; s.quest = null;
  const p = s.player; p.x = p.z = 0; p.yaw = p.pitch = 0; p.invuln = 0; p.hurtT = 0; p.maxHp = 1000; p.hp = variant ? 800 : 400;
  for (const [x, z] of [[-4, 2], [4, 2], [-4, -3], [4, -3], [-6, -5], [6, -5]]) killForCorpse(s, x, z);
  C.step(s, 1 / 60, input()); assert.equal(s.powers.corpses.length, 6, 'I cadaveri devono provenire da vere morti');
  s.mobs = []; s.shots = []; s.events = []; p.cd.fill(0); p.res = 100; p.bank = 60;
  const portal = ops(a.prog).has('portal'), d = portal ? 14 : a.src.includes('ring ') ? 6 : 2.8;
  const positions = portal ? [[0, -d], [-2, -d], [2, -d], [0, -d - 3], [3, -d - 3], [-3, -d - 3]] : [[0, -d], [-1.8, -d], [1.8, -d], [-2, -7], [2, -7], [0, -13], [-2, -13], [2, -13], [-2, 9], [2, 9], [0, 9]];
  // L'ospite principale resta mobile anche nel controllo: immobilizzarlo
  // impedirebbe di verificare il comando diretto della possessione.
  positions.forEach(([x, z], k) => { const e = C.mkMob(s, k % 3 === 0 ? 'tiratore' : 'sgherro', x, z, 'e'); e.testKey = k; e.spawn = 0; e.hp = e.maxHp = 5000; e.root = k === 0 ? 0 : 999; e.atk = k === 0 ? .4 : 999; e.aggro = 99; });
  for (const [x, z] of [[4, 1], [-4, 1], [5, -6]]) { const e = C.mkMob(s, 'spirito', x, z, 'a'); e.spawn = 0; e.hp = 200; e.maxHp = 500; e.atk = 999; }
  const sick = s.mobs.find((e) => e.team === 'a'); sick.burnT = 10; sick.burn = 1; sick.slowT = 10; sick.slow = .2;
  // Purificazioni all'arrivo di uno scatto devono trovare qualcosa da rimuovere
  // anche a destinazione, non soltanto sotto il giocatore alla partenza.
  for (const z of [0, -10, 10]) s.zones.push({ id: s.nextId++, team: 'e', kind: 'dmg', x: 0, z, r: 2, t: 0, dur: 10, dps: 1, tick: 0, el: '' });
  return s;
}
const round = (n) => Math.round((n || 0) * 1000) / 1000;
function material(s) {
  const p = s.player;
  return JSON.stringify([
    [p.x, p.z, p.r, p.cam.x, p.cam.y, p.cam.z, p.hp, p.shield, p.bank].map(round), p.haste > 0, p.veil > 0, p.armT > 0, p.mimic && p.mimic.attack,
    p.possession && p.possession.id, p.captive && p.captive.id, p.scan ? p.scan.ids : [],
    s.kit[0].kind, s.kit[0].prog,
    s.mobs.filter((e) => !e.dead).map((e) => [e.team, e.kind, e.testKey, round(e.x), round(e.z), round(e.hp), !!e.possessed, !!e.captive, !!e.cloned, e.disarmT > 0, e.silenceT > 0, !!e.infection, !!e.debt, !!e.rewind, e.command && [e.command.rally, round(e.command.x), round(e.command.z)]]),
    s.shots.map((q) => [q.team, !!q.clone, round(q.x), round(q.y), round(q.z), round(q.vx), round(q.vy), round(q.vz), round(q.dmg)]),
    s.zones.map((z) => [z.team, z.kind, round(z.x), round(z.z), round(z.r)]),
    Object.entries(s.powers).map(([k, values]) => [k, values.map((v) => [round(v.x), round(v.z), v.r, v.l, v.share, v.hp, v.target, v.ids && v.ids.length, v.foes, v.shots])]),
  ]);
}
const CAP = { fields: 4, links: 3, portals: 1, tethers: 12, barriers: 4, corpses: 24 };
function valid(s, where) {
  const numeric = (o, keys) => { for (const k of keys) if (o[k] !== undefined) assert.ok(Number.isFinite(o[k]), where + ': non finito ' + k); };
  numeric(s.player, ['x', 'z', 'r', 'hp', 'res', 'bank']);
  numeric(s.player.cam, ['x', 'y', 'z']);
  assert.ok(s.player.cd.every(Number.isFinite), where + ': ricarica non finita');
  if (!s.player.ride && !s.player.leap && !s.player.phase) assert.ok(!C.solidAt(s, s.player.x, s.player.z), where + ': giocatore dentro un muro');
  const p = s.player, modes = ['form', 'phase', 'flight', 'possession'];
  assert.ok(modes.filter((k) => p[k]).length <= 1, where + ': trasformazioni incompatibili simultanee');
  for (const k of modes.concat('captive')) if (p[k]) {
    numeric(p[k], ['t', 'slot', 'size', 'speed', 'h', 'y', 'id', 'x', 'z', 'mul', 'd']);
    if (p[k].safe) numeric(p[k].safe, ['x', 'z']);
  }
  assert.ok(Math.abs(p.r - .6 * (p.form ? p.form.size : 1)) < 1e-6, where + ': raggio non coerente con taglia');
  if (p.form) assert.ok(p.form.size >= .4 && p.form.size <= 2.2, where + ': taglia fuori limite');
  if (p.flight) assert.ok(p.flight.y >= C.EYE && p.flight.y <= p.flight.h, where + ': quota fuori limite');
  const possessed = s.mobs.filter((e) => !e.dead && e.possessed), captive = s.mobs.filter((e) => !e.dead && e.captive);
  assert.ok(possessed.length <= 1 && captive.length <= 1, where + ': piu ospiti o prigionieri');
  for (const e of possessed) assert.ok(p.possession && p.possession.id === e.id && e.team === 'a', where + ': ospite senza controllo');
  for (const e of captive) assert.ok(p.captive && p.captive.id === e.id, where + ': prigioniero senza cattura');
  const copies = s.mobs.filter((e) => !e.dead && e.cloned);
  assert.ok(copies.length <= 3, where + ': piu di tre copie');
  for (const e of copies) { numeric(e, ['life', 'cloneX', 'cloneZ', 'cloneMul']); assert.ok(e.team === 'a' && e.cloneMul >= .1 && e.cloneMul <= .8, where + ': copia fuori contratto'); }
  if (p.scan) {
    numeric(p.scan, ['r', 't', 'refresh']);
    assert.ok(p.scan.r >= 4 && p.scan.r <= 50 && p.scan.ids.length <= 64, where + ': scansione fuori limite');
    assert.ok(p.scan.ids.every(Number.isFinite) && new Set(p.scan.ids).size === p.scan.ids.length, where + ': contatti non validi');
  }
  for (const e of s.mobs) { numeric(e, ['x', 'z', 'hp', 'kx', 'kz']); for (const k of ['debt', 'infection', 'rewind', 'command', 'pact']) if (e[k]) numeric(e[k], ['x', 'z', 't', 'dps', 'amount', 'cap', 'l', 'd', 'root', 'serial']); }
  for (const q of s.shots) numeric(q, ['x', 'y', 'z', 'vx', 'vy', 'vz', 'dmg', 'life']);
  for (const [k, limit] of Object.entries(CAP)) { assert.ok(s.powers[k].length <= limit, where + ': limite ' + k); for (const v of s.powers[k]) numeric(v, ['x', 'z', 'r', 't', 'hp']); }
  assert.ok(s.player.bank >= 0 && s.player.bank <= 300, where + ': banca fuori limite');
  assert.ok(s.shots.length <= 300 && s.mobs.length <= 90 && s.zones.length <= 60, where + ': crescita entita');
}
function cleanup(s) {
  assert.equal(C.setRecipe(s, B.PRESETS[0]), true);
  for (const [k, values] of Object.entries(s.powers)) assert.equal(values.length, 0, 'cleanup ' + k);
  assert.equal(s.player.absorb, null); assert.equal(s.player.mimic, null); assert.equal(s.player.bank, 0);
  assert.equal(s.player.scan, null, 'cleanup scansione');
  assert.equal(s.mobs.filter((e) => !e.dead && e.cloned).length, 0, 'cleanup copie');
  for (const k of ['form', 'phase', 'flight', 'possession', 'captive']) assert.equal(s.player[k], null, 'cleanup ' + k);
  assert.equal(s.player.r, .6, 'cleanup taglia');
  if (!s.player.leap && !s.player.ride) assert.equal(s.player.cam.y, C.EYE, 'cleanup quota camera');
  for (const e of s.mobs) { assert.ok(!e.debt && !e.infection && !e.rewind && !e.command && !e.pact); assert.ok(!e.disarmT && !e.silenceT && !e.possessed && !e.captive); }
}
function environment(s, frame) {
  if (frame % 30 === 0) {
    // Stessa pioggia di prova nel caso attivo e nel controllo: raccogliere, curvare,
    // riflettere e trasmutare devono interagire con proiettili davvero presenti.
    for (const z of [-16, -9, -3, 0, 8, 16]) { projectile(s, 'e', -.8, z, .3, z > 0 ? -8 : 8, 1); projectile(s, 'e', .8, z, -.2, z > 0 ? -6 : 6, 1); }
    projectile(s, 'e', s.player.x, s.player.z, 0, 0, 1, .1);
  }
  if (frame > 0 && frame % 90 === 0) {
    // Un vero colpo del giocatore produce l'uccisione che i programmi kill attendono.
    const target = s.mobs.find((e) => e.testKey === 0 && !e.dead);
    if (target) killForCorpse(s, target.x + 1, target.z + 1);
  }
  if (frame === 90) for (const e of s.mobs) if (e.team === 'e' && e.testKey !== undefined) e.x += 4;
  if (frame === 120) for (const e of s.mobs) if (!e.dead && e.team === 'a' && e.pd) projectile(s, 'e', e.x, e.z, 0, 0, 1000, .1);
}
function scenario(a, tier, variant) {
  const tested = fixture(a, tier, variant), control = fixture(a, tier, variant), si = slotOf(a), newOps = ops(a.prog), wanted = new Set([...newOps].map((k) => EVENT[k]));
  let changed = false, cast = false, replicated = false, revealed = false; const observed = new Set();
  for (let frame = 0; frame < 720; frame++) {
    for (const [s, active] of [[tested, true], [control, false]]) {
      environment(s, frame); const i = input(), target = s.mobs.find((e) => e.testKey === 0 && !e.dead);
      if (target) i.yaw = Math.atan2(-(target.x - s.player.x), -(target.z - s.player.z));
      if (variant && frame < 20) i.mx = .25;
      // Poteri con interazione richiedono colpi, scatti e altri lanci reali successivi.
      if (si === 0) i.fire = active && frame < 360;
      else { i.b[si] = active && frame === 0; i.fire = frame >= 30 && frame % 30 < 2; }
      if (frame === 45 && si !== 1) i.b[1] = true;
      if (frame === 60 && si !== 3) i.b[3] = true;
      if (newOps.has('portal') && frame >= 20 && frame < 180) i.my = 1;
      // Gli stessi input muovono il giocatore nel controllo e il corpo attivo
      // nel caso testato: possesso e taglia devono produrre conseguenze reali.
      if (['form', 'phase', 'flight', 'possess'].some((op) => newOps.has(op)) && frame >= 20 && frame < 120) i.my = .5;
      if (newOps.has('flight') && frame >= 20 && frame < 120) i.pitch = .55;
      if (newOps.has('clone') && frame >= 20 && frame < 120) i.mx = .4;
      C.step(s, 1 / 60, i);
      if (active) for (const e of s.events) { if (e.type === 'cast' && e.slot === si) cast = true; if (wanted.has(e.type)) observed.add(e.type); }
      // Per le copie non basta evocare un corpo o un evento: il primario deve
      // emettere una vera replica. Il controllo riceve gli stessi colpi/input.
      if (active && i.fire && s.shots.some((q) => q.clone && q.life > 0 && q.dmg > 0)) replicated = true;
      s.events.length = 0;
      if (frame % 30 === 0) valid(s, a.nome + ' grado ' + tier);
    }
    if (!changed && material(tested) !== material(control)) changed = true;
    if (newOps.has('scan') && tested.player.scan && tested.player.scan.ids.length > 0 && JSON.stringify(tested.player.scan.ids) !== JSON.stringify(control.player.scan ? control.player.scan.ids : [])) revealed = true;
    if (newOps.has('clone')) assert.ok(!control.shots.some((q) => q.clone), 'Il controllo senza lancio non deve replicare');
  }
  cleanup(tested); cleanup(control);
  return { ok: cast && changed && observed.size > 0 && (!newOps.has('clone') || (replicated && observed.has('cloneFire'))) && (!newOps.has('scan') || revealed), cast, changed, replicated, revealed, observed: [...observed], wanted: [...wanted] };
}
function smoke(filter) {
  let n = 0, retries = 0; const failures = [];
  for (const a of catalog.filter((a) => !filter || a.nome.toLowerCase().includes(filter.toLowerCase()))) {
    for (const tier of [1, 2, 3]) {
      let r = scenario(a, tier, 0);
      if (!r.ok) { retries++; r = scenario(a, tier, 1); }
      n++; if (!r.ok) { failures.push(a.nome + ' grado ' + tier + ': ' + JSON.stringify(r)); console.error('NO', failures[failures.length - 1]); }
      if (n % 72 === 0) console.log('Catalogo: verificati ' + n + ' casi.');
    }
  }
  assert.ok(n > 0, 'Filtro senza risultati');
  assert.equal(failures.length, 0, failures.join('\n'));
  console.log('Catalogo: ' + n + ' casi verdi con controllo differenziale; ' + retries + ' fixture alternative.');
}
function fuzz() {
  const groups = { P: [], M: [], S: [], U: [] }; for (const a of catalog) groups[a.slot].push(a);
  let steps = 0, cloneCases = 0, scanCases = 0;
  for (let run = 0; run < 150; run++) {
    const rand = City.rng(20000 + run), slots = ['P', 'M', 'S', 'S', 'U'].map((slot) => { const list = groups[slot], a = list[Math.floor(rand() * list.length)]; return { id: a.id, el: Object.keys(B.ELEM)[Math.floor(rand() * 8)], t: 1 + Math.floor(rand() * 3) }; });
    const r = B.fit({ nome: 'Fuzz espansione', slots }, 24), s = C.create({ seed: 12 + run, fame: 320, theme: ['dite', 'cocito', 'malebolge'][run % 3], recipe: r });
    s.player.bank = 60; let i = input(), hadClones = false, hadContacts = false;
    for (let frame = 0; frame < 600; frame++) {
      if (frame % 15 === 0) { i = input(); i.mx = rand() * 2 - 1; i.my = rand() * 2 - 1; i.yaw = rand() * Math.PI * 2; i.pitch = rand() * 1.2 - .6; i.fire = rand() < .75; for (let k = 1; k < 5; k++) i.b[k] = rand() < .5; }
      if (frame % 150 === 0) { s.player.res = 100; projectile(s, 'e', s.player.x + 2, s.player.z - 2, -3, 3, 3); }
      C.step(s, 1 / 30, i); steps++; s.events.length = 0; if (frame % 10 === 0) valid(s, 'fuzz ' + run);
      if (s.mobs.some((e) => e.cloned && !e.dead)) hadClones = true;
      if (s.player.scan && s.player.scan.ids.length > 0) hadContacts = true;
    }
    if (hadClones) cloneCases++; if (hadContacts) scanCases++;
    cleanup(s); valid(s, 'cleanup fuzz ' + run);
  }
  assert.ok(cloneCases > 0 && scanCases > 0, 'Il fuzz deve esercitare copie e contatti reali');
  console.log('Fuzz espansione: 150 ricette, ' + steps + ' passi, limiti e cleanup verdi; copie in ' + cloneCases + ' ricette, contatti in ' + scanCases + '.');
}
const mode = process.argv[2] || 'all';
assert.ok(['all', 'smoke', 'fuzz'].includes(mode), 'Uso: node tespansione.js [all|smoke|fuzz] [filtro nome]');
if (mode !== 'fuzz') smoke(process.argv[3]);
if (mode !== 'smoke') fuzz();
