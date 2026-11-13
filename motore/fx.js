// MOTORE - creature, abitanti, boss, segnali a terra, poteri, mani. Tutto da primitive, niente file esterni.
G.GEO = null;
G.buildFx = function (s) {
  const C = Core, scene = G.scene, city = s.city, EL = Bricks.ELEM, P = G.PAL[city.theme.id];
  const GEO = (G.GEO = G.GEO || {
    box: new THREE.BoxGeometry(1, 1, 1), ico: new THREE.IcosahedronGeometry(1, 0), oct: new THREE.OctahedronGeometry(1, 0),
    cone: new THREE.ConeGeometry(1, 1, 6), cyl: new THREE.CylinderGeometry(1, 1, 1, 8), sph: new THREE.SphereGeometry(1, 10, 8),
    tor: new THREE.TorusGeometry(1, 0.07, 6, 22), plane: new THREE.PlaneGeometry(1, 1), dome: new THREE.SphereGeometry(1, 18, 9, 0, Math.PI * 2, 0, Math.PI / 2),
  });
  for (const k in GEO) GEO[k].keep = true; // geometrie condivise: non vanno buttate quando cambia citta'
  const std = (c, m, r) => new THREE.MeshStandardMaterial({ color: c, metalness: m, roughness: r, flatShading: true });
  const bas = (c) => new THREE.MeshBasicMaterial({ color: c });
  const add = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: o === undefined ? 1 : o, side: THREE.DoubleSide });
  function mk(parent, geo, mat, x, y, z, sx, sy, sz) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (sx !== undefined) m.scale.set(sx, sy === undefined ? sx : sy, sz === undefined ? sx : sz); parent.add(m); return m; }
  const elc = (el) => { if (el && el.indexOf('+') > 0) el = el.slice(0, el.indexOf('+')); return EL[el] ? EL[el].c : 0xff5a22; };
  const glowSprite = (c, o) => new THREE.Sprite(new THREE.SpriteMaterial({ map: G.glowTex, color: c, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: o === undefined ? 1 : o }));
  G.shadowMat = new THREE.MeshBasicMaterial({ map: G.glowTex, color: 0x000000, transparent: true, opacity: 0.55, depthWrite: false });
  const HOVER = { muro: 1.35, sgherro: 1.35, tiratore: 2.7, bruto: 2.5, spirito: 1.3, colosso: 2.1, esca: 0.1, torretta: 0, anima: 0.15 };
  const KCOL = { sgherro: 0xff5a22, tiratore: 0xffb23a, bruto: 0xff7a20 };
  const CHARM = 0xff3fd0;

  function heavyBody(g, metal, bone, eye, ember, parts) {
    mk(g, GEO.cyl, metal, 0, 0, 0, 1.05, 1.7, 0.85); mk(g, GEO.box, ember, 0, 0.05, 0.84, 0.95, 0.9, 0.06);
    for (let k = -2; k <= 2; k++) mk(g, GEO.box, metal, k * 0.2, 0.05, 0.9, 0.07, 0.95, 0.08);
    mk(g, GEO.box, metal, 0, 1.2, 0.1, 0.75, 0.6, 0.7); mk(g, GEO.box, bone, 0, 1.12, 0.47, 0.6, 0.42, 0.08);
    mk(g, GEO.box, eye, -0.17, 1.2, 0.53, 0.16, 0.07, 0.03); mk(g, GEO.box, eye, 0.17, 1.2, 0.53, 0.16, 0.07, 0.03);
    for (const [x, r] of [[-0.3, 0.35], [0, 0], [0.3, -0.35]]) mk(g, GEO.cone, bone, x, 1.8, 0.05, 0.1, 0.6, 0.1).rotation.z = r;
    for (const sd of [-1, 1]) { mk(g, GEO.cyl, metal, sd * 1.2, 0.95, -0.1, 0.3, 0.9, 0.3); mk(g, GEO.cyl, ember, sd * 1.2, 1.42, -0.1, 0.22, 0.06, 0.22); }
    parts.fl = mk(g, GEO.box, metal, -1.55, -0.3, 0.45, 0.62); parts.fr = mk(g, GEO.box, metal, 1.55, -0.3, 0.45, 0.62);
    mk(parts.fl, GEO.box, ember, 0, 0, 0.51, 0.6, 0.15, 0.02); mk(parts.fr, GEO.box, ember, 0, 0, 0.51, 0.6, 0.15, 0.02);
    mk(g, GEO.cone, metal, 0, -1.25, 0, 0.9, 0.9, 0.75).rotation.x = Math.PI; mk(g, GEO.cone, ember, 0, -1.5, 0, 0.45, 0.8, 0.4).rotation.x = Math.PI;
  }
  function robe(g, cloth, face, sc) { // figura incappucciata, senza gambe: un'ombra
    mk(g, GEO.cyl, cloth, 0, 0.62 * sc, 0, 0.3 * sc, 1.24 * sc, 0.3 * sc).geometry = G.robeGeo;
    mk(g, GEO.sph, cloth, 0, 1.42 * sc, -0.02, 0.27 * sc, 0.3 * sc, 0.29 * sc);
    mk(g, GEO.box, face, 0, 1.4 * sc, 0.2 * sc, 0.26 * sc, 0.2 * sc, 0.08 * sc);
  }
  G.robeGeo = G.robeGeo || (() => { const g = new THREE.CylinderGeometry(0.62, 1.4, 1, 7); g.keep = true; return g; })();

  // ---------- Creature ----------
  function mobModel(kind, el) {
    kind = { arciere: 'tiratore', bomba: 'spirito', guaritore: 'anima' }[kind] || kind;
    const root = new THREE.Group(), g = new THREE.Group(); root.add(g);
    const ec = el ? elc(el) : KCOL[kind] || 0xffffff;
    const metal = std(kind === 'tiratore' ? 0x2c2340 : kind === 'colosso' ? 0x3a3640 : 0x2a2024, 0.65, 0.4), bone = std(kind === 'anima' ? 0xd8d0c0 : 0xb8a68c, 0.1, 0.75), eye = bas(ec);
    const v = { root, g, metal, bone, eye, kind, base: ec, flash: 0, swing: 0, t: Math.random() * 10, parts: {}, fxT: Math.random() * 0.3, mats: [metal, bone, eye] };
    if (kind === 'sgherro') {
      mk(g, GEO.ico, metal, 0, 0, 0, 0.55, 0.5, 0.62); mk(g, GEO.box, bone, 0, 0.02, 0.52, 0.6, 0.5, 0.12); mk(g, GEO.box, bone, 0, -0.3, 0.5, 0.36, 0.16, 0.12);
      mk(g, GEO.box, eye, -0.15, 0.08, 0.59, 0.15, 0.07, 0.03).rotation.z = 0.25; mk(g, GEO.box, eye, 0.15, 0.08, 0.59, 0.15, 0.07, 0.03).rotation.z = -0.25;
      for (const sd of [-1, 1]) { const h = mk(g, GEO.cone, metal, sd * 0.3, 0.5, 0.3, 0.1, 0.6, 0.1); h.rotation.z = -sd * 0.5; h.rotation.x = -0.3; }
      v.parts.blade = mk(g, GEO.tor, eye, 0, -0.45, 0, 0.8); v.parts.blade.rotation.x = Math.PI / 2;
      for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; mk(v.parts.blade, GEO.cone, metal, Math.cos(a), Math.sin(a), 0, 0.09, 0.3, 0.09).rotation.z = a - Math.PI / 2; }
      v.h = 1.0;
    } else if (kind === 'tiratore') {
      mk(g, GEO.oct, metal, 0, 0, 0, 0.32, 0.8, 0.32); mk(g, GEO.sph, eye, 0, 0.25, 0.24, 0.17); mk(g, GEO.tor, metal, 0, 0.25, 0.26, 0.22).scale.z = 0.5;
      v.parts.wl = new THREE.Group(); v.parts.wr = new THREE.Group(); g.add(v.parts.wl, v.parts.wr); v.parts.wl.position.set(-0.2, 0.35, 0); v.parts.wr.position.set(0.2, 0.35, 0);
      for (const [p, sd] of [[v.parts.wl, -1], [v.parts.wr, 1]]) { mk(p, GEO.box, metal, sd * 0.55, 0, 0, 1.0, 0.04, 0.5); mk(p, GEO.box, bone, sd * 1.0, 0, 0.05, 0.3, 0.05, 0.6); mk(p, GEO.box, eye, sd * 0.55, 0.03, 0.26, 0.9, 0.02, 0.03); }
      mk(g, GEO.cone, metal, 0, -1.0, 0, 0.1, 0.6, 0.1).rotation.x = Math.PI; v.h = 1.2;
    } else if (kind === 'bruto') { const ember = bas(0xff7a20); v.mats.push(ember); heavyBody(g, metal, bone, eye, ember, v.parts); v.h = 2.3; }
    else if (kind === 'spirito') {
      mk(g, GEO.ico, eye, 0, 0, 0, 0.3); mk(g, GEO.cone, eye, 0, -0.45, -0.1, 0.16, 0.7, 0.16).rotation.x = Math.PI - 0.3;
      for (const sd of [-1, 1]) mk(g, GEO.cone, eye, sd * 0.3, 0.05, -0.1, 0.07, 0.45, 0.07).rotation.z = sd * 1.2;
      v.h = 0.5;
    } else if (kind === 'colosso') {
      mk(g, GEO.box, metal, 0, 0, 0, 1.8, 1.9, 1.2); mk(g, GEO.box, eye, 0, 0.1, 0.61, 0.7, 0.7, 0.05); mk(g, GEO.box, metal, 0, 1.35, 0.05, 0.9, 0.7, 0.8);
      mk(g, GEO.box, eye, -0.2, 1.4, 0.46, 0.18, 0.08, 0.03); mk(g, GEO.box, eye, 0.2, 1.4, 0.46, 0.18, 0.08, 0.03);
      v.parts.fl = mk(g, GEO.box, metal, -1.45, -0.2, 0.2, 0.75, 1.7, 0.75); v.parts.fr = mk(g, GEO.box, metal, 1.45, -0.2, 0.2, 0.75, 1.7, 0.75);
      for (const sd of [-1, 1]) { mk(g, GEO.box, metal, sd * 0.5, -1.5, 0, 0.7, 1.1, 0.8); mk(g, GEO.box, bone, sd * 1.0, 1.05, 0, 0.5, 0.3, 1.0); }
      v.h = 2.0;
    } else if (kind === 'esca') { const holo = add(ec, 0.55); v.mats.push(holo); robe(g, holo, holo, 1.15); v.h = 1.8; }
    else if (kind === 'muro') { mk(g, GEO.box, metal, 0, 0, 0, 2.2, 2.7, 0.8); mk(g, GEO.box, eye, 0, 0.9, 0, 2.25, 0.1, 0.84); mk(g, GEO.box, eye, 0, -0.9, 0, 2.25, 0.1, 0.84); for (const sd of [-1, 1]) mk(g, GEO.box, bone, sd * 0.7, 0, 0, 0.12, 2.5, 0.86); v.h = 1.5; }
    else if (kind === 'torretta') {
      for (let k = 0; k < 3; k++) { const a = (k / 3) * Math.PI * 2; mk(root, GEO.box, metal, Math.cos(a) * 0.5, 0.35, Math.sin(a) * 0.5, 0.12, 0.8, 0.12).rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); }
      g.position.y = 0.95; mk(g, GEO.box, metal, 0, 0, 0, 0.55, 0.4, 0.6); mk(g, GEO.cyl, metal, 0, 0, 0.5, 0.08, 0.7, 0.08).rotation.x = Math.PI / 2; mk(g, GEO.box, eye, 0, 0.23, 0, 0.3, 0.06, 0.3); mk(g, GEO.cyl, eye, 0, 0, 0.86, 0.06, 0.03, 0.06).rotation.x = Math.PI / 2; v.h = 1.3;
    } else { const cloth = std(0xd8d0c0, 0.05, 0.9), lamp = bas(0xffe08a); v.mats.push(cloth, lamp); robe(g, cloth, lamp, 1.0); mk(g, GEO.sph, lamp, 0.4, 0.9, 0.25, 0.12); v.h = 1.75; }
    v.halo = mk(root, GEO.tor, bas(CHARM), 0, v.h * 0.5, 0, kind === 'bruto' || kind === 'colosso' ? 1.8 : 1.0); v.halo.visible = false; v.mats.push(v.halo.material);
    v.mark = mk(root, GEO.oct, bas(0xffffff), 0, 0, 0, 0.22, 0.34, 0.22); v.mark.visible = false; v.mats.push(v.mark.material);
    v.rootRing = mk(root, GEO.tor, bas(0xffffff), 0, 0.12, 0, 1); v.rootRing.rotation.x = Math.PI / 2; v.rootRing.visible = false; v.mats.push(v.rootRing.material);
    v.bar = new THREE.Group(); root.add(v.bar);
    v.mats.push(mk(v.bar, GEO.box, bas(0x110a0a), 0, 0, 0, 1.24, 0.14, 0.02).material);
    v.fill = mk(v.bar, GEO.box, bas(0xff4028), 0, 0, 0.02, 1.2, 0.09, 0.02); v.bar.visible = false; v.mats.push(v.fill.material);
    v.shadow = mk(root, GEO.plane, G.shadowMat, 0, 0.05, 0, 1); v.shadow.rotation.x = -Math.PI / 2;
    v.aura = glowSprite(ec, 0.4); v.aura.scale.setScalar(kind === 'bruto' || kind === 'colosso' ? 7 : kind === 'spirito' ? 2.2 : 3.2); root.add(v.aura); v.mats.push(v.aura.material);
    scene.add(root); return v;
  }
  const views = (G.mobViews = new Map());
  G.dropMob = (id) => { const v = views.get(id); if (!v) return; scene.remove(v.root); for (const m of v.mats) m.dispose(); views.delete(id); };
  const statusFx = (e, y, r) => { // piccole particelle che dicono in che stato e' la creatura
    if (e.burnT > 0) G.burst(e.x, y, e.z, 2, 0xff7a20, 1.2, 2.2, 0.45, 0.12, -0.3);
    if (e.poisT > 0) G.burst(e.x, y, e.z, 1 + (e.pois > 3 ? 1 : 0), 0x8dff3a, 1, 1.2, 0.6, 0.11, -0.15);
    if (e.slowT > 0) G.burst(e.x, y - 0.4, e.z, 1, 0xcfe4ff, 0.8, 0.1, 0.5, 0.1, 0.25);
    if (e.weakT > 0) G.burst(e.x, y + 0.3, e.z, 1, 0x9a5cff, 0.7, -0.6, 0.5, 0.1, 0);
    if (e.fearT > 0) G.burst(e.x, y + r, e.z, 1, 0xffffff, 1.5, 1.5, 0.3, 0.07, 0);
  };
  G.syncMobs = function (s, dt, t) {
    const seen = new Set();
    for (const e of s.mobs) {
      seen.add(e.id);
      const v = views.get(e.id) || (views.set(e.id, mobModel(e.kind, e.team === 'a' && e.charm <= 0 ? e.el || 'luce' : '')), views.get(e.id));
      v.t += dt;
      const k = v.kind, heavy = k === 'bruto' || k === 'colosso', hov = HOVER[k], sp = e.spawn > 0 ? Math.max(0, 1 - e.spawn / 0.5) : 1, frozen = e.stun > 0.6 && e.chill < 0;
      const bob = k === 'torretta' || k === 'muro' ? 0 : Math.sin(v.t * (heavy ? 1.6 : 3.2)) * (heavy ? 0.12 : k === 'esca' || k === 'anima' ? 0.06 : 0.18) * (frozen || s.freeze > 0 && e.team === 'e' ? 0 : 1);
      v.root.position.set(e.x, 0, e.z); v.root.visible = Math.abs(e.x - s.player.x) < 95 && Math.abs(e.z - s.player.z) < 95;
      if (k !== 'torretta') { v.lift = (v.lift || 0) + (((e.held || e.lift > 0 ? 1.6 : e.thrown ? 0.6 : 0) - (v.lift || 0)) * Math.min(1, dt * 8)); v.g.position.y = hov * sp + bob - (1 - sp) * 1.5 + v.lift; v.g.scale.setScalar((0.2 + 0.8 * sp) * (e.poly > 0 ? 0.42 : 1)); }
      const ty = Math.atan2(e.fx, e.fz); let dy = ty - v.g.rotation.y; while (dy > Math.PI) dy -= Math.PI * 2; while (dy < -Math.PI) dy += Math.PI * 2;
      v.g.rotation.y += dy * Math.min(1, dt * 10);
      v.g.rotation.x = k === 'torretta' ? 0 : e.thrown ? v.t * 14 : e.held ? Math.sin(v.t * 9) * 0.3 : e.moving ? 0.22 : 0.05; v.g.rotation.z = e.stun > 0 && !frozen ? Math.sin(t * 45) * 0.15 : e.fearT > 0 ? Math.sin(t * 60) * 0.08 : 0;
      if (v.swing > 0) v.swing -= dt;
      const sw = Math.max(0, v.swing) / 0.3;
      if (k === 'sgherro') { v.parts.blade.rotation.z += dt * (10 + sw * 40); v.g.rotation.x += sw * 0.7; }
      else if (k === 'tiratore') { const f = Math.sin(v.t * 11) * 0.5; v.parts.wl.rotation.z = -f; v.parts.wr.rotation.z = f; }
      else if (k === 'bruto') { const p = Math.sin(v.t * 2); v.parts.fl.position.set(-1.55, -0.3 + p * 0.12 - sw * 0.9, 0.45 + sw * 1.4); v.parts.fr.position.set(1.55, -0.3 - p * 0.12 - sw * 0.9, 0.45 + sw * 1.4); }
      else if (k === 'colosso') { const p = e.moving ? Math.sin(v.t * 6) * 0.4 : 0; v.parts.fl.rotation.x = p - sw * 1.6; v.parts.fr.rotation.x = -p - sw * 1.6; }
      else if (k === 'esca') v.mats[3].opacity = 0.4 + Math.sin(t * 9) * 0.15;
      if (v.flash > 0) { v.flash -= dt; const on = v.flash > 0 ? 1 : 0; v.metal.emissive.setRGB(on, on, on); v.bone.emissive.setRGB(on * 0.7, on * 0.7, on * 0.7); }
      else if (frozen !== v.wasFrozen) { v.wasFrozen = frozen; v.metal.emissive.setRGB(frozen ? 0.25 : 0, frozen ? 0.45 : 0, frozen ? 0.7 : 0); }
      const ch = e.charm > 0;
      if (ch !== v.wasCharm) { v.wasCharm = ch; v.eye.color.setHex(ch ? CHARM : v.base); v.aura.material.color.setHex(ch ? CHARM : v.base); }
      v.aura.position.y = v.g.position.y; v.aura.material.opacity = 0.4 * sp;
      v.halo.visible = ch; if (ch) { v.halo.position.y = v.g.position.y + v.h * 0.55; v.halo.rotation.x = Math.PI / 2 + Math.sin(t * 3) * 0.3; v.halo.rotation.y = t * 2; }
      const top = v.g.position.y + v.h;
      v.mark.visible = e.markT > 0; if (v.mark.visible) { v.mark.position.y = top + 0.9 + Math.sin(t * 5) * 0.1; v.mark.rotation.y = t * 3; }
      v.rootRing.visible = e.root > 0; if (v.rootRing.visible) { v.rootRing.scale.setScalar(e.r + 0.5); v.rootRing.rotation.z = t * 2; }
      const f = Math.max(0, e.hp / e.maxHp);
      v.bar.visible = f < 1 && e.spawn <= 0 && k !== 'esca';
      if (v.bar.visible) { v.bar.position.y = top + 0.35; v.bar.quaternion.copy(G.camera.quaternion); v.fill.scale.x = Math.max(0.001, 1.2 * f); v.fill.position.x = -(1 - f) * 0.6; v.fill.material.color.setHex(e.team === 'a' ? 0x6fe07a : 0xff4028); }
      v.shadow.scale.setScalar(e.r * 3.2);
      v.fxT -= dt; if (v.fxT <= 0) { v.fxT = 0.22; statusFx(e, v.g.position.y, v.h * 0.5); }
    }
    for (const id of [...views.keys()]) if (!seen.has(id)) G.dropMob(id);
  };
  const B3 = new THREE.Vector3();
  G.targetPos = (kind, id, x, z, out) => { if (kind === 'b' && G.bossView) return out.set(x, G.bossView.cy, z); const v = views.get(id); return out.set(x, v ? v.g.position.y : 1.4, z); };

  // ---------- Abitanti: un solo oggetto disegnato in tante copie ----------
  const NPCN = s.npcs.length, D = new THREE.Object3D(), TC = new THREE.Color();
  const npcGeo = (() => { const a = G.robeGeo.clone(); a.scale(0.3, 1.24, 0.3); a.translate(0, 0.62, 0); const b = new THREE.SphereGeometry(0.29, 7, 5); b.translate(0, 1.42, -0.02); const c = new THREE.ConeGeometry(0.2, 0.45, 5); c.rotateX(-1.9); c.translate(0, 1.55, -0.3); const g = THREE.BufferGeometryUtils.mergeBufferGeometries([a.toNonIndexed(), b.toNonIndexed(), c.toNonIndexed()], false); g.computeVertexNormals(); return g; })();
  const npcBody = new THREE.InstancedMesh(npcGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0.05, flatShading: true }), NPCN);
  const npcFace = new THREE.InstancedMesh(new THREE.BoxGeometry(0.27, 0.2, 0.06), new THREE.MeshBasicMaterial({ color: 0xffffff }), NPCN);
  const npcTag = new THREE.InstancedMesh(GEO.oct, new THREE.MeshBasicMaterial({ color: 0xffffff }), NPCN);
  const ROBES = { dite: [0x4a2a2a, 0x3a2a36, 0x54402e, 0x2e2a3a], cocito: [0x2e3a4c, 0x3a4658, 0x26303e, 0x44485a], malebolge: [0x33402a, 0x403a2a, 0x2a3a34, 0x4a4630] }[city.theme.id];
  for (let i = 0; i < NPCN; i++) { npcBody.setColorAt(i, TC.setHex(ROBES[s.npcs[i].v])); npcFace.setColorAt(i, TC.setHex(0x806040)); npcTag.setColorAt(i, TC.setHex(0xffffff)); }
  for (const m of [npcBody, npcFace, npcTag]) { m.frustumCulled = false; scene.add(m); }
  const FACE = { wander: 0x9a7448, watch: 0xfff2c0, flee: 0xff4028, follow: 0x7dffb0 };
  G.syncNpcs = function (s, dt, t) {
    const p = s.player;
    for (let i = 0; i < NPCN; i++) {
      const c = s.npcs[i], far = Math.abs(c.x - p.x) > 80 || Math.abs(c.z - p.z) > 80;
      c.ry = c.ry === undefined ? Math.atan2(c.fx, c.fz) : c.ry; let dy = Math.atan2(c.fx, c.fz) - c.ry; while (dy > Math.PI) dy -= Math.PI * 2; while (dy < -Math.PI) dy += Math.PI * 2; c.ry += dy * Math.min(1, dt * 7);
      const y = far ? -50 : 0.1 + Math.sin(t * 2.2 + c.off) * 0.05;
      D.position.set(c.x, y, c.z); D.rotation.set(c.moving ? (c.st === 'flee' ? 0.3 : 0.1) : 0, c.ry, 0); D.scale.setScalar(1); D.updateMatrix(); npcBody.setMatrixAt(i, D.matrix);
      D.position.set(c.x + Math.sin(c.ry) * 0.21, y + 1.4, c.z + Math.cos(c.ry) * 0.21); D.updateMatrix(); npcFace.setMatrixAt(i, D.matrix);
      if (c.st !== c.vst) { c.vst = c.st; npcFace.setColorAt(i, TC.setHex(c.charm ? CHARM : FACE[c.st])); npcFace.instanceColor.needsUpdate = true; npcTag.setColorAt(i, TC.setHex(c.charm ? CHARM : 0x7dffb0)); npcTag.instanceColor.needsUpdate = true; }
      const tag = c.st === 'follow' && !far; D.position.set(c.x, tag ? y + 2.15 + Math.sin(t * 4 + c.off) * 0.06 : -50, c.z); D.rotation.set(0, t * 2, 0); D.scale.set(0.1, 0.16, 0.1); D.updateMatrix(); npcTag.setMatrixAt(i, D.matrix);
    }
    npcBody.instanceMatrix.needsUpdate = npcFace.instanceMatrix.needsUpdate = npcTag.instanceMatrix.needsUpdate = true;
  };

  // ---------- Committenti: figure alte con un segnale sopra la testa ----------
  const markTex = (ch, col) => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = col; g.shadowColor = col; g.shadowBlur = 16; g.font = '900 100px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 64, 68); const t = new THREE.CanvasTexture(c); return t; };
  const TEX_Q = markTex('!', '#ffd24a'), TEX_W = markTex('…', '#9aa0b0'), TEX_A = markTex('?', '#7dffb0');
  G.giverViews = s.givers.map((g) => {
    const root = new THREE.Group(); root.position.set(g.x, 0, g.z); scene.add(root);
    const cloth = std(0x241a2c, 0.2, 0.7), gold = bas(0xffc040), body = new THREE.Group(); root.add(body);
    robe(body, cloth, gold, 1.4); mk(body, GEO.tor, gold, 0, 2.38, 0, 0.3).rotation.x = Math.PI / 2; mk(body, GEO.cyl, cloth, 0.62, 1.1, 0.1, 0.035, 2.2, 0.035); mk(body, GEO.oct, gold, 0.62, 2.35, 0.1, 0.14);
    mk(root, GEO.plane, G.shadowMat, 0, 0.05, 0, 2.6).rotation.x = -Math.PI / 2;
    const ring = mk(root, GEO.tor, bas(0xffc040), 0, 0.08, 0, 1.3); ring.rotation.x = Math.PI / 2;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX_Q, transparent: true, depthWrite: false })); sp.position.y = 3.4; sp.scale.setScalar(1.3); root.add(sp);
    const gl = glowSprite(0xffc040, 0.5); gl.position.y = 1.4; gl.scale.setScalar(4.5); root.add(gl);
    return { root, body, sp, ring, gl, st: '' };
  });
  G.syncGivers = function (s, t) {
    const p = s.player;
    s.givers.forEach((g, i) => {
      const v = G.giverViews[i], st = s.quest && s.quest.giver === g.id ? 'a' : g.offer && !s.quest ? 'q' : 'w'; v.root.visible = Math.abs(g.x - p.x) < 110 && Math.abs(g.z - p.z) < 110;
      if (st !== v.st) { v.st = st; v.sp.material.map = st === 'q' ? TEX_Q : st === 'a' ? TEX_A : TEX_W; v.sp.material.needsUpdate = true; v.ring.material.color.setHex(st === 'q' ? 0xffc040 : st === 'a' ? 0x7dffb0 : 0x4a4a55); v.gl.material.opacity = st === 'w' ? 0.15 : 0.5; }
      v.sp.position.y = 3.4 + Math.sin(t * 3 + i) * 0.12; v.body.position.y = 0.12 + Math.sin(t * 1.7 + i) * 0.05;
      let dy = Math.atan2(p.x - g.x, p.z - g.z) - v.body.rotation.y; while (dy > Math.PI) dy -= Math.PI * 2; while (dy < -Math.PI) dy += Math.PI * 2; v.body.rotation.y += dy * 0.05;
    });
  };

  // ---------- Sentinelle ----------
  G.turretViews = s.turrets.map((t) => {
    const root = new THREE.Group(); root.position.set(t.x, 0, t.z); scene.add(root);
    const metal = std(0x26232b, 0.75, 0.35), eye = bas(0xff3018);
    mk(root, GEO.cyl, metal, 0, 0.25, 0, 0.85, 0.5, 0.85); mk(root, GEO.cyl, metal, 0, 0.9, 0, 0.26, 1.0, 0.26);
    for (let k = 0; k < 3; k++) { const a = (k / 3) * Math.PI * 2; mk(root, GEO.box, metal, Math.cos(a) * 0.9, 0.12, Math.sin(a) * 0.9, 0.9, 0.16, 0.22).rotation.y = -a; }
    const head = new THREE.Group(); head.position.y = 1.65; root.add(head); mk(head, GEO.box, metal, 0, 0, 0, 1.0, 0.6, 0.9);
    for (const [x, r] of [[-0.34, 0.28], [0, 0], [0.34, -0.28]]) { const b = new THREE.Group(); b.position.set(x, 0, 0.3); b.rotation.y = -r; head.add(b); mk(b, GEO.cyl, metal, 0, 0, 0.45, 0.1, 0.9, 0.1).rotation.x = Math.PI / 2; mk(b, GEO.box, eye, 0, 0.2, 0.14, 0.14, 0.08, 0.04); mk(b, GEO.cyl, eye, 0, 0, 0.9, 0.07, 0.03, 0.07).rotation.x = Math.PI / 2; }
    const ring = mk(root, GEO.plane, add(0xff3018, 0.5), 0, 0.06, 0, 4.5); ring.rotation.x = -Math.PI / 2; ring.material.map = G.glowTex;
    return { root, head, eye, ring };
  });
  G.syncTurrets = function (s, dt, t) {
    s.turrets.forEach((tu, i) => {
      const v = G.turretViews[i], st = tu.stun > 0 ? 'stun' : tu.state; v.root.visible = Math.abs(tu.x - s.player.x) < 95 && Math.abs(tu.z - s.player.z) < 95;
      let dy = tu.yaw - v.head.rotation.y; while (dy > Math.PI) dy -= Math.PI * 2; while (dy < -Math.PI) dy += Math.PI * 2; v.head.rotation.y += dy * Math.min(1, dt * 8);
      let c = 0xff3018; if (st === 'owned') c = elc(tu.el); else if (st === 'idle') c = 0x5a5a66; else if (st === 'reboot') c = Math.sin(t * 10) > 0 ? 0xffb23a : 0x402a10; else if (st === 'stun') c = Math.sin(t * 30) > 0 ? 0xbff6ff : 0x202428;
      v.eye.color.setHex(c); v.ring.material.color.setHex(c); v.head.rotation.z = st === 'stun' ? Math.sin(t * 40) * 0.08 : 0; v.head.rotation.x = st === 'idle' ? 0.35 : 0;
    });
  };
  G.nodeGlows = city.nodes.map((n) => { const sp = glowSprite(0x55f0ff); sp.position.set(n.x, n.y - 0.2, n.z); sp.scale.setScalar(2.5); scene.add(sp); return sp; });

  // ---------- Boss ----------
  G.bossView = null;
  function bossModel(key) {
    const def = Bricks.BOSSES[key], ec = elc(def.el), root = new THREE.Group(), g = new THREE.Group(); root.add(g);
    const metal = std(key === 'gerione' ? 0x22302a : key === 'cerbero' ? 0x1e1a2a : 0x2a2024, 0.65, 0.4), bone = std(0xc8b89c, 0.1, 0.7), eye = bas(ec), ember = bas(ec);
    const v = { root, g, metal, bone, eye, ember, key, parts: {}, flash: 0, t: 0, cy: 3, mats: [metal, bone, eye, ember], cast: 0, dead: false };
    if (key === 'malacoda') {
      heavyBody(g, metal, bone, eye, ember, v.parts); g.scale.setScalar(1.75); v.hov = 3.5; v.cy = 3.4;
      for (let k = 0; k < 6; k++) { const a = (k / 6) * 6.283; mk(g, GEO.cone, bone, Math.cos(a) * 0.45, 1.75, Math.sin(a) * 0.4 + 0.1, 0.07, 0.5, 0.07).rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); }
      v.parts.ring = mk(g, GEO.tor, ember, 0, -0.9, 0, 1.5); v.parts.ring.rotation.x = Math.PI / 2;
    } else if (key === 'cerbero') {
      v.hov = 0; v.cy = 3.4;
      mk(g, GEO.cyl, metal, 0, 0.7, 0, 2.7, 1.4, 2.7); mk(g, GEO.cyl, metal, 0, 1.8, 0, 1.9, 1.1, 1.9);
      v.parts.ring = mk(g, GEO.tor, ember, 0, 0.3, 0, 3.0); v.parts.ring.rotation.x = Math.PI / 2;
      for (let k = 0; k < 8; k++) { const a = (k / 8) * 6.283; mk(g, GEO.cone, bone, Math.cos(a) * 2.5, 1.5, Math.sin(a) * 2.5, 0.2, 1.1, 0.2).rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); }
      v.parts.necks = [];
      for (const off of [-0.75, 0, 0.75]) {
        const neck = new THREE.Group(); neck.position.set(Math.sin(off) * 1.1, 2.1, Math.cos(off) * 0.7); neck.rotation.y = off; g.add(neck);
        mk(neck, GEO.cyl, metal, 0, 0.8, 0.25, 0.48, 1.7, 0.48).rotation.x = 0.3; mk(neck, GEO.cyl, metal, 0, 2.1, 0.75, 0.4, 1.3, 0.4).rotation.x = 0.55;
        const head = new THREE.Group(); head.position.set(0, 2.9, 1.3); neck.add(head);
        mk(head, GEO.box, metal, 0, 0.15, 0, 1.15, 0.7, 1.5); mk(head, GEO.box, bone, 0, 0.2, 0.72, 0.9, 0.5, 0.2);
        mk(head, GEO.box, eye, -0.3, 0.35, 0.72, 0.24, 0.1, 0.06).rotation.z = 0.3; mk(head, GEO.box, eye, 0.3, 0.35, 0.72, 0.24, 0.1, 0.06).rotation.z = -0.3;
        for (const sd of [-1, 1]) mk(head, GEO.cone, bone, sd * 0.45, 0.75, -0.4, 0.14, 0.7, 0.14).rotation.z = -sd * 0.4;
        const jaw = new THREE.Group(); jaw.position.set(0, -0.2, -0.5); head.add(jaw); mk(jaw, GEO.box, metal, 0, -0.1, 0.6, 1.0, 0.25, 1.3);
        for (let q = -2; q <= 2; q++) mk(jaw, GEO.cone, bone, q * 0.2, 0.12, 1.15, 0.06, 0.26, 0.06);
        mk(jaw, GEO.box, ember, 0, 0.04, 0.5, 0.7, 0.03, 0.9);
        v.parts.necks.push({ neck, head, jaw, off });
      }
    } else {
      v.hov = 4.4; v.cy = 4.4;
      mk(g, GEO.oct, metal, 0, 0, 0, 1.2, 1.7, 1.0); mk(g, GEO.box, bone, 0, 1.3, 0.55, 0.9, 1.0, 0.25); mk(g, GEO.sph, metal, 0, 1.4, 0, 0.75);
      mk(g, GEO.box, eye, -0.22, 1.45, 0.7, 0.22, 0.09, 0.05).rotation.z = -0.2; mk(g, GEO.box, eye, 0.22, 1.45, 0.7, 0.22, 0.09, 0.05).rotation.z = 0.2; mk(g, GEO.box, ember, 0, 1.05, 0.7, 0.3, 0.05, 0.05);
      for (const sd of [-1, 1]) mk(g, GEO.cone, bone, sd * 0.5, 2.2, 0, 0.12, 0.9, 0.12).rotation.z = -sd * 0.5;
      v.parts.wl = new THREE.Group(); v.parts.wr = new THREE.Group(); g.add(v.parts.wl, v.parts.wr); v.parts.wl.position.set(-0.8, 0.7, -0.2); v.parts.wr.position.set(0.8, 0.7, -0.2);
      for (const [w, sd] of [[v.parts.wl, -1], [v.parts.wr, 1]]) { mk(w, GEO.box, metal, sd * 1.7, 0, 0, 3.4, 0.08, 1.6); mk(w, GEO.box, metal, sd * 4.2, -0.1, 0.1, 2.2, 0.06, 1.1).rotation.z = -sd * 0.25; mk(w, GEO.box, ember, sd * 2.4, 0.06, 0.82, 4.6, 0.03, 0.05); for (let q = 1; q <= 3; q++) mk(w, GEO.cone, bone, sd * q * 1.5, -0.1, 0.85, 0.09, 0.6, 0.09).rotation.x = Math.PI / 2; }
      v.parts.tail = []; for (let q = 0; q < 8; q++) { const m = mk(g, q === 7 ? GEO.cone : GEO.sph, q === 7 ? eye : q % 2 ? metal : bone, 0, 0, 0, q === 7 ? 0.3 : 0.75 - q * 0.07, q === 7 ? 1.2 : 0.75 - q * 0.07, q === 7 ? 0.3 : 0.75 - q * 0.07); v.parts.tail.push(m); }
    }
    v.shadow = mk(root, GEO.plane, G.shadowMat, 0, 0.06, 0, def.r * 3.6); v.shadow.rotation.x = -Math.PI / 2;
    v.aura = glowSprite(ec, 0.45); v.aura.scale.setScalar(def.r * 6.5); root.add(v.aura); v.mats.push(v.aura.material);
    v.mark = mk(root, GEO.oct, bas(0xffffff), 0, 0, 0, 0.5, 0.8, 0.5); v.mark.visible = false; v.mats.push(v.mark.material);
    v.light = new THREE.PointLight(ec, 1.4, 34, 1.6); v.light.position.y = 4; root.add(v.light);
    scene.add(root); return v;
  }
  G.dropBoss = function () { const v = G.bossView; if (!v) return; scene.remove(v.root); for (const m of v.mats) m.dispose(); G.bossView = null; };
  G.syncBoss = function (s, dt, t) {
    const b = s.boss;
    if (!b) { if (G.bossView) G.dropBoss(); return; }
    if (G.bossView && G.bossView.key !== b.key) G.dropBoss();
    const v = G.bossView || (G.bossView = bossModel(b.key)), still = s.freeze > 0;
    if (!still) v.t += dt * (b.slowT > 0 ? 0.6 : 1);
    v.root.position.set(b.x, 0, b.z);
    let dy = b.yaw - v.g.rotation.y; while (dy > Math.PI) dy -= Math.PI * 2; while (dy < -Math.PI) dy += Math.PI * 2; v.g.rotation.y += dy * Math.min(1, dt * 6);
    const casting = b.busy > 0 && !still; v.cast += ((casting ? 1 : 0) - v.cast) * Math.min(1, dt * 6);
    const k = v.cast, bob = Math.sin(v.t * 1.5) * 0.18;
    if (b.key === 'malacoda') { v.g.position.y = v.hov + bob + k * 0.5; const p = Math.sin(v.t * 2); v.parts.fl.position.set(-1.55, -0.3 + p * 0.12 + k * 1.1, 0.45 + k * 0.3); v.parts.fr.position.set(1.55, -0.3 - p * 0.12 + k * 1.1, 0.45 + k * 0.3); v.parts.ring.rotation.z = v.t * 2; v.g.rotation.x = b.dash ? 0.5 : 0.04; }
    else if (b.key === 'cerbero') { v.g.position.y = 0; v.parts.ring.rotation.z = v.t; v.parts.necks.forEach((n, i) => { n.neck.rotation.y = n.off + Math.sin(v.t * 1.3 + i * 2) * 0.16; n.neck.rotation.x = Math.sin(v.t * 1.7 + i) * 0.08 - k * 0.35; n.head.rotation.x = k * 0.45 + Math.sin(v.t * 2.2 + i * 1.7) * 0.06; n.jaw.rotation.x = 0.12 + k * 0.6 + Math.max(0, Math.sin(v.t * 3 + i * 2)) * 0.15; }); }
    else { v.g.position.y = v.hov + bob * 1.6 - (b.dash ? 2.2 : 0); const f = Math.sin(v.t * (b.dash ? 9 : 3.4)) * 0.4 + k * 0.5; v.parts.wl.rotation.z = -f; v.parts.wr.rotation.z = f; v.g.rotation.x = b.dash ? 0.7 : 0.12; v.parts.tail.forEach((m, q) => { m.position.set(Math.sin(v.t * 2.2 - q * 0.6) * (0.3 + q * 0.12), -1.3 - q * 0.62 + (q > 4 ? (q - 4) * 0.5 : 0) + k * (q > 4 ? 0.8 : 0), -0.5 - q * 0.55 + (q > 5 ? (q - 5) * 0.9 : 0)); if (q === 7) m.rotation.x = -1.1; }); }
    if (v.flash > 0) { v.flash -= dt; const on = v.flash > 0 ? 0.8 : 0; v.metal.emissive.setRGB(on, on, on); v.bone.emissive.setRGB(on * 0.7, on * 0.7, on * 0.7); }
    v.aura.position.y = v.cy; v.aura.material.opacity = 0.4 + k * 0.4 + Math.sin(t * 9) * 0.05 * k;
    v.light.intensity = 1.2 + k * 1.6;
    v.mark.visible = b.markT > 0; if (v.mark.visible) { v.mark.position.y = v.cy + 4 + Math.sin(t * 5) * 0.15; v.mark.rotation.y = t * 3; }
    v.fxT = (v.fxT || 0) - dt; if (v.fxT <= 0) { v.fxT = 0.2; statusFx(b, v.cy, 1.5); if (b.stun > 0) G.burst(b.x, v.cy + 2.5, b.z, 2, 0xfff2c0, 2, 0.5, 0.4, 0.14, 0); }
  };
  // Sigilli delle arene
  G.sealViews = city.arenas.map((A) => { const c = elc(Bricks.BOSSES[A.boss].el), grp = new THREE.Group(); grp.position.set(A.x, 0, A.z); scene.add(grp); const cr = mk(grp, GEO.oct, bas(c), 0, 2.4, 0, 0.8, 1.5, 0.8), r1 = mk(grp, GEO.tor, bas(c), 0, 2.4, 0, 1.5), gl = glowSprite(c, 0.7); gl.position.y = 2.4; gl.scale.setScalar(8); grp.add(gl); const beam = mk(grp, GEO.cyl, add(c, 0.22), 0, 20, 0, 0.5, 40, 0.5); return { grp, cr, r1, beam }; });
  G.syncSeals = function (s, t) { s.arenas.forEach((st, i) => { const v = G.sealViews[i], on = st.status === 'sealed' && st.t <= 0; v.grp.visible = on; G.arenaSeals[i].material.opacity = st.status === 'active' ? 0.22 : on ? 0.7 : 0.25; if (on) { v.cr.rotation.y = t * 1.2; v.cr.position.y = 2.4 + Math.sin(t * 2) * 0.2; v.r1.rotation.x = t; v.r1.rotation.y = t * 0.7; } }); };

  // ---------- Segnali a terra dei boss ----------
  function fanGeo(a0, a1, r0, r1, seg) { // settore di corona nel piano del suolo, centrato sull'asse +z
    const pos = [], idx = [];
    for (let i = 0; i <= seg; i++) { const a = a0 + ((a1 - a0) * i) / seg, sx = Math.sin(a), cz = Math.cos(a); pos.push(sx * r0, 0, cz * r0, sx * r1, 0, cz * r1); if (i < seg) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3)); g.setIndex(idx); return g;
  }
  const lineGeo = (() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-0.5, 0, 0, 0.5, 0, 0, 0.5, 0, 1, -0.5, 0, 1]), 3)); g.setIndex([0, 1, 2, 0, 2, 3]); g.keep = true; return g; })();
  const discGeo = fanGeo(0, Math.PI * 2, 0, 1, 40), rimGeo = fanGeo(0, Math.PI * 2, 0.95, 1, 40); discGeo.keep = rimGeo.keep = true;
  const teleViews = new Map(), WARN = 0xff2a14;
  function teleView(tl) {
    const grp = new THREE.Group(); grp.position.set(tl.x, 0.07, tl.z); grp.rotation.y = tl.ang;
    const fc = tl.fr ? elc(tl.el) : 0, mb = add(tl.fr ? fc : WARN, 0.3), mf = add(tl.fr ? fc : 0xff5a2a, tl.fr ? 0.3 : 0.55), mr = add(tl.fr ? fc : 0xffe0d0, 0.95); let base, fill; const own = [], rims = [];
    const rim = (g, sx, sy, sz, ry, x, z) => { const m = new THREE.Mesh(g, mr); m.scale.set(sx, sy, sz); m.rotation.y = ry || 0; m.position.set(x || 0, 0.03, z || 0); rims.push(m); };
    if (tl.shape === 'circle') { base = new THREE.Mesh(discGeo, mb); fill = new THREE.Mesh(discGeo, mf); base.scale.setScalar(tl.r); rim(rimGeo, tl.r, 1, tl.r); }
    else if (tl.shape === 'line') { base = new THREE.Mesh(lineGeo, mb); fill = new THREE.Mesh(lineGeo, mf); base.scale.set(tl.w, 1, tl.len); rim(lineGeo, 0.14, 1, tl.len, 0, -tl.w / 2, 0); rim(lineGeo, 0.14, 1, tl.len, 0, tl.w / 2, 0); rim(lineGeo, tl.w, 1, 0.14, 0, 0, tl.len); }
    else if (tl.shape === 'cone') { const g = fanGeo(-tl.half, tl.half, 0, 1, 14), g2 = fanGeo(-tl.half, tl.half, 0.975, 1, 14); own.push(g, g2); base = new THREE.Mesh(g, mb); fill = new THREE.Mesh(g, mf); base.scale.setScalar(tl.r); rim(g2, tl.r, 1, tl.r); rim(lineGeo, 0.14, 1, tl.r, -tl.half); rim(lineGeo, 0.14, 1, tl.r, tl.half); }
    else { const g = fanGeo(0, Math.PI * 2, tl.r0, tl.r, 48); own.push(g); base = new THREE.Mesh(g, mb); fill = new THREE.Mesh(g, mf); rim(rimGeo, tl.r, 1, tl.r); const g2 = fanGeo(0, Math.PI * 2, tl.r0, tl.r0 + 0.2, 48); own.push(g2); rim(g2, 1, 1, 1); }
    fill.position.y = 0.02; grp.add(base, fill); for (const m of rims) grp.add(m);
    scene.add(grp); return { grp, base, fill, own, mats: [mb, mf, mr] };
  }
  G.syncTeles = function (s, t) {
    const seen = new Set();
    for (const tl of s.marks.length ? s.teles.concat(s.marks) : s.teles) {
      seen.add(tl.id); const v = teleViews.get(tl.id) || (teleViews.set(tl.id, teleView(tl)), teleViews.get(tl.id)), k = Math.min(1, tl.t / tl.wind), late = k > 0.75;
      if (tl.shape === 'circle') v.fill.scale.setScalar(Math.max(0.01, tl.r * k)); else if (tl.shape === 'line') v.fill.scale.set(tl.w, 1, Math.max(0.01, tl.len * k)); else if (tl.shape === 'cone') v.fill.scale.setScalar(Math.max(0.01, tl.r * k)); else v.mats[1].opacity = 0.1 + 0.55 * k;
      v.mats[0].opacity = (0.3 + (late ? 0.2 * (0.5 + 0.5 * Math.sin(t * 34)) : 0)) * (tl.fr ? 0.5 : 1); v.mats[2].opacity = late ? 0.6 + 0.4 * Math.sin(t * 34) : 0.95;
    }
    for (const [id, v] of teleViews) if (!seen.has(id)) { scene.remove(v.grp); for (const g of v.own) g.dispose(); for (const m of v.mats) m.dispose(); teleViews.delete(id); }
  };
  // lampo sulla forma quando il colpo cade
  const hitFx = [];
  G.teleFlash = function (e) {
    const grp = new THREE.Group(); grp.position.set(e.x, 0.1, e.z); grp.rotation.y = e.ang; const m = add(elc(e.el), 0.5); let mesh, own = null;
    if (e.shape === 'circle') { mesh = new THREE.Mesh(discGeo, m); mesh.scale.setScalar(e.r); } else if (e.shape === 'line') { mesh = new THREE.Mesh(lineGeo, m); mesh.scale.set(e.w, 1, e.len); } else if (e.shape === 'cone') { own = fanGeo(-e.half, e.half, 0, e.r, 14); mesh = new THREE.Mesh(own, m); } else { own = fanGeo(0, Math.PI * 2, e.r0, e.r, 48); mesh = new THREE.Mesh(own, m); }
    grp.add(mesh); scene.add(grp); hitFx.push({ grp, m, own, life: 0.32 });
    const c = elc(e.el), n = e.shape === 'line' ? Math.ceil(e.len / 3) : e.shape === 'donut' ? 14 : 6;
    for (let i = 0; i < n; i++) { let x = e.x, z = e.z; if (e.shape === 'line') { const d = ((i + 0.5) / n) * e.len; x += Math.sin(e.ang) * d; z += Math.cos(e.ang) * d; } else if (e.shape === 'cone') { const a = e.ang + (Math.random() * 2 - 1) * e.half, d = Math.random() * e.r; x += Math.sin(a) * d; z += Math.cos(a) * d; } else if (e.shape === 'donut') { const a = (i / n) * 6.283, d = (e.r0 + e.r) / 2; x += Math.sin(a) * d; z += Math.cos(a) * d; } else { const a = Math.random() * 6.283, d = Math.random() * e.r * 0.8; x += Math.sin(a) * d; z += Math.cos(a) * d; } G.burst(x, 0.3, z, 5, c, 5, 6, 0.6, 0.2, 1); }
  };

  // ---------- Bagliori, particelle, fulmini, anelli ----------
  const flashes = [];
  for (let i = 0; i < 56; i++) { const sp = glowSprite(0xffffff); sp.visible = false; scene.add(sp); flashes.push({ sp, life: 0, max: 1, s0: 1, s1: 1 }); }
  let fi = 0;
  G.flash = function (x, y, z, color, s0, s1, life) { const f = flashes[fi]; fi = (fi + 1) % flashes.length; f.sp.position.set(x, y, z); f.sp.material.color.setHex(color); f.life = f.max = life; f.s0 = s0; f.s1 = s1; f.sp.visible = true; f.sp.material.opacity = 1; return f; };
  const PN = 640, pm = new THREE.InstancedMesh(GEO.box, new THREE.MeshBasicMaterial({ color: 0xffffff }), PN), parts = [];
  pm.frustumCulled = false; scene.add(pm);
  for (let i = 0; i < PN; i++) { parts.push({ life: 0, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, s: 0.1, max: 1, g: 1 }); D.position.set(0, -99, 0); D.scale.set(0, 0, 0); D.updateMatrix(); pm.setMatrixAt(i, D.matrix); pm.setColorAt(i, TC.setHex(0xffffff)); }
  let pi = 0;
  G.burst = function (x, y, z, n, color, speed, up, life, size, grav) {
    TC.setHex(color);
    for (let k = 0; k < n; k++) { const p = parts[pi], a = Math.random() * Math.PI * 2, e = Math.random() * 2 - 1, sp = speed * (0.35 + Math.random() * 0.65), c = Math.sqrt(1 - e * e); p.x = x; p.y = y; p.z = z; p.vx = Math.cos(a) * c * sp; p.vz = Math.sin(a) * c * sp; p.vy = e * sp * 0.6 + up; p.life = p.max = life * (0.5 + Math.random() * 0.7); p.s = size * (0.5 + Math.random() * 0.8); p.g = grav === undefined ? 1 : grav; pm.setColorAt(pi, TC); pi = (pi + 1) % PN; }
    pm.instanceColor.needsUpdate = true;
  };
  G.spray = function (x, y, z, dx, dy, dz, n, color, speed, spread, life, size, grav) { // particelle lanciate in una direzione
    TC.setHex(color);
    for (let k = 0; k < n; k++) { const p = parts[pi], sp = speed * (0.6 + Math.random() * 0.5); p.x = x; p.y = y; p.z = z; p.vx = (dx + (Math.random() - 0.5) * spread) * sp; p.vy = (dy + (Math.random() - 0.5) * spread) * sp; p.vz = (dz + (Math.random() - 0.5) * spread) * sp; p.life = p.max = life * (0.6 + Math.random() * 0.6); p.s = size * (0.5 + Math.random() * 0.8); p.g = grav === undefined ? 0 : grav; pm.setColorAt(pi, TC); pi = (pi + 1) % PN; }
    pm.instanceColor.needsUpdate = true;
  };
  const SEG = 11, bolts = [];
  function boltMesh(color) { const g = new THREE.BufferGeometry(), pos = new Float32Array((SEG + 1) * 2 * 3), idx = []; for (let i = 0; i < SEG; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx); const m = new THREE.Mesh(g, add(color)); m.frustumCulled = false; m.visible = false; return m; }
  for (let i = 0; i < 30; i++) { const core = boltMesh(0xffffff), halo = boltMesh(0x3fc8ff); scene.add(core, halo); bolts.push({ core, halo, life: 0, max: 1, a: new THREE.Vector3(), b: new THREE.Vector3(), w: 0.1, jit: 0, jag: 1, pts: Array.from({ length: SEG + 1 }, () => new THREE.Vector3()) }); }
  let bi = 0; const T1 = new THREE.Vector3(), T2 = new THREE.Vector3(), T3 = new THREE.Vector3();
  function rejag(b) { const len = b.a.distanceTo(b.b), amp = Math.min(1.1, len * 0.07) * b.jag; for (let i = 0; i <= SEG; i++) { const t = i / SEG, k = Math.sin(t * Math.PI); b.pts[i].lerpVectors(b.a, b.b, t); if (i > 1 && i < SEG) { b.pts[i].x += (Math.random() - 0.5) * amp * 2 * k; b.pts[i].y += (Math.random() - 0.5) * amp * 2 * k; b.pts[i].z += (Math.random() - 0.5) * amp * 2 * k; } } }
  function ribbon(mesh, pts, w, cam) { const pos = mesh.geometry.attributes.position; for (let i = 0; i <= SEG; i++) { T1.subVectors(pts[Math.min(SEG, i + 1)], pts[Math.max(0, i - 1)]).normalize(); T2.subVectors(cam, pts[i]).normalize(); T3.crossVectors(T1, T2).normalize().multiplyScalar(w * Math.min(1, 0.1 + cam.distanceTo(pts[i]) / 9)); pos.setXYZ(i * 2, pts[i].x + T3.x, pts[i].y + T3.y, pts[i].z + T3.z); pos.setXYZ(i * 2 + 1, pts[i].x - T3.x, pts[i].y - T3.y, pts[i].z - T3.z); } pos.needsUpdate = true; }
  G.bolt = function (ax, ay, az, bx, by, bz, w, life, color, jag) { const b = bolts[bi]; bi = (bi + 1) % bolts.length; b.a.set(ax, ay, az); b.b.set(bx, by, bz); b.w = w; b.life = b.max = life; b.jit = 0; b.jag = jag === undefined ? 1 : jag; b.halo.material.color.setHex(color || 0x3fc8ff); b.core.visible = b.halo.visible = true; rejag(b); return b; };
  const rings = [];
  for (let i = 0; i < 18; i++) { const m = new THREE.Mesh(new THREE.RingGeometry(0.86, 1, 44), add(0xffffff)); m.rotation.x = -Math.PI / 2; m.visible = false; scene.add(m); rings.push({ m, life: 0, max: 1, r0: 0, r1: 1 }); }
  let ri = 0;
  G.ring = function (x, y, z, r0, r1, life, color) { const r = rings[ri]; ri = (ri + 1) % rings.length; r.life = r.max = life; r.r0 = r0; r.r1 = r1; r.m.position.set(x, y, z); r.m.material.color.setHex(color); r.m.visible = true; };

  // ---------- Proiettili, zone, trappole, colpi in arrivo ----------
  const pools = { shot: new Map(), zone: new Map(), trap: new Map(), lob: new Map() };
  const drop = (map, id) => { const v = map.get(id); scene.remove(v.o); for (const m of v.mats) m.dispose(); map.delete(id); };
  G.syncThings = function (s, dt, t) {
    let seen = new Set();
    for (const sh of s.shots) {
      seen.add(sh.id); let v = pools.shot.get(sh.id);
      if (!v) { v = G.shotView(sh); scene.add(v.o); pools.shot.set(sh.id, v); }
      v.upd(sh, dt);
    }
    for (const id of [...pools.shot.keys()]) if (!seen.has(id)) drop(pools.shot, id);
    seen = new Set();
    for (const z of s.zones) {
      seen.add(z.id); let v = pools.zone.get(z.id); const c = elc(z.el);
      if (!v) { const o = new THREE.Group(), m1 = add(c, 0.28), m2 = add(c, 0.9); o.position.set(z.x, 0.06, z.z); const d = new THREE.Mesh(discGeo, m1); d.scale.setScalar(z.r); const r = new THREE.Mesh(rimGeo, m2); r.scale.setScalar(z.r); o.add(d, r); const mats = [m1, m2]; if (z.kind === 'slow' || z.ward) { const m3 = add(c, 0.16); const dm = new THREE.Mesh(GEO.dome, m3); dm.scale.setScalar(z.r); o.add(dm); mats.push(m3); } scene.add(o); v = { o, mats, c, ft: 0 }; pools.zone.set(z.id, v); }
      const left = z.dur - z.t; v.mats[0].opacity = (z.team === 'e' ? 0.38 : 0.26) * Math.min(1, left) + Math.sin(t * 5 + z.id) * 0.04; v.mats[1].opacity = 0.9 * Math.min(1, left);
      v.ft -= dt; if (v.ft <= 0) { v.ft = 0.12; const a = Math.random() * 6.283, d = Math.sqrt(Math.random()) * z.r; G.burst(z.x + Math.sin(a) * d, 0.2, z.z + Math.cos(a) * d, 1, c, 0.5, z.kind === 'slow' ? 0.4 : 2.2, 0.7, 0.13, z.kind === 'slow' ? -0.02 : -0.2); }
    }
    for (const id of [...pools.zone.keys()]) if (!seen.has(id)) drop(pools.zone, id);
    seen = new Set();
    for (const tr of s.traps) {
      seen.add(tr.id); let v = pools.trap.get(tr.id); const c = elc(tr.el);
      if (!v) { const o = new THREE.Group(), m1 = bas(c), m2 = std(0x26232b, 0.7, 0.4), m3 = add(c, 0.5); o.position.set(tr.x, 0, tr.z); mk(o, GEO.cyl, m2, 0, 0.1, 0, 0.5, 0.2, 0.5); mk(o, GEO.oct, m1, 0, 0.45, 0, 0.16, 0.24, 0.16); const r = new THREE.Mesh(rimGeo, m3); r.scale.setScalar(tr.r * 0.55); r.position.y = 0.05; o.add(r); scene.add(o); v = { o, mats: [m1, m2, m3] }; pools.trap.set(tr.id, v); }
      v.o.children[1].position.y = 0.45 + Math.sin(t * 4 + tr.id) * 0.06; v.o.children[1].rotation.y = t * 2; v.mats[2].opacity = tr.arm > 0 ? 0.15 : 0.35 + Math.sin(t * 6) * 0.15;
    }
    for (const id of [...pools.trap.keys()]) if (!seen.has(id)) drop(pools.trap, id);
    seen = new Set();
    for (const L of s.lobs) {
      seen.add(L.id); let v = pools.lob.get(L.id); const c = elc(L.el), k = Math.min(1, L.t / L.T);
      if (!v) { const o = new THREE.Group(), m1 = add(c, 0.2), m2 = add(c, 0.9); o.position.set(L.x, 0.06, L.z); const d = new THREE.Mesh(discGeo, m1), r = new THREE.Mesh(rimGeo, m2); r.scale.setScalar(L.r); o.add(d, r); const sp = glowSprite(c); sp.scale.setScalar(1.6); o.add(sp); scene.add(o); v = { o, mats: [m1, m2, sp.material] }; pools.lob.set(L.id, v); }
      v.o.children[0].scale.setScalar(Math.max(0.01, L.r * k));
      const sp = v.o.children[2]; if (L.arc) { const d = Math.hypot(L.x - L.x0, L.z - L.z0); sp.position.set((L.x0 - L.x) * (1 - k), 1.4 * (1 - k) + (2 + d * 0.25) * 4 * k * (1 - k), (L.z0 - L.z) * (1 - k)); } else sp.position.set(0, 30 * (1 - k) * (1 - k) + 0.5, 0);
    }
    for (const id of [...pools.lob.keys()]) if (!seen.has(id)) drop(pools.lob, id);
  };

  // ---------- Segnale della missione: colonna di luce sull'obiettivo ----------
  const beacon = new THREE.Group(); scene.add(beacon); beacon.visible = false;
  const bcA = add(0xffd24a, 0.3), bcB = add(0xffd24a, 0.9);
  mk(beacon, GEO.cyl, bcA, 0, 30, 0, 0.6, 60, 0.6); const bcRing = new THREE.Mesh(rimGeo, bcB); bcRing.position.y = 0.08; beacon.add(bcRing); const bcDisc = new THREE.Mesh(discGeo, add(0xffd24a, 0.35)); bcDisc.position.y = 0.07; beacon.add(bcDisc);
  G.syncBeacon = function (s, t) {
    const q = s.quest; beacon.visible = !!(q && q.obj && q.type !== 'caccia' || q && q.type === 'caccia' && q.left > 0);
    if (!beacon.visible) return; const R = q.type === 'pubblico' ? 16 : q.type === 'caccia' ? 6 : 3.4;
    beacon.position.set(q.obj.x, 0, q.type === 'pubblico' ? 2 : q.obj.z); bcRing.scale.setScalar(R + Math.sin(t * 4) * 0.15); bcDisc.scale.setScalar(Math.max(0.01, q.type === 'ripetitori' ? R * (q.hold / 1.6) : 0.01)); bcA.opacity = 0.22 + Math.sin(t * 3) * 0.08;
  };
  // Mirino a terra: dove cadono i poteri puntati
  const reticle = new THREE.Mesh(new THREE.RingGeometry(0.75, 1, 28), add(0xffffff, 0.5)); reticle.rotation.x = -Math.PI / 2; reticle.visible = false; scene.add(reticle);
  G.syncReticle = function (s, show, c, r) { reticle.visible = show; if (show) { reticle.position.set(s.gp.x, 0.09, s.gp.z); reticle.scale.setScalar(r || 1.2); reticle.material.color.setHex(c); } };
  // Sfere in orbita attorno al giocatore
  const orbs = [0, 1, 2].map(() => { const sp = glowSprite(0xffffff); sp.scale.setScalar(1.1); sp.visible = false; scene.add(sp); return sp; });
  G.syncOrbs = function (s, t) { const p = s.player, on = p.orbit > 0 && !p.ride; orbs.forEach((o, i) => { o.visible = on; if (on) { const a = t * 3.2 + (i * 6.283) / 3; o.position.set(p.x + Math.sin(a) * p.orbitK.r, 1.1 + Math.sin(t * 5 + i) * 0.2, p.z + Math.cos(a) * p.orbitK.r); o.material.color.setHex(elc(p.orbitK.el)); if (Math.random() < 0.3) G.burst(o.position.x, o.position.y, o.position.z, 1, elc(p.orbitK.el), 0.5, 0, 0.3, 0.08, 0); } }); };

  G.updateFx = function (dt, t, cam) {
    for (const f of flashes) { if (f.life <= 0) continue; f.life -= dt; const k = 1 - Math.max(0, f.life) / f.max; f.sp.scale.setScalar(f.s0 + (f.s1 - f.s0) * k); f.sp.material.opacity = 1 - k * k; if (f.life <= 0) f.sp.visible = false; }
    for (let i = 0; i < PN; i++) { const p = parts[i]; if (p.life <= 0) continue; p.life -= dt; p.vy -= 18 * p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; if (p.y < p.s / 2) { p.y = p.s / 2; p.vy *= -0.4; p.vx *= 0.6; p.vz *= 0.6; } const sc = p.life > 0 ? p.s * Math.min(1, p.life / (p.max * 0.5)) : 0; D.position.set(p.x, p.life > 0 ? p.y : -99, p.z); D.scale.set(sc, sc, sc); D.rotation.set(p.x, p.y, p.z); D.updateMatrix(); pm.setMatrixAt(i, D.matrix); }
    pm.instanceMatrix.needsUpdate = true;
    for (const b of bolts) { if (b.life <= 0) continue; b.life -= dt; b.jit -= dt; if (b.life <= 0) { b.core.visible = b.halo.visible = false; continue; } if (b.jit <= 0) { b.jit = 0.035; rejag(b); } const k = b.life / b.max; ribbon(b.core, b.pts, b.w * 0.3, cam); ribbon(b.halo, b.pts, b.w, cam); b.core.material.opacity = Math.min(1, k * 2); b.halo.material.opacity = 0.55 * k; }
    for (const r of rings) { if (r.life <= 0) continue; r.life -= dt; const k = 1 - Math.max(0, r.life) / r.max, rad = r.r0 + (r.r1 - r.r0) * (1 - (1 - k) * (1 - k)); r.m.scale.setScalar(rad); r.m.material.opacity = (1 - k) * 0.95; if (r.life <= 0) r.m.visible = false; }
    for (let i = hitFx.length - 1; i >= 0; i--) { const h = hitFx[i]; h.life -= dt; h.m.opacity = Math.max(0, h.life / 0.32) * 0.5; if (h.life <= 0) { scene.remove(h.grp); h.m.dispose(); if (h.own) h.own.dispose(); hitFx.splice(i, 1); } }
  };

  // ---------- Schermi: una sola immagine animata condivisa ----------
  const sg = G.screenCanvas.getContext('2d'); let scT = 0; G.hypT = 0;
  const TV = city.theme.nome.toUpperCase() + '·TV', n0 = P.neon.cy, n1 = P.neon.mg, n2 = P.neon.am;
  G.drawScreens = function (dt, t) {
    scT -= dt; if (G.hypT > 0) G.hypT -= dt; if (scT > 0) return; scT = 0.1;
    const W = 256, H = 384, hyp = G.hypT > 0, gr = sg.createLinearGradient(0, 0, 0, H);
    if (hyp) { gr.addColorStop(0, '#5a0a48'); gr.addColorStop(1, '#1a0530'); } else { gr.addColorStop(0, '#0a1a2c'); gr.addColorStop(1, '#16082a'); }
    sg.fillStyle = gr; sg.fillRect(0, 0, W, H); sg.lineWidth = hyp ? 9 : 5;
    for (let k = 0; k < 6; k++) { const r = ((t * (hyp ? 90 : 26) + k * 34) % 204) + 6; sg.globalAlpha = Math.max(0, hyp ? 1 - r / 210 : 0.8 - r / 260); sg.strokeStyle = hyp ? '#ff3fd0' : k % 2 ? n0 : n1; sg.beginPath(); sg.arc(W / 2, H * 0.47, r, t * (k % 2 ? 1 : -1) + k, t * (k % 2 ? 1 : -1) + k + (hyp ? 6.3 : 4.4)); sg.stroke(); }
    sg.globalAlpha = 1; sg.fillStyle = hyp ? '#fff' : n0; sg.beginPath(); sg.arc(W / 2, H * 0.47, hyp ? 14 + Math.sin(t * 20) * 5 : 9, 0, 7); sg.fill();
    sg.textAlign = 'center'; sg.font = '900 30px Georgia, serif'; sg.fillStyle = hyp ? '#fff' : n2; sg.fillText(hyp ? 'GUARDA' : TV, W / 2, 46);
    sg.font = '700 22px sans-serif'; sg.fillStyle = Math.sin(t * 6) > 0 || hyp ? '#ff4028' : '#5a1810'; sg.fillText('● IN ONDA', W / 2, H - 52);
    sg.font = '700 18px sans-serif'; sg.fillStyle = '#d6def0'; const msg = 'ASCOLTI IN SALITA  ·  RESTATE SINTONIZZATI  ·  OGNI PECCATO IN DIRETTA  ·  '; sg.fillText(msg + msg, W / 2 + 400 - ((t * 60) % 520), H - 18);
    sg.fillStyle = 'rgba(0,0,0,.22)'; for (let y = 0; y < H; y += 4) sg.fillRect(0, y, W, 1);
    G.screenTex.needsUpdate = true;
  };
};

// ---------- Mani in prima persona (scena a parte, disegnata sopra il mondo; si costruiscono una volta sola) ----------
G.buildHands = function () {
  const GEO = { box: new THREE.BoxGeometry(1, 1, 1), cone: new THREE.ConeGeometry(1, 1, 6) };
  function mk(parent, geo, mat, x, y, z, sx, sy, sz) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); parent.add(m); return m; }
  const hs = (G.handScene = new THREE.Scene()), hc = (G.handCam = new THREE.PerspectiveCamera(52, 1, 0.01, 10));
  hs.add(new THREE.AmbientLight(0x6a5a70, 0.9)); const hl = new THREE.DirectionalLight(0xffb890, 0.8); hl.position.set(0.6, 1, 0.4); hs.add(hl); const hl2 = new THREE.DirectionalLight(0x4ab0d8, 0.5); hl2.position.set(-0.8, 0.2, -0.3); hs.add(hl2);
  const hp = (G.handLight = new THREE.PointLight(0x55d8ff, 0, 3)); hp.position.set(0.2, -0.1, -0.7); hs.add(hp);
  const iron = new THREE.MeshStandardMaterial({ color: 0x5a5560, metalness: 0.6, roughness: 0.42, flatShading: true }), emb = (G.handEmber = new THREE.MeshBasicMaterial({ color: 0xd8601c }));
  function hand(side) {
    const root = new THREE.Group(), o = { root, fingers: [], side };
    mk(root, GEO.box, iron, 0, 0, 0.21, 0.088, 0.082, 0.36); mk(root, GEO.box, iron, 0, 0, 0.03, 0.112, 0.105, 0.06); mk(root, GEO.box, iron, 0, 0.004, -0.07, 0.104, 0.036, 0.115);
    for (const x of [-0.03, 0.03]) mk(root, GEO.box, emb, x, 0.0425, 0.2, 0.004, 0.003, 0.3);
    mk(root, GEO.box, emb, 0, 0.0225, -0.07, 0.03, 0.003, 0.004);
    for (let k = 0; k < 3; k++) mk(root, GEO.box, emb, 0, 0.0535, 0.1 + k * 0.09, 0.09, 0.003, 0.005);
    for (let k = 0; k < 4; k++) {
      const f1 = new THREE.Group(); f1.position.set(-0.039 + k * 0.026, 0.004, -0.128); root.add(f1);
      mk(f1, GEO.box, iron, 0, 0, -0.028, 0.021, 0.022, 0.056); mk(f1, GEO.box, emb, 0, 0.0115, -0.002, 0.015, 0.002, 0.004);
      const f2 = new THREE.Group(); f2.position.set(0, 0, -0.058); f1.add(f2);
      mk(f2, GEO.box, iron, 0, 0, -0.022, 0.018, 0.019, 0.044); mk(f2, GEO.cone, iron, 0, 0, -0.058, 0.009, 0.03, 0.009).rotation.x = -Math.PI / 2;
      o.fingers.push([f1, f2]);
    }
    const t1 = new THREE.Group(); t1.position.set(side * -0.055, -0.004, -0.06); t1.rotation.y = side * 0.9; root.add(t1);
    mk(t1, GEO.box, iron, 0, 0, -0.03, 0.022, 0.022, 0.06); o.thumb = t1; hs.add(root); return o;
  }
  const HR = hand(1), HL = hand(-1); G.handR = HR.root; G.handL = HL.root;
  // zap: rinculo della destra; lift: la sinistra si alza a palmo aperto; push: la sinistra spinge; both: tutte e due in alto (supreme)
  G.hands = { zap: 0, hold: 0, lift: 0, push: 0, both: 0, bob: 0, visible: 1, glow: 0, col: 0xd8601c };
  G.updateHands = function (dt, t, moving, aspect) {
    const h = G.hands; hc.aspect = aspect; hc.updateProjectionMatrix();
    if (moving) h.bob += dt * 9;
    for (const k of ['zap', 'lift', 'push', 'both']) if (h[k] > 0) h[k] = Math.max(0, h[k] - dt);
    const bx = Math.sin(h.bob) * 0.012, by = Math.abs(Math.cos(h.bob)) * 0.012, idle = Math.sin(t * 1.6) * 0.004, hide = (1 - h.visible) * 0.5, wide = Math.min(1, aspect / 1.8);
    const z = Math.max(h.zap / 0.16, h.hold * (0.6 + Math.sin(t * 40) * 0.12)), up = h.lift > 0 ? Math.max(0, Math.min(1, h.lift / 0.25, (0.9 - h.lift) / 0.15)) : 0, ps = h.push > 0 ? Math.sin((1 - h.push / 0.5) * Math.PI) : 0, bo = h.both > 0 ? Math.sin(Math.min(1, (1.1 - h.both) / 0.25) * Math.PI * 0.5) * Math.min(1, h.both / 0.3) : 0;
    HR.root.position.set(0.2 + 0.07 * wide + bx + bo * 0.05, -0.19 + by + idle - hide - z * 0.01 + bo * 0.05, -0.44 - z * 0.07 - bo * 0.06);
    HR.root.rotation.set(0.32 + z * 0.12 + bo * 0.55, -0.3 - bo * 0.1, -0.22 - bo * 0.1);
    const lu = Math.max(up, bo * 0.65);
    HL.root.position.set(-0.2 - 0.07 * wide + bx + lu * 0.05 + ps * 0.08, -0.19 - by + idle - hide + lu * 0.07 + ps * 0.03 + bo * 0.03, -0.44 - lu * 0.12 - ps * 0.14);
    HL.root.rotation.set(0.32 + lu * 0.8, 0.3 - lu * 0.2, 0.22 - lu * 0.2);
    const curlR = 0.55 - Math.max(z, bo) * 0.5 + Math.sin(t * 2.2) * 0.04, curlL = 0.55 - lu * 0.55 + ps * 0.7;
    HR.fingers.forEach(([a, b], k) => { a.rotation.x = -curlR * (0.8 + k * 0.08); b.rotation.x = -curlR * 1.1; a.rotation.y = (k - 1.5) * 0.1 * (1 + z); });
    HL.fingers.forEach(([a, b], k) => { a.rotation.x = -curlL * (0.8 + k * 0.08); b.rotation.x = -curlL * 1.1; a.rotation.y = -(k - 1.5) * 0.1 * (1 + lu * 1.5); });
    HR.thumb.rotation.x = -curlR * 0.5; HL.thumb.rotation.x = -curlL * 0.5;
    hp.intensity = Math.max(z * 2.2, bo * 3, h.glow * (1 + Math.sin(t * 30) * 0.4)); hp.color.setHex(h.col); emb.color.setHex(h.col);
    if (G.animHands) G.animHands(dt);
    HR.root.visible = HL.root.visible = h.visible > 0.02;
  };
  G.handWorld = function (out, cam) { out.set(0.34, -0.3, -0.75).applyQuaternion(cam.quaternion).add(cam.position); return out; };
};
