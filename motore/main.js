// MOTORE - lato schermo: resa, comandi, interfaccia, suoni, ciclo principale.
G.start = function () {
  const C = Core, B = Bricks, EL = B.ELEM, $ = (id) => document.getElementById(id);
  if (!G.storage) G.initStorage();
  const fail = (msg) => {
    $('homeMsg').textContent = msg; $('play').disabled = true;
    if ($('appError')) { $('errorTitle').textContent = 'La grafica non si avvia'; $('errorDetail').textContent = msg; $('appError').classList.remove('hidden'); if ($('errorRetry')) $('errorRetry').onclick = () => window.location.reload(); }
    try { if (G.native) G.native.send({ v: 1, type: 'state', screen: 'error', playing: false }); } catch (error) { /* il messaggio web resta visibile */ }
  };
  const canvas = $('c');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' }); }
  catch (e) { return fail('Questo dispositivo non supporta la grafica 3D nel browser (WebGL).'); }
  const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  let pxr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
  renderer.setPixelRatio(pxr); renderer.autoClear = false; renderer.info.autoReset = false;
  G.aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const bel = (el) => (el && el.indexOf('+') > 0 ? el.slice(0, el.indexOf('+')) : el);
  const ec = (el) => { el = bel(el); return EL[el] ? EL[el].c : 0xff6a20; }, ec2 = (el) => { el = bel(el); return EL[el] ? EL[el].c2 : 0xffd0a0; }, css = (el) => { el = bel(el); return EL[el] ? EL[el].css : '#fff'; };

  const st = G.store, app = G.AppState.create();
  if (G.storage.isNew && G.Onboarding) { st.recipe = G.Onboarding.introRecipe(); st.onboarding = { version: 1, step: 0, skipped: false }; }
  if (!B.valid(st.recipe)) st.recipe = JSON.parse(JSON.stringify(B.PRESETS[0]));
  if (!City.THEMES[st.theme]) st.theme = 'dite';
  st.seed = st.seed || 1; st.fame = st.fame || 0;
  let s = null, running = false, sceneEpoch = 0, graphicsReady = false;
  const sceneTimers = [], notices = [];
  let noticeLeft = 0, noticePriority = 0, dirty = true, raf = 0, renderFrames = 0, lastRender = 0, visualTime = 0;
  const guide = G.Onboarding && G.Onboarding.create({ saved: st.onboarding, onChange(value) { st.onboarding = value; G.save(); renderCoach(); }, onDone() { toast('Guida completata. La città è tua.'); } });
  const journal = G.Journal && G.Journal.create({ saved: st.journal, onChange(value) { st.journal = value; G.save(); } });
  const cam = (G.camera = new THREE.PerspectiveCamera(72, 1, 0.08, 560)); cam.rotation.order = 'YXZ';
  G.buildHands(); G.initForge();

  // ---------- Bagliore e ritocco finale ----------
  const composer = new THREE.EffectComposer(renderer), renderPass = new THREE.RenderPass(new THREE.Scene(), cam);
  composer.addPass(renderPass);
  const handPass = new THREE.RenderPass(G.handScene, G.handCam); handPass.clear = false; handPass.clearDepth = true; composer.addPass(handPass);
  const bloom = new THREE.UnrealBloomPass(new THREE.Vector2(256, 256), 0.32, 0.6, 0.88); composer.addPass(bloom);
  const fin = new THREE.ShaderPass({
    uniforms: { tDiffuse: { value: null }, chroma: { value: 0.006 }, tint: { value: new THREE.Vector3(1, 1, 1) }, tintAmt: { value: 0 }, vig: { value: 1 }, desat: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `uniform sampler2D tDiffuse; uniform float chroma; uniform vec3 tint; uniform float tintAmt; uniform float vig; uniform float desat; varying vec2 vUv;
      void main(){ vec2 d = vUv-.5; float r2 = dot(d,d); vec2 o = d*chroma*(.4+r2*4.);
        vec3 c = vec3(texture2D(tDiffuse,vUv+o).r, texture2D(tDiffuse,vUv).g, texture2D(tDiffuse,vUv-o).b);
        c = mix(c, c*tint*1.7 + tint*.06, tintAmt);
        float l = dot(c, vec3(.3,.59,.11)); c = mix(c, vec3(l)*vec3(.82,.92,1.12), desat);
        c *= 1. - vig*r2*1.1; c = clamp(c,0.,1.); c = mix(c, c*c*(3.-2.*c), .35);
        gl_FragColor = vec4(c,1.); }`,
  });
  composer.addPass(fin);
  let useBloom = true;

  // ---------- Suoni sintetici ----------
  let ac = null, muted = !!st.muted, master = null, rideGain = null, audioWanted = false; const lastS = {};
  function audioTransition(context, want) {
    if (!context || context.state === 'closed') return;
    try {
      const result = want ? context.resume() : context.suspend();
      if (result && result.then) result.then(() => {
        if (context !== ac) { if (context.state !== 'closed') return context.suspend(); return; }
        const desired = audioWanted && active();
        // Una promessa vecchia puo terminare dopo una pausa o un nuovo gesto di ripresa.
        if ((desired && context.state === 'suspended') || (!desired && context.state === 'running')) audioTransition(context, desired);
      }).catch(() => {});
    } catch (error) { /* l'audio non impedisce la navigazione */ }
  }
  function initAudio() {
    try {
      if (!ac) {
        ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = muted ? 0 : st.volume; master.connect(ac.destination);
        const o1 = ac.createOscillator(), o2 = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain();
        o1.type = 'sawtooth'; o2.type = 'sawtooth'; o1.frequency.value = 43; o2.frequency.value = 43.7; f.type = 'lowpass'; f.frequency.value = 170; g.gain.value = 0.11;
        o1.connect(f); o2.connect(f); f.connect(g); g.connect(master); o1.start(); o2.start();
        const n = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = n.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        const src = ac.createBufferSource(), bf = ac.createBiquadFilter(); rideGain = ac.createGain(); src.buffer = n; src.loop = true; bf.type = 'bandpass'; bf.frequency.value = 1800; bf.Q.value = 0.8; rideGain.gain.value = 0;
        src.connect(bf); bf.connect(rideGain); rideGain.connect(master); src.start(); G.noiseBuf = n;
      }
      audioWanted = active(); if (audioWanted) audioTransition(ac, true);
    } catch (e) { ac = null; }
  }
  function tone(name, type, f0, f1, dur, vol, gap) {
    if (!ac || muted || !active()) return; const now = performance.now(); if (gap && lastS[name] && now - lastS[name] < gap) return; lastS[name] = now;
    try { const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02); } catch (e) { /* audio non disponibile */ }
  }
  function boom(dur, vol, freq, hp, gap) {
    if (!ac || muted || !active() || !G.noiseBuf) return; if (gap) { const now = performance.now(); if (lastS['b' + freq] && now - lastS['b' + freq] < gap) return; lastS['b' + freq] = now; }
    try { const t = ac.currentTime, src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); src.buffer = G.noiseBuf; f.type = hp ? 'highpass' : 'lowpass'; f.frequency.setValueAtTime(freq, t); if (!hp) f.frequency.exponentialRampToValueAtTime(Math.max(60, freq * 0.2), t + dur); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); src.connect(f); f.connect(g); g.connect(master); src.start(t, Math.random()); src.stop(t + dur + 0.05); } catch (e) { /* audio non disponibile */ }
  }
  // Ogni elemento ha la sua voce: k = grandezza (0..1), v = volume
  function elSound(el, k, v) {
    const i = el ? el.indexOf('+') : -1, e = i > 0 ? el.slice(0, i) : el, now = performance.now(); if (lastS['el' + e] && now - lastS['el' + e] < 55) return; lastS['el' + e] = now; k = Math.max(0, Math.min(1, k));
    if (e === 'fuoco') { boom(0.25 + k * 0.5, v, 700 + k * 500); tone('ef', 'sawtooth', 110, 45, 0.25 + k * 0.3, v * 0.35); }
    else if (e === 'gelo') { tone('eg', 'triangle', 2400 - k * 600, 900, 0.1, v * 0.3); tone('eg2', 'sine', 3300, 1500, 0.16, v * 0.18); boom(0.09 + k * 0.1, v * 0.6, 4200, true); }
    else if (e === 'folgore') { boom(0.06, v * 0.8, 5200, true); tone('el', 'sawtooth', 1500, 110, 0.1 + k * 0.1, v * 0.3); if (k > 0.4) boom(0.5, v * 0.7, 420); }
    else if (e === 'veleno') { tone('ev', 'sine', 150, 420, 0.16, v * 0.4); tone('ev2', 'sine', 240, 620, 0.22, v * 0.25); boom(0.3 + k * 0.3, v * 0.35, 520); }
    else if (e === 'ombra') { tone('eo', 'sine', 70, 190, 0.3 + k * 0.3, v * 0.6); tone('eo2', 'triangle', 320, 60, 0.4, v * 0.2); }
    else if (e === 'luce') { tone('eu', 'sine', 880, 880, 0.3, v * 0.25); tone('eu2', 'sine', 1320, 1320, 0.4, v * 0.2); tone('eu3', 'sine', 1760, 1760, 0.5, v * 0.12); boom(0.12, v * 0.3, 3000, true); }
    else if (e === 'sangue') { boom(0.1, v * 0.8, 1700); tone('es', 'square', 140, 55, 0.14, v * 0.35); boom(0.2, v * 0.3, 380); }
    else { boom(0.3 + k * 0.4, v * 0.7, 2400, true); tone('ew', 'sine', 500, 1300, 0.25, v * 0.12); }
  }
  const chime = (a, b) => { tone('ch' + a, 'sine', a, a, 0.18, 0.1); sceneDelay(() => tone('ch' + b, 'sine', b, b, 0.3, 0.1), 110); };

  // ---------- Stato e comandi ----------
  const STEP = 1 / 60;
  let acc = 0, last = 0, hitStop = 0, shake = 0, yaw = Math.PI, pitch = 0, fov = 72, bobT = 0, rideK = 0, flashSky = 0, ocK = 0, veilK = 0, timeK = 0, kick = 0, hitMark = 0, furyK = 0, hasteK = 0;
  const keys = new Set(), buf = [0, 0, 0, 0, 0]; let useBuf = 0;
  const joy = { id: null, ox: 0, oy: 0, x: 0, y: 0 }, look = { id: null, x: 0, y: 0 };
  let W = 0, Hh = 0, locked = false, fireBtn = false, fireMouse = false; const zp = { id: null, x: 0, y: 0 };
  const fresh = [false, false, false, false, false]; let useFresh = false;
  const press = (i) => { if (active() && Number.isInteger(i) && i >= 1 && i < 5) { buf[i] = performance.now(); fresh[i] = true; } }, pressUse = () => { if (active()) { useBuf = performance.now(); useFresh = true; } };
  const KEYMAP = { Space: 1, ShiftLeft: 1, KeyQ: 2, KeyE: 3, KeyR: 4 };
  const active = () => app.snapshot().playing;
  const typing = (target) => !!(target && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable));
  window.addEventListener('keydown', (e) => {
    if (typing(e.target) || e.repeat) return;
    if (e.code === 'Escape' || e.code === 'KeyP') { if (active()) openMenu(); else if (app.snapshot().screen === 'pause' && !app.snapshot().blockers.length) begin(); else if (!['lobby', 'boot', 'loading', 'error'].includes(app.snapshot().screen)) navigate('back'); e.preventDefault(); return; }
    if (!active()) return; keys.add(e.code);
    if (KEYMAP[e.code]) press(KEYMAP[e.code]); if (e.code === 'KeyF') pressUse();
    if (KEYMAP[e.code] || e.code.startsWith('Arrow') || e.code === 'KeyF') e.preventDefault();
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code));
  const joyEl = $('joy'), knob = $('knob');
  const turn = (dx, dy, k) => { yaw -= dx * k * st.sens; pitch = Math.max(-1.25, Math.min(1.25, pitch - dy * k * st.sens * (st.invertY ? -1 : 1))); };
  canvas.addEventListener('pointerdown', (e) => {
    if (!active()) return;
    if (e.pointerType === 'mouse') { if (e.button === 0) fireMouse = true; if (!locked && canvas.requestPointerLock) { try { const r = canvas.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (err) { /* resta il trascinamento */ } } }
    const wantJoy = e.pointerType !== 'mouse' && (st.leftHanded ? e.clientX > W * 0.58 : e.clientX < W * 0.42) && joy.id === null;
    if (wantJoy) { joy.id = e.pointerId; joy.ox = e.clientX; joy.oy = e.clientY; joy.x = joy.y = 0; joyEl.style.left = e.clientX + 'px'; joyEl.style.top = e.clientY + 'px'; joyEl.style.display = 'block'; knob.style.transform = 'translate(-50%,-50%)'; }
    else if (look.id === null) { look.id = e.pointerId; look.x = e.clientX; look.y = e.clientY; } else return;
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignora */ }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!active()) return;
    if (e.pointerId === look.id && !locked) { turn(e.clientX - look.x, e.clientY - look.y, e.pointerType === 'mouse' ? 0.004 : 0.0062); look.x = e.clientX; look.y = e.clientY; return; }
    if (e.pointerId !== joy.id) return;
    let dx = e.clientX - joy.ox, dy = e.clientY - joy.oy; const d = Math.hypot(dx, dy), R = 46; if (d > R) { dx = (dx / d) * R; dy = (dy / d) * R; }
    joy.x = dx / R; joy.y = dy / R; knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  });
  const ptrEnd = (e) => { if (e.pointerType === 'mouse') fireMouse = false; if (e.pointerId === look.id) look.id = null; if (e.pointerId === joy.id) { joy.id = null; joy.x = joy.y = 0; joyEl.style.display = 'none'; } };
  canvas.addEventListener('pointerup', ptrEnd); canvas.addEventListener('pointercancel', ptrEnd); canvas.addEventListener('lostpointercapture', ptrEnd);
  document.addEventListener('pointerlockchange', () => { locked = document.pointerLockElement === canvas; if (locked && !active() && document.exitPointerLock) document.exitPointerLock(); });
  document.addEventListener('mousemove', (e) => { if (locked && active()) turn(e.movementX, e.movementY, 0.0024); });
  document.addEventListener('mousedown', (e) => { if (active() && locked && e.button === 0) fireMouse = true; });
  document.addEventListener('mouseup', (e) => { if (e.button === 0) fireMouse = false; });
  // Il tasto grande si tiene premuto e, trascinando lo stesso dito, si continua a mirare.
  const BT = [0, 1, 2, 3, 4].map((i) => $('b' + i)), b0 = BT[0];
  b0.addEventListener('pointerdown', (e) => { e.preventDefault(); if (!active() || zp.id !== null) return; fireBtn = true; zp.id = e.pointerId; zp.x = e.clientX; zp.y = e.clientY; try { b0.setPointerCapture(e.pointerId); } catch (err) { /* ignora */ } });
  b0.addEventListener('pointermove', (e) => { if (!active() || e.pointerId !== zp.id) return; turn(e.clientX - zp.x, e.clientY - zp.y, 0.0062); zp.x = e.clientX; zp.y = e.clientY; });
  const zapEnd = (e) => { if (e.pointerId === zp.id) { zp.id = null; fireBtn = false; } };
  b0.addEventListener('pointerup', zapEnd); b0.addEventListener('pointercancel', zapEnd); b0.addEventListener('lostpointercapture', zapEnd);
  for (let i = 1; i < 5; i++) BT[i].addEventListener('pointerdown', (e) => { e.preventDefault(); if (active()) press(i); });
  $('useBtn').addEventListener('pointerdown', (e) => { e.preventDefault(); if (active()) pressUse(); });
  document.addEventListener('contextmenu', (e) => { if (active()) e.preventDefault(); });
  const inCard = (t) => !!(t && t.closest && t.closest('.overlay'));
  document.addEventListener('touchmove', (e) => { if (active() && !inCard(e.target)) e.preventDefault(); }, { passive: false });
  canvas.addEventListener('touchstart', (e) => { if (active()) e.preventDefault(); }, { passive: false });
  for (const ev of ['gesturestart', 'gesturechange', 'dblclick']) document.addEventListener(ev, (e) => { if (active()) e.preventDefault(); }, { passive: false });

  const inp = { mx: 0, my: 0, yaw: 0, pitch: 0, fire: false, b: [false, false, false, false, false], use: false };
  function resetInput() {
    const captures = [[canvas, joy.id], [canvas, look.id], [b0, zp.id]];
    joy.id = look.id = zp.id = null; joy.x = joy.y = 0; fireBtn = fireMouse = false; keys.clear();
    buf.fill(0); fresh.fill(false); useBuf = 0; useFresh = false; inp.mx = inp.my = 0; inp.fire = inp.use = false; inp.b.fill(false); acc = 0;
    joyEl.style.display = 'none'; knob.style.transform = 'translate(-50%,-50%)';
    for (const [element, id] of captures) if (id !== null) try { if (element.hasPointerCapture(id)) element.releasePointerCapture(id); } catch (error) { /* puntatore gia rilasciato */ }
    if (document.pointerLockElement && document.exitPointerLock) try { document.exitPointerLock(); } catch (error) { /* puntatore gia rilasciato */ }
  }
  function readInput() {
    let mx = joy.x, my = -joy.y;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) mx -= 1; if (keys.has('KeyD') || keys.has('ArrowRight')) mx += 1;
    if (keys.has('KeyW') || keys.has('ArrowUp')) my += 1; if (keys.has('KeyS') || keys.has('ArrowDown')) my -= 1;
    const now = performance.now();
    inp.mx = mx; inp.my = my; inp.yaw = yaw; inp.pitch = pitch; inp.fire = fireBtn || fireMouse || keys.has('KeyJ') || !!window.__dite.autoFire;
    for (let i = 1; i < 5; i++) inp.b[i] = fresh[i] || (buf[i] > 0 && now - buf[i] < 220);
    inp.use = useFresh || (useBuf > 0 && now - useBuf < 220);
    return inp;
  }

  // ---------- Interfaccia ----------
  const nums = [], numBox = $('nums'); for (let i = 0; i < 22; i++) { const d = document.createElement('div'); d.className = 'num'; numBox.appendChild(d); nums.push(d); }
  let ni = 0; const v3 = new THREE.Vector3();
  function project(x, y, z, out) { v3.set(x, y, z).project(cam); out.x = ((v3.x + 1) / 2) * W; out.y = ((1 - v3.y) / 2) * Hh; out.ok = v3.z < 1 && v3.z > -1; return out; }
  const scr = { x: 0, y: 0, ok: false };
  function number(x, y, z, text, big, color) { project(x, y, z, scr); if (!scr.ok) return; const d = nums[ni]; ni = (ni + 1) % nums.length; d.textContent = text; d.className = 'num'; d.style.color = color || '#fff'; d.style.left = scr.x + (Math.random() - 0.5) * 24 + 'px'; d.style.top = scr.y + 'px'; void d.offsetWidth; d.className = 'num go' + (big ? ' big' : ''); }
  function sceneDelay(fn, milliseconds) { sceneTimers.push({ fn, left: milliseconds / 1000, epoch: sceneEpoch }); }
  function banner(text, sub, cls, priority = 1) {
    if (noticeLeft > 0 && priority < noticePriority) { notices.push({ text, sub, cls, priority }); if (notices.length > 4) notices.shift(); return; }
    noticePriority = priority; noticeLeft = priority >= 3 ? 4.5 : 3.2;
    const b = $('banner'); b.innerHTML = ''; const t = document.createElement('div'); t.textContent = text; b.appendChild(t); if (sub) { const u = document.createElement('small'); u.textContent = sub; b.appendChild(u); } b.className = ''; void b.offsetWidth; b.className = 'go ' + (cls || '');
  }
  function tickScene(dt) {
    noticeLeft = Math.max(0, noticeLeft - dt);
    if (!noticeLeft && notices.length) { const n = notices.shift(); banner(n.text, n.sub, n.cls, n.priority); }
    const ready = [];
    for (let i = sceneTimers.length - 1; i >= 0; i--) { const timer = sceneTimers[i]; timer.left -= dt; if (timer.epoch !== sceneEpoch || timer.left <= 0) { sceneTimers.splice(i, 1); if (timer.epoch === sceneEpoch) ready.unshift(timer.fn); } }
    for (const fn of ready) fn();
  }
  function toast(text) { const b = $('toast'); b.textContent = text; b.className = ''; void b.offsetWidth; b.className = 'go'; }
  function pulse(id, col) { if (st.reducedFlash && id === 'flashfx') return; const e = $(id); if (col) e.style.setProperty('--el', col); e.classList.remove('go'); void e.offsetWidth; e.classList.add('go'); }
  const dmgEls = [$('dmg0'), $('dmg1'), $('dmg2')]; let di = 0;
  function dmgArrow(sx, sz) { const p = s.player, a = Math.atan2(sx - p.x, sz - p.z), rel = a - (yaw + Math.PI); const e = dmgEls[di]; di = (di + 1) % 3; e.style.transform = `translate(-50%,-50%) rotate(${-rel}rad)`; e.className = 'dmg'; void e.offsetWidth; e.className = 'dmg go'; }
  // numeri di danno: sommati per bersaglio, cosi' i colpi continui non riempiono lo schermo
  const pend = new Map();
  function addDmg(ev) { const o = pend.get(ev.id) || { d: 0, t: 0.28, x: ev.x, z: ev.z, y: 2, el: ev.el }; o.d += ev.dmg; o.x = ev.x; o.z = ev.z; if (ev.el) o.el = ev.el; G.targetPos(ev.boss ? 'b' : 'e', ev.id, ev.x, ev.z, hw); o.y = hw.y + (ev.boss ? 2 : 0.8); pend.set(ev.id, o); }
  function flushDmg(dt) { for (const [id, o] of pend) { o.t -= dt; if (o.t <= 0) { number(o.x, o.y, o.z, Math.max(1, Math.round(o.d)), o.d >= 40, css(o.el)); pend.delete(id); } } }

  // minimappa
  const mini = $('mini'), mg = mini.getContext('2d'), MS = mini.width, baseMap = document.createElement('canvas'); baseMap.width = baseMap.height = MS;
  const mm = (v) => ((v + C.HALF) / (C.HALF * 2)) * MS;
  function drawBase() {
    const g = baseMap.getContext('2d'), k = MS / C.N, liq = '#' + G.PAL[s.city.theme.id].liqHex.toString(16).padStart(6, '0');
    g.fillStyle = '#0a0709'; g.fillRect(0, 0, MS, MS);
    for (let z = 0; z < C.N; z++) for (let x = 0; x < C.N; x++) { const t = s.city.map[z][x]; g.fillStyle = t === '#' ? '#1a1418' : t === '~' ? liq : t === '=' ? '#6a5a4a' : t === 'o' ? '#3a3038' : '#2e2a33'; g.fillRect(x * k, z * k, k + 0.5, k + 0.5); }
    g.strokeStyle = 'rgba(63,233,255,.5)'; g.lineWidth = 1; g.beginPath(); for (const [a, b] of s.city.edges) { g.moveTo(mm(s.city.nodes[a].x), mm(s.city.nodes[a].z)); g.lineTo(mm(s.city.nodes[b].x), mm(s.city.nodes[b].z)); } g.stroke();
    g.fillStyle = '#c08aff'; for (const sc of s.city.screens) g.fillRect(mm(sc.x) - 1.5, mm(sc.z) - 1.5, 3, 3);
  }
  let miniT = 0;
  function drawMini(dt, t) {
    miniT -= dt; if (miniT > 0) return; miniT = 0.12;
    mg.drawImage(baseMap, 0, 0);
    s.city.arenas.forEach((A, i) => { const stt = s.arenas[i]; mg.strokeStyle = css(B.BOSSES[A.boss].el); mg.globalAlpha = stt.status === 'sealed' && stt.t <= 0 ? 1 : 0.35; mg.lineWidth = 2; mg.beginPath(); mg.arc(mm(A.x), mm(A.z), 6, 0, 7); mg.stroke(); mg.globalAlpha = 1; });
    for (const tu of s.turrets) { mg.fillStyle = tu.state === 'owned' ? '#3fe9ff' : tu.state === 'idle' ? '#77778a' : tu.state === 'reboot' ? '#ffb23a' : '#ff3018'; mg.fillRect(mm(tu.x) - 1.5, mm(tu.z) - 1.5, 3, 3); }
    for (const g of s.givers) { const on = g.offer && !s.quest; mg.fillStyle = on ? '#ffd24a' : s.quest && s.quest.giver === g.id ? '#7dffb0' : '#6a6470'; mg.beginPath(); mg.arc(mm(g.x), mm(g.z), on ? 3.2 : 2.2, 0, 7); mg.fill(); }
    for (const c of s.npcs) if (c.st === 'follow') { mg.fillStyle = '#7dffb0'; mg.fillRect(mm(c.x) - 1, mm(c.z) - 1, 2, 2); }
    for (const e of s.mobs) { if (e.spawn > 0 || e.dead || e.captive) continue; mg.fillStyle = e.team === 'a' ? (e.charm > 0 ? '#ff3fd0' : '#7dffb0') : '#ff4028'; mg.beginPath(); mg.arc(mm(e.x), mm(e.z), C.MOB[e.kind].heavy ? 2.6 : 1.6, 0, 7); mg.fill(); }
    if (s.boss) { mg.fillStyle = '#ff2a14'; mg.beginPath(); mg.arc(mm(s.boss.x), mm(s.boss.z), 4, 0, 7); mg.fill(); }
    const q = s.quest; if (q && q.obj) { const r = 3 + (Math.sin(t * 6) + 1) * 1.5; mg.strokeStyle = '#ffd24a'; mg.lineWidth = 2; mg.beginPath(); mg.arc(mm(q.obj.x), mm(q.obj.z), r, 0, 7); mg.stroke(); if (q.pts) { mg.fillStyle = 'rgba(255,210,74,.6)'; for (let i = q.i + 1; i < q.pts.length; i++) mg.fillRect(mm(q.pts[i].x) - 1.5, mm(q.pts[i].z) - 1.5, 3, 3); } }
    const p = s.player, px = mm(p.x), pz = mm(p.z), fx = -Math.sin(yaw), fz = -Math.cos(yaw);
    if (p.scan) {
      mg.strokeStyle = '#90ecff'; mg.lineWidth = 1; mg.beginPath(); mg.arc(px, pz, p.scan.r / (C.HALF * 2) * MS, 0, Math.PI * 2); mg.stroke();
      for (const id of p.scan.ids) { const e = s.boss && s.boss.id === id ? s.boss : s.mobs.find((m) => m.id === id && !m.dead); if (!e || e.captive) continue; mg.beginPath(); mg.arc(mm(e.x), mm(e.z), 3.4, 0, Math.PI * 2); mg.stroke(); }
    }
    if (p.possession) { mg.strokeStyle = '#90ecff'; mg.lineWidth = 2; mg.beginPath(); mg.arc(mm(p.cam.x), mm(p.cam.z), 4, 0, Math.PI * 2); mg.stroke(); }
    mg.fillStyle = '#fff'; mg.beginPath(); mg.moveTo(px + fx * 6, pz + fz * 6); mg.lineTo(px - fz * 3.2 - fx * 3, pz + fx * 3.2 - fz * 3); mg.lineTo(px + fz * 3.2 - fx * 3, pz - fx * 3.2 - fz * 3); mg.fill();
  }
  let shownPrimary = null, shownControl = null;
  const mimicked = { tiro: { nome: 'TIRO', ic: 'orb' }, artiglio: { nome: 'ARTIGLIO', ic: 'claw' }, pesante: { nome: 'PUGNO', ic: 'claw' }, boss: { nome: 'ONDA', ic: 'wave' } };
  function setupButtons() {
    const host = s.player.possession && s.mobs.find((e) => e.id === s.player.possession.id), borrowed = host ? mimicked[host.kind === 'tiratore' || C.MOB[host.kind].shooter ? 'tiro' : 'artiglio'] : s.player.mimic && mimicked[s.player.mimic.attack];
    s.kit.forEach((K, i) => { const b = BT[i], display = i === 0 && borrowed ? borrowed : K; K.gnd = K.kind === 'x' && /@aim|leap|blink g/.test(B.ARCH[K.id] && B.ARCH[K.id].src || ''); b.style.setProperty('--c', css(K.el)); b.querySelector('.svg').outerHTML = '<span class="svg" style="display:contents">' + G.svg(display.ic) + '</span>'; b.querySelector('.nm').textContent = display.nome; b.dataset.nm = display.nome; b.setAttribute('aria-label', display.nome); });
    shownPrimary = s.kit[0]; shownControl = s.player.possession;
    document.documentElement.style.setProperty('--el', css(s.kit[0].el)); G.hands.col = ec(s.kit[0].el);
    $('resTxt').textContent = s.kit[4].nome.toUpperCase();
  }
  // Un solo elenco dei timer reali alimenta il riepilogo HUD e il dettaglio in pausa.
  const BONUS_LABELS = [
    ['invuln', 'Invulnerabilità', 'Invulnerabile'],
    ['reflect', 'Riflessione dei colpi', 'Riflessione'],
    ['phoenix', 'Rinascita della Fenice', 'Fenice'],
    ['veil', 'Occultamento', 'Occultato'],
    ['hot', 'Cura nel tempo', 'Cura'],
    ['fury', 'Furia', 'Furia'],
    ['haste', 'Velocità aumentata', 'Velocità'],
    ['orbit', 'Orbite offensive', 'Orbite'],
  ];
  function bonusSnapshot(player) {
    if (!player) return [];
    return BONUS_LABELS.filter(([key]) => Number.isFinite(player[key]) && player[key] > (key === 'invuln' ? 0.3 : 0))
      .map(([key, name, short]) => ({ key, name, short, left: player[key] }));
  }
  function renderBonuses(player, detail = false) {
    const bonuses = bonusSnapshot(player), count = bonuses.length;
    setTxt('buffs', count ? bonuses[0].short + (count > 1 ? ' +' + (count - 1) : '') : '');
    const description = count ? 'Potenziamenti: ' + bonuses.map((bonus) => bonus.name).join(', ') : '';
    if (txtCache.bonusDescription !== description) {
      txtCache.bonusDescription = description; $('buffs').title = description;
      if (description) $('buffs').setAttribute('aria-label', description); else $('buffs').removeAttribute('aria-label');
    }
    if (!detail || !$('menuEffects') || !$('menuEffectList')) return;
    $('menuEffects').classList.toggle('hidden', !count);
    if ($('menuEffectCount')) $('menuEffectCount').textContent = String(count);
    const signature = bonuses.map((bonus) => bonus.key + ':' + Math.ceil(bonus.left)).join('|');
    if (txtCache.bonusList === signature) return;
    txtCache.bonusList = signature;
    const rows = bonuses.map((bonus) => {
      const row = document.createElement('li'), name = document.createElement('span'), time = document.createElement('span');
      row.dataset.effect = bonus.key; name.className = 'effect-name'; name.textContent = bonus.name;
      time.className = 'effect-time'; time.textContent = Math.ceil(bonus.left) + ' s';
      row.append(name, time); return row;
    });
    $('menuEffectList').replaceChildren(...rows);
  }
  function renderPowerDetails() {
    if (!$('menuPowers') || !$('menuPowerList')) return;
    const rows = G.powerStatusSnapshot(s);
    $('menuPowers').classList.toggle('hidden', !rows.length);
    if ($('menuPowerCount')) $('menuPowerCount').textContent = String(rows.length);
    const signature = JSON.stringify(rows);
    if (txtCache.powerDetails === signature) return; txtCache.powerDetails = signature;
    const nodes = rows.map((row) => {
      const item = document.createElement('li'); item.dataset.power = row.key;
      for (const [tag, className, value] of [['span', 'effect-name', row.name], ['span', 'effect-time', row.time], ['small', 'effect-resource', row.resource], ['small', 'effect-detail', row.instruction]]) {
        const node = document.createElement(tag); node.className = className; node.textContent = value; item.appendChild(node);
      }
      return item;
    });
    $('menuPowerList').replaceChildren(...nodes);
  }
  function renderHome() {
    if (G.shell) G.shell.render({ screen: app.snapshot().screen, recipe: st.recipe, fame: st.fame, level: B.levelFor(st.fame), theme: st.theme, cityName: s ? s.city.nome : City.THEMES[st.theme].nome, session: app.snapshot().hasSession, muted, prefs: st, saveStatus: G.storage.status(), citySummary: s && s.quest ? s.quest.titolo : 'Missioni, abitanti e tre sigilli da esplorare', nativeHaptics: !!(G.native.available && G.native.capabilities.haptics), journal: journal && journal.view() });
  }

  // ---------- Eventi di gioco -> effetti ----------
  const hw = new THREE.Vector3(), ep = new THREE.Vector3();
  const aimEnd = (d, out) => { const fx = -Math.sin(yaw) * Math.cos(pitch), fy = Math.sin(pitch), fz = -Math.cos(yaw) * Math.cos(pitch), c = s.player.cam; let k = 2; while (k < d && !C.solidAt(s, c.x + fx * k, c.z + fz * k) && c.y + fy * k > 0.1) k += 1; return out.set(c.x + fx * k, c.y + fy * k, c.z + fz * k); };
  const jagOf = (el) => { el = bel(el); return el === 'folgore' ? 1 : el === 'ombra' || el === 'sangue' ? 0.45 : 0.2; };
  function boomFx(ev) {
    const c = ec(ev.el), c2 = ec2(ev.el), R = ev.r, self = ev.self, soft = ev.soft;
    G.ring(ev.x, 0.1, ev.z, 0.5, R, soft ? 0.7 : 0.45, c); if (!soft) G.ring(ev.x, 0.12, ev.z, 0.2, R * 0.65, 0.6, c2);
    const n = Math.min(9, Math.round(R * 1.2));
    for (let k = 0; k < n; k++) { const a = (k / n) * 6.283 + Math.random(), r = self ? R * (0.45 + Math.random() * 0.4) : Math.random() * R * 0.7, x = ev.x + Math.sin(a) * r, z = ev.z + Math.cos(a) * r; G.burst(x, 0.3, z, soft ? 3 : 7, k % 2 ? c : c2, soft ? 2 : 6, soft ? 2 : 5, 0.7, 0.11, soft ? -0.05 : 0.8); if (!soft && (k % 2 === 0 || !self)) G.flash(x, 0.6, z, c, 1.5, R * 0.9, 0.35); if (ev.sky && k < 2) G.bolt(x + (Math.random() - 0.5) * 3, 26, z + (Math.random() - 0.5) * 3, ev.x, 0, ev.z, 0.5, 0.3, c, jagOf(ev.el) + 0.3); }
    if (!self && !soft) G.flash(ev.x, 1, ev.z, c2, 2, R * 2.2, 0.3);
    if (!soft) { G.elemFx(ev.el, ev.x, ev.z, R * (self ? 0.8 : 0.7), ev.big ? 1.3 : 0.8); elSound(ev.el, R / 12, 0.3 * (0.3 + Math.max(0, 1 - Math.hypot(ev.x - s.player.x, ev.z - s.player.z) / 30))); }
    const d = Math.hypot(ev.x - s.player.x, ev.z - s.player.z), near = Math.max(0, 1 - d / 30);
    if (soft) tone('soft', 'sine', 300, 120, 0.5, 0.14); else { boom(ev.big ? 1.1 : 0.5, (ev.big ? 0.9 : 0.5) * (0.3 + near), ev.big ? 900 : 1300, false, 40); shake = Math.max(shake, (ev.big ? 1.1 : 0.45) * near); }
    if (ev.big) { flashSky = 1; pulse('flashfx'); hitStop = Math.max(hitStop, 0.05); }
  }
  function handleEvents(t) {
    const p = s.player;
    for (const ev of s.events) {
      G.powerEvent(ev);
      switch (ev.type) {
        case 'cast': {
          const h = G.hands;
          if (ev.slot > 0) haptic('light');
          if (ev.slot === 0) { h.zap = 0.16; G.handWorld(hw, cam); G.flash(hw.x, hw.y, hw.z, ec(ev.el), 0.5, 1.5, 0.1); if (ev.kind === 'proj') tone('pj', 'square', 760, 240, 0.07, 0.05, 40); else if (ev.kind === 'mortar') { tone('mo', 'sine', 220, 90, 0.22, 0.14); boom(0.12, 0.15, 900); } }
          else { if (ev.slot === 1) h.push = 0.5; else if (ev.slot === 2) h.lift = 0.9; else if (ev.slot === 3) h.push = 0.5; else h.both = 1.1; if (ev.kind === 'wave') { G.handWorld(hw, cam); aimEnd(4, ep); G.flash(ep.x, 1.2, ep.z, ec(ev.el), 2, 5, 0.2); tone('wv', 'sawtooth', 500, 120, 0.25, 0.12); } }
          break;
        }
        case 'chain': {
          G.handWorld(hw, cam); let px = ev.from ? ev.from.x : hw.x, py = ev.from ? 1.2 : hw.y, pz = ev.from ? ev.from.z : hw.z; const c = ec(ev.el), j = jagOf(ev.el);
          ev.pts.forEach((pt, k) => { G.bolt(px, py, pz, pt.x, pt.y, pt.z, k ? 0.1 : 0.16, 0.14, c, j); if (!k) G.bolt(px, py, pz, pt.x, pt.y, pt.z, 0.07, 0.1, ec2(ev.el), j); G.flash(pt.x, pt.y, pt.z, c, 1.2, 3.2, 0.16); G.burst(pt.x, pt.y, pt.z, 5, ec2(ev.el), 5, 1.5, 0.3, 0.07, 0.6); px = pt.x; py = pt.y; pz = pt.z; });
          tone('zap', 'sawtooth', p.oc > 0 ? 1300 : 980, 180, 0.09, 0.07, 50); boom(0.07, 0.12, 5200, true); break;
        }
        case 'miss': { G.hands.zap = 0.16; G.handWorld(hw, cam); aimEnd(15, ep); G.bolt(hw.x, hw.y, hw.z, ep.x, ep.y, ep.z, 0.1, 0.11, ec(ev.el), jagOf(ev.el)); G.flash(ep.x, ep.y, ep.z, ec(ev.el), 0.6, 1.8, 0.14); G.burst(ep.x, ep.y, ep.z, 4, ec2(ev.el), 3, 1, 0.25, 0.06, 0.6); tone('zapm', 'sawtooth', 700, 160, 0.07, 0.04, 50); break; }
        case 'swing': { const fx = -Math.sin(yaw), fz = -Math.cos(yaw), c = ec(ev.el); for (let k = -3; k <= 3; k++) { const a = k * 0.28, dx = fx * Math.cos(a) - fz * Math.sin(a), dz = fz * Math.cos(a) + fx * Math.sin(a); G.spray(p.x + dx * 1.4, 1.25 + k * 0.08, p.z + dz * 1.4, dx, 0.05, dz, 2, k % 2 ? c : ec2(ev.el), 7, 0.35, 0.22, 0.13, 0.2); } kick = Math.max(kick, 0.25); tone('sw', 'sawtooth', 340, 90, 0.1, 0.09, 60); boom(0.08, ev.n ? 0.25 : 0.1, 2600, true); if (ev.n) shake = Math.max(shake, 0.18); break; }
        case 'hit': {
          if (ev.boss) { if (G.bossView) G.bossView.flash = 0.07; } else { const v = G.mobViews.get(ev.id); if (v) v.flash = 0.08; }
          addDmg(ev); if (!ev.tick) { hitMark = 0.14; G.targetPos(ev.boss ? 'b' : 'e', ev.id, ev.x, ev.z, ep); G.burst(ep.x, ep.y, ep.z, 3, ec(ev.el), 4, 1.5, 0.3, 0.08, 0.5); tone('hit', 'square', 210, 90, 0.05, 0.05, 40); } else tone('tk', 'square', 320, 200, 0.03, 0.02, 90);
          break;
        }
        case 'kill': {
          const big = C.MOB[ev.kind].heavy, y = big ? 2.4 : ev.kind === 'tiratore' ? 2.7 : 1.4, ally = ev.team === 'a' && ev.kind !== 'sgherro' && ev.kind !== 'tiratore';
          if (ally) { G.burst(ev.x, y, ev.z, 14, 0xdff6ff, 4, 2, 0.6, 0.09, 0.1); G.flash(ev.x, y, ev.z, 0xdff6ff, 1, 4, 0.3); tone('van', 'sine', 500, 180, 0.3, 0.08); break; }
          G.burst(ev.x, y, ev.z, big ? 70 : 20, 0x2a2024, big ? 10 : 6.5, 3, 0.9, big ? 0.26 : 0.13); G.burst(ev.x, y, ev.z, big ? 40 : 12, 0xff7a20, big ? 12 : 8, 4, 0.7, 0.1, 0.7);
          G.flash(ev.x, y, ev.z, 0xff8a30, 2, big ? 14 : 6, big ? 0.5 : 0.28); G.ring(ev.x, 0.08, ev.z, 0.4, big ? 7 : 3, 0.4, 0xff7a20);
          tone('kill', 'square', 300, 50, 0.16, 0.09, 25); boom(big ? 0.7 : 0.22, big ? 0.6 : 0.2, big ? 700 : 1400, false, 30);
          if (big) { hitStop = Math.max(hitStop, 0.08); shake = Math.max(shake, 0.7); } else shake = Math.max(shake, 0.1);
          break;
        }
        case 'vanish': G.burst(ev.x, 1.2, ev.z, 10, 0xcfc6cc, 3, 1.5, 0.5, 0.09, 0.1); break;
        case 'freeze': G.burst(ev.x, 1.4, ev.z, 14, 0xdff6ff, 4, 2, 0.6, 0.12, 0.6); G.flash(ev.x, 1.4, ev.z, 0x9fb8ff, 1, 4, 0.3); tone('frz', 'triangle', 1800, 900, 0.12, 0.08, 60); break;
        case 'mobAtk': { const v = G.mobViews.get(ev.id); if (v) v.swing = 0.3; if (ev.heavy) { const e = s.mobs.find((o) => o.id === ev.id); if (e) G.ring(e.x, 0.08, e.z, 0.5, 4.5, 0.4, e.team === 'a' ? ec(e.el) : 0xff5a1a); boom(0.4, 0.4, 500, false, 80); } break; }
        case 'playerHit': shake = Math.max(shake, Math.min(0.8, 0.2 + ev.dmg * 0.02)); pulse('vig'); dmgArrow(ev.sx, ev.sz); tone('hurt', 'sawtooth', 150, 55, 0.2, 0.16, 60); boom(0.15, 0.25, 900, false, 60); break;
        case 'shieldHit': tone('shh', 'triangle', 900, 500, 0.08, 0.1, 50); pulse('flashfx'); break;
        case 'shieldEnd': tone('she', 'triangle', 500, 200, 0.2, 0.08); break;
        case 'down': boom(1.2, 0.8, 500); shake = 1.2; notices.length = 0; banner('SEI CADUTO', 'torni in piazza tra un attimo', 'rd', 4); break;
        case 'respawn': yaw = Math.PI / 2; pitch = 0; if (noticePriority === 4) { noticePriority = noticeLeft = 0; $('banner').className = ''; } pulse('flashfx'); chime(392, 523); break;
        case 'ride': { G.flash(p.x, 1.4, p.z, 0x7fdcff, 2, 7, 0.3); G.burst(p.x, 1.2, p.z, 24, 0xbfefff, 7, 3, 0.5, 0.09, 0.4); const n = s.city.nodes[ev.node]; G.bolt(p.x, 1.4, p.z, n.x, n.y, n.z, 0.3, 0.22, ec(ev.el)); tone('ride', 'sawtooth', 200, 1600, 0.25, 0.14); pulse('flashfx'); break; }
        case 'node': { const n = s.city.nodes[ev.id]; G.flash(n.x, n.y, n.z, 0x9fe8ff, 2, 6, 0.25); G.burst(n.x, n.y, n.z, 10, 0xbfefff, 6, 1, 0.4, 0.08, 0.5); tone('node', 'triangle', 1400, 900, 0.06, 0.08, 40); break; }
        case 'drop': tone('drop', 'sawtooth', 1500, 120, 0.18, 0.14); break;
        case 'strike': {
          const c = ec(ev.el);
          for (let k = 0; k < 6; k++) { const an = (k / 6) * Math.PI * 2 + Math.random(), r = 2.6 + Math.random() * 2.5, bx = ev.x + Math.cos(an) * r, bz = ev.z + Math.sin(an) * r; G.bolt(bx + (Math.random() - 0.5) * 3, C.NODE_H + 8, bz + (Math.random() - 0.5) * 3, bx, 0, bz, 0.4, 0.34, c, 1.5); G.flash(bx, 0.5, bz, ec2(ev.el), 2, 7, 0.4); G.burst(bx, 0.3, bz, 12, ec2(ev.el), 7, 5, 0.7, 0.09, 0.8); G.burst(bx, 0.3, bz, 5, 0x2a2024, 5, 4, 0.8, 0.16); }
          G.ring(ev.x, 0.1, ev.z, 0.8, ev.r, 0.5, c); G.ring(ev.x, 0.12, ev.z, 0.3, ev.r * 0.65, 0.65, 0xffffff);
          boom(0.9, 0.9, 1100); tone('strike', 'sawtooth', 160, 30, 0.6, 0.25); shake = Math.max(shake, 1.0); hitStop = Math.max(hitStop, 0.05); flashSky = 1; pulse('flashfx'); break;
        }
        case 'boom': boomFx(ev); break;
        case 'dash': kick = 1; pulse('flashfx'); tone('dash', 'sawtooth', 300, 900, 0.14, 0.1); boom(0.15, 0.2, 3000, true); for (let k = 0; k < 10; k++) G.burst(p.x, 0.5 + Math.random() * 1.2, p.z, 1, ec(ev.el), 3, 0.5, 0.4, 0.1, 0.1); break;
        case 'blink': kick = 1; pulse('flashfx'); G.flash(ev.x0, 1.2, ev.z0, ec(ev.el), 3, 0.5, 0.35); G.burst(ev.x0, 1.2, ev.z0, 18, ec2(ev.el), 4, 1, 0.5, 0.1, 0.1); G.ring(ev.x1, 0.1, ev.z1, 0.3, ev.r, 0.4, ec(ev.el)); tone('blk', 'sine', 1400, 300, 0.2, 0.14); break;
        case 'leap': tone('leap', 'sawtooth', 180, 520, 0.3, 0.12); kick = 0.6; break;
        case 'buff': { pulse('castfx', css(ev.el)); const f = { haste: [500, 1000], veil: [700, 250], shield: [300, 700], heal: [523, 784], orbit: [600, 900], drain: [400, 200] }[ev.what] || [400, 800]; tone('bf' + ev.what, ev.what === 'veil' ? 'sine' : 'triangle', f[0], f[1], 0.3, 0.13); if (ev.what === 'heal') for (let k = 0; k < 3; k++) G.ring(p.x, 0.1, p.z, 0.5, 2 + k, 0.5 + k * 0.15, 0x7dffb0); break; }
        case 'buffEnd': tone('bfe', 'triangle', 500, 250, 0.15, 0.06); break;
        case 'unveil': tone('unv', 'sine', 300, 700, 0.15, 0.08); break;
        case 'place': G.flash(ev.x, 0.6, ev.z, ec(ev.el), 1, 4, 0.3); G.ring(ev.x, 0.1, ev.z, 0.3, 2.5, 0.35, ec(ev.el)); tone('plc', 'triangle', ev.what === 'trap' ? 900 : 500, ev.what === 'trap' ? 1200 : 250, 0.14, 0.1); break;
        case 'charm': {
          pulse('castfx', '#ff3fd0'); tone('hyp', 'sine', 380, 950, 0.5, 0.16); tone('hyp2', 'sine', 570, 1425, 0.5, 0.08);
          for (let k = 0; k < 3; k++) sceneDelay(() => { if (s) G.ring(s.player.x, 0.1, s.player.z, 0.5, 11, 0.6, 0xff3fd0); }, k * 110);
          for (const e of s.mobs) if (e.charm > 0) { G.flash(e.x, 1.5, e.z, 0xff3fd0, 1, 4, 0.4); G.burst(e.x, 1.5, e.z, 10, 0xff7fe0, 3, 2, 0.6, 0.08, 0.2); }
          if (ev.screen >= 0) { G.hypT = 2.2; const sc = s.city.screens[ev.screen]; G.ring(sc.x, 0.1, sc.z, 1, sc.r, 0.9, 0xff3fd0); banner('IN ONDA', (ev.n + ev.npcs) + ' spettatori ipnotizzati', 'mg'); } else if (ev.npcs && !ev.n) toast(ev.npcs + ' abitanti ti seguono');
          break;
        }
        case 'release': tone('rel', 'triangle', 900, 300, 0.18, 0.1); buf[ev.slot] = 0; break;
        case 'rooted': G.ring(ev.x, 0.1, ev.z, 2, 0.6, 0.35, ec(ev.el)); G.burst(ev.x, 0.4, ev.z, 8, ec(ev.el), 2, 3, 0.5, 0.1, 0.5); break;
        case 'coneFx': { G.handWorld(hw, cam); const fx = -Math.sin(yaw), fz = -Math.cos(yaw); G.spray(hw.x, hw.y, hw.z, fx, 0.02, fz, 26, ec(ev.el), ev.range / 0.4, ev.half * 1.6, 0.4, 0.2, 0.05); G.spray(hw.x, hw.y, hw.z, fx, 0.02, fz, 12, ec2(ev.el), ev.range / 0.5, ev.half * 1.6, 0.5, 0.14, 0.05); boom(0.25, 0.3, 2400, true); tone('cn', 'sawtooth', 260, 120, 0.2, 0.1); kick = Math.max(kick, 0.3); break; }
        case 'tether': { G.handWorld(hw, cam); G.bolt(hw.x - 0.3, hw.y, hw.z, ev.x, 1.4, ev.z, 0.14, 0.3, ec(ev.el), 0.5); G.flash(ev.x, 1.4, ev.z, ec(ev.el), 1, 4, 0.3); tone('pull', 'sawtooth', 900, 200, 0.2, 0.12); break; }
        case 'summon': tone('sum', 'sine', 300, 600, 0.3, 0.12); tone('sum2', 'sine', 450, 900, 0.35, 0.07); G.ring(p.x, 0.1, p.z, 0.5, 3.5, 0.5, ec(ev.el)); break;
        case 'possess': { const tu = s.turrets[ev.id]; G.handWorld(hw, cam); G.bolt(hw.x - 0.3, hw.y, hw.z, tu.x, 1.7, tu.z, 0.14, 0.3, ec(ev.el), 0.5); G.flash(tu.x, 1.7, tu.z, ec(ev.el), 2, 7, 0.4); G.ring(tu.x, 0.1, tu.z, 0.5, 4, 0.5, ec(ev.el)); tone('pos', 'square', 300, 1200, 0.2, 0.1); tone('pos2', 'square', 600, 1800, 0.25, 0.06); break; }
        case 'marked': G.targetPos(ev.boss ? 'b' : 'e', ev.id, ev.x, ev.z, ep); G.flash(ep.x, ep.y, ep.z, ec(ev.el), 4, 0.8, 0.35); G.ring(ev.x, 0.1, ev.z, 3.5, 0.8, 0.35, ec(ev.el)); tone('mk', 'square', 1200, 600, 0.1, 0.08); break;
        case 'ult': {
          if (ev.quiet) break;
          const nm = { oc: 'SOVRACCARICO', cata: 'CATACLISMA', storm: 'PIOGGIA', domin: 'DOMINIO', timestop: 'TEMPO FERMO', giant: 'COLOSSO', eclipse: 'ECLISSI', rage: 'IRA', judge: 'GIUDIZIO', phoenix: 'FENICE' }[ev.what] || (ev.nome || '').toUpperCase(), bn = bel(ev.el), md = ev.el !== bn ? ' · ' + B.MOD[ev.el.slice(bn.length + 1)].nome : '';
          banner(nm, EL[bn].nome + md, 'cy'); document.documentElement.style.setProperty('--el', css(ev.el)); boom(1.0, 0.8, 1600); tone('oc', 'sawtooth', 110, 880, 0.7, 0.2); flashSky = 1; shake = Math.max(shake, 0.7); pulse('flashfx'); G.sky.material.uniforms.fc.value.set(((ec(ev.el) >> 16) & 255) / 255, ((ec(ev.el) >> 8) & 255) / 255, (ec(ev.el) & 255) / 255);
          break;
        }
        case 'ultEnd': tone('oce', 'sawtooth', 600, 80, 0.5, 0.12); break;
        case 'timeEnd': tone('te', 'sine', 200, 800, 0.4, 0.12); pulse('flashfx'); break;
        case 'turretFree': { const tu = s.turrets[ev.id]; G.burst(tu.x, 1.7, tu.z, 12, 0xffb23a, 4, 2, 0.5, 0.08); tone('free', 'square', 700, 200, 0.2, 0.08); break; }
        case 'turretShot': { const tu = s.turrets[ev.id]; G.flash(tu.x + Math.sin(tu.yaw) * 1.2, 1.7, tu.z + Math.cos(tu.yaw) * 1.2, tu.state === 'owned' ? ec(tu.el) : 0xff6a20, 0.6, 1.8, 0.08); if (Math.hypot(tu.x - p.x, tu.z - p.z) < 40) tone('tshot', 'square', tu.state === 'owned' ? 700 : 260, 140, 0.05, 0.04, 60); break; }
        case 'shotEnd': G.burst(ev.x, 1.4, ev.z, ev.w ? 8 : 4, ev.team === 'e' ? 0xff8a30 : ec(ev.el), 3, 1.5, 0.3, 0.07); break;
        case 'fizzle': { tone('fz', 'square', 140, 100, 0.08, 0.05, 150); const be = BT[ev.slot]; be.classList.remove('nope'); void be.offsetWidth; be.classList.add('nope'); buf[ev.slot] = 0; if (ev.why) toast(ev.why); break; }
        case 'watch': toast(ev.n === 1 ? 'Un abitante ti guarda' : ev.n + ' abitanti ti guardano'); tone('wt', 'sine', 880, 1100, 0.12, 0.05, 400); break;
        case 'invite': chime(660, 880); break;
        case 'msg': toast(ev.text); tone('fz', 'square', 140, 100, 0.08, 0.05, 150); break;
        case 'step': chime(784, 1046); break;
        case 'ring': G.ring(ev.x, 0.1, ev.z, 0.5, ev.r + 2, 0.6, ev.c === 'quest' ? 0xffd24a : ec(ev.c)); break;
        case 'ambush': banner('IMBOSCATA', 'proteggi l\'anima', 'rd'); tone('amb', 'sawtooth', 200, 100, 0.4, 0.15); break;
        case 'questStart': banner(ev.titolo, C.QINFO[ev.q].testo, 'gd'); chime(523, 784); break;
        case 'questDone': banner('MISSIONE RIUSCITA', ev.titolo + ' · Fama +' + ev.fama, 'gd', 2); haptic('success'); chime(784, 1175); sceneDelay(() => tone('qd', 'sine', 1568, 1568, 0.4, 0.1), 240); break;
        case 'questFail': banner('MISSIONE FALLITA', ev.why, 'rd'); tone('qf', 'sawtooth', 300, 90, 0.5, 0.14); break;
        case 'fame': st.fame = s.fame; G.save(); break;
        case 'level': sceneDelay(() => banner('FAMA · LIVELLO ' + ev.level, 'ora hai ' + ev.budget + ' punti: passa in officina', 'gd'), 2300); break;
        case 'bossStart': banner(ev.nome.toUpperCase(), ev.titolo, 'rd'); boom(1.4, 0.9, 500); tone('bs', 'sawtooth', 70, 140, 1.2, 0.25); shake = Math.max(shake, 0.9); flashSky = 0.8; break;
        case 'bossCast': tone('bc', 'sawtooth', 120, 240, Math.min(0.9, ev.wind), 0.12, 100); break;
        case 'bossPhase': banner('FASE ' + (ev.phase + 1), 'riprendi fiato: +30 vita', 'rd'); boom(0.9, 0.8, 700); shake = Math.max(shake, 0.8); G.ring(ev.x, 0.1, ev.z, 1, 22, 0.8, 0xff3a20); pulse('flashfx'); break;
        case 'teleHit': { G.teleFlash(ev); const d = Math.hypot(ev.x - p.x, ev.z - p.z); boom(0.35, 0.5 * Math.max(0.25, 1 - d / 40), 1000, false, 60); shake = Math.max(shake, 0.4 * Math.max(0, 1 - d / 26)); break; }
        case 'bossDown': {
          for (let k = 0; k < 10; k++) sceneDelay(() => { if (!s) return; const a = Math.random() * 6.283, r = Math.random() * 3, y = 1 + Math.random() * 5; G.burst(ev.x + Math.sin(a) * r, y, ev.z + Math.cos(a) * r, 30, k % 2 ? 0xff7a20 : 0x2a2024, 12, 5, 1, 0.24); G.flash(ev.x + Math.sin(a) * r, y, ev.z + Math.cos(a) * r, 0xffd0a0, 3, 16, 0.5); boom(0.6, 0.7, 600 + k * 80); shake = Math.max(shake, 0.9); }, k * 130);
          G.ring(ev.x, 0.1, ev.z, 1, 26, 1.2, 0xffd24a); hitStop = 0.12; flashSky = 1; banner(ev.nome.toUpperCase() + ' ABBATTUTO', 'il sigillo riposa', 'gd', 3); haptic('success'); chime(523, 784); sceneDelay(() => chime(1046, 1568), 400); break;
        }
        case 'bossReset': toast(ev.why + ': il boss torna a dormire'); break;
        case 'shape': {
          if (ev.tk) { const now = performance.now(), key = 'tk' + ev.shape; if (lastS[key] && now - lastS[key] < 70) break; lastS[key] = now; G.handWorld(hw, cam); const c = Math.random() < 0.6 ? ec(ev.el) : ec2(ev.el), sx = Math.sin(ev.ang), sz = Math.cos(ev.ang);
            if (ev.shape === 'cone') G.spray(hw.x, hw.y, hw.z, sx, Math.sin(pitch), sz, 6, c, ev.r / 0.42, ev.half * 1.5, 0.42, 0.13, 0.03);
            else if (ev.shape === 'line') G.bolt(hw.x, hw.y, hw.z, ev.x + sx * ev.len, 1.2, ev.z + sz * ev.len, 0.18, 0.09, ec(ev.el), jagOf(ev.el));
            else if (ev.shape === 'donut') G.ring(ev.x, 0.1, ev.z, ev.r0, ev.r, 0.25, c); else if (ev.r > 1.5) G.ring(ev.x, 0.1, ev.z, ev.r * 0.4, ev.r, 0.22, c); else { G.bolt(hw.x, hw.y, hw.z, ev.x, 1.3, ev.z, 0.14, 0.09, ec(ev.el), jagOf(ev.el)); G.flash(ev.x, 1.3, ev.z, c, 0.6, 1.8, 0.1); }
            tone('tkb', 'sawtooth', 400, 360, 0.08, 0.03, 90); break; }
          G.shapeFx(ev); const d = Math.hypot(ev.x - p.x, ev.z - p.z), size = ev.shape === 'line' ? ev.len * 0.4 : ev.r, vol = Math.min(0.6, 0.12 + size * 0.03) * Math.max(0.3, 1 - d / 40);
          if (ev.shape === 'circle' && ev.r <= 1.5) { G.handWorld(hw, cam); G.bolt(hw.x, hw.y, hw.z, ev.x, 1.3, ev.z, 0.15, 0.13, ec(ev.el), jagOf(ev.el)); G.flash(ev.x, 1.3, ev.z, ec(ev.el), 1, 3.4, 0.18); tone('tg', 'square', 620, 180, 0.09, 0.07, 40); }
          else { elSound(ev.el, size / 12, vol); if (ev.n && d < 20) shake = Math.max(shake, Math.min(0.5, size * 0.04));
            if (d < 2.5 && !ev.late) { if (ev.shape === 'cone') { G.gesture('slash', ev.el); kick = Math.max(kick, 0.2); } else if (ev.shape === 'circle' || ev.shape === 'donut') { G.gesture('slam', ev.el); kick = Math.max(kick, 0.3); } else G.gesture('toss', ev.el); }
            if (ev.late && d < 30) { shake = Math.max(shake, Math.min(0.7, size * 0.06)); if (size > 5) flashSky = Math.max(flashSky, 0.5); } }
          break;
        }
        case 'face': yaw = Math.atan2(-(ev.x - p.x), -(ev.z - p.z)); pitch = -0.05; break;
        case 'arc': G.bolt(ev.x0, 1.3, ev.z0, ev.x1, 1.3, ev.z1, 0.12, 0.16, ec(ev.el), jagOf(ev.el)); G.flash(ev.x1, 1.3, ev.z1, ec(ev.el), 0.8, 2.4, 0.15); break;
        case 'uncharm': break;
      }
    }
    s.events.length = 0;
  }

  // ---------- Fotogramma ----------
  const nodeMark = $('nodeMark'), hintEl = $('hint'), xh = $('xh'), objMark = $('objMark'), txtCache = {}, clsCache = {};
  const setTxt = (id, t) => { if (txtCache[id] !== t) { txtCache[id] = t; $(id).textContent = t; } };
  const setW = (id, w) => { const k = 'w' + id, v = Math.round(w * 10) / 10; if (txtCache[k] !== v) { txtCache[k] = v; $(id).style.width = v + '%'; } };
  const GROUND = { mortar: 1, blink: 1, leap: 1, zone: 1, strike: 1, bubble: 1, storm: 1, snare: 1 };
  let beamT = 0, drainT = 0;
  function updateView(dt, t) {
    const p = s.player, riding = !!p.ride, dead = p.dead > 0;
    rideK += ((riding ? 1 : 0) - rideK) * Math.min(1, dt * 9); ocK += (((p.oc > 0 || p.eclipse > 0) ? 1 : 0) - ocK) * Math.min(1, dt * 5); veilK += (((p.veil > 0 || p.phase) ? 1 : 0) - veilK) * Math.min(1, dt * 6); timeK += ((s.freeze > 0 ? 1 : 0) - timeK) * Math.min(1, dt * 6);
    if (kick > 0) kick = Math.max(0, kick - dt * 4);
    if (p.moving && !riding && !p.leap && !p.flight && !st.reducedMotion) bobT += dt * (p.haste > 0 ? 13 : 10);
    const sx = st.reducedMotion ? 0 : (Math.random() - 0.5) * shake * 0.35, sy = st.reducedMotion ? 0 : (Math.random() - 0.5) * shake * 0.35;
    if (running) { cam.position.set(p.cam.x + sx, p.cam.y + (riding ? 0.35 : st.reducedMotion ? 0 : Math.sin(bobT) * 0.045) + sy - (dead ? Math.min(1.2, (3 - p.dead) * 1.5) : 0), p.cam.z); cam.rotation.y = yaw; cam.rotation.x = pitch; cam.rotation.z = st.reducedMotion ? 0 : (Math.random() - 0.5) * shake * 0.03 + (dead ? 0.5 : 0); }
    else { const a = t * 0.05; cam.position.set(Math.sin(a) * 30, 9, Math.cos(a) * 30 + 6); cam.rotation.y = a + 0.25; cam.rotation.x = 0.12; cam.rotation.z = 0; }
    if (shake > 0) shake = Math.max(0, shake - dt * 2.6);
    const tf = (W > Hh ? 72 : 92) + (st.reducedMotion ? 0 : rideK * 20 + ocK * 4 + (p.haste > 0 ? 6 : 0) + kick * 12);
    if (Math.abs(tf - fov) > 0.05) { fov += (tf - fov) * Math.min(1, dt * 10); cam.fov = fov; cam.updateProjectionMatrix(); }
    cam.updateMatrixWorld();
    const decorTime = st.reducedMotion ? 0 : t;
    G.sky.position.copy(cam.position); const su = G.sky.material.uniforms; su.time.value = decorTime; flashSky = Math.max(0, flashSky - dt * 3); su.flash.value = st.reducedFlash ? 0 : flashSky + ocK * (0.15 + 0.15 * Math.sin(t * 17));
    for (const m of G.liqMats) m.uniforms.time.value = s.freeze > 0 ? m.uniforms.time.value : decorTime; G.cableMat.uniforms.time.value = decorTime; G.cableMat.uniforms.boost.value = rideK * 0.8 + ocK * 0.3;
    G.emberMat.uniforms.time.value = decorTime; G.emberMat.uniforms.cam.value.copy(cam.position); G.emberMat.uniforms.px.value = pxr * (Hh / 700);
    G.beaconMat.color.setHex(st.reducedMotion || st.reducedFlash || Math.sin(t * 3) > 0.2 ? 0xff2a18 : 0x3a0806);
    G.towerLight.intensity = 1.1 + (st.reducedMotion || st.reducedFlash ? 0 : Math.sin(t * 2) * 0.3) + (G.hypT > 0 ? 1.5 : 0);

    G.syncMobs(s, dt, t); G.syncNpcs(s, dt, t); G.syncGivers(s, t); G.syncTurrets(s, dt, t); G.syncBoss(s, dt, t); G.syncSeals(s, t); G.syncTeles(s, t); G.syncThings(s, dt, t); G.animZones(s, dt, t); G.animMobs(s, dt); G.syncBeacon(s, t); G.syncOrbs(s, t, dt); G.drawScreens(dt, t);
    G.nodeGlows.forEach((sp, i) => { const on = s.hint.node === i; sp.scale.setScalar((on ? 5 : 2.4) + (st.reducedMotion ? 0 : Math.sin(t * 5 + i) * 0.4)); sp.material.color.setHex(on ? 0xffffff : 0x55f0ff); });
    if (active() && riding && Math.random() < 0.7) G.burst(p.cam.x, p.cam.y - 0.4, p.cam.z, 1, 0xbfefff, 2, 0, 0.3, 0.06, 0.5);
    // poteri continui: raggio, soffio, risucchio
    const K0 = s.kit[0], h = G.hands; h.hold = 0;
    if (active() && p.beam.on) { h.hold = 1; beamT -= dt; if (beamT <= 0) { beamT = 0.035; G.handWorld(hw, cam); G.bolt(hw.x, hw.y, hw.z, p.beam.x, p.beam.y, p.beam.z, 0.2, 0.08, ec(K0.el), jagOf(K0.el)); if (p.beam.hit) { G.flash(p.beam.x, p.beam.y, p.beam.z, ec(K0.el), 0.8, 2.2, 0.1); if (Math.random() < 0.5) G.burst(p.beam.x, p.beam.y, p.beam.z, 2, ec2(K0.el), 4, 1, 0.3, 0.07, 0.5); } tone('beam', 'sawtooth', 420, 380, 0.09, 0.035, 80); } }
    if (active() && p.cone) { h.hold = 1; G.handWorld(hw, cam); const cp = Math.cos(pitch); G.spray(hw.x, hw.y, hw.z, -Math.sin(yaw) * cp, Math.sin(pitch), -Math.cos(yaw) * cp, 5, Math.random() < 0.6 ? ec(K0.el) : ec2(K0.el), K0.range / 0.42, K0.half * 1.5, 0.42, 0.13, bel(K0.el) === 'fuoco' ? -0.15 : 0.05); boom(0.1, 0.07, 1800, true, 70); }
    if (active() && p.drain) { drainT -= dt; if (drainT <= 0) { drainT = 0.06; G.handWorld(hw, cam); G.bolt(p.drain.x || p.x, p.drain.y || 1.2, p.drain.z || p.z, hw.x - 0.3, hw.y, hw.z, 0.14, 0.1, ec(p.drain.k.el), 0.6); } }
    if (active() && p.grab) { drainT -= dt; if (drainT <= 0) { drainT = 0.05; const e = s.mobs.find((o) => o.id === p.grab.id); if (e) { G.handWorld(hw, cam); G.targetPos('e', e.id, e.x, e.z, ep); G.bolt(hw.x - 0.3, hw.y, hw.z, ep.x, ep.y, ep.z, 0.2, 0.09, ec(p.grab.k.el), 0.5); } } }
    let gk = null; for (let i = 0; i < 5; i++) if ((GROUND[s.kit[i].kind] || s.kit[i].gnd) && (i === 0 || s.ready[i])) { gk = s.kit[i]; break; }
    G.syncReticle(s, running && !!gk && !riding && !dead && !p.leap, gk ? ec(gk.el) : 0xffffff, gk && gk.r ? Math.min(3, gk.r * 0.5) : 1.2);
    G.updateFx(dt, t, cam.position); G.animUpdate(dt); G.syncPowerFx(t); flushDmg(dt);
    h.visible += ((riding || dead || !running || p.leap || p.possession || p.phase ? 0 : 1) - h.visible) * Math.min(1, dt * 12); h.glow = ocK;
    G.updateHands(dt, t, p.moving && !riding && !st.reducedMotion, W / Hh);

    bloom.strength = st.reducedFlash ? 0.18 : Math.min(0.52, 0.32 + rideK * 0.12 + ocK * 0.08);
    fin.uniforms.chroma.value = st.reducedMotion ? 0 : 0.0022 + rideK * 0.018 + ocK * 0.005 + shake * 0.008 + kick * 0.01;
    const ult = s.kit[4], uc = ec(ult.el);
    if (rideK > 0.02) fin.uniforms.tint.value.set(0.55, 0.9, 1.15); else fin.uniforms.tint.value.set(0.35 + ((uc >> 16) & 255) / 320, 0.35 + ((uc >> 8) & 255) / 320, 0.35 + (uc & 255) / 320);
    fin.uniforms.tintAmt.value = Math.max(rideK * 0.5, ocK * 0.2); fin.uniforms.desat.value = Math.max(timeK * 0.85, veilK * 0.5, dead ? 0.9 : 0);
    if (!running) return;

    // interfaccia
    if (s.kit[0] !== shownPrimary || s.player.possession !== shownControl) setupButtons();
    setW('hpFill', (100 * p.hp) / p.maxHp); setTxt('hpTxt', String(Math.ceil(p.hp))); setW('shFill', Math.min(100, p.shield));
    setW('resFill', p.oc > 0 ? (100 * p.oc) / p.ocDur : p.res); $('res').classList.toggle('full', p.res >= 100);
    const hnt = s.hint;
    for (let i = 0; i < 5; i++) {
      const K = s.kit[i], b = BT[i], body = ['form', 'phase', 'flight', 'possession', 'captive'].find((key) => p[key] && p[key].slot === i), act = s.act[i] > 0 && i > 0, tog = !!body || K.kind === 'charm' || K.kind === 'possess' || K.kind === 'grab' || K.kind === 'anchor';
      let ready = body ? true : i === 0 ? !riding && !p.phase && (!!p.possession || !!s.aim.kind || K.kind !== 'chain') : s.ready[i] && !act, lab = b.dataset.nm, cdh = 0;
      if (K.kind === 'cable') { ready = riding || hnt.node >= 0; lab = riding ? 'Scendi' : lab; cdh = riding ? 0 : Math.max(0, p.cd[1]) / K.cd; }
      else if (i === 4) cdh = act ? 0 : 1 - p.res / 100;
      else if (i > 0) cdh = act && tog ? 0 : Math.max(0, p.cd[i]) / K.cd;
      if (K.kind === 'possess' && !act) ready = ready && hnt.turret >= 0;
      if (tog && act) lab = K.kind === 'grab' ? 'Scaglia' : K.kind === 'anchor' ? 'Torna' : 'Rilascia';
      if (body) { lab = { form: 'Normale', phase: 'Solido', flight: 'Atterra', possession: 'Rientra', captive: 'Libera' }[body]; cdh = 0; }
      const cls = (ready ? 'r' : '') + (act ? 'a' : '') + (i === 0 && inp.fire && !riding ? 'h' : '') + (K.kind === 'charm' && ready && hnt.screen >= 0 ? 'x' : '');
      if (clsCache[i] !== cls) { clsCache[i] = cls; b.classList.toggle('ready', ready); b.classList.toggle('act', act); b.classList.toggle('held', cls.includes('h')); b.classList.toggle('hot', cls.includes('x')); }
      if (txtCache['l' + i] !== lab) { txtCache['l' + i] = lab; b.querySelector('.nm').textContent = lab; b.setAttribute('aria-label', lab); }
      if (i > 0) { const hh = Math.round(cdh * 100); if (txtCache['c' + i] !== hh) { txtCache['c' + i] = hh; b.querySelector('.cd').style.height = hh + '%'; } }
    }
    furyK += ((p.fury > 0 ? 1 : 0) - furyK) * Math.min(1, dt * 6); hasteK += ((p.haste > 0 ? 1 : 0) - hasteK) * Math.min(1, dt * 6);
    $('furyfx').style.opacity = furyK * (st.reducedFlash ? 0.35 : 0.75 + Math.sin(t * 9) * 0.25); $('hastefx').style.opacity = hasteK * (st.reducedMotion ? 0.25 : 0.8); $('reflfx').style.opacity = p.reflect > 0 ? 0.9 : 0;
    if (hitMark > 0) { hitMark = Math.max(0, hitMark - dt); } const hm = hitMark > 0; if (clsCache.hm !== hm) { clsCache.hm = hm; xh.classList.toggle('hit', hm); }
    $('ride').style.opacity = rideK; $('ocfx').style.opacity = ocK; $('veilfx').style.opacity = veilK; $('timefx').style.opacity = timeK; $('shieldfx').style.opacity = p.shield > 0 ? 0.9 : 0; $('downfx').style.opacity = dead ? 1 : 0;
    xh.className = riding ? 'ride' : s.aim.kind ? 'lock' : '';
    renderBonuses(p);
    let txt = '';
    if (riding) txt = 'guarda dove andare · ripremi per scendere'; else if (hnt.node >= 0) txt = 'cavo a portata'; else if (hnt.screen >= 0 && s.kit.some((K, i) => K.kind === 'charm' && s.ready[i])) txt = 'schermo vicino: ipnosi in onda';
    else if (s.boss && s.boss.out > 0.5) txt = 'torna nell\'arena o il boss si riaddormenta'; else if (s.quest && s.quest.type === 'ripetitori' && s.quest.hold > 0) txt = 'resta nel cerchio';
    if (hintEl.textContent !== txt) hintEl.textContent = txt;
    if (!riding && hnt.node >= 0) { const n = s.city.nodes[hnt.node]; project(n.x, n.y, n.z, scr); if (scr.ok) { nodeMark.style.display = 'block'; nodeMark.style.left = scr.x + 'px'; nodeMark.style.top = scr.y + 'px'; } else nodeMark.style.display = 'none'; } else nodeMark.style.display = 'none';
    // tasto contestuale
    const u = hnt.use, ub = $('useBtn'), uk = u ? u.kind + u.id + u.label : '';
    if (txtCache.use !== uk) { txtCache.use = uk; ub.classList.toggle('hidden', !u); if (u) { ub.classList.toggle('dim', u.kind === 'busy'); ub.innerHTML = G.esc(u.label) + (u.testo ? '<small>' + G.esc(u.testo) + ' Fama +' + u.fama + '</small>' : ''); } }
    // missione
    const q = s.quest, qp = $('quest');
    if (q) { qp.classList.remove('none'); setTxt('qTitle', q.titolo.toUpperCase()); setTxt('qLine', q.line || ''); const tm = q.time > 0 ? Math.ceil(q.time) : 0; setTxt('qTime', tm ? Math.floor(tm / 60) + ':' + String(tm % 60).padStart(2, '0') : ''); $('qTime').classList.toggle('low', tm > 0 && tm <= 10); }
    else { qp.classList.add('none'); setTxt('qTitle', 'MISSIONE'); setTxt('qTime', ''); setTxt('qLine', 'Cerca chi ha un ! sopra la testa'); }
    // segnale dell'obiettivo: sullo schermo se e' davanti, sul bordo se e' altrove
    let ox = null, oz = 0;
    if (q && q.obj && !(q.type === 'pubblico' && q.line[0] === 'A')) { ox = q.obj.x; oz = q.obj.z; if (q.type === 'scorta' && q.obj2 && Math.hypot(q.obj2.x - p.x, q.obj2.z - p.z) > 11) { ox = q.obj2.x; oz = q.obj2.z; } }
    else if (!q && !s.boss) { let bd = 1e9; for (const g of s.givers) if (g.offer) { const d = Math.hypot(g.x - p.x, g.z - p.z); if (d < bd) { bd = d; ox = g.x; oz = g.z; } } }
    if (ox !== null && !dead) {
      const d = Math.hypot(ox - p.x, oz - p.z); project(ox, 2.6, oz, scr); let x = scr.x, y = scr.y; const m = 46;
      if (!scr.ok || x < m || x > W - m || y < m || y > Hh - m) { let a = Math.atan2(ox - p.x, oz - p.z) - (yaw + Math.PI); const sx2 = -Math.sin(a), cy2 = Math.cos(a), k = Math.min((W / 2 - m) / Math.max(0.001, Math.abs(sx2)), (Hh / 2 - m) / Math.max(0.001, Math.abs(cy2))); x = W / 2 + sx2 * k; y = Hh / 2 - cy2 * k; }
      objMark.style.display = d > 5 ? 'block' : 'none'; objMark.style.left = x + 'px'; objMark.style.top = y + 'px'; setTxt('objTxt', Math.round(d) + ' m');
    } else objMark.style.display = 'none';
    // boss
    const b = s.boss, bp = $('boss');
    if (b) { if (txtCache.boss !== b.key) { txtCache.boss = b.key; bp.classList.remove('hidden'); $('bossName').textContent = b.def.nome.toUpperCase() + ' · ' + b.def.titolo.toUpperCase(); $('tk1').style.left = b.def.fasi[0].fino * 100 + '%'; $('tk2').style.left = b.def.fasi[1].fino * 100 + '%'; } setW('bossFill', Math.max(0, (100 * b.hp) / b.maxHp)); setTxt('bossCast', b.stun > 0 ? 'esita' : b.cast || ''); }
    else if (txtCache.boss) { txtCache.boss = ''; bp.classList.add('hidden'); }
    setTxt('fameLv', String(s.level)); setTxt('famePt', String(s.fame)); setTxt('place', s.city.district(p.x, p.z));
    if (rideGain) rideGain.gain.value = muted ? 0 : rideK * 0.16;
    drawMini(dt, t);
  }

  // adattamento automatico della qualita' se il dispositivo arranca
  let slowT = 0, appliedQuality = null;
  function quality(dt) {
    if (window.__dite.lockQ || st.quality !== 'auto') return;
    if (dt > 0.03) slowT += dt; else slowT = Math.max(0, slowT - dt * 0.5);
    if (slowT > 1.6) { slowT = 0; if (pxr > 1.01) { pxr = Math.max(1, pxr - 0.25); renderer.setPixelRatio(pxr); composer.setPixelRatio(pxr); resize(true); } else if (useBloom) { useBloom = false; bloom.enabled = false; } }
  }
  function invalidate() { dirty = true; if (!raf) raf = requestAnimationFrame(frame); }
  function renderOnce(options = {}) {
    if (!s || !graphicsReady || app.snapshot().blockers.includes('context')) return false;
    const previousBloom = bloom.enabled;
    if (typeof options.bloom === 'boolean') bloom.enabled = options.bloom;
    try { renderer.info.reset(); renderer.clear(); composer.render(0); renderFrames++; lastRender = performance.now(); dirty = false; return true; }
    finally { bloom.enabled = previousBloom; }
  }
  function frame(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000 || 0); last = now;
    if (canvas.clientWidth !== W || canvas.clientHeight !== Hh) resize();
    if (active()) visualTime += dt; const t = visualTime;
    if (!s || !graphicsReady) return;
    if (active()) {
      tickScene(dt);
      if (hitStop > 0) hitStop -= dt;
      else {
        acc += dt; let n = 0;
        while (acc >= STEP && n < 4) {
          const e0 = s.events.length; C.step(s, STEP, readInput());
          const events = s.events.slice(e0);
          if (guide) guide.observe(s, inp, events); if (journal) journal.observe(s, events);
          for (const ev of events) { if ((ev.type === 'cast' || ev.type === 'fizzle' || ev.type === 'release') && ev.slot > 0) buf[ev.slot] = 0; else if (ev.type === 'ride' || ev.type === 'drop') buf[1] = 0; }
          if (inp.use) useBuf = 0; useFresh = false; for (let k = 1; k < 5; k++) fresh[k] = false;
          acc -= STEP; n++;
        }
        if (n === 4) acc = 0;
      }
      handleEvents(t); quality(dt); updateView(dt, t); renderCoach(); renderOnce();
    } else if (dirty && !app.snapshot().blockers.includes('context')) { updateView(0, t); renderOnce(); }
    if (active() && !raf) raf = requestAnimationFrame(frame);
  }
  function resize(force) {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight; if (!w || !h) return;
    W = w; Hh = h; renderer.setSize(w, h, false); composer.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix();
    // L'orientamento fisico non cambia quando la tastiera riduce il visual viewport.
    const orientation = window.screen && window.screen.orientation;
    const portrait = coarse && orientation && typeof orientation.type === 'string' ? orientation.type.startsWith('portrait') : coarse && typeof window.orientation === 'number' ? Math.abs(window.orientation) % 180 === 0 : window.innerHeight > window.innerWidth;
    document.body.classList.toggle('portrait', portrait); app.setBlocker('portrait', portrait);
    if ($('rotateGuard')) $('rotateGuard').classList.toggle('hidden', !portrait);
    if (!force) resetInput(); invalidate();
  }
  window.addEventListener('resize', () => resize()); window.addEventListener('orientationchange', () => resize());
  if (window.visualViewport) window.visualViewport.addEventListener('resize', () => resize());

  // ---------- Citta', schermate e sessione ----------
  const panels = { lobby: 'home', pause: 'menu', city: 'cityScreen', loadout: 'loadout', forge: 'forge', journal: 'journalScreen', settings: 'settings', guide: 'tips', loading: 'loading', error: 'appError' };
  const focusMemory = new Map(); let previousScreen = 'boot', loadToken = 0, failedLoad = null;
  let coachLayoutQueued = false, coachLayoutKey = '';
  const mode = () => ({ kind: coarse ? 'touch' : 'keyboard', movementSide: st.leftHanded ? 'right' : 'left' });
  // Due ancoraggi: sotto le informazioni laterali, oppure sopra il reticolo.
  // Le misure avvengono solo quando cambia un ingombro, non durante ogni frame.
  function positionCoach() {
    const coach = $('guideCoach');
    if (!active() || !coach || coach.classList.contains('hidden')) return;
    if (!s.quest && $('powerHud').classList.contains('hidden')) {
      coach.classList.remove('coach-fit');
      for (const property of ['width', 'left', 'right', 'top']) coach.style.removeProperty(property);
      delete coach.dataset.layout; return;
    }
    const rect = (id) => $(id).getBoundingClientRect();
    const left = rect('left'), info = rect('info'), supreme = rect('b4'), aim = rect('xh'), joyBox = rect('joy'), useBox = rect('useBtn');
    const hand = st.leftHanded, edge = hand ? left.right - 2 : left.left + 2;
    const room = hand ? edge - supreme.right - 10 : supreme.left - 10 - edge;
    const aimRoom = hand ? edge - aim.right - 6 : aim.left - 6 - edge;
    const width = Math.min(292, room, aimRoom);
    coach.classList.add('coach-fit'); coach.style.width = width + 'px'; coach.style.right = 'auto';
    coach.style.left = (hand ? edge - width : edge) + 'px';
    const bottom = Math.min(rect('b0').top, joyBox.width ? joyBox.top - 8 : Infinity, useBox.width ? useBox.top - 6 : Infinity);
    let top = left.bottom + 6, layout = 'side';
    if (top + coach.getBoundingClientRect().height > bottom) {
      layout = 'center';
      const gap = hand ? left.left - info.right : info.left - left.right, centerWidth = Math.min(224, gap - 16);
      coach.style.width = centerWidth + 'px'; coach.style.left = (W - centerWidth) / 2 + 'px';
      const boss = rect('boss'), cast = rect('bossCast');
      top = Math.max(left.top, boss.width ? boss.bottom + 6 : 0, cast.width && cast.height ? cast.bottom + 6 : 0);
    }
    coach.style.top = top + 'px'; coach.dataset.layout = layout;
  }
  function queueCoachLayout() {
    if (coachLayoutQueued) return;
    coachLayoutQueued = true;
    requestAnimationFrame(() => { coachLayoutQueued = false; positionCoach(); });
  }
  if (typeof ResizeObserver === 'function') {
    const observer = new ResizeObserver(queueCoachLayout);
    for (const id of ['guideCoach', 'left', 'info', 'boss', 'bossCast', 'joy', 'useBtn']) observer.observe($(id));
  }
  function renderCoach() {
    if (!guide || !$('guideCoach') || !s) return;
    const view = guide.view(s, mode());
    const visible = active() && view.visible && !window.__dite.lockQ;
    $('guideCoach').classList.toggle('hidden', !visible);
    const stepText = view.index + '/' + view.total + ' · ' + view.title;
    if ($('guideStep') && $('guideStep').textContent !== stepText) $('guideStep').textContent = stepText;
    if ($('guideText') && $('guideText').textContent !== (view.text || '')) $('guideText').textContent = view.text || '';
    const key = [visible, view.stepId, view.text, st.leftHanded, W, Hh, !!s.quest].join('|');
    if (key !== coachLayoutKey) { coachLayoutKey = key; if (visible) queueCoachLayout(); }
  }
  function suspendAudio() { audioWanted = false; if (rideGain) rideGain.gain.value = 0; audioTransition(ac, false); }
  function nativeState(value) { try { G.native.send({ v: 1, type: 'state', screen: value.screen, playing: value.playing }); } catch (error) { /* il gioco web resta autonomo */ } }
  function haptic(style) { if (!st.haptics || !active() || !G.native.available || !G.native.capabilities.haptics) return; try { G.native.send({ v: 1, type: 'haptic', style }); } catch (error) { /* facoltativo */ } }
  function applyScreen(value) {
    const changed = previousScreen !== value.screen;
    if (changed && document.activeElement && document.activeElement !== document.body) {
      focusMemory.set(previousScreen, document.activeElement);
      if (typing(document.activeElement)) document.activeElement.blur();
    }
    running = value.hasSession && !['lobby', 'city', 'loadout', 'loading', 'boot'].includes(value.screen);
    if (!value.playing || changed) resetInput();
    if (!value.playing) {
      suspendAudio(); sceneTimers.length = notices.length = 0; noticeLeft = noticePriority = 0; $('banner').className = '';
    }
    for (const [screen, id] of Object.entries(panels)) if ($(id)) { const visible = value.screen === screen; $(id).classList.toggle('hidden', !visible); $(id).setAttribute('aria-hidden', String(!visible)); }
    $('ui').classList.toggle('hidden', !value.playing);
    document.body.dataset.screen = value.screen;
    if (s && $('menuSub')) $('menuSub').textContent = (st.recipe.nome || 'Senza nome') + ' · ' + s.city.nome + ' · Fama ' + s.fame;
    renderBonuses(s && s.player, value.screen === 'pause');
    if (value.screen === 'pause') renderPowerDetails();
    renderHome(); renderCoach(); nativeState(value); last = performance.now(); invalidate();
    if (changed) {
      const remembered = focusMemory.get(value.screen), panel = $(panels[value.screen]);
      if (remembered && remembered.isConnected && panel && panel.contains(remembered) && !(coarse && typing(remembered))) remembered.focus({ preventScroll: true });
      else if (panel) {
        const heading = $(panel.getAttribute('aria-labelledby'));
        const first = heading || panel.querySelector('button:not([disabled]),[tabindex="0"]');
        if (first) { if (first === heading) first.tabIndex = -1; first.focus({ preventScroll: true }); }
      }
      else if (value.playing) { canvas.tabIndex = -1; canvas.focus({ preventScroll: true }); }
    }
    previousScreen = value.screen;
  }
  function loadCity(theme, seed) {
    if (!City.THEMES[theme] || !Number.isInteger(seed) || seed < 1 || seed > 99999) return false;
    const next = C.create({ seed, theme, recipe: st.recipe, fame: st.fame });
    const oldState = s, oldScene = G.scene;
    resetInput(); graphicsReady = false; sceneEpoch++; sceneTimers.length = notices.length = 0; noticeLeft = noticePriority = 0; $('banner').className = ''; pend.clear();
    try {
      G.buildWorld(next.city); G.buildFx(next); G.buildAnim(next); G.buildPowerFx(next);
    } catch (error) {
      if (G.scene && G.scene !== oldScene) G.disposeWorld(G.scene);
      // I dati di partita precedenti rimangono in RAM; Ricostruisci riprova solo la grafica.
      s = oldState; G.scene = oldScene; renderPass.scene = oldScene || new THREE.Scene(); throw error;
    }
    if (oldScene && oldScene !== G.scene) G.disposeWorld(oldScene);
    s = next; renderPass.scene = G.scene; graphicsReady = true;
    drawBase(); setupButtons(); for (const k in txtCache) delete txtCache[k]; for (const k in clsCache) delete clsCache[k];
    yaw = Math.PI / 2; pitch = 0.04; acc = 0; shake = 0; hitStop = 0; bobT = 0; visualTime = 0; beamT = drainT = 0;
    st.theme = theme; st.seed = seed; app.setSession(false); invalidate(); return true;
  }
  function begin() {
    if (!s || !graphicsReady || app.snapshot().blockers.length || app.snapshot().screen === 'loading') return false;
    const first = !app.snapshot().hasSession;
    app.setSession(true); app.go('playing'); resetInput(); last = performance.now(); initAudio();
    if (first) banner(s.city.nome, s.city.theme.sotto, '');
    if (guide && st.onboarding && !st.onboarding.skipped && st.onboarding.step < 5 && !window.__dite.lockQ) guide.start(s, { mode: mode().kind });
    invalidate(); return true;
  }
  function openMenu() { if (app.snapshot().hasSession) app.go('pause'); }
  function setRecipe(raw) {
    const r = DiteStorage.recipe(raw, B); if (!r || B.cost(r) > B.budgetFor(B.levelFor(st.fame))) return false;
    if (s && !C.setRecipe(s, r)) return false;
    st.recipe = r; G.save(); if (s) { setupButtons(); for (const k in txtCache) delete txtCache[k]; for (const k in clsCache) delete clsCache[k]; }
    resetInput(); renderHome(); invalidate(); return true;
  }
  function openForge() {
    if (app.snapshot().screen === 'forge') return;
    app.go('forge'); G.forge.open(st.recipe, B.levelFor(st.fame), (r) => { if (setRecipe(r)) app.back(); }, () => app.back()); invalidate();
  }
  function navigate(screen) {
    if (app.snapshot().screen === 'loading') return false;
    if (screen === 'back') app.back(); else if (screen === 'forge') openForge(); else if (screen === 'playing') return begin(); else if (screen === 'pause') openMenu(); else app.go(screen);
    return true;
  }
  function rebuild(theme, seed) {
    if (app.snapshot().screen === 'loading' || !City.THEMES[theme] || !Number.isInteger(seed) || seed < 1 || seed > 99999) return false;
    const token = ++loadToken, back = app.snapshot().screen === 'city' ? 'city' : 'lobby'; failedLoad = { theme, seed };
    app.go('loading'); if ($('loadingTitle')) $('loadingTitle').textContent = 'Preparo ' + City.THEMES[theme].nome;
    if ($('loadingDetail')) $('loadingDetail').textContent = 'Strade, abitanti e incontri prendono posto.';
    // Due fotogrammi lasciano dipingere il caricamento prima della generazione sincrona.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (token !== loadToken) return;
      try { if (!loadCity(theme, seed)) throw new Error('Città non valida'); G.save(); failedLoad = null; app.go(back); }
      catch (error) { showError('La città non si è aperta', 'Il tuo profilo è al sicuro. Riprova a preparare la città.', error); }
    })); return true;
  }
  function showError(title, detail, error) {
    resetInput(); app.go('error'); if ($('errorTitle')) $('errorTitle').textContent = title; if ($('errorDetail')) $('errorDetail').textContent = detail;
    if (window.__dite) window.__dite.lastError = error && error.message || String(error || '');
  }
  function applyPreferences() {
    muted = st.muted; G.renderPrefs = { quality: st.quality, reducedMotion: st.reducedMotion, reducedFlash: st.reducedFlash };
    if (st.reducedMotion) { shake = kick = bobT = 0; fov = W > Hh ? 72 : 92; cam.fov = fov; cam.updateProjectionMatrix(); }
    if (appliedQuality !== st.quality) {
      appliedQuality = st.quality; pxr = Math.min(window.devicePixelRatio || 1, st.quality === 'performance' ? 1 : coarse ? 1.5 : 2);
      useBloom = st.quality !== 'performance'; bloom.enabled = useBloom; slowT = 0;
      renderer.setPixelRatio(pxr); composer.setPixelRatio(pxr); resize(true);
    }
    document.body.classList.toggle('left-handed', st.leftHanded); document.body.classList.toggle('reduce-motion', st.reducedMotion); document.body.classList.toggle('reduce-flash', st.reducedFlash);
    if (master) master.gain.value = muted ? 0 : st.volume;
    if ($('sens')) $('sens').value = Math.round(st.sens * 100); if ($('sensV')) $('sensV').textContent = Math.round(st.sens * 100) + '%';
    renderHome(); renderCoach(); invalidate();
  }
  function setPreference(key, value) {
    if (!Object.prototype.hasOwnProperty.call(DiteStorage.PREFS, key)) return false;
    const normalized = DiteStorage.normalize({ ...st, [key]: value }, B); st[key] = normalized[key];
    if (key === 'leftHanded' || key === 'invertY' || key === 'sens') resetInput();
    applyPreferences(); G.save(); return true;
  }
  function startGuide(restart) {
    if (!guide || !s) return;
    if (guide.start(s, { restart: !!restart, mode: mode().kind })) { st.onboarding = guide.snapshot(); G.save(); }
    begin(); renderCoach();
  }
  const actions = { play: begin, resume: begin, menuBtn: openMenu, openForge, menuForge: openForge, menuHome: () => navigate('lobby'), menuTips: () => navigate('guide'), openGuide: () => navigate('guide'), tipsOk: () => { st.tips = true; G.save(); navigate('back'); }, mute: () => setPreference('muted', !st.muted), menuMute: () => setPreference('muted', !st.muted), newCity: () => rebuild(st.theme, 1 + Math.floor(Math.random() * 99999)), guideStart: () => startGuide(false), guideRestart: () => startGuide(true), guideSkip: () => { if (guide) guide.skip(); renderCoach(); }, guideHelp: () => { app.go('pause'); navigate('guide'); }, errorRetry: () => { if (failedLoad) rebuild(failedLoad.theme, failedLoad.seed); else if (!app.snapshot().blockers.includes('context')) rebuild(st.theme, st.seed); } };
  document.addEventListener('click', (event) => {
    const target = event.target.closest && event.target.closest('button,[data-nav],[data-app-action],[data-city]'); if (!target || target.disabled) return;
    if (actions[target.id]) { actions[target.id](); return; }
    if (target.dataset.nav) { navigate(target.dataset.nav); return; }
    if (target.dataset.city && target.dataset.city !== st.theme) { rebuild(target.dataset.city, st.seed); return; }
    const action = target.dataset.appAction;
    if (action === 'enter') begin(); else if (action === 'new-city') actions.newCity(); else if (action === 'retry') actions.errorRetry();
    else if (action === 'reset-settings') { for (const [key, value] of Object.entries(DiteStorage.PREFS)) st[key] = value; setPreference('quality', st.quality); }
  });
  document.addEventListener('input', (event) => {
    const target = event.target; if (target.id === 'sens') setPreference('sens', Number(target.value) / 100);
    else if (target.dataset && target.dataset.pref) setPreference(target.dataset.pref, target.type === 'checkbox' ? target.checked : target.type === 'range' ? Number(target.value) : target.value);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab' || active()) return;
    const panel = app.snapshot().blockers.includes('portrait') ? $('rotateGuard') : $(panels[app.snapshot().screen]); if (!panel) return;
    const items = Array.from(panel.querySelectorAll('summary,button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex="0"]')).filter((el) => el.getClientRects().length);
    if (!items.length) { event.preventDefault(); return; }
    const index = items.indexOf(document.activeElement); if (event.shiftKey && index <= 0) { items[items.length - 1].focus(); event.preventDefault(); } else if (!event.shiftKey && (index < 0 || index === items.length - 1)) { items[0].focus(); event.preventDefault(); }
  });
  document.addEventListener('visibilitychange', () => app.setBlocker('hidden', document.hidden));
  window.addEventListener('blur', () => { resetInput(); app.suspend('blur'); suspendAudio(); });
  window.addEventListener('pagehide', () => { app.setBlocker('pagehide', true); resetInput(); suspendAudio(); G.save(); });
  window.addEventListener('pageshow', () => { app.setBlocker('pagehide', false); app.setBlocker('hidden', document.hidden); invalidate(); });
  canvas.addEventListener('webglcontextlost', (event) => { event.preventDefault(); app.setBlocker('context', true); showError('La grafica si è fermata', 'Attendi che il dispositivo ripristini la grafica, poi riprendi.', new Error('WebGL context lost')); });
  canvas.addEventListener('webglcontextrestored', () => { app.setBlocker('context', false); if (s) { applyPreferences(); app.go(app.snapshot().hasSession ? 'pause' : 'lobby'); invalidate(); } });
  G.native.subscribe((message) => app.setBlocker('native', !message.active));
  G.storage.subscribe(() => renderHome()); app.subscribe(applyScreen);
  if (G.shell) G.shell.init({ onEquip: (r) => { if (setRecipe(r)) toast('Kit equipaggiato'); } });
  if (!coarse) document.body.classList.add('desk');
  window.__dite = { G, Core: C, Bricks: B, state: () => s, press, use: pressUse, cam: () => ({ yaw, pitch }), setLook: (y, p) => { if (Number.isFinite(y) && Number.isFinite(p)) { yaw = y; pitch = Math.max(-1.25, Math.min(1.25, p)); invalidate(); } }, begin, loadCity, setRecipe, store: st,
    screen: () => app.snapshot(), navigate, invalidate, renderOnce, setPreference, inputSnapshot: () => ({ keys: Array.from(keys), joy: { ...joy }, look: { ...look }, primary: { ...zp }, fireBtn, fireMouse, fresh: fresh.slice(), buf: buf.slice(), useFresh, useBuf, input: { ...inp, b: inp.b.slice() } }),
    info: () => ({ pxr, useBloom, calls: renderer.info.render.calls, tris: renderer.info.render.triangles, geo: renderer.info.memory.geometries, tex: renderer.info.memory.textures, renderFrames, lastRender, scheduledEffects: sceneTimers.length, audio: ac ? ac.state : 'uninitialized', ...G.fxInfo && G.fxInfo() }) };
  app.setBlocker('native', !G.native.active); app.setBlocker('hidden', document.hidden);
  try { loadCity(st.theme, st.seed); applyPreferences(); resize(); app.go('lobby'); if (G.storage.isNew) G.save(); invalidate(); }
  catch (error) { failedLoad = { theme: st.theme, seed: st.seed }; showError('La città non si è aperta', 'Riprova. Il tuo profilo resta disponibile su questo dispositivo.', error); }
};
