// Segni persistenti dei poteri: porte, legami e difese devono essere leggibili.
// Materiali normali e geometrie condivise: niente pareti additive davanti alla camera.
G.powerStatusSnapshot = function (s) {
  if (!s || !s.player) return [];
  const p = s.player, rows = [], mobs = s.mobs || [], seconds = (n) => Math.ceil(Math.max(0, n)) + ' s';
  const number = (n) => String(Math.round(n * 10) / 10), active = (value) => value && Number.isFinite(value.t) && value.t > 0;
  const add = (key, name, hud, value, resource, instruction, critical = false) => rows.push({ key, name, hud, left: value ? value.t : null, time: value ? seconds(value.t) : 'Senza scadenza', resource, instruction, critical });
  // Il Core ammette un solo corpo alternativo, piu' una creatura in stasi.
  // Questi sono i due stati che non devono mai sparire dietro il conteggio.
  const bodyKey = ['possession', 'phase', 'flight', 'form'].find((key) => active(p[key]));
  if (bodyKey) {
    const value = p[bodyKey], manual = Number.isInteger(value.slot) && value.slot >= 1 && value.slot <= 4;
    if (bodyKey === 'possession') add(bodyKey, 'Possessione', 'Corpo esposto · ' + seconds(value.t), value, 'Il tuo corpo è vulnerabile · vita ' + Math.ceil(p.hp) + '/' + p.maxHp,
      'Muovi e attacca con l’ospite. ' + (manual ? 'Ripremi lo stesso potere per rientrare nel tuo corpo.' : 'Rientri nel tuo corpo alla scadenza.'), true);
    else if (bodyKey === 'phase') add(bodyKey, 'Fase', 'Fase · ' + seconds(value.t), value, 'Attraversi i muri · nuovi attacchi spenti',
      manual ? 'Ripremi lo stesso potere per tornare solido.' : 'Torni solido alla scadenza.', true);
    else if (bodyKey === 'flight') { const height = Math.max(0, value.y - Core.EYE).toFixed(1); add(bodyKey, 'Volo', 'Volo · ' + height + ' m · ' + seconds(value.t), value, 'Quota ' + height + ' m sopra il terreno',
      'Guarda in alto o in basso mentre ti muovi per cambiare quota. ' + (manual ? 'Ripremi lo stesso potere per atterrare.' : 'Atterri alla scadenza.'), true); }
    else add(bodyKey, 'Taglia', 'Taglia ×' + value.size.toFixed(1) + ' · ' + seconds(value.t), value, 'Taglia ×' + value.size.toFixed(1),
      manual ? 'Ripremi lo stesso potere per tornare normale.' : 'Torni alla taglia normale alla scadenza.', true);
  }
  if (active(p.captive)) {
    const value = p.captive, target = mobs.find((e) => e.id === value.id && !e.dead), shared = bodyKey && p[bodyKey].slot === value.slot;
    const bodyName = { form: 'la trasformazione', phase: 'la fase', flight: 'il volo', possession: 'la possessione' }[bodyKey];
    let instruction = Number.isInteger(value.slot) && value.slot >= 1 && value.slot <= 4 ? (shared ? 'Prima termina ' + bodyName + ' con lo stesso potere; poi ripremilo per liberare la creatura.' : 'Ripremi lo stesso potere per liberare la creatura.') : 'La creatura viene liberata alla scadenza.';
    if (value.fling) instruction += ' Il rilascio manuale la scaglia nella direzione dello sguardo.';
    add('captive', 'Stasi', 'Stasi · ' + seconds(value.t), value, (target ? 'Creatura: ' + target.kind : 'Creatura catturata') + (value.d > 0 ? ' · rilascio ' + number(value.d) + ' danni' : ''), instruction, true);
  }
  if (active(p.mimic)) {
    const attack = { tiro: 'Tiro', artiglio: 'Artiglio', pesante: 'Pesante', boss: 'Onda' }[p.mimic.attack] || 'Copiato';
    add('mimic', 'Imitazione', 'Imitazione · ' + attack, p.mimic, 'Primario: ' + attack, 'Usa il primario copiato; il tuo ritorna alla scadenza.');
  }
  if (Number.isFinite(p.bank) && p.bank > 0) add('bank', 'Energia raccolta', 'Energia · ' + Math.round(p.bank), null, Math.round(p.bank) + ' energia', 'Si spende con un potere di rilascio. Si perde alla morte o cambiando kit.');
  if (active(p.absorb)) add('absorb', 'Assorbimento', 'Assorbe · ' + seconds(p.absorb.t), p.absorb, 'Raggio ' + number(p.absorb.r) + ' m · limite ' + number(p.absorb.cap), 'Intercetta i proiettili nemici vicini e accumula energia.');
  if (active(p.scan)) {
    const alive = new Set(mobs.filter((e) => !e.dead && !e.captive).map((e) => e.id)); if (s.boss && !s.boss.dead) alive.add(s.boss.id);
    const count = p.scan.ids.filter((id) => alive.has(id)).length;
    add('scan', 'Rilevamento', 'Rilevamento · ' + count, p.scan, count + (count === 1 ? ' presenza' : ' presenze') + ' · raggio ' + number(p.scan.r) + ' m', 'Vedi le presenze rilevate anche dietro gli ostacoli. La scansione non mira e non colpisce.');
  }
  const clones = mobs.filter((e) => e.cloned && !e.dead && e.life > 0).sort((a, b) => a.cloneSlot - b.cloneSlot);
  if (clones.length) {
    const first = Math.min(...clones.map((e) => e.life)), last = Math.max(...clones.map((e) => e.life));
    add('clones', 'Copie attive', 'Copie attive · ' + clones.length, { t: first }, clones.map((e, i) => 'Copia ' + (i + 1) + ': ' + Math.ceil(e.hp) + '/' + e.maxHp + ' vita, ' + seconds(e.life)).join(' · '), 'Ripetono gli attacchi diretti compatibili del primario. Possono essere colpite.');
    if (Math.ceil(first) !== Math.ceil(last)) rows[rows.length - 1].time = Math.ceil(first) + '–' + Math.ceil(last) + ' s';
  }
  return rows;
};
G.renderPowerHud = function (snapshot) {
  const hud = document.getElementById('powerHud'); if (!hud) return;
  const shown = snapshot.length > 3 ? snapshot.slice(0, 2) : snapshot, extra = snapshot.length - shown.length;
  const signature = shown.map((row) => row.key + ':' + row.hud).join('|') + '|' + extra;
  hud.classList.toggle('hidden', !snapshot.length); hud.dataset.count = String(snapshot.length);
  if (hud.dataset.signature === signature) return; hud.dataset.signature = signature;
  const nodes = shown.map((row) => { const node = document.createElement('div'); node.className = 'power-status-row'; node.dataset.power = row.key; node.textContent = row.hud; return node; });
  if (extra) { const node = document.createElement('div'); node.className = 'power-status-more'; node.textContent = '+' + extra + ' altri · pausa'; nodes.push(node); }
  hud.replaceChildren(...nodes);
};
G.buildPowerFx = function (s) {
  const scene = G.scene, views = new Map(), p = s.player;
  const geo = G.POWER_GEO = G.POWER_GEO || (() => {
    const g = { ring: new THREE.TorusGeometry(1, 0.045, 4, 28), floor: new THREE.RingGeometry(0.96, 1, 36), box: new THREE.BoxGeometry(1, 1, 1), disc: new THREE.CircleGeometry(1, 28), head: new THREE.IcosahedronGeometry(1, 1), robe: new THREE.CylinderGeometry(0.32, 0.5, 1.25, 7) };
    g.outline = new THREE.EdgesGeometry(g.box);
    for (const v of Object.values(g)) v.keep = true;
    return g;
  })();
  const color = (el) => (Bricks.ELEM[(el || '').split('+')[0]] || Bricks.ELEM.folgore).c;
  const material = (c, opacity = 1) => new THREE.MeshBasicMaterial({ color: c, opacity, transparent: opacity < 1, depthWrite: opacity === 1, side: THREE.DoubleSide });
  const mesh = (g, c, opacity, parent) => { const m = new THREE.Mesh(g, material(c, opacity)); parent.add(m); return m; };
  const ground = (parent, c, r) => { const m = mesh(geo.floor, c, 0.75, parent); m.rotation.x = -Math.PI / 2; m.position.y = 0.12; m.scale.setScalar(r); return m; };
  const wire = (parent, c) => { const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3)); const o = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: 0.8 })); o.frustumCulled = false; parent.add(o); return o; };
  const segment = (line, a, b, ya = 1.1, yb = 1.1) => { const pos = line.geometry.attributes.position; pos.setXYZ(0, a.x, ya, a.z); pos.setXYZ(1, b.x, yb, b.z); pos.needsUpdate = true; };
  const entities = new Map(), linked = [], statuses = [['silence', 'silenceT', 0x9ad9ff], ['disarm', 'disarmT', 0xffc46b], ['debt', 'debt', 0xd7a0ff], ['infection', 'infection', 0xb8f463], ['rewind', 'rewind', 0x7ce5de], ['pact', 'pact', 0xff84b6]];
  const entity = (id) => entities.get(id), statusOn = (e, field) => typeof e[field] === 'number' ? e[field] > 0 : !!e[field];
  const remove = (v) => { scene.remove(v.o); v.o.traverse((o) => { if (o.geometry && !o.geometry.keep) o.geometry.dispose(); if (o.material) o.material.dispose(); }); };
  const get = (key, build) => { let v = views.get(key); if (!v) { v = { o: new THREE.Group() }; build(v); scene.add(v.o); views.set(key, v); } v.seen = true; return v; };
  let kitRef = null, canRaise = false;
  const cameraRight = new THREE.Vector3();

  G.syncPowerFx = function (t) {
    if (G.renderPrefs && G.renderPrefs.reducedMotion) t = 0;
    entities.clear();
    for (const e of s.mobs) if (!e.dead) entities.set(e.id, e);
    if (s.boss) entities.set(s.boss.id, s.boss);
    for (const v of views.values()) v.seen = false;
    const ps = s.powers;
    if (!ps) return;
    cameraRight.setFromMatrixColumn(G.camera.matrixWorld, 0);
    for (const f of ps.fields) {
      const v = get('field' + f.id, (v) => { v.ring = ground(v.o, color(f.el), f.r); v.inner = ground(v.o, color(f.el), f.r * 0.45); v.arrows = []; for (let i = 0; i < 4; i++) { const m = mesh(geo.box, color(f.el), 0.7, v.o); m.scale.set(0.08, 0.08, 0.8); v.arrows.push(m); } });
      v.o.position.set(f.x, 0, f.z); v.inner.scale.setScalar(f.r * (0.35 + ((t * 0.6) % 0.5))); v.inner.material.opacity = 0.45;
      v.arrows.forEach((m, i) => { const a = i * Math.PI / 2 + t * (f.repel ? -0.4 : 0.4), r = f.r * (f.repel ? 0.7 : 0.4); m.position.set(Math.sin(a) * r, 0.2, Math.cos(a) * r); m.rotation.y = a; });
    }
    for (const pair of ps.portals) {
      const v = get('portal' + pair.id, (v) => { v.doors = [0, 1].map((i) => { const g = new THREE.Group(), c = i ? 0xffc46b : color(pair.el); v.o.add(g); const rim = mesh(geo.ring, c, 1, g); rim.scale.set(pair.r, pair.r * 1.5, 1); const inner = mesh(geo.ring, c, 0.5, g); inner.scale.set(pair.r * 0.83, pair.r * 1.27, 1); const veil = mesh(geo.disc, c, 0.1, g); veil.scale.set(pair.r * 0.95, pair.r * 1.45, 1); return g; }); ground(v.o, color(pair.el), 0.5); });
      v.doors.forEach((g, i) => { const q = i ? pair.b : pair.a, other = i ? pair.a : pair.b; g.position.set(q.x, pair.r * 1.5 + 0.12, q.z); g.rotation.y = Math.atan2(other.x - q.x, other.z - q.z); g.children[1].rotation.z = Math.sin(t * 2) * 0.04; });
      // Il piccolo segno a terra indica l'ingresso anche guardandolo di taglio.
      v.o.children[2].position.set(pair.a.x, 0.13, pair.a.z);
    }
    for (const b of ps.barriers) {
      const v = get('barrier' + b.id, (v) => { const c = color(b.el); v.fill = mesh(geo.box, c, 0.14, v.o); v.fill.scale.set(b.l, 2.6, 0.08); v.fill.position.y = 1.3; for (const y of [0.1, 2.6]) { const m = mesh(geo.box, c, 1, v.o); m.scale.set(b.l, 0.07, 0.09); m.position.y = y; } for (const x of [-b.l / 2, b.l / 2]) { const m = mesh(geo.box, c, 1, v.o); m.scale.set(0.07, 2.6, 0.09); m.position.set(x, 1.3, 0); } v.health = mesh(geo.box, b.reflect ? 0xffd487 : 0xc7fff0, 1, v.o); v.health.position.y = 2.8; });
      v.o.position.set(b.x, 0, b.z); v.o.rotation.y = Math.atan2(-b.dz, b.dx); const hp = Math.max(0, b.hp / b.maxHp); v.health.scale.set(Math.max(0.01, b.l * hp), 0.06, 0.1); v.fill.material.opacity = 0.08 + hp * 0.08;
    }
    for (const l of ps.links) {
      const es = linked; es.length = 0; for (const id of l.ids) { const e = entity(id); if (e && !e.dead) es.push(e); }
      if (es.length < 2) continue;
      const v = get('link' + l.id, (v) => { v.lines = Array.from({ length: 5 }, () => wire(v.o, color(l.el))); });
      v.lines.forEach((line, i) => { line.visible = i + 1 < es.length; if (line.visible) segment(line, es[0], es[i + 1], 1.5, 1.5); });
    }
    for (const f of ps.tethers) {
      const target = entity(f.target); if (!target) continue;
      const v = get('tether' + f.id, (v) => { v.line = wire(v.o, color(f.el)); v.anchor = ground(v.o, color(f.el), 0.5); v.limit = ground(v.o, color(f.el), f.l); v.limit.material.opacity = 0.2; });
      segment(v.line, f, target, 0.15, 1.2); v.anchor.position.set(f.x, 0.15, f.z); v.limit.position.set(f.x, 0.13, f.z); v.line.material.opacity = Math.hypot(f.x - target.x, f.z - target.z) > f.l ? 1 : 0.45;
    }
    // I corpi disponibili per la necromanzia sono segni bassi, non nuovi modelli.
    if (kitRef !== s.kit) { kitRef = s.kit; canRaise = s.kit.some((k) => k.prog && JSON.stringify(k.prog).includes('"revive"')); }
    if (canRaise) for (const c of ps.corpses) { const v = get('corpse' + c.id, (v) => { ground(v.o, 0xa3b8c8, 0.55); const m = mesh(geo.box, 0xa3b8c8, 0.45, v.o); m.scale.set(0.09, 0.05, 0.65); m.position.y = 0.1; }); v.o.position.set(c.x, 0, c.z); }
    for (const e of entities.values()) {
      if (e.dead || e.captive || e.possessed || Math.hypot(e.x - p.cam.x, e.z - p.cam.z) > 48) continue;
      let idx = 0, activeCount = 0; for (const [, field] of statuses) if (statusOn(e, field)) activeCount++;
      for (const [kind, field, c] of statuses) if (statusOn(e, field)) {
        const v = get(kind + e.id, (v) => { const m = mesh(geo.ring, c, 0.9, v.o); m.scale.setScalar(0.2); if (kind === 'silence' || kind === 'disarm') { const bar = mesh(geo.box, c, 1, v.o); bar.scale.set(0.5, 0.05, 0.05); bar.rotation.z = kind === 'disarm' ? Math.PI / 4 : 0; } else { const dot = mesh(geo.box, c, 1, v.o); dot.scale.setScalar(0.1); dot.rotation.z = Math.PI / 4; } });
        const offset = (idx++ - (activeCount - 1) / 2) * 0.55;
        v.o.position.set(e.x + cameraRight.x * offset, e.boss ? 4.3 : e.kind === 'bruto' ? 3.9 : 2.9, e.z + cameraRight.z * offset); v.o.quaternion.copy(G.camera.quaternion);
      }
    }
    if (p.absorb) { const v = get('absorb', (v) => { v.ring = ground(v.o, color(p.absorb.el), p.absorb.r); }); v.o.position.set(p.x, 0, p.z); v.ring.scale.setScalar(p.absorb.r); v.ring.material.opacity = 0.5 + Math.sin(t * 4) * 0.12; }
    if (p.possession) {
      const v = get('body', (v) => {
        const c = color(p.possession.el), robe = mesh(geo.robe, 0x453448, 1, v.o); robe.position.y = 0.72;
        const head = mesh(geo.head, 0xe9d3b1, 1, v.o); head.position.y = 1.55; head.scale.set(0.22, 0.26, 0.22);
        const core = mesh(geo.head, c, 1, v.o); core.position.set(0, 1.05, 0.3); core.scale.setScalar(0.13);
        ground(v.o, 0xff997c, 0.85); v.bar = mesh(geo.box, 0xff997c, 1, v.o); v.bar.position.y = 2;
      });
      v.o.position.set(p.x, 0, p.z); v.o.rotation.y = -p.yaw; v.bar.scale.set(Math.max(0.05, p.hp / p.maxHp), 0.07, 0.07);
    }
    if (p.captive) {
      const v = get('captive', (v) => { for (let i = 0; i < 3; i++) { const r = mesh(geo.ring, color(p.captive.el), 0.8, v.o); r.scale.setScalar(0.23); r.rotation[i === 0 ? 'x' : i === 1 ? 'y' : 'z'] = Math.PI / 2; } const core = mesh(geo.head, 0xe6d9ff, 0.7, v.o); core.scale.setScalar(0.1); });
      const fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw); v.o.position.set(p.x + fx * 1.6 + fz * 0.6, p.cam.y - 0.5, p.z + fz * 1.6 - fx * 0.6); v.o.rotation.set(t * 0.4, t * 0.8, 0);
    }
    G.scanFxCount = 0;
    if (p.scan) for (const id of p.scan.ids) {
      const e = entity(id); if (!e || e.dead || e.captive) continue;
      const v = get('scan' + id, (v) => {
        v.outline = new THREE.LineSegments(geo.outline, new THREE.LineBasicMaterial({ color: 0x90ecff, transparent: true, opacity: 0.85, depthTest: false, depthWrite: false }));
        v.outline.renderOrder = 20; v.o.add(v.outline);
        v.dot = mesh(geo.head, 0x90ecff, 0.65, v.o); v.dot.material.depthTest = false; v.dot.material.depthWrite = false; v.dot.renderOrder = 20; v.dot.scale.setScalar(0.14);
      });
      const height = e.boss ? 4.5 : e.kind === 'bruto' ? 4.5 : e.kind === 'tiratore' ? 3.5 : 2;
      v.o.position.set(e.x, height / 2 + 0.1, e.z); v.outline.scale.set(e.r * 2.2, height, e.r * 2.2); v.dot.position.y = height / 2 + 0.4; v.dot.rotation.y = t;
      v.outline.material.opacity = Core.los(s, p.cam.x, p.cam.z, e.x, e.z) ? 0.22 : 0.85;
      G.scanFxCount++;
    }
    for (const [key, v] of views) if (!v.seen) { remove(v); views.delete(key); }
    G.powerFxCount = views.size;
    G.renderPowerHud(G.powerStatusSnapshot(s));
  };
  G.powerEvent = function (ev) {
    if (!Number.isFinite(ev.x) || !Number.isFinite(ev.z)) return;
    const c = color(ev.el);
    if (ev.type === 'cloneBeam') G.bolt(ev.x, 1.35, ev.z, ev.x1, 1.35, ev.z1, 0.1, 0.08, c, 0.1);
    else if (['absorbHit', 'barrierHit', 'transmute'].includes(ev.type)) { G.burst(ev.x, 1.2, ev.z, 3, c, 1.4, 1.2, 0.28, 0.06, 0.1); }
    else if (['portalTravel', 'rewindReturn', 'revive', 'cleanse', 'debtPay', 'energyRelease', 'pactBreak', 'stasisEnd', 'form', 'phase', 'flight', 'possessBody', 'clone', 'scan'].includes(ev.type)) G.ring(ev.x, 0.15, ev.z, 0.2, 2, 0.4, c);
  };
};
