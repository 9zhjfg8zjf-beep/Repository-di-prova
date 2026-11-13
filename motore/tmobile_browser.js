// Percorsi mobili e interruzioni attraversano DOM/input reali, non soltanto il router puro.
'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs');
const { chromium } = require('./pw.js'), B = require('./bricks.js'), Storage = require('./storage.js');
const selected = (process.argv[2] || 'all').split(','), available = ['all', 'audio', 'bootstrap', 'coach', 'navigation', 'input', 'storage', 'loading', 'journal', 'bonuses', 'counter'];
for (const name of selected) assert.ok(available.includes(name), 'scenario mobile sconosciuto: ' + name);
const wants = name => selected.includes('all') || selected.includes(name);
const profile = Storage.normalize({ recipe: { nome: 'Prova mobile', slots: ['dardo', 'scatto', 'nova', 'nova', 'ira'].map(id => ({ id, el: 'luce', t: 1 })) }, fame: 80, seed: 14, tips: true, onboarding: { version: 1, step: 5, skipped: false }, muted: true }, B);
const empty = input => {
  assert.deepEqual(input.keys, []); assert.equal(input.joy.id, null); assert.equal(input.joy.x, 0); assert.equal(input.joy.y, 0); assert.equal(input.look.id, null); assert.equal(input.primary.id, null);
  assert.equal(input.fireBtn, false); assert.equal(input.fireMouse, false); assert.ok(input.buf.every(x => x === 0)); assert.ok(input.fresh.every(x => x === false)); assert.equal(input.useBuf, 0); assert.equal(input.useFresh, false);
  assert.equal(Math.abs(input.input.mx), 0); assert.equal(Math.abs(input.input.my), 0); assert.equal(input.input.fire, false); assert.equal(input.input.use, false); assert.ok(input.input.b.every(x => x === false));
};
// Fixture condivisa: gli operatori creano sei stati, il colpo assorbito crea la banca.
const sevenPowerStates = () => {
  const D = window.__dite, s = D.state(), p = s.player, C = D.Core, A = s.city.arenas[0];
  Object.assign(p, { x: A.x + 10, z: A.z + 7, yaw: Math.PI / 2, pitch: 0 }); D.setLook(p.yaw, 0);
  s.mobs = []; s.shots = []; s.zones = []; s.patrols = [];
  const target = C.mkMob(s, 'tiratore', p.x - 3, p.z, 'e'), other = C.mkMob(s, 'sgherro', p.x - 6, p.z + 2, 'e');
  for (const e of [target, other]) Object.assign(e, { spawn: 0, atk: 999, root: 999, hp: 800, maxHp: 800 });
  const run = (program, tgt) => C.run(s, D.Bricks.parseProg(program), { K: { el: 'gelo' }, slot: 2, depth: tgt ? 1 : 0, tgt });
  const results = { absorb: run('absorb t20 r3 cap120'), mimic: run('mimic g24 t20', target), form: run('form size0.6 t20'), stasis: run('stasis g24 t12', target), scan: run('scan r32 t20'), clone: run('clone n2 t20') };
  s.shots.push({ id: s.nextId++, team: 'e', x: p.x, z: p.z - 2, dmg: 75, vx: 0, vz: 12, r: .3, life: 5, el: 'gelo', hom: '' });
  return results;
};
(async () => {
  fs.mkdirSync(__dirname + '/shots', { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    if (wants('audio')) {
      const controlled = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
      await controlled.addInitScript(profile => {
        localStorage.setItem('dite2', JSON.stringify(profile));
        const audit = window.__controlledAudio = {
          context: null, calls: [], pending: [], fuse: 0, modes: { resume: 'normal', suspend: 'normal' },
          phase(modes) { this.modes = { resume: 'normal', suspend: 'normal', ...modes }; this.calls = []; this.fuse = 0; },
          snapshot() { return { state: this.context && this.context.state, calls: this.calls.slice(), pending: this.pending.map(value => value.kind), fuse: this.fuse }; },
          finish(kind) { const index = this.pending.findIndex(value => value.kind === kind); if (index < 0) throw new Error('Nessuna promessa audio ' + kind); const task = this.pending.splice(index, 1)[0]; this.context.state = kind === 'resume' ? 'running' : 'suspended'; task.resolve(); },
        };
        const parameter = () => ({ value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} });
        const node = () => ({ gain: parameter(), frequency: parameter(), Q: parameter(), connect() {}, start() {}, stop() {} });
        class ControlledAudioContext {
          constructor() { this.state = 'suspended'; this.sampleRate = 64; this.currentTime = 0; this.destination = {}; audit.context = this; }
          createGain() { return node(); } createOscillator() { return node(); } createBiquadFilter() { return node(); } createBufferSource() { return node(); }
          createBuffer(channels, length) { return { getChannelData: () => new Float32Array(length) }; }
          transition(kind) {
            audit.calls.push(kind);
            // Il negativo deve fallire con un contatore, senza affamare il browser di microtask.
            if (audit.calls.filter(value => value === kind).length >= 8) { audit.fuse++; return Promise.reject(new Error('Fusibile audio: otto tentativi nello stesso caso')); }
            if (audit.modes[kind] === 'defer') return new Promise(resolve => audit.pending.push({ kind, resolve }));
            if (audit.modes[kind] === 'reject') return Promise.reject(new Error('Audio non disponibile'));
            if (audit.modes[kind] !== 'unchanged') this.state = kind === 'resume' ? 'running' : 'suspended';
            return Promise.resolve();
          }
          resume() { return this.transition('resume'); } suspend() { return this.transition('suspend'); }
        }
        window.AudioContext = window.webkitAudioContext = ControlledAudioContext;
      }, profile);
      const page = await controlled.newPage(), errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(process.env.DITE_MOBILE_URL || 'file://' + __dirname + '/dist/index.html');
      await page.waitForFunction(() => window.__dite && window.__dite.screen().screen === 'lobby');
      const screen = name => page.waitForFunction(name => window.__dite.screen().screen === name, name);
      const phase = modes => page.evaluate(modes => window.__controlledAudio.phase(modes), modes);
      // Il timer prova che il ciclo restituisce il controllo a un task successivo.
      const snapshot = () => page.evaluate(() => new Promise(resolve => setTimeout(() => resolve({ ...window.__controlledAudio.snapshot(), screen: window.__dite.screen() }), 0)));
      const resume = async () => { await page.locator(await page.locator('#play').isVisible() ? '#play' : '#resume').tap(); await screen('playing'); };
      const pause = async () => { await page.locator('#menuBtn').tap(); await screen('pause'); };
      const count = (value, kind) => value.calls.filter(call => call === kind).length;
      for (const mode of ['unchanged', 'reject']) {
        // Un documento nuovo evita che una sospensione precedente aggiunga una riconciliazione legittima.
        if (mode === 'reject') { await page.reload(); await page.waitForFunction(() => window.__dite && window.__dite.screen().screen === 'lobby'); }
        await phase({ resume: mode }); await resume();
        let value = await snapshot();
        assert.equal(count(value, 'resume'), 1, mode + ': una ripresa senza effetto non deve ritentare lo stesso intento: ' + JSON.stringify(value));
        assert.equal(value.fuse, 0); assert.equal(value.state, 'suspended'); assert.equal(value.screen.playing, true);
        await pause(); await phase({}); await resume();
        assert.equal((await snapshot()).state, 'running', 'Controllo positivo: la ripresa accettata deve avviare davvero l’audio');
        await phase({ suspend: mode }); await pause(); value = await snapshot();
        assert.equal(count(value, 'suspend'), 1, mode + ': una sospensione senza effetto non deve ritentare lo stesso intento: ' + JSON.stringify(value));
        assert.equal(value.fuse, 0); assert.equal(value.state, 'running'); assert.equal(value.screen.playing, false);
        // Ripristina il contesto con gli stessi comandi reali, senza forzare lo stato del router.
        await phase({}); await resume(); await pause(); assert.equal((await snapshot()).state, 'suspended');
      }
      await page.reload(); await page.waitForFunction(() => window.__dite && window.__dite.screen().screen === 'lobby');
      await phase({ resume: 'defer' }); await resume();
      assert.deepEqual((await snapshot()).pending, ['resume']); await pause();
      await page.evaluate(() => window.__controlledAudio.finish('resume'));
      let value = await snapshot();
      assert.equal(value.state, 'suspended', 'Una vecchia ripresa completata dopo Pausa deve essere sospesa');
      assert.equal(value.screen.screen, 'pause'); assert.equal(value.screen.playing, false); assert.equal(count(value, 'resume'), 1); assert.deepEqual(value.pending, []); assert.equal(value.fuse, 0);
      const pausedCalls = value.calls;
      await page.waitForTimeout(100); assert.deepEqual((await snapshot()).calls, pausedCalls, 'Nessuna ripartenza audio involontaria durante la pausa');
      await phase({}); await resume(); await phase({ suspend: 'defer' }); await pause(); await resume();
      const before = await snapshot(); assert.ok(before.pending.length > 0 && before.pending.every(kind => kind === 'suspend'));
      const reconciled = await page.evaluate(async () => { const audit = window.__controlledAudio, states = []; while (audit.pending.length) { audit.finish('suspend'); await new Promise(resolve => setTimeout(resolve, 0)); states.push(audit.snapshot()); } return states; });
      assert.equal(reconciled.length, before.pending.length);
      for (const state of reconciled) { assert.equal(state.state, 'running', 'Ogni vecchia sospensione deve riconciliare la ripresa prima della promessa successiva'); assert.equal(state.fuse, 0); }
      value = await snapshot();
      assert.equal(value.state, 'running', 'Una vecchia sospensione deve rispettare la ripresa esplicita successiva');
      assert.equal(value.screen.playing, true); assert.deepEqual(value.pending, []); assert.equal(value.fuse, 0);
      assert.ok(count(value, 'resume') > count(before, 'resume') && count(value, 'resume') <= count(before, 'resume') + before.pending.length, 'Ogni promessa vecchia puo riconciliare il nuovo intento una volta');
      await phase({}); await pause(); assert.equal((await snapshot()).state, 'suspended');
      assert.deepEqual(errors, []); await controlled.close();
      console.log('audio: tap reali, resume/suspend senza effetto o rifiutati finiti, promesse tardive riconciliate e nessuna ripresa involontaria');
      if (selected.length === 1 && selected[0] === 'audio') { console.log('nessun errore'); return; }
    }
    if (wants('bootstrap')) {
      const broken = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
      await broken.addInitScript(profile => {
        const attempt = Number(sessionStorage.getItem('dite-bootstrap-attempt') || 0) + 1; sessionStorage.setItem('dite-bootstrap-attempt', String(attempt));
        window.__bootstrapMessages = []; window.__bootstrapFrames = 0; window.__bootstrapWebglCalls = 0;
        window.__DITE_HOST__ = { v: 1, platform: 'ios', active: true, storage: profile, capabilities: {} };
        window.webkit = { messageHandlers: { dite: { postMessage(message) { window.__bootstrapMessages.push(message); } } } };
        const frame = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = fn => frame(time => { window.__bootstrapFrames++; fn(time); });
        const context = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (kind, ...args) { if (['webgl', 'webgl2', 'experimental-webgl'].includes(kind)) { window.__bootstrapWebglCalls++; if (attempt === 1) return null; } return context.call(this, kind, ...args); };
      }, profile);
      const page = await broken.newPage(), pageErrors = []; page.on('pageerror', e => pageErrors.push(e.message));
      await page.goto(process.env.DITE_MOBILE_URL || 'file://' + __dirname + '/dist/index.html');
      await page.waitForFunction(() => window.__bootstrapMessages.some(m => m.type === 'state' && m.screen === 'error' && m.playing === false));
      assert.equal(await page.locator('#appError').isVisible(), true); assert.match(await page.locator('#errorDetail').innerText(), /WebGL/);
      const failed = await page.evaluate(() => ({ messages: window.__bootstrapMessages, frames: window.__bootstrapFrames, webgl: window.__bootstrapWebglCalls, simulation: !!window.__dite, retry: !document.getElementById('errorRetry').disabled }));
      assert.ok(failed.webgl > 0); assert.equal(failed.simulation, false); assert.equal(failed.retry, true);
      assert.equal(failed.messages[0].type, 'ready'); assert.equal(failed.messages.filter(m => m.type === 'ready').length, 1);
      assert.ok(failed.messages.findIndex(m => m.type === 'state' && m.screen === 'error') > 0, 'Il contenitore nativo riceve subito ready e poi errore, senza il timeout iniziale');
      await page.waitForTimeout(240); assert.equal(await page.evaluate(() => window.__bootstrapFrames), failed.frames, 'Nessun loop grafico deve girare senza WebGL');
      await page.screenshot({ path: __dirname + '/shots/mobile-bootstrap-webgl.png' });
      await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.locator('#errorRetry').tap()]);
      await page.waitForFunction(() => window.__dite && window.__dite.screen().screen === 'lobby' && window.__dite.info().renderFrames > 0);
      assert.equal(await page.evaluate(() => sessionStorage.getItem('dite-bootstrap-attempt')), '2');
      assert.equal(await page.locator('#appError').isVisible(), false); assert.ok(await page.evaluate(() => window.__dite.info().renderFrames > 0));
      assert.equal(await page.evaluate(() => window.__bootstrapMessages.filter(m => m.type === 'ready').length), 1);
      assert.deepEqual(pageErrors, [], 'Il fallimento WebGL deve essere gestito senza eccezioni JavaScript'); await broken.close();
      console.log('bootstrap: WebGL assente notifica ready/error nativi, nessun loop, retry ricarica e avvia davvero');
      if (selected.length === 1 && selected[0] === 'bootstrap') { console.log('nessun errore'); return; }
    }
    if (wants('coach')) {
      const fresh = await browser.newContext({ viewport: { width: 667, height: 375 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
      const page = await fresh.newPage(), errors = [];
      page.on('pageerror', error => errors.push(error.message)); page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      await page.goto(process.env.DITE_MOBILE_URL || 'file://' + __dirname + '/dist/index.html');
      await page.waitForFunction(() => window.__dite && window.__dite.screen().screen === 'lobby');
      await page.evaluate(() => { const style = document.documentElement.style; style.setProperty('--sl', '44px'); style.setProperty('--sr', '44px'); style.setProperty('--sb', '21px'); });
      assert.equal(await page.evaluate(() => !!window.__dite.lockQ), false, 'Il primo ingresso deve usare la guida vera');
      await page.locator('#play').tap(); await page.waitForFunction(() => window.__dite.screen().playing);
      const cdp = await fresh.newCDPSession(page);
      await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
      for (const font of ['system', 'dejavu']) for (const leftHanded of [false, true]) {
        await page.evaluate(font => { if (font === 'system') document.documentElement.style.removeProperty('--ui'); else document.documentElement.style.setProperty('--ui', '"DejaVu Sans",sans-serif'); return document.fonts.ready; }, font);
        if (await page.evaluate(leftHanded => window.__dite.store.leftHanded !== leftHanded, leftHanded)) {
          await page.locator('#menuBtn').tap(); await page.locator('#menuSettings').tap();
          await page.locator('[data-settings-tab="controls"]').tap(); await page.locator('[data-pref="leftHanded"]').setChecked(leftHanded);
          await page.locator('#settings [data-nav="back"]').tap(); await page.locator('#resume').tap();
        }
        await page.waitForFunction(() => !document.getElementById('guideCoach').classList.contains('hidden') && document.getElementById('guideStep').textContent.includes('Cammina'));
        assert.ok((await page.locator('#guideText').textContent()).includes(leftHanded ? 'destra' : 'sinistra'));
        const x = leftHanded ? 557 : 110;
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: 314, id: 31 }] });
        const layout = await page.evaluate(() => {
          const D = window.__dite, coach = document.getElementById('guideCoach').getBoundingClientRect(), joy = document.getElementById('joy').getBoundingClientRect();
          const visible = node => { const style = getComputedStyle(node), r = node.getBoundingClientRect(); return style.display !== 'none' && style.visibility !== 'hidden' && r.width > 0 && r.height > 0; };
          const collisions = []; for (const id of ['quest', 'joy', 'b0', 'b1', 'b2', 'b3', 'b4', 'useBtn']) { const node = document.getElementById(id), r = node.getBoundingClientRect(); if (visible(node) && Math.min(coach.right, r.right) > Math.max(coach.left, r.left) && Math.min(coach.bottom, r.bottom) > Math.max(coach.top, r.top)) collisions.push(id); }
          const labels = Array.from(document.querySelectorAll('#btns .nm')).map(node => { const style = getComputedStyle(node); return { name: node.textContent, clientWidth: node.clientWidth, scrollWidth: node.scrollWidth, font: style.font, fontSize: Number.parseFloat(style.fontSize), padding: style.padding, width: node.getBoundingClientRect().width }; });
          const clippedLabels = labels.filter(node => node.scrollWidth > node.clientWidth + 1).map(node => node.name);
          return { collisions, clippedLabels, labels, coach: coach.toJSON(), joy: joy.toJSON(), pointer: D.inputSnapshot().joy.id, leftHanded: D.store.leftHanded, quest: !!D.state().quest, questHidden: !visible(document.getElementById('quest')), questNone: document.getElementById('quest').classList.contains('none') };
        });
        const documentNode = await cdp.send('DOM.getDocument'), labelNode = await cdp.send('DOM.querySelector', { nodeId: documentNode.root.nodeId, selector: '#b4 .nm' });
        const actualFonts = (await cdp.send('CSS.getPlatformFontsForNode', { nodeId: labelNode.nodeId })).fonts;
        const diagnostic = JSON.stringify({ font, leftHanded, actualFonts, labels: layout.labels });
        // Conserva la foto anche quando un font del runner rivela un nome tagliato.
        await page.screenshot({ path: __dirname + '/shots/mobile-coach-' + (leftHanded ? 'mancino' : 'destro') + (font === 'dejavu' ? '-dejavu' : '') + '.png' });
        if (font === 'dejavu') assert.ok(actualFonts.length > 0 && actualFonts.every(value => value.familyName === 'DejaVu Sans') && actualFonts.some(value => value.glyphCount > 0), 'La regressione richiede DejaVu Sans reale, non un fallback: ' + diagnostic);
        assert.equal(layout.leftHanded, leftHanded); assert.notEqual(layout.pointer, null); assert.ok(layout.joy.width > 0 && layout.joy.height > 0);
        assert.equal(layout.quest, false); assert.equal(layout.questNone, true); assert.equal(layout.questHidden, true, 'Il suggerimento missione lascia spazio alla guida iniziale');
        assert.deepEqual(layout.collisions, [], 'La guida deve restare distinta dal joystick e da tutti i comandi: ' + diagnostic); assert.deepEqual(layout.clippedLabels, [], 'I nomi dei cinque poteri iniziali devono essere interi: ' + diagnostic);
        assert.ok(layout.labels.every(value => value.fontSize >= 11), 'I nomi non devono restringersi per entrare: ' + diagnostic);
        assert.ok(layout.coach.left >= 44 && layout.coach.right <= 623 && layout.coach.top >= 0 && layout.coach.bottom <= 354, 'Guida dentro la safe area a667');
        console.log('coach font:', diagnostic);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      }
      await page.locator('#guideSkip').tap();
      await page.waitForFunction(() => document.getElementById('guideCoach').classList.contains('hidden') && window.__dite.store.onboarding.skipped);
      assert.equal(await page.locator('#quest.none').isVisible(), true); assert.match(await page.locator('#qLine').textContent(), /Cerca chi ha un !/);
      assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('dite2')).onboarding.skipped), true);
      await page.screenshot({ path: __dirname + '/shots/mobile-coach-saltato.png' });
      // La guida si può riavviare durante una missione: conserva il contratto e il suo HUD.
      await page.evaluate(() => {
        const D = window.__dite, s = D.state(), p = s.player, giver = s.givers[0];
        giver.offer = { type: 'consegna', ...D.Core.QINFO.consegna, fama: D.Core.QINFO.consegna.fama + 2 * s.level }; giver.cool = 0;
        p.x = giver.x + 2.5; p.z = giver.z + 1; D.setLook(Math.atan2(giver.x - p.x, giver.z - p.z) + Math.PI, 0);
      });
      await page.waitForFunction(() => window.__dite.state().hint.use?.kind === 'giver');
      await page.locator('#useBtn').tap();
      await page.waitForFunction(() => window.__dite.state().quest?.type === 'consegna');
      const accepted = await page.evaluate(() => {
        const q = window.__dite.state().quest; window.__coachQuest = q;
        return { type: q.type, giver: q.giver, obj: { ...q.obj }, time: q.time };
      });
      for (const dense of [false, true]) for (const leftHanded of [false, true]) {
        await page.locator('#menuBtn').tap();
        if (await page.evaluate(left => window.__dite.store.leftHanded !== left, leftHanded)) {
          await page.locator('#menuSettings').tap(); await page.locator('[data-settings-tab="controls"]').tap();
          await page.locator('[data-pref="leftHanded"]').setChecked(leftHanded);
          await page.locator('#settings [data-nav="back"]').tap();
        }
        await page.locator('#menuTips').tap(); await page.locator('#guideRestart').tap();
        await page.waitForFunction(() => window.__dite.screen().playing && !document.getElementById('guideCoach').classList.contains('hidden') && document.getElementById('guideStep').textContent.includes('Cammina'));
        if (dense) {
          assert.equal(await page.evaluate(() => window.__dite.setRecipe(window.__dite.state().recipe)), true);
          const states = await page.evaluate(sevenPowerStates);
          assert.ok(Object.values(states).every(value => value === true));
          await page.waitForFunction(() => window.__dite.state().player.bank === 75);
          await page.evaluate(() => { const D = window.__dite, s = D.state(); D.Core.wakeBoss(s, 0); D.Core.bossCast(s, s.boss, 'pioggia'); });
          await page.waitForFunction(() => !document.getElementById('boss').classList.contains('hidden') && document.getElementById('bossCast').textContent === window.__dite.Bricks.ATK.pioggia.nome);
        }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: leftHanded ? 557 : 110, y: 314, id: 41 }] });
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const restarted = await page.evaluate(() => {
          const D = window.__dite, s = D.state(), q = s.quest, p = s.player;
          const rects = Object.fromEntries(['guideCoach', 'quest', 'joy', 'b0', 'b1', 'b2', 'b3', 'b4', 'useBtn', 'guideSkip', 'guideHelp', 'xh', 'boss', 'bossCast', 'banner'].map(id => {
            const node = document.getElementById(id), r = node.getBoundingClientRect(), style = getComputedStyle(node);
            return [id, { ...r.toJSON(), visible: style.display !== 'none' && style.visibility !== 'hidden' && r.width > 0 && r.height > 0 }];
          }));
          const coach = rects.guideCoach, collisions = [];
          for (const id of ['quest', 'joy', 'b0', 'b1', 'b2', 'b3', 'b4', 'useBtn', 'xh', 'boss', 'bossCast']) {
            const r = rects[id];
            if (r.visible && Math.min(coach.right, r.right) > Math.max(coach.left, r.left) && Math.min(coach.bottom, r.bottom) > Math.max(coach.top, r.top)) collisions.push(id);
          }
          const clipped = ['guideStep', 'guideText', 'guideSkip', 'guideHelp'].filter(id => { const node = document.getElementById(id); return node.scrollWidth > node.clientWidth + 1 || node.scrollHeight > node.clientHeight + 1; });
          const livePowers = { bank: p.bank, absorb: !!p.absorb, mimic: p.mimic && p.mimic.attack, form: p.form && p.form.size, captive: !!p.captive, scan: !!p.scan, clones: s.mobs.filter(e => e.cloned && !e.dead).length };
          return { rects, collisions, clipped, layout: document.getElementById('guideCoach').dataset.layout, livePowers, boss: s.boss && { key: s.boss.key, cast: s.boss.cast, attackSerial: s.boss.attackSerial }, banner: { text: document.getElementById('banner').textContent, opacity: getComputedStyle(document.getElementById('banner')).opacity }, leftHanded: D.store.leftHanded, pointer: D.inputSnapshot().joy.id, checkpoint: D.store.onboarding, sameQuest: q === window.__coachQuest, quest: q && { type: q.type, giver: q.giver, obj: { ...q.obj }, time: q.time }, questText: document.getElementById('qLine').textContent, questNone: document.getElementById('quest').classList.contains('none') };
        });
        await page.screenshot({ path: __dirname + '/shots/mobile-coach-' + (dense ? 'denso-' : 'missione-') + (leftHanded ? 'mancino' : 'destro') + '.png' });
        const diagnostic = JSON.stringify(restarted);
        assert.equal(restarted.leftHanded, leftHanded); assert.notEqual(restarted.pointer, null);
        assert.equal(restarted.sameQuest, true, 'Ricomincia deve conservare la missione già accettata: ' + diagnostic);
        assert.deepEqual({ type: restarted.quest.type, giver: restarted.quest.giver, obj: restarted.quest.obj }, { type: accepted.type, giver: accepted.giver, obj: accepted.obj });
        assert.ok(restarted.quest.time > 0 && restarted.quest.time <= accepted.time, 'La missione deve restare attiva con il proprio tempo');
        assert.equal(restarted.checkpoint.step, 0); assert.equal(restarted.checkpoint.skipped, false);
        assert.equal(restarted.questNone, false); assert.equal(restarted.rects.quest.visible, true); assert.ok(restarted.questText.length > 0);
        assert.deepEqual(restarted.collisions, [], 'Guida riavviata, missione, joystick e comandi devono restare distinti: ' + diagnostic);
        assert.deepEqual(restarted.clipped, [], 'Testo e azioni della guida devono essere interi: ' + diagnostic);
        if (dense) {
          assert.equal(restarted.layout, 'center', 'Il caso denso deve esercitare il secondo ancoraggio');
          assert.deepEqual(restarted.livePowers, { bank: 75, absorb: true, mimic: 'tiro', form: .6, captive: true, scan: true, clones: 2 });
          assert.ok(restarted.rects.boss.visible && restarted.rects.bossCast.visible && restarted.boss.attackSerial > 0 && restarted.boss.cast.length > 0);
        }
        const coach = restarted.rects.guideCoach;
        assert.ok(coach.left >= 44 && coach.right <= 623 && coach.top >= 0 && coach.bottom <= 354, 'Guida riavviata dentro la safe area: ' + diagnostic);
        for (const id of ['guideSkip', 'guideHelp']) assert.ok(restarted.rects[id].width >= 44 && restarted.rects[id].height >= 44, 'Azione guida raggiungibile con un bersaglio di almeno 44 px: ' + id + ' ' + diagnostic);
        console.log(dense ? 'coach denso:' : 'coach missione:', diagnostic);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      }
      assert.deepEqual(errors, []); await fresh.close(); console.log('coach: profilo nuovo, font di sistema e DejaVu reale, due lati via impostazioni, nomi interi, safe area/joystick/poteri distinti, Salta ripristina il suggerimento e Ricomincia preserva la missione visibile');
      if (selected.length === 1 && selected[0] === 'coach') { console.log('nessun errore'); return; }
    }
    const context = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
    await context.addInitScript(value => localStorage.setItem('dite2', JSON.stringify(value)), profile);
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !m.text().includes('CONTEXT_LOST_WEBGL')) errors.push(m.text()); });
    await page.goto(process.env.DITE_MOBILE_URL || 'file://' + __dirname + '/dist/index.html');
    await page.waitForFunction(() => window.__dite && window.__dite.screen && window.__dite.screen().screen === 'lobby');
    await page.evaluate(() => { const D = window.__dite; D.lockQ = true; window.__mobileTrusted = []; document.addEventListener('pointerdown', e => window.__mobileTrusted.push({ trusted: e.isTrusted, target: e.target.id, id: e.pointerId }), true); });
    const screen = name => page.waitForFunction(name => window.__dite.screen().screen === name, name);
    const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const frozen = async (label) => {
      await settle();
      const before = await page.evaluate(() => ({ t: window.__dite.state().t, frames: window.__dite.info().renderFrames }));
      await page.waitForTimeout(240);
      const after = await page.evaluate(() => ({ t: window.__dite.state().t, frames: window.__dite.info().renderFrames }));
      assert.deepEqual(after, before, label + ': simulazione e rendering devono fermarsi');
      assert.notEqual(await page.evaluate(() => window.__dite.info().audio), 'running', label + ': audio sospeso insieme alla schermata');
    };
    const start = async () => {
      const state = await page.evaluate(() => window.__dite.screen().screen);
      if (state !== 'playing') { if (state === 'pause') await page.locator('#resume').tap(); else if (state === 'lobby') await page.locator('#play').tap(); else await page.evaluate(() => window.__dite.navigate('playing')); }
      await screen('playing');
      await page.evaluate(() => { const s = window.__dite.state(); s.player.invuln = 999; s.mobs = []; s.patrols = []; for (const turret of s.turrets) turret.stun = 999; });
    };
    if (wants('navigation')) {
      await frozen('lobby'); await page.locator('#play').tap(); await screen('playing');
      const t = await page.evaluate(() => window.__dite.state().t); await page.waitForFunction(t => window.__dite.state().t > t, t);
      await page.locator('#menuBtn').tap(); await screen('pause'); await frozen('pausa');
      await page.locator('#menuTips').tap(); await screen('guide'); await frozen('guida dalla pausa');
      await page.locator('#tipsOk').tap(); await screen('pause'); assert.equal(await page.evaluate(() => window.__dite.screen().playing), false);
      await page.locator('#menuSettings').tap(); await screen('settings');
      await page.evaluate(() => window.__dite.navigate('guide')); await screen('guide');
      await page.locator('#tipsOk').tap(); await screen('settings'); await frozen('ritorno alle impostazioni');
      await page.keyboard.press('Escape'); await screen('pause');
      const explicit = await page.evaluate(() => { const D = window.__dite, before = { t: D.state().t, frames: D.info().renderFrames }; let steps = 0; const step = D.Core.step; try { D.Core.step = (...args) => { steps++; return step(...args); }; const drew = D.renderOnce(); return { before, after: { t: D.state().t, frames: D.info().renderFrames }, steps, drew, calls: D.info().calls }; } finally { D.Core.step = step; } });
      assert.equal(explicit.drew, true); assert.equal(explicit.steps, 0); assert.equal(explicit.after.t, explicit.before.t); assert.equal(explicit.after.frames, explicit.before.frames + 1); assert.ok(explicit.calls > 0);
      await page.screenshot({ path: __dirname + '/shots/mobile-pausa.png' });
      await page.locator('#resume').tap(); await screen('playing'); console.log('navigation: ritorni annidati, gioco fermo, draw esplicito e ripresa verdi');
    }
    if (wants('input')) {
      const cdp = await context.newCDPSession(page);
      const touch = (type, points) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points });
      const primary = async () => { const box = await page.locator('#b0').boundingBox(); assert.ok(box && box.width > 0); return { x: box.x + box.width / 2, y: box.y + box.height / 2, id: 2 }; };
      const hold = async () => {
        await start(); const fire = await primary(), left = { x: 180, y: 215, id: 1 };
        const before = await page.evaluate(() => { const D = window.__dite, s = D.state(); return { x: s.player.x, z: s.player.z, casts: s.stats.casts[0], yaw: D.cam().yaw }; });
        await touch('touchStart', [left, fire]); await touch('touchMove', [{ ...left, x: left.x + 32, y: left.y - 20 }, { ...fire, x: fire.x + 16 }]);
        await page.waitForFunction(before => { const s = window.__dite.state(); return s.stats.casts[0] > before.casts && Math.hypot(s.player.x - before.x, s.player.z - before.z) > .05; }, before);
        const proof = await page.evaluate(() => { const D = window.__dite, i = D.inputSnapshot(); return { input: i, captures: [document.getElementById('c').hasPointerCapture(i.joy.id), document.getElementById('b0').hasPointerCapture(i.primary.id)], trusted: window.__mobileTrusted.slice(-2), yaw: D.cam().yaw }; });
        assert.ok(proof.input.joy.x > 0 && proof.input.joy.y < 0); assert.equal(proof.input.fireBtn, true); assert.deepEqual(proof.captures, [true, true]); assert.ok(proof.trusted.every(e => e.trusted)); assert.ok(Math.abs(proof.yaw - before.yaw) > .01);
        return { left, fire };
      };
      for (const reason of ['pause', 'blur', 'hidden', 'native', 'pagehide', 'rotate']) {
        const points = await hold();
        if (reason === 'pause') await page.keyboard.press('Escape');
        else if (reason === 'blur') await page.evaluate(() => window.dispatchEvent(new Event('blur')));
        else if (reason === 'hidden') await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
        else if (reason === 'native') await page.evaluate(() => window.DiteNative.receive({ v: 1, type: 'lifecycle', active: false, reason: 'test-interruption' }));
        else if (reason === 'pagehide') await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
        else await page.setViewportSize({ width: 390, height: 844 });
        await screen('pause'); empty(await page.evaluate(() => window.__dite.inputSnapshot()));
        const state = await page.evaluate(() => { const D = window.__dite, s = D.state(); return { x: s.player.x, z: s.player.z, casts: s.stats.casts.slice(), yaw: D.cam().yaw }; });
        if (reason !== 'rotate') await touch('touchMove', [{ ...points.left, x: 250, y: 170 }, { ...points.fire, x: points.fire.x + 26 }]);
        await touch('touchEnd', []); await frozen(reason);
        assert.deepEqual(await page.evaluate(() => { const D = window.__dite, s = D.state(); return { x: s.player.x, z: s.player.z, casts: s.stats.casts.slice(), yaw: D.cam().yaw }; }), state, reason + ': input tenuto non deve attraversare il pannello');
        if (reason === 'hidden') await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
        if (reason === 'native') await page.evaluate(() => window.DiteNative.receive({ v: 1, type: 'lifecycle', active: true, reason: 'foreground' }));
        if (reason === 'pagehide') await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
        if (reason === 'rotate') { await page.screenshot({ path: __dirname + '/shots/mobile-rotazione.png' }); await page.setViewportSize({ width: 844, height: 390 }); }
        await settle(); assert.equal(await page.evaluate(() => window.__dite.screen().playing), false); empty(await page.evaluate(() => window.__dite.inputSnapshot()));
        await page.locator('#resume').tap(); await screen('playing'); await page.waitForTimeout(120); empty(await page.evaluate(() => window.__dite.inputSnapshot()));
        console.log('input ' + reason + ': movimento/tiro, reset e ripresa esplicita verdi');
      }
      // Il rilascio della capture è reale, dopo un pointerdown generato dal CDP.
      await start();
      await page.evaluate(() => { window.__mobileCaptures = []; for (const type of ['gotpointercapture', 'lostpointercapture']) document.getElementById('b0').addEventListener(type, e => window.__mobileCaptures.push({ type, trusted: e.isTrusted, id: e.pointerId })); });
      const fire = await primary(); await touch('touchStart', [fire]);
      assert.equal(await page.evaluate(() => window.__dite.inputSnapshot().fireBtn), true);
      // Dopo il down la capture è ancora pending: un movimento reale la attiva.
      await touch('touchMove', [{ ...fire, x: fire.x + 16 }]);
      assert.ok(await page.evaluate(() => window.__mobileCaptures.some(e => e.type === 'gotpointercapture' && e.trusted)));
      await page.evaluate(() => { const id = window.__dite.inputSnapshot().primary.id, b = document.getElementById('b0'); if (!b.hasPointerCapture(id)) throw Error('Capture primaria assente'); b.releasePointerCapture(id); });
      await touch('touchMove', [{ ...fire, x: fire.x + 20 }]);
      await page.waitForFunction(() => !window.__dite.inputSnapshot().fireBtn && window.__dite.inputSnapshot().primary.id === null); await touch('touchEnd', []);
      assert.ok(await page.evaluate(() => window.__mobileCaptures.some(e => e.type === 'lostpointercapture' && e.trusted)));
      const casts = await page.evaluate(() => window.__dite.state().stats.casts[0]); await page.waitForTimeout(140); assert.equal(await page.evaluate(() => window.__dite.state().stats.casts[0]), casts);
      console.log('input capture: got/lost trusted e nessun tiro residuo verdi');
      await touch('touchStart', [fire]);
      const owner = await page.evaluate(() => window.__dite.inputSnapshot().primary.id);
      await touch('touchStart', [fire, { ...fire, x: fire.x - 12, id: 4 }]);
      assert.equal(await page.evaluate(() => window.__dite.inputSnapshot().primary.id), owner, 'Il secondo dito non deve rubare il primario');
      // La lista di contatti attivi rimuove soltanto il secondo dito.
      await touch('touchMove', [{ ...fire, x: fire.x + 3 }]);
      assert.equal(await page.evaluate(() => window.__dite.inputSnapshot().fireBtn), true);
      assert.equal(await page.evaluate(() => window.__dite.inputSnapshot().primary.id), owner);
      await touch('touchEnd', []);
      assert.equal(await page.evaluate(() => window.__dite.inputSnapshot().fireBtn), false);
      const turns = {};
      for (const surface of ['canvas', 'primary']) for (const sens of [.5, 2]) {
        await page.evaluate(sens => { const D = window.__dite; D.setPreference('sens', sens); D.setLook(0, 0); }, sens);
        const point = surface === 'canvas' ? { x: 470, y: 130, id: 3 } : await primary();
        await touch('touchStart', [point]); await touch('touchMove', [{ ...point, x: point.x + 18, y: point.y + 6 }]); await touch('touchEnd', []);
        turns[surface + sens] = await page.evaluate(() => window.__dite.cam());
      }
      for (const sens of [.5, 2]) { assert.ok(Math.abs(turns['canvas' + sens].yaw) > .01); assert.ok(Math.abs(turns['canvas' + sens].yaw - turns['primary' + sens].yaw) < .00001); assert.ok(Math.abs(turns['canvas' + sens].pitch - turns['primary' + sens].pitch) < .00001); }
      assert.ok(Math.abs(turns.canvas2.yaw / turns['canvas0.5'].yaw - 4) < .001);
      console.log('input sensibilità: canvas e primario equivalenti, rapporto quattro verificato');
      await page.evaluate(() => window.__dite.setPreference('sens', 1));
      await hold();
      await page.evaluate(() => { const canvas = document.getElementById('c'), gl = canvas.getContext('webgl2') || canvas.getContext('webgl'); window.__mobileLostContext = gl.getExtension('WEBGL_lose_context'); if (!window.__mobileLostContext) throw Error('WEBGL_lose_context necessario per la regressione'); window.__mobileLostContext.loseContext(); });
      await screen('error'); empty(await page.evaluate(() => window.__dite.inputSnapshot())); await touch('touchEnd', []); await frozen('contesto grafico perso');
      assert.ok(await page.evaluate(() => window.__dite.screen().blockers.includes('context')));
      await page.evaluate(() => window.__mobileLostContext.restoreContext()); await screen('pause');
      assert.equal(await page.evaluate(() => window.__dite.screen().playing), false); empty(await page.evaluate(() => window.__dite.inputSnapshot()));
      await page.evaluate(() => { if (!window.__dite.renderOnce()) throw Error('Contesto non ripristinato'); }); assert.ok(await page.evaluate(() => window.__dite.info().calls > 0));
      await cdp.detach();
      console.log('input: multi-touch reale, capture, sospensioni/rotazione/context loss e sensibilità condivisa verdi');
    }
    if (wants('storage')) {
      await page.evaluate(() => window.__dite.navigate('lobby')); await screen('lobby');
      await page.setViewportSize({ width: 667, height: 375 });
      await page.evaluate(() => { const style = document.documentElement.style; style.setProperty('--sl', '32px'); style.setProperty('--sr', '32px'); style.setProperty('--sb', '21px'); });
      await settle();
      const proof = await page.evaluate(() => {
        const D = window.__dite, old = localStorage.getItem('dite2'), before = JSON.stringify(D.store.recipe), set = Storage.prototype.setItem;
        const invalid = JSON.parse(before); invalid.slots[0].id = 'inesistente'; if (D.setRecipe(invalid) !== false || JSON.stringify(D.store.recipe) !== before) throw Error('Ricetta invalida accettata');
        const expensive = { nome: 'Oltre budget', slots: D.Bricks.SLOTS.map(slot => { const a = D.Bricks.LIST.filter(a => a.slot === slot).sort((a, b) => b.cost[2] - a.cost[2])[0]; return { id: a.id, el: 'luce', t: 3, m: D.Bricks.MODS[0] }; }) };
        const fame = D.store.fame; D.store.fame = 0; const over = D.setRecipe(expensive); D.store.fame = fame;
        if (over !== false || JSON.stringify(D.store.recipe) !== before) throw Error('Ricetta oltre budget accettata');
        window.__mobileSetItem = set;
        Storage.prototype.setItem = function (key, value) { if (key === 'dite2') throw new DOMException('Quota piena', 'QuotaExceededError'); return set.call(this, key, value); };
        const recipe = JSON.parse(before); recipe.nome = 'Kit in memoria'; const accepted = D.setRecipe(recipe);
        return { accepted, rawSame: localStorage.getItem('dite2') === old, ram: D.store.recipe.nome, actual: D.state().recipe.nome, status: D.G.storage.status() };
      });
      assert.equal(proof.accepted, true); assert.equal(proof.rawSame, true); assert.equal(proof.ram, 'Kit in memoria'); assert.equal(proof.actual, 'Kit in memoria'); assert.equal(proof.status.state, 'temporary');
      await page.waitForFunction(() => document.body.innerText.includes('progressi temporanei'));
      const visibleWarning = async label => {
        const view = await page.evaluate(() => {
          const warning = document.getElementById('saveStatus'), kit = document.querySelector('.lobby-kit'), r = warning.getBoundingClientRect(), p = kit.getBoundingClientRect(), hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
          return { rect: r.toJSON(), parent: p.toJSON(), hit: !!hit && (hit === warning || warning.contains(hit)), state: warning.dataset.state, scroll: kit.scrollTop, overflow: kit.scrollHeight - kit.clientHeight, w: innerWidth, h: innerHeight };
        });
        assert.equal(view.state, 'temporary'); assert.ok(view.rect.width > 0 && view.rect.height > 0); assert.equal(view.hit, true, label + ': avviso coperto o fuori dalla vista');
        assert.ok(view.rect.top >= Math.max(0, view.parent.top) - 1 && view.rect.bottom <= Math.min(view.h - 21, view.parent.bottom) + 1, label + ': avviso tagliato verticalmente');
        assert.ok(view.rect.left >= Math.max(32, view.parent.left) - 1 && view.rect.right <= Math.min(view.w - 32, view.parent.right) + 1, label + ': avviso tagliato dagli inset laterali');
        return view;
      };
      const initialWarning = await visibleWarning('senza scorrere'); assert.equal(initialWarning.scroll, 0, 'L’avviso deve essere presente già in cima alla scheda');
      await page.screenshot({ path: __dirname + '/shots/mobile-storage-temporaneo.png' });
      await page.locator('.lobby-kit').evaluate(kit => { kit.scrollTop = kit.scrollHeight; }); await settle();
      const scrolledWarning = await visibleWarning('dopo scorrimento'); assert.ok(scrolledWarning.scroll > 0, 'La prova deve scorrere realmente una scheda più alta dello spazio disponibile');
      await page.screenshot({ path: __dirname + '/shots/mobile-storage-temporaneo-scroll.png' });
      const saved = await page.evaluate(() => { Storage.prototype.setItem = window.__mobileSetItem; const D = window.__dite, result = D.G.save(); return { result, raw: JSON.parse(localStorage.getItem('dite2')).recipe.nome, status: D.G.storage.status().state }; });
      assert.equal(saved.result.ok, true); assert.equal(saved.raw, 'Kit in memoria'); assert.equal(saved.status, 'saved');
      await page.evaluate(() => { for (const key of ['--sl', '--sr', '--sb']) document.documentElement.style.removeProperty(key); }); await page.setViewportSize({ width: 844, height: 390 });
      console.log('storage: kit invalido/budget respinti, quota piena conserva RAM e precedente, recupero salvato verde');
    }
    if (wants('loading')) {
      await page.evaluate(() => window.__dite.navigate('city')); await screen('city');
      const prior = await page.evaluate(() => { const D = window.__dite; window.__mobileOldState = D.state(); window.__mobileOldScene = D.G.scene; window.__mobileBuild = D.G.buildWorld; window.__mobileBuildCalls = 0; D.G.buildWorld = (...args) => { window.__mobileBuildCalls++; const result = window.__mobileBuild(...args); if (window.__mobileBuildCalls === 1) { window.__mobileFailedScene = D.G.scene; throw Error('Fixture: costruzione interrotta dopo il nuovo mondo'); } return result; }; return { theme: D.store.theme, seed: D.store.seed, raw: localStorage.getItem('dite2') }; });
      const submitted = await page.evaluate(() => { document.querySelector('[data-city="cocito"]').click(); document.querySelector('[data-city="malebolge"]').click(); const D = window.__dite; return { screen: D.screen().screen, theme: D.store.theme }; });
      assert.equal(submitted.screen, 'loading'); assert.equal(submitted.theme, prior.theme); await screen('error');
      const failed = await page.evaluate(() => { const D = window.__dite; return { calls: window.__mobileBuildCalls, theme: D.store.theme, seed: D.store.seed, raw: localStorage.getItem('dite2'), sameState: D.state() === window.__mobileOldState, sameScene: D.G.scene === window.__mobileOldScene, children: D.G.scene.children.length, temporaryDisposed: window.__mobileFailedScene.children.length === 0, resume: D.begin(), playing: D.screen().playing }; });
      assert.equal(failed.calls, 1); assert.equal(failed.theme, prior.theme); assert.equal(failed.seed, prior.seed); assert.equal(failed.raw, prior.raw); assert.equal(failed.sameState, true); assert.equal(failed.sameScene, true); assert.ok(failed.children > 0); assert.equal(failed.temporaryDisposed, true); assert.equal(failed.resume, false); assert.equal(failed.playing, false);
      await page.screenshot({ path: __dirname + '/shots/mobile-recupero-citta.png' });
      await page.locator('#errorRetry').tap(); await page.waitForFunction(() => window.__dite.store.theme === 'cocito' && window.__dite.screen().screen !== 'loading');
      const recovered = await page.evaluate(() => { const D = window.__dite; D.G.buildWorld = window.__mobileBuild; return { theme: D.state().city.theme.id, saved: JSON.parse(localStorage.getItem('dite2')).theme, calls: window.__mobileBuildCalls, newState: D.state() !== window.__mobileOldState }; });
      assert.deepEqual(recovered, { theme: 'cocito', saved: 'cocito', calls: 2, newState: true });
      console.log('loading: doppio tap ignorato, errore conserva mondo/profilo, recupero e salvataggio dopo successo verdi');
    }
    if (wants('journal')) {
      await start();
      const before = await page.evaluate(() => {
        const D = window.__dite, s = D.state(); D.Core.wakeBoss(s, 0); s.boss.hp = 1;
        s.player.x = s.boss.x; s.player.z = s.boss.z + 8; s.player.invuln = 999; s.player.cd.fill(0); D.setLook(0, 0);
        return { wins: s.stats.bossWins, fame: s.fame, reward: s.boss.def.fame, rows: D.store.journal.recent.length };
      });
      // Il frame dell'app deve alimentare il registro: niente Core.step manuale.
      await page.keyboard.down('j');
      try { await page.waitForFunction(n => { const D = window.__dite; return !D.state().boss && D.store.journal.recent.length === n + 1; }, before.rows, { timeout: 60000 }); }
      finally { await page.keyboard.up('j'); }
      const result = await page.evaluate(() => { const D = window.__dite, s = D.state(); return { wins: s.stats.bossWins, fame: s.fame, row: D.store.journal.recent[0], saved: JSON.parse(localStorage.getItem('dite2')).journal.recent[0] }; });
      assert.equal(result.wins, before.wins + 1); assert.equal(result.fame, before.fame + before.reward); assert.equal(result.row.kind, 'boss'); assert.equal(result.row.fame, before.reward); assert.deepEqual(result.saved, result.row);
      await page.locator('#menuBtn').tap(); await screen('pause'); await page.locator('#menuHome').tap(); await screen('lobby'); await page.locator('#openJournal').tap(); await screen('journal');
      assert.ok((await page.locator('#journalEntries').innerText()).includes(result.row.title)); assert.ok((await page.locator('#journalEntries').innerText()).includes('+' + result.row.fame));
      await frozen('registro'); await page.screenshot({ path: __dirname + '/shots/mobile-registro-vittoria.png' });
      await page.locator('#journalScreen [data-nav="back"]').tap(); await screen('lobby');
      console.log('journal: colpo reale nel frame app, vittoria/premio persistiti, voce visibile e ritorno verdi');
    }
    if (wants('bonuses')) {
      const names = { invuln: 'Invulnerabilità', reflect: 'Riflessione dei colpi', phoenix: 'Rinascita della Fenice', veil: 'Occultamento', hot: 'Cura nel tempo', fury: 'Furia', haste: 'Velocità aumentata', orbit: 'Orbite offensive' };
      await page.setViewportSize({ width: 667, height: 375 });
      await page.evaluate(() => { const style = document.documentElement.style; style.setProperty('--sl', '44px'); style.setProperty('--sr', '44px'); style.setProperty('--sb', '21px'); });
      await start();
      await page.evaluate(() => {
        const D = window.__dite, s = D.state(), p = s.player, giver = s.givers[0];
        s.quest = null; giver.offer = { type: 'consegna', ...D.Core.QINFO.consegna, fama: D.Core.QINFO.consegna.fama + 2 * s.level }; giver.cool = 0;
        p.x = giver.x + 2.5; p.z = giver.z + 1; D.setLook(Math.atan2(giver.x - p.x, giver.z - p.z) + Math.PI, 0);
      });
      await page.waitForFunction(() => { const s = window.__dite.state(); return s.hint.use && s.hint.use.kind === 'giver' && document.getElementById('useBtn').getBoundingClientRect().width > 0; });
      await page.locator('#useBtn').tap(); await page.waitForFunction(() => window.__dite.state().quest && window.__dite.state().quest.type === 'consegna');
      await page.evaluate(() => {
        const D = window.__dite, s = D.state(), recipe = { nome: 'Bonus leggibili', slots: ['dardo', 'scatto', 'nova', 'nova', 'fenice'].map(id => ({ id, el: 'luce', t: 1 })) };
        if (!D.setRecipe(recipe)) throw Error('Fixture Fenice non equipaggiabile'); s.player.invuln = 0; s.player.res = 100; s.player.cd[4] = 0; D.press(4);
      });
      await page.waitForFunction(() => window.__dite.state().player.phoenix > 0);
      const cast = await page.evaluate(() => {
        const D = window.__dite, s = D.state(), ok = D.Core.run(s, D.Bricks.parseProg('buff t40 invuln1 reflect.5 veil1 hot20 fury1.5 haste1.3 orbit5'), { K: { el: 'luce' }, slot: 2, depth: 0 });
        return { ok, phoenixCasts: s.stats.casts[4], timers: Object.fromEntries(['invuln', 'reflect', 'phoenix', 'veil', 'hot', 'fury', 'haste', 'orbit'].map(key => [key, s.player[key]])) };
      });
      assert.equal(cast.ok, true); assert.ok(cast.phoenixCasts > 0); assert.ok(Object.values(cast.timers).every(t => Number.isFinite(t) && t > 0));
      const states = await page.evaluate(sevenPowerStates);
      assert.ok(Object.values(states).every(value => value === true), 'Tutti i sei operatori devono creare stati reali');
      await page.waitForFunction(() => window.__dite.state().player.bank === 75);
      const livePowers = await page.evaluate(() => { const s = window.__dite.state(), p = s.player; return { bank: p.bank, absorb: !!p.absorb, mimic: p.mimic && p.mimic.attack, form: p.form && p.form.size, captive: !!p.captive, scan: !!p.scan, clones: s.mobs.filter(e => e.cloned && !e.dead).length }; });
      assert.deepEqual(livePowers, { bank: 75, absorb: true, mimic: 'tiro', form: .6, captive: true, scan: true, clones: 2 }, 'I sette stati del riepilogo devono esistere nella simulazione');
      await page.waitForFunction(() => document.getElementById('buffs').textContent === 'Invulnerabile +7');
      const hud = await page.locator('#buffs').evaluate(node => ({ text: node.textContent, aria: node.getAttribute('aria-label'), clipped: node.scrollWidth > node.clientWidth + 1, rect: node.getBoundingClientRect().toJSON() }));
      assert.equal(hud.text, 'Invulnerabile +7'); assert.equal(hud.clipped, false, 'Riepilogo bonus senza ellissi a667'); assert.ok(hud.rect.width > 0 && hud.rect.right <= 623);
      for (const name of Object.values(names)) assert.ok(hud.aria.includes(name), 'Nome completo disponibile anche nel riepilogo accessibile: ' + name);
      const controls = await context.newCDPSession(page);
      await controls.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 110, y: 314, id: 11 }] });
      await controls.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 127, y: 297, id: 11 }] });
      const inspectLayout = () => page.evaluate(() => {
        const D = window.__dite, rect = id => document.getElementById(id).getBoundingClientRect().toJSON(), joy = rect('joy'), power = rect('powerHud'), quest = rect('quest');
        const overlap = (r, target) => Math.max(0, Math.min(r.right, target.right) - Math.max(r.left, target.left)) * Math.max(0, Math.min(r.bottom, target.bottom) - Math.max(r.top, target.top));
        const node = document.getElementById('powerHud');
        const collisions = []; for (const id of ['left', 'quest', 'powerHud']) for (let index = 0; index < 5; index++) if (overlap(rect(id), rect('b' + index)) > 0) collisions.push(id + '/b' + index);
        return { joy, power, quest, powerOverlap: overlap(power, joy), questOverlap: overlap(quest, joy), collisions, input: D.inputSnapshot(), questType: D.state().quest.type, questTitle: document.getElementById('qTitle').textContent, powerText: node.textContent, shownPowers: Array.from(node.querySelectorAll('.power-status-row')).map(row => row.dataset.power), more: node.querySelector('.power-status-more')?.textContent, clipped: node.scrollHeight > node.clientHeight + 1, font: Number.parseFloat(getComputedStyle(node).fontSize) };
      });
      const checkLayout = layout => {
        assert.notEqual(layout.input.joy.id, null); assert.ok(Math.hypot(layout.input.joy.x, layout.input.joy.y) > 0, 'Il joystick della fotografia deve essere davvero attivo');
        assert.equal(layout.questType, 'consegna'); assert.ok(layout.questTitle.length > 0); assert.ok(layout.joy.width > 0 && layout.joy.height > 0);
        assert.equal(layout.powerOverlap, 0, 'Stati e joystick non devono sovrapporsi'); assert.equal(layout.questOverlap, 0, 'Missione e joystick non devono sovrapporsi'); assert.deepEqual(layout.collisions, [], 'HUD laterale/missione/stati non devono coprire nessuno dei cinque poteri');
        assert.ok(layout.power.height > 0 && layout.power.height <= 60, 'Gli stati attivi devono occupare al massimo tre righe compatte'); assert.ok(layout.font >= 11); assert.equal(layout.clipped, false, 'Nessuna riga di stato tagliata senza riepilogo');
        assert.deepEqual(layout.shownPowers, ['form', 'captive'], 'Corpo e creatura catturata devono restare visibili'); assert.equal(layout.more, '+5 altri · pausa');
      };
      checkLayout(await inspectLayout());
      await page.screenshot({ path: __dirname + '/shots/mobile-bonus-hud.png' });
      await controls.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.evaluate(() => window.__dite.setPreference('leftHanded', true)); await settle();
      await controls.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 557, y: 314, id: 12 }] });
      await controls.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 540, y: 297, id: 12 }] });
      checkLayout(await inspectLayout()); await page.screenshot({ path: __dirname + '/shots/mobile-stati-mancino.png' });
      await controls.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.evaluate(() => window.__dite.setPreference('leftHanded', false)); await settle();
      await page.locator('#menuBtn').tap(); await screen('pause');
      assert.equal(await page.locator('#menuEffects').isVisible(), true); assert.equal(await page.locator('#menuEffectCount').textContent(), '8');
      await page.locator('#resume').focus();
      let reachable = false;
      for (let i = 0; i < 10; i++) { await page.keyboard.press('Tab'); if (await page.evaluate(() => document.activeElement === document.querySelector('#menuEffects summary'))) { reachable = true; break; } }
      assert.equal(reachable, true, 'Summary dei bonus raggiungibile nel ciclo Tab della pausa');
      await page.keyboard.press('Enter'); assert.equal(await page.locator('#menuEffects').evaluate(node => node.open), true);
      const inspect = () => page.evaluate(() => {
        const p = window.__dite.state().player;
        return Array.from(document.querySelectorAll('#menuEffectList li')).map(row => ({ key: row.dataset.effect, name: row.querySelector('.effect-name').textContent, time: row.querySelector('.effect-time').textContent, remaining: Math.ceil(p[row.dataset.effect]) }));
      });
      const before = await inspect(); assert.equal(before.length, 8); assert.deepEqual(new Set(before.map(row => row.key)), new Set(Object.keys(names)));
      for (const row of before) {
        assert.equal(row.name, names[row.key]); assert.equal(row.time, row.remaining + ' s');
        const item = page.locator('#menuEffectList [data-effect="' + row.key + '"]'); await item.scrollIntoViewIfNeeded();
        const visible = await item.evaluate(row => { const r = row.getBoundingClientRect(), p = row.closest('.pause-title').getBoundingClientRect(), name = row.querySelector('.effect-name'), time = row.querySelector('.effect-time'); return { r: r.toJSON(), p: p.toJSON(), clipped: name.scrollWidth > name.clientWidth + 1 || time.scrollWidth > time.clientWidth + 1 }; });
        assert.equal(visible.clipped, false, row.key + ': nome o timer tagliato'); assert.ok(visible.r.top >= Math.max(0, visible.p.top) - 1 && visible.r.bottom <= Math.min(354, visible.p.bottom) + 1, row.key + ': riga non raggiungibile nel pannello');
      }
      await page.locator('#menuEffects summary').scrollIntoViewIfNeeded(); await page.screenshot({ path: __dirname + '/shots/mobile-bonus-pausa.png' });
      assert.equal(await page.locator('#menuPowerCount').textContent(), '7');
      await page.locator('#resume').focus(); reachable = false;
      for (let i = 0; i < 10; i++) { await page.keyboard.press('Tab'); if (await page.evaluate(() => document.activeElement === document.querySelector('#menuPowers summary'))) { reachable = true; break; } }
      assert.equal(reachable, true, 'Anche i dettagli dei poteri devono essere raggiungibili con Tab');
      await page.keyboard.press('Enter'); assert.equal(await page.locator('#menuPowers').evaluate(node => node.open), true);
      const inspectPowers = () => page.evaluate(() => {
        const s = window.__dite.state(), p = s.player, alive = new Set(s.mobs.filter(e => !e.dead && !e.captive).map(e => e.id));
        const rows = Array.from(document.querySelectorAll('#menuPowerList li')).map(row => ({ key: row.dataset.power, name: row.querySelector('.effect-name').textContent, time: row.querySelector('.effect-time').textContent, resource: row.querySelector('.effect-resource').textContent, instruction: row.querySelector('.effect-detail').textContent }));
        return { rows, bank: p.bank, times: Object.fromEntries(['absorb', 'mimic', 'form', 'captive', 'scan'].map(key => [key, Math.ceil(p[key].t)])), radius: p.absorb.r, cap: p.absorb.cap, size: p.form.size, scanRadius: p.scan.r, contacts: p.scan.ids.filter(id => alive.has(id)).length, clones: s.mobs.filter(e => e.cloned && !e.dead).sort((a, b) => a.cloneSlot - b.cloneSlot).map(e => ({ hp: Math.ceil(e.hp), maxHp: e.maxHp, time: Math.ceil(e.life) })) };
      });
      const checkPowers = value => {
        const expected = { form: 'Taglia', captive: 'Stasi', mimic: 'Imitazione', bank: 'Energia raccolta', absorb: 'Assorbimento', scan: 'Rilevamento', clones: 'Copie attive' };
        assert.equal(value.rows.length, 7); assert.deepEqual(new Set(value.rows.map(row => row.key)), new Set(Object.keys(expected))); assert.equal(value.clones.length, 2);
        for (const row of value.rows) {
          assert.equal(row.name, expected[row.key]); assert.ok(row.instruction.length > 10, row.key + ': istruzioni assenti');
          if (row.key in value.times) assert.equal(row.time, value.times[row.key] + ' s', row.key + ': timer diverso dal Core');
        }
        const byKey = Object.fromEntries(value.rows.map(row => [row.key, row]));
        assert.equal(byKey.bank.time, 'Senza scadenza'); assert.equal(byKey.bank.resource, value.bank + ' energia');
        assert.equal(byKey.form.resource, 'Taglia ×' + value.size.toFixed(1)); assert.match(byKey.form.instruction, /ripremi.*normale/i);
        assert.equal(byKey.mimic.resource, 'Primario: Tiro'); assert.match(byKey.mimic.instruction, /primario.*scadenza/i);
        assert.match(byKey.captive.resource, /Creatura: tiratore/); assert.match(byKey.captive.instruction, /libera/i);
        assert.equal(byKey.absorb.resource, 'Raggio ' + value.radius + ' m · limite ' + value.cap);
        assert.equal(byKey.scan.resource, value.contacts + (value.contacts === 1 ? ' presenza' : ' presenze') + ' · raggio ' + value.scanRadius + ' m');
        for (const [index, clone] of value.clones.entries()) assert.ok(byKey.clones.resource.includes('Copia ' + (index + 1) + ': ' + clone.hp + '/' + clone.maxHp + ' vita, ' + clone.time + ' s'), 'Ogni copia mostra vita e scadenza reali');
        const times = value.clones.map(e => e.time); assert.equal(byKey.clones.time, Math.min(...times) + (Math.min(...times) === Math.max(...times) ? '' : '–' + Math.max(...times)) + ' s');
      };
      const powersBefore = await inspectPowers(); checkPowers(powersBefore);
      for (const row of powersBefore.rows) {
        const item = page.locator('#menuPowerList [data-power="' + row.key + '"]'); await item.scrollIntoViewIfNeeded();
        const visible = await item.evaluate(row => { const r = row.getBoundingClientRect(), p = row.closest('.pause-title').getBoundingClientRect(); return { r: r.toJSON(), p: p.toJSON(), clipped: [...row.children].some(node => node.scrollWidth > node.clientWidth + 1) }; });
        assert.equal(visible.clipped, false, row.key + ': dettaglio potere tagliato'); assert.ok(visible.r.top >= Math.max(0, visible.p.top) - 1 && visible.r.bottom <= Math.min(354, visible.p.bottom) + 1, row.key + ': dettagli non raggiungibili nel pannello');
      }
      await page.screenshot({ path: __dirname + '/shots/mobile-stati-pausa-fondo.png' });
      await page.locator('#menuPowers summary').scrollIntoViewIfNeeded(); await page.screenshot({ path: __dirname + '/shots/mobile-stati-pausa.png' });
      await frozen('dettagli bonus');
      await page.locator('#resume').tap(); await screen('playing');
      const until = await page.evaluate(() => window.__dite.state().t + 1.2); await page.waitForFunction(t => window.__dite.state().t >= t, until, { timeout: 60000 });
      await page.locator('#menuBtn').tap(); await screen('pause');
      assert.equal(await page.locator('#menuEffects').evaluate(node => node.open), true, 'Aggiornare i timer non richiude i dettagli già aperti');
      assert.equal(await page.locator('#menuPowers').evaluate(node => node.open), true, 'Aggiornare gli stati non richiude i dettagli già aperti'); checkPowers(await inspectPowers());
      const after = await inspect(); assert.equal(after.length, 8); assert.ok(after.some(row => row.remaining < before.find(old => old.key === row.key).remaining), 'Il gioco deve aver consumato davvero i timer');
      for (const row of after) { assert.equal(row.name, names[row.key]); assert.equal(row.time, row.remaining + ' s'); }
      await page.evaluate(() => { for (const key of ['--sl', '--sr', '--sb']) document.documentElement.style.removeProperty(key); }); await page.setViewportSize({ width: 844, height: 390 });
      console.log('bonuses:8 bonus e7 stati Core, HUD sintetico667 senza overlap joystick/missione, dettagli completi, Tab e apertura persistente verdi');
    }
    if (wants('counter')) {
      await page.setViewportSize({ width: 667, height: 375 });
      await page.evaluate(() => { const style = document.documentElement.style; style.setProperty('--sl', '44px'); style.setProperty('--sr', '44px'); style.setProperty('--sb', '21px'); style.setProperty('--ui', '"DejaVu Sans",sans-serif'); return document.fonts.ready; });
      await start();
      const cdp = await context.newCDPSession(page); await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
      for (const fame of [999999, 1e9]) for (const leftHanded of [false, true]) {
        assert.equal(Storage.normalize({ fame }, B).fame, fame, 'La fixture deve essere un valore di Fama accettato dal salvataggio');
        await page.evaluate(fame => { const D = window.__dite; D.store.fame = D.state().fame = fame; D.state().level = D.Bricks.levelFor(fame); D.invalidate(); }, fame);
        if (await page.evaluate(left => window.__dite.store.leftHanded !== left, leftHanded)) {
          await page.locator('#menuBtn').tap(); await page.locator('#menuSettings').tap(); await page.locator('[data-settings-tab="controls"]').tap();
          await page.locator('[data-pref="leftHanded"]').setChecked(leftHanded); await page.locator('#settings [data-nav="back"]').tap(); await page.locator('#resume').tap();
        }
        await page.waitForFunction(fame => document.getElementById('famePt').textContent === String(fame), fame);
        await settle();
        const counter = await page.evaluate(() => {
          const span = document.querySelector('#cnt>span'), box = span.getBoundingClientRect(), button = document.getElementById('menuBtn').getBoundingClientRect();
          const walker = document.createTreeWalker(span, NodeFilter.SHOW_TEXT), fragments = []; let node;
          while ((node = walker.nextNode())) { if (!node.textContent.trim()) continue; const range = document.createRange(); range.selectNodeContents(node); for (const r of range.getClientRects()) fragments.push({ text: node.textContent, ...r.toJSON() }); }
          const outside = fragments.filter(r => r.left < box.left - 1 || r.right > box.right + 1 || r.top < box.top - 1 || r.bottom > box.bottom + 1 || r.right > button.left);
          return { text: span.textContent, span: box.toJSON(), button: button.toJSON(), fragments, outside, font: getComputedStyle(span).font, whiteSpace: getComputedStyle(span).whiteSpace, leftHanded: window.__dite.store.leftHanded };
        });
        const documentNode = await cdp.send('DOM.getDocument'), labelNode = await cdp.send('DOM.querySelector', { nodeId: documentNode.root.nodeId, selector: '#famePt' });
        counter.actualFonts = (await cdp.send('CSS.getPlatformFontsForNode', { nodeId: labelNode.nodeId })).fonts;
        await page.screenshot({ path: __dirname + '/shots/mobile-fama-' + fame + '-' + (leftHanded ? 'mancino' : 'destro') + '.png' });
        const diagnostic = JSON.stringify(counter);
        assert.equal(counter.leftHanded, leftHanded); assert.equal(counter.text.replace(/\s+/g, ' ').trim(), 'FAMA ' + fame + ' · LIV ' + B.levelFor(fame));
        assert.ok(counter.actualFonts.length > 0 && counter.actualFonts.every(value => value.familyName === 'DejaVu Sans') && counter.actualFonts.some(value => value.glyphCount > 0), 'Il contatore deve usare il font largo reale: ' + diagnostic);
        assert.ok(counter.fragments.length > 0); assert.deepEqual(counter.outside, [], 'Fama e livello devono restare dentro lo span e prima di Pausa: ' + diagnostic);
        assert.ok(counter.button.width >= 44 && counter.button.height >= 44, 'Pausa deve conservare il bersaglio da 44 px: ' + diagnostic);
        assert.ok(counter.span.left >= 44 && counter.button.right <= 623 && counter.button.bottom <= 354, 'Contatore e Pausa dentro la safe area: ' + diagnostic);
        console.log('counter:', diagnostic);
      }
      console.log('counter: Fama 999999 e limite 1e9, DejaVu reale e due lati; frammenti di testo contenuti, Pausa distinta e target 44 px');
    }
    assert.deepEqual(errors, [], 'errori browser'); console.log('nessun errore');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
