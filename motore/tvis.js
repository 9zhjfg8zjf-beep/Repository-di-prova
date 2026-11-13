// Fotografie ripetibili dei nuovi comportamenti, cleanup e diagnostica shader.
const assert = require('node:assert/strict'), fs = require('node:fs');
const { chromium } = require('./pw.js');
// Esempi: node tvis.js stati,legami  oppure DITE_VIS=forma-luce node tvis.js.
const selected = (process.argv[2] || process.env.DITE_VIS || 'all').split(',');
const wants = (name) => selected.includes('all') || selected.includes(name) || (name.startsWith('forma-') && selected.includes('forme'));
(async () => {
  fs.mkdirSync('shots', { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(process.env.DITE_TEST_URL || 'file://' + __dirname + '/dist/index.html');
    await page.waitForFunction(() => !!window.__dite);
    await page.evaluate(() => { const D = window.__dite; D.lockQ = true; D.begin(); });
    await page.waitForTimeout(600);
    await page.evaluate(() => { document.getElementById('menuBtn').click(); document.getElementById('menu').classList.add('hidden'); document.getElementById('ui').classList.remove('hidden'); document.getElementById('banner').className = ''; });
    const setup = async () => page.evaluate(() => {
      const D = window.__dite, G = D.G, s = D.state(), p = s.player;
      D.Core.setRecipe(s, D.Bricks.PRESETS[0]); s.mobs.length = 0; s.shots.length = 0; s.zones.length = 0; s.events.length = 0;
      // La scena e' in pausa: va spostata anche la camera logica usata dal culling.
      // La corsia laterale tiene il segnale luminoso centrale fuori dai bersagli.
      const arena = s.city.arenas[0], laneZ = arena.z + 7; p.x = arena.x + 10; p.z = laneZ; p.yaw = Math.PI / 2; p.pitch = -0.12; p.hp = 70; p.invuln = 999;
      Object.assign(p.cam, { x: p.x, y: 1.7, z: p.z });
      G.camera.position.set(p.x, 1.7, p.z); G.camera.rotation.set(-0.12, Math.PI / 2, 0, 'YXZ'); G.camera.updateMatrixWorld();
      const enemies = [[-2, 0, 'tiratore'], [-4, -3, 'sgherro'], [-5, 3, 'bruto']].map(([dx, dz, kind]) => { const e = D.Core.mkMob(s, kind, arena.x + dx, laneZ + dz, 'e'); e.spawn = 0; e.atk = 99; e.hp = e.maxHp = 800; e.fx = 1; e.fz = 0; return e; });
      s.aim = { kind: 'e', id: enemies[0].id, x: enemies[0].x, z: enemies[0].z, d: 12 };
      G.syncMobs(s, 0.5, 0); G.syncNpcs(s, 0.016, 0); G.syncPowerFx(0);
      // Gli indicatori HUD rimasti dal punto di partenza non seguono una scena in pausa.
      for (const id of ['objMark', 'nodeMark']) document.getElementById(id).style.display = 'none';
      document.getElementById('hint').textContent = '';
      for (const e of enemies) { const v = G.mobViews.get(e.id); v.root.userData.draws = 0; v.g.traverse((o) => { if (o.isMesh) o.onBeforeRender = () => v.root.userData.draws++; }); }
      return enemies.map((e) => e.id);
    });
    const inspect = async () => {
      // In pausa il renderer riposa: la fixture richiede un vero draw esplicito.
      await page.evaluate(() => { if (!window.__dite.renderOnce()) throw Error('Draw esplicito non riuscito'); });
      const result = await page.evaluate(() => {
        const D = window.__dite, G = D.G, s = D.state(); G.scene.updateMatrixWorld(true);
        return s.mobs.map((e) => {
          const v = G.mobViews.get(e.id), center = v.g.getWorldPosition(new THREE.Vector3()).project(G.camera), bad = [];
          v.root.traverse((o) => { if (!o.matrixWorld.elements.every(Number.isFinite)) bad.push(o.type + ':' + o.id); });
          return { id: e.id, kind: e.kind, visible: v.root.visible, inScene: v.root.parent === G.scene, draws: v.root.userData.draws, projection: center.toArray(), bad };
        });
      });
      for (const m of result) {
        assert.deepEqual(m.bad, [], 'matrici non finite: ' + m.kind);
        assert.ok(m.visible && m.inScene && m.draws > 0, 'modello non disegnato: ' + JSON.stringify(m));
        assert.ok(m.projection.every(Number.isFinite) && m.projection.every((v) => Math.abs(v) < 1), 'bersaglio fuori campo: ' + JSON.stringify(m));
      }
      if (process.env.DITE_VIS_DEBUG) console.log('modelli', JSON.stringify(result));
    };
    const scenarios = [
      ['portali', 'portal g22 r1.2 t10 foes shots'],
      ['barriera', 'barrier @fwd6 l7 t8 hp120 reflect'],
      ['magnetismo', 'magnet @fwd8 r5 t8 force16 repel'],
      ['legami', 'link @fwd8 r7 n3 t8; tether g24 t8 l3'],
      ['stati', 'debt g24 t6; disarm g24 t5; silence g24 t5; infect g24 t8; rewindfoe g24 t6'],
      ['assorbimento', 'absorb t8 r3 cap120'],
      ['imitazione', 'mimic g24 t8'],
    ];
    const available = ['all', 'forme', 'cleanup', ...scenarios.map(([name]) => name), ...['fuoco', 'gelo', 'folgore', 'veleno', 'ombra', 'luce', 'sangue', 'vento'].map((el) => 'forma-' + el)];
    for (const name of selected) assert.ok(available.includes(name), 'scenario sconosciuto: ' + name);
    for (const [name, prog] of scenarios) {
      if (!wants(name)) continue;
      await setup();
      const result = await page.evaluate(([prog, name]) => {
        const D = window.__dite, s = D.state(), G = D.G;
        const result = D.Core.run(s, D.Bricks.parseProg(prog), { K: { el: 'folgore' }, slot: 2, depth: 0 });
        if (name === 'assorbimento') s.player.bank = 75;
        if (name === 'legami') s.mobs[0].x -= 2;
        G.syncMobs(s, 0.016, 1); G.syncPowerFx(1);
        for (const ev of s.events) G.powerEvent(ev);
        G.updateFx(0.05, 1, G.camera.position);
        return { result, count: G.powerFxCount, hud: document.getElementById('powerHud').textContent };
      }, [prog, name]);
      assert.equal(result.result, true, name + ' deve attivarsi');
      if (name !== 'imitazione') assert.ok(result.count > 0, name + ' deve avere una rappresentazione persistente');
      else assert.match(result.hud, /IMITAZIONE/);
      await inspect();
      await page.screenshot({ path: 'shots/nuovi-' + name + '.png' });
      console.log(name, JSON.stringify(result));
    }
    // Materiali per elemento: attiva realmente la compilazione degli shader.
    for (const el of ['fuoco', 'gelo', 'folgore', 'veleno', 'ombra', 'luce', 'sangue', 'vento']) {
      if (!wants('forma-' + el)) continue;
      await setup();
      await page.evaluate((el) => { const D = window.__dite, G = D.G, p = D.state().player; G.animUpdate(10); G.updateFx(10, 0, G.camera.position); G.shapeFx({ shape: 'circle', x: p.x - 5, z: p.z, r: 5, ang: -Math.PI / 2, el }); G.animUpdate(0.1); G.updateFx(0.1, 1, G.camera.position); }, el);
      await inspect();
      await page.screenshot({ path: 'shots/nuovi-forma-' + el + '.png' });
    }
    await setup();
    const cleanup = await page.evaluate(() => { const D = window.__dite, G = D.G, s = D.state(); G.animUpdate(50); G.updateFx(50, 0, G.camera.position); G.syncPowerFx(50); return { count: G.powerFxCount, bank: s.player.bank, hudHidden: document.getElementById('powerHud').classList.contains('hidden') }; });
    assert.deepEqual(cleanup, { count: 0, bank: 0, hudHidden: true });
    assert.deepEqual(errors, [], 'errori browser o shader');
    console.log('nessun errore');
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
