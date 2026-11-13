// MOTORE - animazioni dei poteri: ogni elemento ha il suo modo di colpire, ogni forma il suo gesto, ogni proiettile il suo corpo.
G.buildAnim = function (s) {
  const scene = G.scene, EL = Bricks.ELEM, R = Math.random;
  const bel = (el) => (el && el.indexOf('+') > 0 ? el.slice(0, el.indexOf('+')) : el);
  const col = (el) => { el = bel(el); return EL[el] ? EL[el].c : 0xff6a20; }, col2 = (el) => { el = bel(el); return EL[el] ? EL[el].c2 : 0xffd0a0; };
  const add = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: o === undefined ? 1 : o, side: THREE.DoubleSide });
  const A = (G.AGEO = G.AGEO || (() => {
    const cres = (() => { const pos = [], idx = [], n = 18; for (let i = 0; i <= n; i++) { const a = -1.15 + (2.3 * i) / n, w = Math.sin((i / n) * Math.PI), r0 = 1 - 0.3 * w; pos.push(Math.sin(a) * r0, -0.32 * w, Math.cos(a) * r0, Math.sin(a), 0.32 * w, Math.cos(a)); if (i < n) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); } } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3)); g.setIndex(idx); return g; })();
    const o = { wall: new THREE.CylinderGeometry(1, 1, 1, 30, 1, true).translate(0, 0.5, 0), spike: new THREE.ConeGeometry(0.5, 1, 4).translate(0, 0.5, 0), cres, oct: new THREE.OctahedronGeometry(1, 0), ico: new THREE.IcosahedronGeometry(1, 1), sph: new THREE.SphereGeometry(1, 14, 10), tor: new THREE.TorusGeometry(1, 0.055, 6, 30).rotateX(Math.PI / 2), box: new THREE.BoxGeometry(1, 1, 1), plane: new THREE.PlaneGeometry(1, 1) };
    for (const k in o) o[k].keep = true; return o;
  })());
  // effetti a tempo: un oggetto, i suoi materiali, e una funzione che lo muove da 0 a 1
  const fxs = [];
  const kill = (e) => { scene.remove(e.o); for (const m of e.mats) m.dispose(); };
  function spawn(o, mats, life, f) { if (fxs.length > 120) kill(fxs.shift()); scene.add(o); const e = { o, mats, life, max: life, f }; f(0, o, mats); fxs.push(e); return e; }
  const mesh = (geo, c, op) => { const m = add(c, op * 0.8); return [new THREE.Mesh(geo, m), m]; };
  const out = (k) => 1 - (1 - k) * (1 - k);
  G.animUpdate = function (dt) { for (let i = fxs.length - 1; i >= 0; i--) { const e = fxs[i]; e.life -= dt; if (e.life <= 0) { kill(e); fxs.splice(i, 1); } else e.f(1 - e.life / e.max, e.o, e.mats); } };
  const near = (x, z) => Math.abs(x - s.player.x) < 70 && Math.abs(z - s.player.z) < 70;

  // ---------- Ogni elemento colpisce a modo suo ----------
  G.elemFx = function (el, x, z, r, pw) {
    if (!near(x, z)) return; const e = bel(el), c = col(el), c2 = col2(el), n = Math.max(2, Math.min(7, Math.round(r * 0.9 * (pw || 1)))), rp = () => { const a = R() * 6.283, d = Math.sqrt(R()) * r * 0.85; return [x + Math.sin(a) * d, z + Math.cos(a) * d]; };
    if (e === 'fuoco') { for (let i = 0; i < n; i++) { const [px, pz] = rp(), h = (1.2 + R() * 1.6) * (0.7 + 0.3 * (pw || 1)), w = 0.5 + R() * 0.4, [m, mt] = mesh(A.spike, i % 2 ? c : c2, 0.6), ph = R() * 6; m.position.set(px, 0, pz); spawn(m, [mt], 0.5 + R() * 0.25, (k, o, ms) => { const g = Math.sin(Math.min(1, k * 1.15) * Math.PI); o.scale.set(w * (1 - k * 0.5), h * (0.3 + g) + 0.01, w * (1 - k * 0.5)); o.rotation.set(Math.sin(k * 14 + ph) * 0.2, k * 3 + ph, Math.cos(k * 11 + ph) * 0.2); o.position.y = k * 0.8; ms[0].opacity = 0.6 * (1 - k * k); }); G.burst(px, 0.3, pz, 5, i % 2 ? c : c2, 1.6, 4.6, 0.75, 0.17, -0.25); G.burst(px, 0.4, pz, 2, 0xffe2a0, 5, 3, 0.5, 0.06, 0.4); } G.flash(x, 0.9, z, c, 1, r * 1.7, 0.32); }
    else if (e === 'gelo') {
      for (let i = 0; i < n + 1; i++) { const [px, pz] = rp(), h = (1 + R() * 1.9) * (0.7 + 0.3 * (pw || 1)), w = 0.35 + R() * 0.3, [m, mt] = mesh(A.spike, i % 2 ? 0x3f9cff : 0x7fd0ff, 0.42); m.position.set(px, 0, pz); m.rotation.set((R() - 0.5) * 0.5, R() * 3, (R() - 0.5) * 0.5); spawn(m, [mt], 0.9 + R() * 0.4, (k, o, ms) => { const g = k < 0.12 ? k / 0.12 : k > 0.7 ? Math.max(0, 1 - (k - 0.7) / 0.3) : 1; o.scale.set(w, h * g + 0.01, w); ms[0].opacity = 0.28 * (k > 0.7 ? g : 1); }); }
      G.burst(x, 0.5, z, 8, 0xeaf4ff, 4, 2, 0.6, 0.09, 0.7); G.ring(x, 0.08, z, 0.3, r, 0.4, c2);
    } else if (e === 'folgore') { for (let i = 0; i < Math.min(4, n); i++) { const [px, pz] = rp(); G.bolt(px + (R() - 0.5) * 4, 22, pz + (R() - 0.5) * 4, px, 0, pz, 0.34, 0.24, c, 1.5); G.flash(px, 0.5, pz, c2, 1.5, 5, 0.25); G.burst(px, 0.3, pz, 6, c2, 8, 3, 0.35, 0.07, 0.8); } }
    else if (e === 'veleno') {
      for (let i = 0; i < n; i++) { const [px, pz] = rp(); G.burst(px, 0.2, pz, 4, i % 2 ? c : c2, 0.8, 1.3, 1.3, 0.2, -0.07); }
      const [m, mt] = mesh(A.sph, c, 0.24); m.position.set(x, 0.4, z); spawn(m, [mt], 1.1, (k, o, ms) => { const g = r * (0.4 + 0.7 * out(k)); o.scale.set(g, 0.5 + k * 0.5, g); ms[0].opacity = 0.24 * (1 - k); });
    } else if (e === 'ombra') {
      for (let i = 0; i < n; i++) { const [px, pz] = rp(), h = 2 + R() * 2.4, [m, mt] = mesh(A.spike, i % 2 ? c : 0x3a1a70, 0.55); m.position.set(px, 0, pz); m.rotation.set((R() - 0.5) * 0.9, R() * 3, (R() - 0.5) * 0.9); spawn(m, [mt], 0.7, (k, o, ms) => { const g = Math.sin(Math.min(1, k * 1.3) * Math.PI); o.scale.set(0.22, h * g + 0.01, 0.22); ms[0].opacity = 0.55 * g; }); }
      const [m, mt] = mesh(A.sph, c, 0.3); m.position.set(x, 1, z); spawn(m, [mt], 0.45, (k, o, ms) => { o.scale.setScalar(Math.max(0.05, r * (1 - out(k)))); ms[0].opacity = 0.1 + 0.4 * k; });
    } else if (e === 'luce') {
      const [m, mt] = mesh(A.wall, c, 0.3); m.position.set(x, 0, z); spawn(m, [mt], 0.55, (k, o, ms) => { const g = Math.max(0.05, r * 0.4 * (1 - k * 0.7)); o.scale.set(g, 22, g); ms[0].opacity = 0.2 * (1 - k); });
      G.burst(x, 0.4, z, 8, c, 2.5, 7, 0.7, 0.08, -0.2); G.ring(x, 0.1, z, 0.2, r * 1.1, 0.45, c);
    } else if (e === 'sangue') {
      G.burst(x, 1, z, 12 + n, c, 6, 4.5, 0.85, 0.12, 1.7); G.burst(x, 1, z, 5, 0x5a0612, 4, 3, 0.9, 0.18, 1.5);
      for (const rz of [0.7, -0.7]) { const [m, mt] = mesh(A.plane, c, 0.9); m.position.set(x, 1.3, z); m.rotation.set(0, R() * 3, rz); spawn(m, [mt], 0.22, (k, o, ms) => { o.scale.set(r * 1.6 * (0.3 + k), 0.12 * (1 - k) + 0.01, 1); ms[0].opacity = 0.9 * (1 - k); }); }
    } else { // vento
      for (let i = 0; i < 3; i++) { const [m, mt] = mesh(A.tor, i % 2 ? c2 : c, 0.7), y0 = 0.4 + i * 0.9, rr = r * (0.45 + i * 0.22), sp = (i % 2 ? -1 : 1) * (7 + i * 2); m.position.set(x, y0, z); spawn(m, [mt], 0.6, (k, o, ms) => { o.position.y = y0 + k * 1.6; o.rotation.y = k * sp; o.scale.setScalar(rr * (0.6 + 0.5 * k)); ms[0].opacity = 0.7 * (1 - k); }); }
      for (let i = 0; i < 6; i++) { const a = R() * 6.283; G.spray(x + Math.sin(a) * r * 0.6, 0.5 + R() * 1.5, z + Math.cos(a) * r * 0.6, Math.cos(a), 0.1, -Math.sin(a), 2, c2, 9, 0.3, 0.35, 0.08, 0); }
    }
  };
  // ---------- Ogni forma ha il suo gesto ----------
  G.shapeFx = function (ev) {
    if (!near(ev.x, ev.z)) return; const c = col(ev.el), c2 = col2(ev.el), sx = Math.sin(ev.ang), sz = Math.cos(ev.ang);
    const own = Math.hypot(ev.x - s.player.x, ev.z - s.player.z) < 2; const wall = (rad, hgt, op, life) => { if (own) { op *= 0.5; hgt *= 0.6; } const [m, mt] = mesh(A.wall, c, op); m.position.set(ev.x, 0, ev.z); spawn(m, [mt], life, (k, o, ms) => { const g = rad * (0.25 + 0.75 * out(k)); o.scale.set(g, hgt * (1 - k) + 0.15, g); ms[0].opacity = op * (1 - k); }); };
    if (ev.shape === 'circle') {
      if (ev.r <= 1.5) { G.elemFx(ev.el, ev.x, ev.z, 1.3, 0.6); return; }
      wall(ev.r, 1.8, 0.5, 0.4); if (ev.r > 6) wall(ev.r * 0.6, 3, 0.35, 0.55);
      if (ev.late) { const [m, mt] = mesh(A.wall, c, 0.45); m.position.set(ev.x, 0, ev.z); spawn(m, [mt], 0.35, (k, o, ms) => { const g = Math.max(0.05, ev.r * 0.4 * (1 - k)); o.scale.set(g, 40, g); ms[0].opacity = 0.36 * (1 - k * k); }); }
      G.elemFx(ev.el, ev.x, ev.z, ev.r, ev.late ? 1.3 : 1);
    } else if (ev.shape === 'cone') {
      const dir = R() < 0.5 ? 1 : -1;
      for (const [sc, cc, op] of [[1, c, 0.8], [0.72, c2, 0.6]]) { const [m, mt] = mesh(A.cres, cc, op); m.position.set(ev.x, 1.15, ev.z); spawn(m, [mt], 0.26, (k, o, ms) => { o.rotation.set(0, ev.ang + (k - 0.5) * ev.half * 1.5 * dir, 0.22 * dir); const g = ev.r * sc * (0.55 + 0.45 * out(k)); o.scale.set(g, 1.6 + ev.r * 0.12, g); ms[0].opacity = op * (1 - k * k); }); }
      for (const f of [0.45, 0.8]) { const a = ev.ang + (R() - 0.5) * ev.half; G.elemFx(ev.el, ev.x + Math.sin(a) * ev.r * f, ev.z + Math.cos(a) * ev.r * f, Math.max(1.2, ev.r * 0.22), 0.6); }
    } else if (ev.shape === 'line') {
      for (const [ws, cc, op] of [[0.5, c, 0.5], [0.16, c2, 0.8]]) { const [m, mt] = mesh(A.box, cc, op); const st = own ? Math.min(1.6, ev.len * 0.3) : 0, L = ev.len - st; m.position.set(ev.x + sx * (st + L / 2), 1.0, ev.z + sz * (st + L / 2)); m.rotation.y = ev.ang; spawn(m, [mt], 0.28, (k, o, ms) => { const g = Math.max(0.02, Math.min(1.4, ev.w * ws) * (1 - k)); o.scale.set(g, g * 0.6 + 0.03, L); ms[0].opacity = op * (1 - k); }); }
      const n = Math.min(4, Math.max(2, Math.round(ev.len / 8))); for (let i = 0; i < n; i++) { const d = ((i + 0.6) / n) * ev.len; G.elemFx(ev.el, ev.x + sx * d, ev.z + sz * d, Math.max(1.2, ev.w * 0.7), 0.5); }
    } else { wall(ev.r, 1.6, 0.45, 0.4); wall(ev.r0, 1.2, 0.3, 0.3); const mid = (ev.r0 + ev.r) / 2; for (let i = 0; i < 5; i++) { const a = (i / 5) * 6.283 + R(); G.elemFx(ev.el, ev.x + Math.sin(a) * mid, ev.z + Math.cos(a) * mid, Math.max(1.3, (ev.r - ev.r0) * 0.4), 0.5); } }
  };

  // ---------- Proiettili con un corpo ----------
  G.shotView = function (sh) {
    const o = new THREE.Group(), mats = [], enemy = sh.team === 'e', c = enemy ? 0xff5a18 : col(sh.el), c2 = enemy ? 0xffd0a0 : col2(sh.el), sp = Math.hypot(sh.vx, sh.vz);
    const put = (geo, cc, op, x, y, z, sx, sy, sz) => { const mt = new THREE.MeshBasicMaterial({ color: cc, transparent: op < 0.5, opacity: op < 0.5 ? op : 1, depthWrite: op >= 0.5, side: THREE.DoubleSide }), m = new THREE.Mesh(geo, mt); m.position.set(x, y, z); m.scale.set(sx, sy, sz); o.add(m); mats.push(mt); return m; };
    const glow = (size, op) => { const g = new THREE.Sprite(new THREE.SpriteMaterial({ map: G.glowTex, color: c, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: op })); g.scale.setScalar(size); o.add(g); mats.push(g.material); return g; };
    let kind = 'orb', spin = null, y = 1.35;
    if (sh.w) { kind = 'wave'; y = 1.1; const big = sh.w > 3; put(A.cres, c, big ? 0.4 : 0.85, 0, 0, -sh.w * 0.75, sh.w * 1.25, 1, sh.w * 1.25); put(A.cres, c2, big ? 0.3 : 0.6, 0, 0.02, -sh.w * 0.5, sh.w * 0.95, 1, sh.w * 0.95); glow(sh.w * 1.6, 0.2); }
    else if (sh.aura) { kind = 'aura'; put(A.sph, c, 0.14, 0, 0, 0, sh.aura, sh.aura * 0.7, sh.aura); put(A.ico, c2, 0.9, 0, 0, 0, 0.55, 0.55, 0.55); spin = put(A.tor, c, 0.8, 0, 0, 0, sh.aura * 0.9, sh.aura * 0.9, sh.aura * 0.9); glow(sh.aura * 1.6, 0.4); }
    else if (sh.boom) { kind = 'rocket'; put(A.oct, 0x2a2630, 1, 0, 0, 0, 0.3, 0.3, 0.8); put(A.oct, c, 0.9, 0, 0, -0.75, 0.24, 0.24, 0.7); put(A.tor, c2, 0.8, 0, 0, 0.15, 0.36, 0.36, 0.36).rotation.x = Math.PI / 2; glow(1.2, 0.45); }
    else if (sp > 38 || (sh.hitSet && !sh.back)) { kind = 'lance'; put(A.oct, c2, 0.9, 0, 0, 0, 0.09, 0.09, 1.5); put(A.oct, c, 0.6, 0, 0, -0.7, 0.22, 0.22, 2.2); glow(0.8, 0.3); }
    else if (sh.back) { kind = 'disc'; spin = put(A.tor, c, 0.95, 0, 0, 0, 0.9, 0.9, 0.9); put(A.oct, c2, 0.9, 0, 0, 0, 0.85, 0.08, 0.85); glow(1.4, 0.25); }
    else { put(A.ico, enemy ? c : c2, 0.95, 0, 0, 0, 0.26, 0.26, 0.26); spin = put(A.tor, c, 0.7, 0, 0, 0, 0.42, 0.42, 0.42); spin.rotation.x = 1.2; glow(enemy ? 1.4 : 0.9, 0.4); if (sh.hom) kind = 'hom'; }
    o.rotation.y = Math.atan2(sh.vx, sh.vz); let tt = R() * 6, pt = 0;
    return { o, mats, c, upd(sh2, dt) {
      tt += dt; o.position.set(sh2.x, y + (kind === 'hom' ? Math.sin(tt * 14) * 0.18 : 0), sh2.z); o.rotation.y = Math.atan2(sh2.vx, sh2.vz);
      if (spin) spin.rotation.y += dt * 12; if (kind === 'wave') o.rotation.z = Math.sin(tt * 9) * 0.12;
      pt -= dt; if (pt <= 0 && near(sh2.x, sh2.z)) { pt = kind === 'aura' ? 0.1 : kind === 'wave' ? 0.12 : 0.06; const e = enemy ? '' : bel(sh2.el);
        if (kind === 'aura') { const a = R() * 6.283; G.burst(sh2.x + Math.sin(a) * sh2.aura * 0.8, 0.3 + R() * 1.6, sh2.z + Math.cos(a) * sh2.aura * 0.8, 1, c, 0.6, e === 'fuoco' ? 1.5 : 0.2, 0.5, 0.11, e === 'fuoco' ? -0.2 : 0.1); }
        else G.burst(sh2.x, y, sh2.z, 1, R() < 0.5 ? c : c2, 0.5, e === 'fuoco' ? 0.9 : e === 'gelo' || e === 'sangue' ? -0.5 : 0.2, kind === 'rocket' ? 0.45 : 0.25, kind === 'rocket' ? 0.1 : 0.05, e === 'fuoco' || e === 'veleno' ? -0.15 : e === 'sangue' ? 1 : 0.15); }
    } };
  };

  // ---------- Zone: vortici e trombe d'aria hanno un corpo ----------
  const zv = new Map(); let zt = 0;
  G.animZones = function (st, dt, t) {
    const seen = new Set(); zt -= dt; const puff = zt <= 0; if (puff) zt = 0.3; let budget = 5;
    for (const z of st.zones) {
      if (z.team !== 'p' || !near(z.x, z.z)) continue; const o = z.px ? z.px.o : null, twist = z.pull || (o && (o.mv || o.seek));
      if (twist) {
        seen.add(z.id); let v = zv.get(z.id);
        if (!v) { const g = new THREE.Group(), mats = [], tall = !!(o && (o.mv || o.seek)); for (let i = 0; i < (tall ? 5 : 3); i++) { const [m, mt] = mesh(A.tor, i % 2 ? col2(z.el) : col(z.el), 0.65); m.userData = { h: tall ? 0.4 + i * 1.1 : 0.25 + i * 0.3, r: tall ? 0.35 + i * 0.17 : 1 - i * 0.28, sp: (i % 2 ? -1 : 1) * (3 + i) }; g.add(m); mats.push(mt); } scene.add(g); v = { o: g, mats }; zv.set(z.id, v); }
        v.o.position.set(z.x, 0, z.z); for (const m of v.o.children) { const u = m.userData; m.position.y = u.h + Math.sin(t * 3 + u.h) * 0.12; m.rotation.y = t * u.sp; m.scale.setScalar(Math.max(0.2, z.r * u.r * (z.pull && !u.h ? 1 : 0.9 + Math.sin(t * 5 + u.h) * 0.1))); m.rotation.x = Math.sin(t * 2 + u.h) * 0.15; }
        const left = z.dur - z.t; for (const m of v.mats) m.opacity = 0.65 * Math.min(1, left);
      }
      if (puff && budget > 0 && (z.dps > 0 || z.px) && !z.mini) { budget--; const a = R() * 6.283, d = Math.sqrt(R()) * z.r * 0.8, e = bel(z.el), px = z.x + Math.sin(a) * d, pz = z.z + Math.cos(a) * d, c = col(z.el);
        if (e === 'fuoco') G.burst(px, 0.2, pz, 4, R() < 0.5 ? c : col2(z.el), 1, 4, 0.7, 0.16, -0.25); else if (e === 'gelo') G.burst(px, 2.5, pz, 3, 0xeaf4ff, 0.6, -1.5, 0.9, 0.08, 0.1); else if (e === 'folgore') { G.bolt(px, 0.1, pz, px + (R() - 0.5) * 3, 1.4 + R() * 1.5, pz + (R() - 0.5) * 3, 0.1, 0.14, c, 1.2); } else if (e === 'veleno') G.burst(px, 0.2, pz, 3, c, 0.5, 1, 1.4, 0.2, -0.06); else if (e === 'ombra') G.burst(px, 2.2, pz, 3, c, 0.4, -2.2, 0.8, 0.12, 0); else if (e === 'luce') G.burst(px, 0.2, pz, 3, col2(z.el), 0.5, 6, 0.6, 0.07, -0.2); else if (e === 'sangue') G.burst(px, 1.6, pz, 3, c, 1.5, 1, 0.8, 0.11, 1.6); else G.spray(px, 0.5 + R(), pz, Math.cos(a), 0.15, -Math.sin(a), 3, col2(z.el), 7, 0.3, 0.4, 0.08, 0); }
    }
    for (const [id, v] of zv) if (!seen.has(id)) { scene.remove(v.o); for (const m of v.mats) m.dispose(); zv.delete(id); }
  };
  // ---------- Evocazioni: una colonna di luce quando arrivano ----------
  const known = new Set(); let first = true;
  G.animMobs = function (st) {
    for (const e of st.mobs) { if (known.has(e.id)) { if (e.thrown && R() < 0.6) G.burst(e.x, 1.6, e.z, 1, col(e.thrown.el), 1, 0.5, 0.4, 0.14, 0.2); continue; } known.add(e.id); if (first || e.team !== 'a' || e.charm > 0 || !near(e.x, e.z)) continue;
      const c = col(e.el || 'luce'), [m, mt] = mesh(A.wall, c, 0.6); m.position.set(e.x, 0, e.z); spawn(m, [mt], 0.5, (k, o, ms) => { const g = Math.max(0.05, (e.r + 0.5) * (1 - k * 0.6)); o.scale.set(g, 9 * (1 - k * 0.5), g); ms[0].opacity = 0.6 * (1 - k); }); G.ring(e.x, 0.1, e.z, 0.2, e.r + 1.6, 0.4, c); G.burst(e.x, 0.3, e.z, 8, c, 2, 5, 0.6, 0.09, -0.1); }
    first = false; if (known.size > 600) known.clear();
  };

  // ---------- Mani: fendente, schianto, lancio ----------
  if (!G.slashArc) {
    const hsMat = add(0xffffff, 0), hsMat2 = add(0xffffff, 0), g = new THREE.Group(), a = new THREE.Mesh(A.cres, hsMat), b = new THREE.Mesh(A.cres, hsMat2);
    b.scale.setScalar(0.8); g.add(a, b); g.rotation.x = Math.PI / 2; const piv = new THREE.Group(); piv.add(g); piv.position.set(0, -0.06, -0.62); piv.scale.setScalar(0.42); G.handScene.add(piv); G.slashArc = { piv, hsMat, hsMat2, dir: 1 };
    G.hands.slash = 0; G.hands.slam = 0; G.hands.toss = 0;
  }
  G.gesture = function (what, el) { const h = G.hands, S = G.slashArc; if (what === 'slash') { h.slash = 0.2; S.dir = R() < 0.5 ? 1 : -1; S.hsMat.color.setHex(col(el)); S.hsMat2.color.setHex(col2(el)); S.tilt = (R() - 0.5) * 0.9; } else if (what === 'slam') h.slam = 0.34; else h.toss = 0.26; };
  G.animHands = function (dt) {
    const h = G.hands, S = G.slashArc, HR = G.handR, HL = G.handL; if (!HR) return;
    if (h.slash > 0) { h.slash = Math.max(0, h.slash - dt); const k = 1 - h.slash / 0.2; HR.position.x += (0.5 - k) * 0.3 * S.dir; HR.position.y += Math.sin(k * Math.PI) * 0.05; HR.rotation.z += (k - 0.5) * 1.5 * S.dir; S.piv.rotation.z = S.tilt + (0.5 - k) * 2.1 * S.dir; S.hsMat.opacity = 0.85 * Math.sin(k * Math.PI); S.hsMat2.opacity = 0.6 * Math.sin(k * Math.PI); } else { S.hsMat.opacity = 0; S.hsMat2.opacity = 0; }
    if (h.slam > 0) { h.slam = Math.max(0, h.slam - dt); const k = 1 - h.slam / 0.34, up = k < 0.35 ? k / 0.35 : Math.max(0, 1 - (k - 0.35) / 0.2) - Math.min(1, Math.max(0, (k - 0.55) / 0.2)) * 0.6 * (1 - Math.max(0, (k - 0.75) / 0.25)); for (const H of [HR, HL]) { H.position.y += up * 0.13; H.rotation.x += up * 0.7; } }
    if (h.toss > 0) { h.toss = Math.max(0, h.toss - dt); const k = 1 - h.toss / 0.26, a = Math.sin(k * Math.PI); HR.position.y += a * 0.09; HR.position.z -= a * 0.14; HR.rotation.x += (0.5 - k) * 1.3; }
  };
};
