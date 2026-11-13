// I sei controlli del corpo attraversano il vero input e il fotogramma della UI.
'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs');
const { chromium } = require('./pw.js');
const scenarios = [
  ['taglia', 'Spalle della montagna', 'form', 'Normale', 'Taglia'],
  ['fase', 'Passo senza peso', 'phase', 'Solido', 'Fase'],
  ['volo', 'Ali del pellegrino', 'flight', 'Atterra', 'Volo'],
  ['possessione', 'Inquilino dello Stige', 'possession', 'Rientra', 'Corpo esposto'],
  ['patto', 'Giuramento del passo', 'pact', null, null],
  ['stasi', 'Ampolla dello Stige', 'captive', 'Libera', 'Stasi'],
];
const selected = (process.argv[2] || process.env.DITE_CORPO_VIS || 'all').split(',');
for (const name of selected) assert.ok(name === 'all' || scenarios.some(([n]) => n === name), 'scenario sconosciuto: ' + name);
(async () => {
  fs.mkdirSync(__dirname + '/shots', { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(process.env.DITE_TEST_URL || 'file://' + __dirname + '/dist/index.html');
    await page.waitForFunction(() => !!window.__dite);
    await page.evaluate(() => { const D = window.__dite; D.lockQ = true; D.begin(); document.getElementById('menuBtn').click(); document.getElementById('menu').classList.add('hidden'); });
    const frames = async () => page.evaluate(() => { if (!window.__dite.renderOnce()) throw Error('Draw esplicito non riuscito'); });
    // Ferma la scena per la fotografia, mantenendo il suo HUD come nel frame attivo.
    const pause = async () => page.evaluate(() => { document.getElementById('menuBtn').click(); document.getElementById('menu').classList.add('hidden'); document.getElementById('ui').classList.remove('hidden'); document.getElementById('banner').className = ''; });
    const advance = async (seconds = .1) => {
      const until = await page.evaluate((seconds) => { const t = window.__dite.state().t; document.getElementById('resume').click(); return t + seconds; }, seconds);
      await page.waitForFunction((until) => window.__dite.state().t >= until, until, { timeout: 60000 });
    };
    for (const [name, power, key, label, hud] of scenarios) {
      if (!selected.includes('all') && !selected.includes(name)) continue;
      const fixture = await page.evaluate(([power, key]) => {
        const D = window.__dite, s = D.state(), p = s.player, G = D.G, a = D.Bricks.LIST.find((a) => a.nome === power);
        if (!a) throw Error('Meccanica assente dal build: ' + power);
        const slot = a.slot === 'M' ? 1 : 2, ids = ['dardo', 'scatto', 'nova', 'nova', 'ira']; ids[slot] = a.id;
        D.setRecipe({ nome: 'Fotografie del corpo', slots: ids.map((id) => ({ id, el: 'folgore', t: 1 })) });
        s.mobs.length = 0; s.shots.length = 0; s.zones.length = 0; s.events.length = 0; s.patrols.length = 0; s.quest = null;
        for (const t of s.turrets) t.stun = 999;
        const A = s.city.arenas[0]; Object.assign(p, { x: A.x + 10, z: A.z + 7, yaw: Math.PI / 2, pitch: -.05, hp: 100, invuln: 999, res: 100 });
        Object.assign(p.cam, { x: p.x, y: D.Core.EYE, z: p.z }); p.cd.fill(0); D.setLook(p.yaw, p.pitch);
        const enemies = [[-2, 0, key === 'pact' ? 'sgherro' : 'tiratore'], [-4, -4, 'sgherro'], [-5, 4, 'bruto']].map(([dx, dz, kind]) => {
          const e = D.Core.mkMob(s, kind, A.x + dx, A.z + 7 + dz, 'e'); e.spawn = 0; e.atk = 999; e.root = 999; e.hp = e.maxHp = 800; e.fx = 1; e.fz = 0; return e;
        });
        if (key === 'captive') Object.assign(enemies[0], { burnT: 8, burn: 1, poisT: 8, pois: 1 });
        G.animUpdate(50); G.updateFx(50, 0, G.camera.position); G.syncMobs(s, .016, 0); G.syncPowerFx(0);
        let visibleBursts = 0;
        if (key === 'captive') { const burst = G.burst; try { G.burst = () => visibleBursts++; G.mobViews.get(enemies[0].id).fxT = 0; G.syncMobs(s, .016, 0); } finally { G.burst = burst; } }
        document.getElementById('banner').className = '';
        return { slot, target: enemies[0].id, x: p.x, z: p.z, visibleBursts };
      }, [power, key]);
      if (key === 'captive') assert.ok(fixture.visibleBursts >= 2, 'controllo positivo: fuoco e veleno devono emettere prima della cattura');
      await advance();
      await page.evaluate((slot) => window.__dite.press(slot), fixture.slot);
      await page.waitForFunction(([key, id]) => { const s = window.__dite.state(); return key === 'pact' ? !!s.mobs.find((e) => e.id === id).pact : !!s.player[key]; }, [key, fixture.target], { timeout: 60000 });
      if (key === 'phase') await advance(.4); // Lascia finire la scomparsa delle mani.
      await pause();
      const active = await page.evaluate(([key, slot, id]) => {
        const D = window.__dite, s = D.state(), p = s.player, G = D.G, button = document.getElementById('b' + slot), bad = [];
        G.scene.updateMatrixWorld(true);
        for (const v of G.mobViews.values()) v.root.traverse((o) => { if (!o.matrixWorld.elements.every(Number.isFinite)) bad.push(o.type + ':' + o.id); });
        const target = s.mobs.find((e) => e.id === id), view = G.mobViews.get(id);
        const row = document.querySelector('#powerHud .power-status-row[data-power="' + key + '"]');
        return { state: key === 'pact' ? !!target.pact : !!p[key], label: button.querySelector('.nm').textContent, primaryLabel: document.getElementById('b0').querySelector('.nm').textContent, ready: button.classList.contains('ready'), cooldown: button.querySelector('.cd').style.height, hud: row && row.textContent, visible: view.root.visible, captive: !!target.captive, possessed: !!target.possessed, r: p.r, camera: [p.cam.x, p.cam.y, p.cam.z], bad, fx: G.powerFxCount };
      }, [key, fixture.slot, fixture.target]);
      assert.equal(active.state, true, name + ': attivazione reale'); assert.deepEqual(active.bad, []);
      if (label) { assert.equal(active.label, label); assert.equal(active.ready, true, name + ': rilascio disponibile durante ricarica'); assert.equal(active.cooldown, '0%'); assert.ok(active.hud.includes(hud)); }
      if (key === 'form') { assert.equal(active.r, 1.2); assert.ok(active.camera[1] > 3); }
      if (key === 'flight') assert.ok(active.camera[1] > 2.5);
      if (key === 'captive') {
        assert.equal(active.captive, true); assert.equal(active.visible, false); assert.ok(active.fx > 0);
        const hiddenFx = await page.evaluate((id) => {
          const D = window.__dite, s = D.state(), G = D.G, e = s.mobs.find((e) => e.id === id), burst = G.burst; let emitted = 0;
          // Conta nuove emissioni, non le particelle precedenti ancora in dissolvenza.
          try { G.burst = () => emitted++; G.mobViews.get(id).fxT = 0; G.syncMobs(s, .016, 1); } finally { G.burst = burst; }
          return { emitted, burning: e.burnT > 0, poisoned: e.poisT > 0, captive: !!e.captive, visible: G.mobViews.get(id).root.visible };
        }, fixture.target);
        assert.deepEqual(hiddenFx, { emitted: 0, burning: true, poisoned: true, captive: true, visible: false });
      }
      if (key === 'possession') { assert.equal(active.primaryLabel, 'TIRO'); assert.equal(active.possessed, true); assert.equal(active.visible, false); assert.ok(Math.hypot(active.camera[0] - fixture.x, active.camera[2] - fixture.z) > 5); }
      await frames();
      await page.screenshot({ path: __dirname + '/shots/corpo-' + name + '.png' });
      if (key === 'possession') {
        // Dall'ospite, girarsi deve mostrare il corpo lasciato indietro.
        await page.evaluate(() => window.__dite.setLook(-Math.PI / 2, -.02)); await advance(); await pause();
        const body = await page.evaluate(() => {
          const G = window.__dite.G, body = G.scene.children.find((o) => o.children.some((c) => c.geometry === G.POWER_GEO.robe));
          if (!body) return null;
          G.scene.updateMatrixWorld(true); const center = body.position.clone(); center.y = 1; center.project(G.camera);
          body.userData.draws = 0; body.traverse((o) => { if (o.isMesh) o.onBeforeRender = () => body.userData.draws++; });
          return { visible: body.visible, projection: center.toArray(), finite: body.matrixWorld.elements.every(Number.isFinite) };
        });
        assert.ok(body && body.visible && body.finite && body.projection.every((n) => Number.isFinite(n) && Math.abs(n) < 1), 'corpo originale fuori scena');
        await frames();
        assert.ok(await page.evaluate(() => { const G = window.__dite.G; return G.scene.children.find((o) => o.children.some((c) => c.geometry === G.POWER_GEO.robe)).userData.draws > 0; }), 'corpo originale non disegnato');
        await page.screenshot({ path: __dirname + '/shots/corpo-possessione-corpo.png' });
      }
      if (key === 'pact') {
        await page.evaluate((id) => { const e = window.__dite.state().mobs.find((e) => e.id === id); e.root = 0; e.aggro = 99; document.getElementById('resume').click(); }, fixture.target);
        await page.waitForFunction((id) => { const e = window.__dite.state().mobs.find((e) => e.id === id); return !e.pact && e.hp < 800; }, fixture.target, { timeout: 60000 });
      } else {
        await page.evaluate((slot) => { document.getElementById('resume').click(); window.__dite.press(slot); }, fixture.slot);
        await page.waitForFunction((key) => !window.__dite.state().player[key], key, { timeout: 60000 });
        await advance();
        const released = await page.evaluate(([slot, id]) => { const D = window.__dite, s = D.state(), e = s.mobs.find((e) => e.id === id); return { label: document.getElementById('b' + slot).querySelector('.nm').textContent, primaryLabel: document.getElementById('b0').querySelector('.nm').textContent, captive: !!e.captive, possessed: !!e.possessed, visible: D.G.mobViews.get(id).root.visible, r: s.player.r, y: s.player.cam.y }; }, [fixture.slot, fixture.target]);
        assert.notEqual(released.label, label); assert.equal(released.captive, false); assert.equal(released.possessed, false); assert.equal(released.visible, true); assert.equal(released.r, .6); assert.equal(released.y, 1.7);
        if (key === 'possession') assert.match(released.primaryLabel, /^dardo$/i);
      }
      await pause();
      await page.evaluate(() => window.__dite.setRecipe(window.__dite.Bricks.PRESETS[0])); await advance(); await pause();
      const cleanup = await page.evaluate(() => { const D = window.__dite, s = D.state(); return { body: ['form', 'phase', 'flight', 'possession', 'captive'].some((k) => !!s.player[k]), fx: D.G.powerFxCount, hudHidden: document.getElementById('powerHud').classList.contains('hidden'), mobStates: s.mobs.some((e) => e.captive || e.possessed || e.pact) }; });
      assert.deepEqual(cleanup, { body: false, fx: 0, hudHidden: true, mobStates: false });
      console.log(name + ': input, grafica, rilascio e cleanup verdi');
    }
    assert.deepEqual(errors, [], 'errori browser o shader');
    console.log('nessun errore');
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
