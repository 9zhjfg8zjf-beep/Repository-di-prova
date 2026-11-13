// MOTORE - costruzione della citta' a partire dalla mappa generata. Tutto da codice: geometrie, texture, insegne.
G.PAL = {
  dite: { fog: 0x200a0c, fogD: 0.0105, sky: [[1, 0.38, 0.08], [0.62, 0.13, 0.08], [0.22, 0.045, 0.1]], skyGlow: [0.95, 0.3, 0.08], liq: [[1, 0.2, 0.02], [1, 0.62, 0.16], [0.08, 0.012, 0.008]], liqHex: 0xff5a18, bank: ['#120b0a', '#5a1a08', '#ff7a20'],
    ember: [1, 0.5, 0.14], emberDir: 1, amb: 0x4a3a52, hemi: [0x8a3a3a, 0x4a2010], sun: 0xc86a70, far: 0x9a7068, farLights: ['#ff8a3a', '#ff4028', '#ffb23a', '#c03020'],
    neon: { cy: '#3fe9ff', mg: '#ff3fd0', am: '#ffb23a', rd: '#ff4028', gr: '#9dff3a', wh: '#f2f6ff' }, bases: ['#2a2229', '#222a33', '#2c2026', '#332c29', '#141c26'], tower: 0x8a5aff,
    lights: [['#ffb23a', '#ff9a2a', '#ffc860', '#ff6a2a'], ['#3fe9ff', '#bff6ff', '#ffb23a'], ['#ffb23a', '#3fe9ff', '#ff3fd0', '#ff4028', '#ffd9a0'], ['#ff4028', '#ff6a2a']], street: ['#131217', 'rgba(63,233,255,.55)', 'rgba(255,178,58,.5)'], ash: ['#17120f', 'rgba(255,106,42,.75)'] },
  cocito: { fog: 0x0a1420, fogD: 0.0095, sky: [[0.35, 0.62, 0.8], [0.1, 0.22, 0.42], [0.03, 0.05, 0.14]], skyGlow: [0.5, 0.85, 1], liq: [[0.4, 0.68, 0.85], [0.62, 0.8, 0.9], [0.08, 0.16, 0.26]], liqHex: 0x6fd0ff, bank: ['#0a1016', '#1a3a52', '#9fe0ff'],
    ember: [0.8, 0.92, 1], emberDir: -1, amb: 0x3a4a62, hemi: [0x4a6a9a, 0x1a2a40], sun: 0x8ab0e0, far: 0x6a8aa8, farLights: ['#9fd8ff', '#6fb6ff', '#dff3ff', '#b8a8ff'],
    neon: { cy: '#6fe0ff', mg: '#b08aff', am: '#dff3ff', rd: '#5a8cff', gr: '#8affd8', wh: '#f2f6ff' }, bases: ['#1f2630', '#1c2733', '#232a38', '#262b33', '#101a26'], tower: 0x6fd0ff,
    lights: [['#9fd8ff', '#dff3ff', '#6fb6ff'], ['#6fe0ff', '#dff3ff', '#b8a8ff'], ['#9fd8ff', '#b08aff', '#8affd8', '#f2f6ff'], ['#5a8cff', '#6fb6ff']], street: ['#12161c', 'rgba(111,224,255,.55)', 'rgba(223,243,255,.4)'], ash: ['#141a22', 'rgba(140,210,255,.7)'] },
  malebolge: { fog: 0x0c140a, fogD: 0.011, sky: [[0.55, 0.75, 0.12], [0.2, 0.3, 0.1], [0.1, 0.04, 0.16]], skyGlow: [0.6, 1, 0.2], liq: [[0.26, 0.62, 0.06], [0.5, 0.72, 0.16], [0.03, 0.07, 0.02]], liqHex: 0x8dff3a, bank: ['#0a0f08', '#2a4a0c', '#b0ff40'],
    ember: [0.6, 1, 0.3], emberDir: 1, amb: 0x3f4a3a, hemi: [0x5a7a3a, 0x2a2040], sun: 0xa0c070, far: 0x7a8a60, farLights: ['#9dff3a', '#c05aff', '#e8ff5a', '#5aff9a'],
    neon: { cy: '#9dff3a', mg: '#c05aff', am: '#e8ff5a', rd: '#ff6a2a', gr: '#5aff9a', wh: '#e6ffd0' }, bases: ['#24281f', '#1f2a22', '#2a2622', '#2b2a1c', '#141f14'], tower: 0xc05aff,
    lights: [['#9dff3a', '#d7ff7a', '#e8ff5a'], ['#5aff9a', '#d7ff7a', '#c05aff'], ['#9dff3a', '#c05aff', '#ffb23a', '#e8ff5a'], ['#ff6a2a', '#c05aff']], street: ['#12140f', 'rgba(157,255,58,.5)', 'rgba(192,90,255,.5)'], ash: ['#14160e', 'rgba(157,255,58,.7)'] },
};
G.disposeWorld = function () {
  if (!G.scene) return;
  G.scene.traverse((o) => {
    if (o.geometry && !o.geometry.keep) o.geometry.dispose();
    const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
    for (const m of ms) { for (const k of ['map', 'emissiveMap', 'alphaMap']) if (m[k]) m[k].dispose(); m.dispose(); }
  });
  G.scene = null;
};
G.buildWorld = function (city) {
  const C = Core, HALF = C.HALF, CELL = C.CELL, N = C.N, MAP = city.map, P = G.PAL[city.theme.id], liqSolid = city.theme.liquidSolid;
  const scene = (G.scene = new THREE.Scene());
  scene.fog = new THREE.FogExp2(P.fog, P.fogD);
  let seed = 20261110 + city.seed * 131;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const NEON = P.neon, hexOf = (css) => parseInt(css.slice(1), 16);
  const shade = (css, f) => { const n = hexOf(css), r = Math.min(255, Math.round(((n >> 16) & 255) * f)), g = Math.min(255, Math.round(((n >> 8) & 255) * f)), b = Math.min(255, Math.round((n & 255) * f)); return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1); };

  // ---------- Texture da canvas ----------
  function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function toTex(c, repeat) { const t = new THREE.CanvasTexture(c); if (repeat !== false) t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = G.aniso; return t; }
  function speckle(g, w, h, n, colors, s0, s1) { for (let i = 0; i < n; i++) { g.fillStyle = pick(colors); const s = s0 + rnd() * (s1 - s0); g.fillRect(rnd() * w, rnd() * h, s, s); } }
  // Facciata: 512px = 16 unita'. Mappa colore + mappa luminosa (finestre accese).
  function facade(o) {
    const S = 512, c = canvas(S, S), e = canvas(S, S), g = c.getContext('2d'), ge = e.getContext('2d');
    g.fillStyle = o.base; g.fillRect(0, 0, S, S);
    speckle(g, S, S, 1400, [shade(o.base, 1.22), shade(o.base, 0.74), shade(o.base, 1.4)], 1, 3);
    ge.fillStyle = '#000'; ge.fillRect(0, 0, S, S);
    g.strokeStyle = shade(o.base, 0.45); g.lineWidth = 2;
    for (let i = 0; i <= o.cols; i++) { const x = (i * S) / o.cols; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, S); g.stroke(); }
    for (let j = 0; j <= o.rows; j++) { const y = (j * S) / o.rows; g.beginPath(); g.moveTo(0, y); g.lineTo(S, y); g.stroke(); }
    const cw = S / o.cols, ch = S / o.rows;
    for (let j = 0; j < o.rows; j++) for (let i = 0; i < o.cols; i++) {
      const x = i * cw + cw * o.mx, y = j * ch + ch * o.my, w = cw * (1 - 2 * o.mx), h = ch * (1 - o.my - o.mb);
      const lit = rnd() < o.lit, col = lit ? pick(o.lights) : pick(['#07070b', '#0a0a10', '#0c0b12']);
      const shape = (ctx) => { ctx.beginPath(); if (o.arch) { ctx.moveTo(x, y + h); ctx.lineTo(x, y + h * 0.35); ctx.quadraticCurveTo(x, y, x + w / 2, y); ctx.quadraticCurveTo(x + w, y, x + w, y + h * 0.35); ctx.lineTo(x + w, y + h); } else ctx.rect(x, y, w, h); ctx.closePath(); };
      g.fillStyle = '#030305'; g.fillRect(x - 3, y - 3, w + 6, h + 6);
      shape(g); g.fillStyle = col; g.fill();
      if (lit) { shape(ge); ge.fillStyle = col; ge.globalAlpha = 0.55 + rnd() * 0.45; ge.fill(); ge.globalAlpha = 1; if (rnd() < 0.5) { g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(x, y + h * (0.3 + rnd() * 0.4), w, 3); ge.fillStyle = '#000'; ge.fillRect(x, y + h * 0.55, w, 3); } }
      if (o.mullion) { g.fillStyle = '#050508'; g.fillRect(x + w / 2 - 1.5, y, 3, h); ge.fillStyle = '#000'; ge.fillRect(x + w / 2 - 1.5, y, 3, h); }
    }
    if (o.strips) for (let i = 0; i < o.cols; i += 2) { const x = (i * S) / o.cols + 2; ge.fillStyle = o.strips; ge.fillRect(x, 0, 3, S); g.fillStyle = o.strips; g.fillRect(x, 0, 3, S); }
    for (let i = 0; i < 26; i++) { const x = rnd() * S, y = rnd() * S, h = 30 + rnd() * 120; const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, 'rgba(0,0,0,.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x, y, 3 + rnd() * 8, h); }
    return new THREE.MeshStandardMaterial({ map: toTex(c), emissiveMap: toTex(e), emissive: 0xffffff, emissiveIntensity: o.glow || 1, roughness: o.rough || 0.82, metalness: o.metal || 0.15 });
  }
  const TW = P.neon.cy, twd = shade(TW, 0.22);
  const FAC = [
    facade({ base: P.bases[0], cols: 8, rows: 6, mx: 0.24, my: 0.16, mb: 0.2, arch: true, lit: 0.26, lights: P.lights[0] }),
    facade({ base: P.bases[1], cols: 4, rows: 8, mx: 0.06, my: 0.3, mb: 0.3, lit: 0.34, lights: P.lights[1], metal: 0.5, rough: 0.5, mullion: true }),
    facade({ base: P.bases[2], cols: 12, rows: 9, mx: 0.2, my: 0.2, mb: 0.22, lit: 0.3, lights: P.lights[2] }),
    facade({ base: P.bases[3], cols: 6, rows: 4, mx: 0.38, my: 0.3, mb: 0.45, lit: 0.18, lights: P.lights[3], rough: 0.95 }),
    facade({ base: P.bases[4], cols: 8, rows: 16, mx: 0.05, my: 0.1, mb: 0.1, lit: 0.5, lights: [twd, twd, twd, shade(TW, 0.32), twd, shade(TW, 0.28), TW], strips: shade(TW, 0.75), metal: 0.7, rough: 0.35, glow: 1.2 }),
  ];
  const FARMAT = (() => { const m = facade({ base: '#0a0608', cols: 10, rows: 14, mx: 0.25, my: 0.25, mb: 0.25, lit: 0.16, lights: P.farLights }); m.map.dispose(); const fm = new THREE.MeshBasicMaterial({ map: m.emissiveMap, color: P.far, fog: false }); m.dispose(); return fm; })();

  // Piano terra: vetrine, saracinesche, porte (512x128 = 16 x 3.4 unita')
  function shopfront(v) {
    const W = 512, H = 128, c = canvas(W, H), e = canvas(W, H), g = c.getContext('2d'), ge = e.getContext('2d');
    g.fillStyle = '#0e0c10'; g.fillRect(0, 0, W, H); ge.fillStyle = '#000'; ge.fillRect(0, 0, W, H);
    speckle(g, W, H, 500, ['#15121a', '#09080b', '#1c1820'], 1, 3);
    for (let m = 0; m < 4; m++) {
      const x = m * 128 + 8, kind = Math.floor(rnd() * 5), col = pick(Object.values(NEON));
      if (kind === 0) { g.fillStyle = '#1b1a20'; g.fillRect(x, 18, 112, 110); g.strokeStyle = '#0a0a0d'; g.lineWidth = 2; for (let y = 22; y < 128; y += 7) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 112, y); g.stroke(); } g.fillStyle = col; g.globalAlpha = 0.5; g.font = 'bold 26px sans-serif'; g.fillText(pick(['IX', 'VII', '666', 'XIV', 'NO', 'XXXIV']), x + 20 + rnd() * 30, 80 + rnd() * 20); g.globalAlpha = 1; }
      else if (kind === 1) { const gr = g.createLinearGradient(0, 20, 0, 128); gr.addColorStop(0, col); gr.addColorStop(1, '#120a0c'); g.fillStyle = gr; g.fillRect(x + 4, 22, 104, 96); ge.fillStyle = gr; ge.globalAlpha = 0.55; ge.fillRect(x + 4, 22, 104, 96); ge.globalAlpha = 1; g.fillStyle = '#050507'; for (let k = 0; k < 4; k++) { const bx = x + 10 + k * 25, bh = 20 + rnd() * 50; g.fillRect(bx, 118 - bh, 16, bh); ge.fillStyle = '#000'; ge.fillRect(bx, 118 - bh, 16, bh); } g.strokeStyle = '#050507'; g.lineWidth = 4; g.strokeRect(x + 4, 22, 104, 96); }
      else if (kind === 2) { g.fillStyle = '#060608'; g.beginPath(); g.moveTo(x + 30, 128); g.lineTo(x + 30, 55); g.quadraticCurveTo(x + 56, 8, x + 82, 55); g.lineTo(x + 82, 128); g.fill(); for (const ctx of [g, ge]) { ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 30, 128); ctx.lineTo(x + 30, 55); ctx.quadraticCurveTo(x + 56, 8, x + 82, 55); ctx.lineTo(x + 82, 128); ctx.stroke(); } }
      else if (kind === 3) { g.fillStyle = '#16161c'; g.fillRect(x + 20, 30, 70, 98); for (const ctx of [g, ge]) { ctx.fillStyle = col; ctx.fillRect(x + 28, 40, 54, 30); ctx.fillStyle = NEON.rd; ctx.fillRect(x + 30, 80, 8, 8); ctx.fillStyle = NEON.gr; ctx.fillRect(x + 44, 80, 8, 8); } g.fillStyle = '#000'; for (let y = 42; y < 70; y += 4) g.fillRect(x + 28, y, 54, 1); }
      else { g.fillStyle = '#17151a'; g.fillRect(x, 40, 112, 60); g.strokeStyle = '#2b2630'; g.lineWidth = 6; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x + 14 + k * 34, 0); g.lineTo(x + 14 + k * 34, 128); g.stroke(); } for (const ctx of [g, ge]) { ctx.fillStyle = NEON.am; for (let y = 50; y < 96; y += 9) ctx.fillRect(x + 8, y, 96, 2); } }
    }
    g.fillStyle = '#060507'; g.fillRect(0, 0, W, 12);
    for (const ctx of [g, ge]) { ctx.fillStyle = v % 2 ? NEON.cy : NEON.mg; ctx.globalAlpha = 0.8; ctx.fillRect(0, 12, W, 2); ctx.globalAlpha = 1; }
    return new THREE.MeshStandardMaterial({ map: toTex(c), emissiveMap: toTex(e), emissive: 0xffffff, emissiveIntensity: 1.15, roughness: 0.6, metalness: 0.3 });
  }
  const SHOP = [0, 1, 2, 3].map(shopfront);

  function groundTex(kind) {
    const S = 256, c = canvas(S, S), e = canvas(S, S), g = c.getContext('2d'), ge = e.getContext('2d'), sb = P.street[0];
    ge.fillStyle = '#000'; ge.fillRect(0, 0, S, S);
    if (kind === 'street' || kind === 'cross') {
      g.fillStyle = sb; g.fillRect(0, 0, S, S);
      speckle(g, S, S, 2600, [shade(sb, 1.3), shade(sb, 0.7), shade(sb, 1.6), shade(sb, 1.1)], 1, 3);
      for (let i = 0; i < 9; i++) { g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 1; g.beginPath(); let x = rnd() * S, y = rnd() * S; g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (rnd() - 0.5) * 50; y += (rnd() - 0.5) * 50; g.lineTo(x, y); } g.stroke(); }
      for (let i = 0; i < 5; i++) { const x = rnd() * S, y = rnd() * S, r = 14 + rnd() * 26, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(40,46,60,.55)'); gr.addColorStop(1, 'rgba(40,46,60,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
      if (kind === 'street') {
        for (const x0 of [0, S - 44]) { g.fillStyle = shade(sb, 1.6); g.fillRect(x0, 0, 44, S); g.strokeStyle = '#0c0b0e'; g.lineWidth = 2; for (let y = 0; y < S; y += 32) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + 44, y); g.stroke(); } }
        g.fillStyle = '#09090b'; g.fillRect(44, 0, 4, S); g.fillRect(S - 48, 0, 4, S);
        for (const ctx of [g, ge]) { ctx.fillStyle = P.street[1]; ctx.fillRect(49, 0, 2, S); ctx.fillRect(S - 51, 0, 2, S); }
        g.fillStyle = P.street[2]; for (let y = 10; y < S; y += 64) g.fillRect(S / 2 - 2, y, 4, 30);
      } else { g.strokeStyle = P.street[2]; g.globalAlpha = 0.7; g.lineWidth = 3; g.strokeRect(50, 50, S - 100, S - 100); g.globalAlpha = 1; }
    } else if (kind === 'plaza') {
      g.fillStyle = shade(sb, 1.25); g.fillRect(0, 0, S, S);
      speckle(g, S, S, 1500, [shade(sb, 1.6), shade(sb, 0.85)], 1, 3);
      g.strokeStyle = '#0a090c'; g.lineWidth = 2; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, S); g.moveTo(0, i * 32); g.lineTo(S, i * 32); g.stroke(); }
      for (const ctx of [g, ge]) { ctx.strokeStyle = NEON.mg; ctx.globalAlpha = 0.55; ctx.lineWidth = 3; for (const r of [44, 78, 118]) { ctx.beginPath(); ctx.arc(S / 2, S / 2, r, 0, 7); ctx.stroke(); } ctx.lineWidth = 1.5; for (let a = 0; a < 9; a++) { const an = (a / 9) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(S / 2 + Math.cos(an) * 44, S / 2 + Math.sin(an) * 44); ctx.lineTo(S / 2 + Math.cos(an) * 118, S / 2 + Math.sin(an) * 118); ctx.stroke(); } ctx.globalAlpha = 1; }
    } else if (kind === 'ash') {
      const ab = P.ash[0]; g.fillStyle = ab; g.fillRect(0, 0, S, S);
      speckle(g, S, S, 3000, [shade(ab, 1.4), shade(ab, 0.6), shade(ab, 1.8), shade(ab, 1.15)], 1, 4);
      for (let i = 0; i < 7; i++) for (const ctx of [g, ge]) { ctx.strokeStyle = P.ash[1]; ctx.lineWidth = 1.5; ctx.beginPath(); let x = (i * 37 + 20) % S, y = (i * 91 + 10) % S; ctx.moveTo(x, y); let sx = i * 13.7; for (let k = 0; k < 6; k++) { sx = (sx * 7.3 + 3.1) % 10; x += (sx / 10 - 0.5) * 60; y += (((sx * 3.7) % 10) / 10 - 0.5) * 60; ctx.lineTo(x, y); } ctx.stroke(); }
    } else {
      g.fillStyle = '#1a1614'; g.fillRect(0, 0, S, S);
      g.strokeStyle = '#0a0807'; g.lineWidth = 3; for (let i = 0; i <= 16; i++) { g.beginPath(); g.moveTo(i * 16, 0); g.lineTo(i * 16, S); g.moveTo(0, i * 16); g.lineTo(S, i * 16); g.stroke(); }
      for (const ctx of [g, ge]) { ctx.fillStyle = P.bank[2]; ctx.globalAlpha = 0.5; for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) if ((i + j) % 2) ctx.fillRect(i * 16 + 5, j * 16 + 5, 6, 6); ctx.globalAlpha = 1; }
    }
    return new THREE.MeshStandardMaterial({ map: toTex(c), emissiveMap: toTex(e), emissive: 0xffffff, emissiveIntensity: 0.9, roughness: kind === 'ash' ? 0.95 : 0.58, metalness: kind === 'bridge' ? 0.5 : 0.12 });
  }
  const GM = { sv: groundTex('street'), sh: null, cross: groundTex('cross'), plaza: groundTex('plaza'), ash: groundTex('ash'), bridge: groundTex('bridge') };
  GM.sh = GM.sv;

  // ---------- Raccolta e fusione delle geometrie ----------
  const bags = new Map();
  const put = (key, mat, geo) => { if (!bags.has(key)) bags.set(key, { mat, list: [] }); bags.get(key).list.push(geo); };
  const DARK = new THREE.MeshStandardMaterial({ color: 0x15131a, roughness: 0.7, metalness: 0.45 });
  const STONE = new THREE.MeshStandardMaterial({ color: 0x1d1716, roughness: 0.95, metalness: 0.05 });
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V1 = new THREE.Vector3(), V2 = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
  function box(w, h, d, x, y, z) { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); return g; }
  function beam(ax, ay, az, bx, by, bz, th) { V1.set(bx - ax, by - ay, bz - az); const len = V1.length(); V1.normalize(); const g = new THREE.BoxGeometry(th, len, th); Q.setFromUnitVectors(UP, V1); M4.compose(V2.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2), Q, new THREE.Vector3(1, 1, 1)); g.applyMatrix4(M4); return g; }
  function facadeBox(w, h, d, x, y, z) {
    const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv, ou = Math.floor(rnd() * 8) / 8, ov = Math.floor(rnd() * 6) / 6;
    for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const k = f * 4 + i; if (f === 2 || f === 3) uv.setXY(k, 0.002, 0.002); else uv.setXY(k, (uv.getX(k) * (f < 2 ? d : w)) / 16 + ou, (uv.getY(k) * h) / 16 + ov); }
    g.translate(x, y, z); return g;
  }
  function quadXZ(x0, z0, x1, z1, y, u0, v0, u1, v1, swap) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([x0, y, z0, x1, y, z0, x1, y, z1, x0, y, z1]), 3));
    g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]), 3));
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(swap ? [v0, u0, v0, u1, v1, u1, v1, u0] : [u0, v0, u1, v0, u1, v1, u0, v1]), 2));
    g.setIndex([0, 2, 1, 0, 3, 2]); return g;
  }
  function wallQuad(ax, az, bx, bz, y0, y1, u0, u1) { // parete verticale da A a B, normale a sinistra del verso A->B
    const g = new THREE.BufferGeometry(), nx = bz - az, nz = -(bx - ax), nl = Math.hypot(nx, nz) || 1;
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([ax, y0, az, bx, y0, bz, bx, y1, bz, ax, y1, az]), 3));
    g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array([nx / nl, 0, nz / nl, nx / nl, 0, nz / nl, nx / nl, 0, nz / nl, nx / nl, 0, nz / nl]), 3));
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([u0, 0, u1, 0, u1, 1, u0, 1]), 2));
    g.setIndex([0, 2, 1, 0, 3, 2]); return g;
  }
  const tile = (cx, cz) => (cx < 0 || cz < 0 || cx >= N || cz >= N ? '#' : MAP[cz][cx]);
  const passable = (cx, cz) => { const t = tile(cx, cz); return t !== '#' && (t !== '~' || !liqSolid); };
  const band = (i) => i % 6 < 2;
  const glows = [];

  // ---------- Suolo ----------
  const LIQ_Y = liqSolid ? -1.5 : 0.015;
  for (let cz = 0; cz < N; cz++) for (let cx = 0; cx < N; cx++) {
    const t = MAP[cz][cx], x0 = cx * CELL - HALF, z0 = cz * CELL - HALF, x1 = x0 + CELL, z1 = z0 + CELL;
    if (t === '#' || t === '~') continue;
    if (t === '=') put('gbridge', GM.bridge, quadXZ(x0, z0, x1, z1, 0.02, x0 / 8, z0 / 8, x1 / 8, z1 / 8));
    else if (t === 'o') { if (cx >= 18 && cx <= 25 && cz >= 18 && cz <= 25) put('gplaza', GM.plaza, quadXZ(x0, z0, x1, z1, 0, (x0 + 8) / 16, (z0 + 8) / 16, (x1 + 8) / 16, (z1 + 8) / 16)); else put('gash', GM.ash, quadXZ(x0, z0, x1, z1, 0, x0 / 8, z0 / 8, x1 / 8, z1 / 8)); }
    else if (cx >= 18 && cx <= 25 && cz >= 18 && cz <= 25) put('gplaza', GM.plaza, quadXZ(x0, z0, x1, z1, 0, (x0 + 8) / 16, (z0 + 8) / 16, (x1 + 8) / 16, (z1 + 8) / 16));
    else if (band(cx) && band(cz)) put('gcross', GM.cross, quadXZ(x0, z0, x1, z1, 0, x0 / 8, z0 / 8, x1 / 8, z1 / 8));
    else if (band(cx)) put('gsv', GM.sv, quadXZ(x0, z0, x1, z1, 0, x0 / 8, z0 / 8, x1 / 8, z1 / 8));
    else if (band(cz)) put('gsv', GM.sv, quadXZ(x0, z0, x1, z1, 0, x0 / 8, z0 / 8, x1 / 8, z1 / 8, true));
    else put('gcross', GM.cross, quadXZ(x0, z0, x1, z1, 0, x0 / 8, z0 / 8, x1 / 8, z1 / 8)); // vicolo
  }
  // ---------- Canali ----------
  G.liqMats = [];
  const liqFrag = `uniform float time; uniform vec3 c0; uniform vec3 c1; uniform vec3 c2; uniform vec2 sc; uniform float ice; varying vec2 vP;
    float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
    float n(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y); }
    float fbm(vec2 p){ float a=.5,s=0.; for(int i=0;i<4;i++){ s+=a*n(p); p=p*2.03+7.1; a*=.5; } return s; }
    void main(){ vec2 p = vP*sc; float t=time*.12*(1.-ice);
      float v = fbm(p+vec2(t*2.,0.)+fbm(p*1.7-vec2(t,0.))*1.2);
      float crust = smoothstep(.42,.62,v);
      vec3 hot = mix(c0, c1, smoothstep(.25,.5,1.-v));
      vec3 c = mix(hot*1.25, c2, crust);
      c += c0*pow(1.-crust,3.)*.5;
      if(ice>.5){ float cr = smoothstep(.02,.0,abs(fbm(vP*.35)-.5)); c = mix(c2*1.5, c1*.5, smoothstep(.3,.7,v)) + c1*cr*.7 + c0*.08*sin(time+vP.x*.3); }
      gl_FragColor = vec4(c,1.); }`;
  for (const cn of city.canals) {
    const a0 = 6 * cn.k * CELL - HALF, a1 = a0 + 8, ext = liqSolid ? 70 : 0;
    const mat = new THREE.ShaderMaterial({ uniforms: { time: { value: 0 }, c0: { value: new THREE.Vector3(...P.liq[0]) }, c1: { value: new THREE.Vector3(...P.liq[1]) }, c2: { value: new THREE.Vector3(...P.liq[2]) }, sc: { value: cn.horiz ? new THREE.Vector2(0.16, 0.34) : new THREE.Vector2(0.34, 0.16) }, ice: { value: liqSolid ? 0 : 1 } },
      vertexShader: 'varying vec2 vP; void main(){ vP = position.xz; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }', fragmentShader: liqFrag });
    if (!cn.horiz) mat.uniforms.sc.value.set(0.34, 0.16);
    G.liqMats.push(mat);
    scene.add(new THREE.Mesh(cn.horiz ? quadXZ(-HALF - ext, a0, HALF + ext, a1, LIQ_Y, 0, 0, 1, 1) : quadXZ(a0, -HALF - ext, a1, HALF + ext, LIQ_Y, 0, 0, 1, 1), mat));
  }
  const bankMat = new THREE.MeshBasicMaterial({ map: (() => { const c = canvas(8, 64), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, P.bank[0]); gr.addColorStop(0.6, P.bank[1]); gr.addColorStop(1, P.bank[2]); g.fillStyle = gr; g.fillRect(0, 0, 8, 64); return toTex(c, false); })() });
  if (liqSolid) for (let cz = 0; cz < N; cz++) for (let cx = 0; cx < N; cx++) {
    if (MAP[cz][cx] !== '~') continue;
    const x0 = cx * CELL - HALF, z0 = cz * CELL - HALF, x1 = x0 + CELL, z1 = z0 + CELL;
    const sides = [[cx + 1, cz, x1, z1, x1, z0, x1 + 0.18, (z0 + z1) / 2, 0.35, CELL], [cx - 1, cz, x0, z0, x0, z1, x0 - 0.18, (z0 + z1) / 2, 0.35, CELL], [cx, cz - 1, x1, z0, x0, z0, (x0 + x1) / 2, z0 - 0.18, CELL, 0.35], [cx, cz + 1, x0, z1, x1, z1, (x0 + x1) / 2, z1 + 0.18, CELL, 0.35]];
    for (const [nx, nz, ax, az, bx, bz, px, pz, pw, pd] of sides) {
      if (nx < 0 || nz < 0 || nx >= N || nz >= N) continue; const t = MAP[nz][nx]; if (t === '~') continue;
      put('bank', bankMat, wallQuad(ax, az, bx, bz, LIQ_Y, 0, 0, 1));
      if (t === '=') { put('dark', DARK, box(pw === CELL ? CELL : 0.2, 1.05, pd === CELL ? CELL : 0.2, px, 0.52, pz)); put('neonAm', null, box(pw === CELL ? CELL : 0.08, 0.08, pd === CELL ? CELL : 0.08, px, 1.1, pz)); }
      else if (t !== '#') { put('stone', STONE, box(pw, 0.95, pd, px, 0.47, pz)); if ((cx + cz) % 3 === 0) glows.push({ x: px + (px - (x0 + 2)) * 1.2, z: pz + (pz - (z0 + 2)) * 1.2, c: P.liqHex, sx: 10, sz: 10 }); }
    }
  }

  // ---------- Edifici ----------
  const signSlots = [];
  function lot(x0, z0, x1, z1, style, hMin, hMax) {
    const w = x1 - x0, d = z1 - z0, h = hMin + rnd() * (hMax - hMin), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    put('fac' + style, FAC[style], facadeBox(w, h, d, cx, h / 2, cz));
    let top = h;
    if (rnd() < 0.55 && w > 6 && d > 6) { const th = 4 + rnd() * 10, ins = 1.2 + rnd() * 1.5; put('fac' + style, FAC[style], facadeBox(w - ins * 2, th, d - ins * 2, cx, h + th / 2, cz)); top = h + th; }
    put('dark', DARK, box(w + 0.3, 0.35, d + 0.3, cx, h + 0.05, cz));
    if (style === 0 || rnd() < 0.25) for (const [sx, sz] of [[x0 + 0.8, z0 + 0.8], [x1 - 0.8, z0 + 0.8], [x0 + 0.8, z1 - 0.8], [x1 - 0.8, z1 - 0.8]]) { const g = new THREE.ConeGeometry(0.8, 3.5 + rnd() * 2.5, 4); g.translate(sx, h + 2, sz); put('dark', DARK, g); }
    if (rnd() < 0.5) { const ah = 4 + rnd() * 8, ax = cx + (rnd() - 0.5) * w * 0.4, az = cz + (rnd() - 0.5) * d * 0.4; put('dark', DARK, box(0.16, ah, 0.16, ax, top + ah / 2, az)); put('beacon', null, box(0.35, 0.35, 0.35, ax, top + ah, az)); }
    if (rnd() < 0.6) put('dark', DARK, box(1.6 + rnd() * 2, 1 + rnd(), 1.6 + rnd() * 2, cx + (rnd() - 0.5) * w * 0.5, top + 0.6, cz + (rnd() - 0.5) * d * 0.5));
    // lati che danno sulla strada, cella per cella: piano terra e possibili insegne
    const cx0 = C.cellOf(x0 + 1), cz0 = C.cellOf(z0 + 1), cx1 = C.cellOf(x1 - 1), cz1 = C.cellOf(z1 - 1);
    const run = (fixed, a0, a1, nx, nz) => { // tratti continui di parete affacciata su celle libere
      let s0 = -1;
      for (let a = a0; a <= a1 + 1; a++) {
        const open = a <= a1 && passable(nx ? fixed + nx : a, nz ? fixed + nz : a);
        if (open && s0 < 0) s0 = a;
        if (!open && s0 >= 0) {
          const p0 = s0 * CELL - HALF, p1 = a * CELL - HALF, len = p1 - p0, o = 0.05, u0 = Math.floor(rnd() * 4) / 4, k = (signSlots.length + style) % 4;
          let ax, az, bx, bz;
          if (nx) { const X = nx > 0 ? x1 : x0; if (nx > 0) { ax = X; az = p0; bx = X; bz = p1; } else { ax = X; az = p1; bx = X; bz = p0; } }
          else { const Z = nz > 0 ? z1 : z0; if (nz > 0) { ax = p1; az = Z; bx = p0; bz = Z; } else { ax = p0; az = Z; bx = p1; bz = Z; } }
          put('shop' + k, SHOP[k], wallQuad(ax + nx * o, az + nz * o, bx + nx * o, bz + nz * o, 0, 3.4, u0 + len / 16, u0));
          if (len >= 8) signSlots.push({ x: (ax + bx) / 2, z: (az + bz) / 2, nx, nz, len, h });
          s0 = -1;
        }
      }
    };
    run(cx1, cz0, cz1, 1, 0); run(cx0, cz0, cz1, -1, 0); run(cz1, cx0, cx1, 0, 1); run(cz0, cx0, cx1, 0, -1);
  }
  // Scomposizione dei palazzi in lotti rettangolari
  const used = new Uint8Array(N * N);
  for (let z = 21; z <= 22; z++) for (let x = 21; x <= 22; x++) used[x + z * N] = 1;
  const SIZES = [[4, 4], [4, 2], [2, 4], [2, 2], [2, 2], [4, 2], [2, 4], [2, 1], [1, 2], [1, 1]];
  for (let cz = 0; cz < N; cz++) for (let cx = 0; cx < N; cx++) {
    if (MAP[cz][cx] !== '#' || used[cx + cz * N]) continue;
    const start = Math.floor(rnd() * 6);
    for (let k = 0; k < SIZES.length; k++) {
      const [w, d] = SIZES[k < 6 ? (k + start) % 6 : k]; let ok = true;
      for (let j = 0; j < d && ok; j++) for (let i = 0; i < w; i++) if (tile(cx + i, cz + j) !== '#' || cx + i >= N || cz + j >= N || used[cx + i + (cz + j) * N]) { ok = false; break; }
      if (!ok) continue;
      for (let j = 0; j < d; j++) for (let i = 0; i < w; i++) used[cx + i + (cz + j) * N] = 1;
      const x0 = cx * CELL - HALF, z0 = cz * CELL - HALF, mx = x0 + w * 2, mz = z0 + d * 2, central = Math.hypot(mx, mz) < 40, near = city.arenas.some((a) => Math.hypot(mx - a.x, mz - a.z) < 34);
      lot(x0, z0, x0 + w * CELL, z0 + d * CELL, near ? 3 : Math.floor(rnd() * 4), near ? 16 : central ? 16 : 9, near ? 26 : central ? 34 : 26);
      break;
    }
  }
  // Torre in piazza
  put('fac4', FAC[4], facadeBox(8, 46, 8, 0, 23, 0)); put('fac4', FAC[4], facadeBox(5, 14, 5, 0, 53, 0));
  { const g = new THREE.ConeGeometry(2.2, 16, 4); g.rotateY(Math.PI / 4); g.translate(0, 68, 0); put('dark', DARK, g); }
  put('dark', DARK, box(9, 0.6, 9, 0, 46.2, 0)); put('dark', DARK, box(9.4, 0.5, 9.4, 0, 4.1, 0)); put('beacon', null, box(0.7, 0.7, 0.7, 0, 76.3, 0));
  // Cintura esterna e sagome lontane
  const canalAt = (v, horiz) => city.canals.some((c) => c.horiz === horiz && Math.abs(v - (6 * c.k * CELL - HALF + 4)) < 10);
  for (let i = -6; i <= 6; i++) for (const side of [0, 1, 2, 3]) {
    const a = i * 16 + (rnd() - 0.5) * 3, off = HALF + 9 + rnd() * 6, w = 13 + rnd() * 5, h = 26 + rnd() * 34, st = Math.floor(rnd() * 4);
    const x = side === 0 ? -off : side === 1 ? off : a, z = side === 2 ? -off : side === 3 ? off : a;
    if (liqSolid && (side < 2 ? canalAt(z, true) : canalAt(x, false))) continue;
    put('fac' + st, FAC[st], facadeBox(side < 2 ? 16 : w, h, side < 2 ? w : 16, x, h / 2, z));
  }
  for (let i = 0; i < 80; i++) { const a = rnd() * Math.PI * 2, r = 140 + rnd() * 130, w = 14 + rnd() * 26, h = 40 + rnd() * 120 * (r / 270); put('far', FARMAT, facadeBox(w, h, w, Math.cos(a) * r, h / 2 - 4, Math.sin(a) * r)); }

  // ---------- Arche nei campi ----------
  for (const t of city.props) {
    put('stone', STONE, box(t.hx * 2, 0.9, t.hz * 2, t.x, 0.45, t.z));
    put('stone', STONE, box(t.hx * 2 + 0.2, 0.22, t.hz * 2 + 0.2, t.x + (t.hx > 1 ? 0.5 : 0), 1.05, t.z + (t.hx > 1 ? 0 : 0.5)));
    put('neonOr', null, box(t.hx * 2 - 0.3, 0.1, t.hz * 2 - 0.3, t.x, 0.92, t.z));
    glows.push({ x: t.x, z: t.z, c: P.liqHex, sx: 5, sz: 5 });
  }
  // ---------- Arene: sigillo a terra e pilastri ----------
  G.arenaSeals = [];
  for (const A of city.arenas) {
    const el = Bricks.ELEM[Bricks.BOSSES[A.boss].el], c = canvas(512, 512), g = c.getContext('2d');
    g.strokeStyle = el.css; g.shadowColor = el.css; g.shadowBlur = 14; g.lineWidth = 7;
    for (const r of [246, 226, 120]) { g.beginPath(); g.arc(256, 256, r, 0, 7); g.stroke(); }
    g.lineWidth = 3; for (let k = 0; k < 12; k++) { const a = (k / 12) * 6.283; g.beginPath(); g.moveTo(256 + Math.cos(a) * 120, 256 + Math.sin(a) * 120); g.lineTo(256 + Math.cos(a + 0.26) * 226, 256 + Math.sin(a + 0.26) * 226); g.stroke(); }
    g.lineWidth = 5; g.beginPath(); for (let k = 0; k <= 5; k++) { const a = ((k * 2) / 5) * 6.283 - 1.57; g[k ? 'lineTo' : 'moveTo'](256 + Math.cos(a) * 118, 256 + Math.sin(a) * 118); } g.stroke();
    const m = new THREE.Mesh(new THREE.PlaneGeometry(36, 36).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: toTex(c, false), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.75 }));
    m.position.set(A.x, 0.03, A.z); scene.add(m); G.arenaSeals.push(m);
    for (let k = 0; k < 8; k++) { const a = (k / 8) * 6.283 + 0.39, px = A.x + Math.sin(a) * 19, pz = A.z + Math.cos(a) * 19; if (Math.abs(px - A.x) > 19.5 || Math.abs(pz - A.z) > 19.5) continue; put('stone', STONE, box(1.3, 7, 1.3, px, 3.5, pz)); put('arena' + A.id, new THREE.MeshBasicMaterial({ color: el.c }), box(0.7, 0.7, 0.7, px, 7.5, pz)); glows.push({ x: px, z: pz, c: el.c, sx: 6, sz: 6 }); }
  }

  // ---------- Tralicci e cavi ----------
  const H = C.NODE_H;
  for (const n of city.nodes) {
    for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { put('dark', DARK, beam(n.x + sx * 3.7, 0, n.z + sz * 3.7, n.x + sx * 0.7, H - 0.9, n.z + sz * 0.7, 0.22)); put('dark', DARK, beam(n.x + sx * 3.7, 0, n.z + sz * 3.7, n.x + sx * 3.7, 2.2, n.z + sz * 3.7, 0.5)); }
    for (const yy of [4, 7.5]) { const k = 3.7 - (3.0 * yy) / (H - 0.9); put('dark', DARK, box(k * 2, 0.12, 0.12, n.x, yy, n.z + k)); put('dark', DARK, box(k * 2, 0.12, 0.12, n.x, yy, n.z - k)); put('dark', DARK, box(0.12, 0.12, k * 2, n.x + k, yy, n.z)); put('dark', DARK, box(0.12, 0.12, k * 2, n.x - k, yy, n.z)); }
    put('dark', DARK, box(2.0, 0.3, 2.0, n.x, H - 0.75, n.z)); put('neonCy', null, box(0.5, 0.5, 0.5, n.x, H - 0.25, n.z));
  }
  class CableCurve extends THREE.Curve {
    constructor(a, b, drop) { super(); this.a = a; this.b = b; this.drop = drop; }
    getPoint(t, target) { const A = city.nodes[this.a], B = city.nodes[this.b], d = (C.SAG + this.drop) * 4 * t * (1 - t); return (target || new THREE.Vector3()).set(A.x + (B.x - A.x) * t, H - d, A.z + (B.z - A.z) * t); }
  }
  const cableMat = (G.cableMat = new THREE.ShaderMaterial({ uniforms: { time: { value: 0 }, boost: { value: 0 }, col: { value: new THREE.Color(0x4deaff) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `uniform float time; uniform float boost; uniform vec3 col; varying vec2 vUv;
      void main(){ float p = fract(vUv.x*.07 - time*.8); float pulse = smoothstep(.9,1.,p) + smoothstep(.1,0.,p)*.35;
        vec3 c = col*.1 + col*.45*boost + col*pulse*(1.3+boost*2.5); gl_FragColor = vec4(c,1.); }` }));
  for (const [a, b] of city.edges) {
    const A = city.nodes[a], B = city.nodes[b], len = Math.hypot(B.x - A.x, B.z - A.z);
    const g = new THREE.TubeGeometry(new CableCurve(a, b, 0), Math.round(len / 1.6), 0.09, 5, false), uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * len);
    put('cable', cableMat, g); put('dark', DARK, new THREE.TubeGeometry(new CableCurve(a, b, 1.1), Math.round(len / 2.4), 0.05, 4, false));
  }

  // ---------- Insegne: poche texture condivise, tante targhe ----------
  function signTex(text, col, vertical) {
    const W = vertical ? 128 : 512, Hh = vertical ? 512 : 128, c = canvas(W, Hh), g = c.getContext('2d');
    g.fillStyle = 'rgba(6,5,8,.92)'; g.fillRect(0, 0, W, Hh);
    g.strokeStyle = col; g.lineWidth = 5; g.shadowColor = col; g.shadowBlur = 18; g.strokeRect(9, 9, W - 18, Hh - 18);
    g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle';
    if (vertical) { g.font = '900 78px Georgia, serif'; const n = text.length, st = (Hh - 60) / n; for (let i = 0; i < n; i++) g.fillText(text[i], W / 2, 30 + st * (i + 0.5)); }
    else { let fs = 74; g.font = `900 ${fs}px Georgia, serif`; while (g.measureText(text).width > W - 50 && fs > 20) { fs -= 4; g.font = `900 ${fs}px Georgia, serif`; } g.fillText(text, W / 2, Hh / 2 + 4); g.fillText(text, W / 2, Hh / 2 + 4); }
    return new THREE.MeshBasicMaterial({ map: toTex(c, false), transparent: true });
  }
  const NM = city.theme.nome.toUpperCase();
  const WALL = [[NM, 'rd'], ['LETE · BAR', 'cy'], ['CARONTE TAXI', 'am'], ['MINOSSE · GIUDIZI RAPIDI', 'mg'], ['MALEBOLGE MARKET', 'gr'], ['LASCIATE OGNE SPERANZA', 'rd'], ['STIGE SPA', 'cy'], ['FLEGETONTE GRILL', 'am'], ['LIMBO HOTEL', 'wh'], ['COCITO GELATI', 'cy'], ['CERBERO SECURITY', 'rd'], ['ANTENORA NEWS', 'mg'], ['PECCATI 24H', 'gr'], ['GERIONE VOLI', 'am'], ['BOLGIA V', 'mg'], ['ERESIA RECORDS', 'cy']].map(([t, k]) => ({ mat: signTex(t, NEON[k]), hex: hexOf(NEON[k]) }));
  const BLADE = [['BAR', 'mg'], ['LETE', 'cy'], ['24H', 'gr'], ['TAXI', 'am'], ['SPA', 'cy'], ['HOTEL', 'wh'], [NM.slice(0, 6), 'rd'], ['XXX', 'mg']].map(([t, k]) => ({ mat: signTex(t, NEON[k], true), hex: hexOf(NEON[k]) }));
  const plane = (w, h, x, y, z, ry) => { const g = new THREE.PlaneGeometry(w, h); g.rotateY(ry); g.translate(x, y, z); return g; };
  let wi = 0, bi2 = 0;
  for (const s of signSlots) {
    const r = rnd();
    if (r < 0.4) { const S = WALL[wi % WALL.length], w = Math.min(s.len - 1, 7.5), hh = w / 4, y = 4.4 + rnd() * 2.2; put('wsign' + (wi % WALL.length), S.mat, plane(w, hh, s.x + s.nx * 0.14, y, s.z + s.nz * 0.14, Math.atan2(s.nx, s.nz))); wi++; glows.push({ x: s.x + s.nx * 2.2, z: s.z + s.nz * 2.2, c: S.hex, sx: s.nx ? 5 : 8, sz: s.nx ? 8 : 5 }); }
    else if (r < 0.58) {
      const S = BLADE[bi2 % BLADE.length], hh = 4.6, w = 1.15, y = 5 + rnd() * 2, off = (rnd() - 0.5) * (s.len - 2), px = s.x + s.nx * 0.75 + (s.nx ? 0 : off), pz = s.z + s.nz * 0.75 + (s.nz ? 0 : off);
      for (const k of [1, -1]) put('bsign' + (bi2 % BLADE.length), S.mat, plane(w, hh, px, y, pz, Math.atan2(s.nx, s.nz) + (k * Math.PI) / 2));
      bi2++; put('dark', DARK, beam(px - s.nx * 0.75, y + 1.8, pz - s.nz * 0.75, px, y + 1.8, pz, 0.08)); glows.push({ x: px + s.nx * 1.2, z: pz + s.nz * 1.2, c: S.hex, sx: 4, sz: 4 });
    }
  }

  // ---------- Schermi ----------
  const sc = (G.screenCanvas = canvas(256, 384)), scTex = (G.screenTex = toTex(sc, false)), scMat = new THREE.MeshBasicMaterial({ map: scTex });
  function screen(x, y, z, ry, w, h) {
    put('screen', scMat, plane(w, h, x, y, z, ry));
    put('dark', DARK, (() => { const g = new THREE.BoxGeometry(w + 0.5, h + 0.5, 0.25); g.rotateY(ry); g.translate(x - Math.sin(ry) * 0.16, y, z - Math.cos(ry) * 0.16); return g; })());
    glows.push({ x: x + Math.sin(ry) * 3.5, z: z + Math.cos(ry) * 3.5, c: P.tower, sx: Math.abs(Math.sin(ry)) > 0.5 ? 6 : w + 2, sz: Math.abs(Math.sin(ry)) > 0.5 ? w + 2 : 6 });
  }
  screen(0, 10, 4.2, 0, 6, 9); screen(0, 10, -4.2, Math.PI, 6, 9); screen(4.2, 10, 0, Math.PI / 2, 6, 9); screen(-4.2, 10, 0, -Math.PI / 2, 6, 9);
  for (const S of city.screens) if (!S.big) screen(S.wx + S.nx * 0.2, 8.5, S.wz + S.nz * 0.2, Math.atan2(S.nx, S.nz), 3.6, 5.4);

  // ---------- Fusione ----------
  const basic = (hex) => new THREE.MeshBasicMaterial({ color: hex });
  const special = { neonAm: basic(hexOf(NEON.am)), neonCy: basic(0x55f0ff), neonOr: basic(P.liqHex), beacon: (G.beaconMat = basic(0xff2a18)) };
  for (const [key, b] of bags) {
    const geo = THREE.BufferGeometryUtils.mergeBufferGeometries(b.list.map((g) => (g.index ? g.toNonIndexed() : g)), false);
    const mesh = new THREE.Mesh(geo, b.mat || special[key]); mesh.matrixAutoUpdate = false;
    if (key === 'far') mesh.frustumCulled = false;
    scene.add(mesh);
    for (const g of b.list) g.dispose();
  }

  // ---------- Aloni di luce sul suolo ----------
  const glowTex = (G.glowTex = (() => { const c = canvas(64, 64), g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,.85)'); gr.addColorStop(0.5, 'rgba(255,255,255,.25)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return toTex(c, false); })());
  const gm = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.42 }), glows.length + 4);
  const D = new THREE.Object3D(), col = new THREE.Color(); let gi = 0;
  for (const g of glows) { D.position.set(g.x, 0.04, g.z); D.scale.set(g.sx, 1, g.sz); D.updateMatrix(); gm.setMatrixAt(gi, D.matrix); gm.setColorAt(gi, col.setHex(g.c)); gi++; }
  gm.count = gi; gm.instanceMatrix.needsUpdate = true; if (gm.instanceColor) gm.instanceColor.needsUpdate = true; gm.frustumCulled = false; scene.add(gm);

  // ---------- Cielo, particelle, luci ----------
  const sky = (G.sky = new THREE.Mesh(new THREE.SphereGeometry(420, 24, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { time: { value: 0 }, flash: { value: 0 }, fc: { value: new THREE.Vector3(0.45, 0.7, 1) }, c0: { value: new THREE.Vector3(...P.sky[0]) }, c1: { value: new THREE.Vector3(...P.sky[1]) }, c2: { value: new THREE.Vector3(...P.sky[2]) }, cg: { value: new THREE.Vector3(...P.skyGlow) } },
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `uniform float time; uniform float flash; uniform vec3 fc; uniform vec3 c0; uniform vec3 c1; uniform vec3 c2; uniform vec3 cg; varying vec3 vD;
      float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float n(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y); }
      float fbm(vec2 p){ float a=.5,s=0.; for(int i=0;i<5;i++){ s+=a*n(p); p=p*2.02+3.7; a*=.5; } return s; }
      void main(){ float y = vD.y;
        vec3 c = mix(c0, c1, smoothstep(-.02,.22,y)); c = mix(c, c2, smoothstep(.15,.9,y));
        vec2 uv = vD.xz/(abs(y)+.22); float s = fbm(uv*1.3+vec2(time*.012,time*.004));
        c *= .5 + 1.1*s; c += cg*pow(max(0.,1.-abs(y)*4.),3.)*.4; c += fc*flash*(.3+s);
        gl_FragColor = vec4(c,1.); }` })));
  sky.frustumCulled = false; sky.renderOrder = -10; scene.add(sky);
  const EN = 380, ep = new Float32Array(EN * 3), es = new Float32Array(EN);
  for (let i = 0; i < EN; i++) { ep[i * 3] = rnd() * 70; ep[i * 3 + 1] = rnd() * 30; ep[i * 3 + 2] = rnd() * 70; es[i] = rnd(); }
  const eg = new THREE.BufferGeometry(); eg.setAttribute('position', new THREE.BufferAttribute(ep, 3)); eg.setAttribute('seed', new THREE.BufferAttribute(es, 1));
  G.emberMat = new THREE.ShaderMaterial({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, uniforms: { time: { value: 0 }, cam: { value: new THREE.Vector3() }, px: { value: 1 }, col: { value: new THREE.Vector3(...P.ember) }, dir: { value: P.emberDir } },
    vertexShader: `uniform float time; uniform vec3 cam; uniform float px; uniform float dir; attribute float seed; varying float vA; varying float vN;
      void main(){ vec3 b = vec3(70.,30.,70.); vec3 p = position + vec3(sin(time*.4+seed*40.)*1.5 + time*.6, 0., cos(time*.3+seed*30.)*1.5);
        p = mod(p - cam + b*.5, b) - b*.5 + cam; p.y = mod(position.y + dir*time*(1.2+seed*1.8), 30.) - 1.;
        vec4 mv = modelViewMatrix*vec4(p,1.); gl_Position = projectionMatrix*mv;
        float dz = -mv.z; gl_PointSize = px*(1.6+seed*3.2)*(16./max(7.,dz)); vN = smoothstep(1.5,5.,dz); vA = .35+.65*abs(sin(time*(2.+seed*5.)+seed*60.)); }`,
    fragmentShader: 'uniform vec3 col; varying float vA; varying float vN; void main(){ vec2 d = gl_PointCoord-.5; float r = dot(d,d); if(r>.25) discard; gl_FragColor = vec4(col*vA*vN*(1.-r*4.), 1.); }' });
  const embers = new THREE.Points(eg, G.emberMat); embers.frustumCulled = false; scene.add(embers);

  scene.add(new THREE.AmbientLight(P.amb, 1.5));
  scene.add(new THREE.HemisphereLight(P.hemi[0], P.hemi[1], 1.25));
  const dl = new THREE.DirectionalLight(P.sun, 0.8); dl.position.set(-30, 60, -20); scene.add(dl);
  const cn = city.canals[0], cv = 6 * cn.k * CELL - HALF + 4;
  for (const a of [-50, 0, 50]) { const l = new THREE.PointLight(P.liqHex, 1.1, 50, 1.6); l.position.set(cn.horiz ? a : cv, 1.2, cn.horiz ? cv : a); scene.add(l); }
  const tl = new THREE.PointLight(P.tower, 1.2, 40, 1.5); tl.position.set(0, 12, 0); scene.add(tl); G.towerLight = tl;
};
