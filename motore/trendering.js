// Risorse realmente caricate sulla GPU, pool vuoti e aree che seguono Core.
const assert = require('node:assert/strict'), fs = require('node:fs');
const { chromium } = require('./pw.js');
const selected = (process.argv[2] || 'all').split(',');
const wants = (name) => selected.includes('all') || selected.includes(name);
(async () => {
  fs.mkdirSync('shots', { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(process.env.DITE_RENDER_URL || 'file://' + __dirname + '/dist/index.html');
    await page.waitForFunction(() => window.__dite && window.__dite.state());
    await page.evaluate(() => { const D = window.__dite; D.lockQ = true; D.begin(); document.getElementById('menuBtn').click(); });
    const draw = () => page.evaluate(() => {
      const D = window.__dite;
      if (D.renderOnce) { D.renderOnce(); return; }
      return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    const fixture = () => page.evaluate(() => {
      const D = window.__dite, s = D.state(), G = D.G, g = s.givers[0], p = s.player, arena = s.city.arenas[0];
      // Tutto si svolge in pausa: nessun nuovo cast o AI cambia il campione.
      for (const id of ['home', 'menu', 'tips']) document.getElementById(id).classList.add('hidden');
      document.getElementById('banner').className = '';
      s.mobs = []; s.shots = []; s.zones = []; s.teles = []; s.marks = []; s.lobs = []; s.traps = []; s.quest = null; s.events = [];
      // Corsia libera dell'arena: i draw non devono finire dietro un edificio.
      g.x = arena.x; g.z = arena.z + 7; G.giverViews[0].root.position.set(g.x, 0, g.z);
      Object.assign(p, { x: g.x + 10, z: g.z + 5, yaw: Math.PI / 4, invuln: 999 });
      Object.assign(p.cam, { x: p.x, y: 7, z: p.z });
      G.camera.position.set(p.x, 7, p.z); G.camera.lookAt(g.x, 1, g.z); G.camera.updateMatrixWorld();
      G.syncMobs(s, 0, 0); G.syncThings(s, 0, 0); G.syncTeles(s, 0); G.animZones(s, 0, 0); G.syncPowerFx(0);
      G.animUpdate(100); G.updateFx(100, 0, G.camera.position);
      window.__renderProof = { draws: {}, maps: {}, textures: {}, disposed: {} };
      const proof = window.__renderProof, sp = G.giverViews[0].sp;
      sp.onBeforeRender = () => { const id = sp.material.map.uuid; proof.maps[id] = (proof.maps[id] || 0) + 1; };
      return { x: g.x, z: g.z };
    });
    if (wants('memory')) {
      const samples = [], themes = ['dite', 'dite', 'dite', 'cocito', 'malebolge', 'dite', 'cocito', 'malebolge', 'dite'];
      for (let cycle = 0; cycle < themes.length; cycle++) {
        const theme = themes[cycle];
        const disposal = await page.evaluate((theme) => {
          const old = window.__renderProof;
          window.__dite.loadCity(theme, 14);
          return old ? old.disposed : null;
        }, theme);
        if (cycle > 0) { assert.equal(Object.keys(disposal).length, 3, 'Tre texture dei committenti devono essere liberate'); for (const n of Object.values(disposal)) assert.equal(n, 1, 'Ogni texture va liberata una sola volta'); }
        await fixture();
        await page.evaluate(() => {
          const D = window.__dite, G = D.G, s = D.state(), g = s.givers[0], proof = window.__renderProof;
          const before = new Set(G.scene.children);
          for (const [i, shape] of ['circle', 'line', 'cone', 'donut'].entries()) s.teles.push({ id: 90000 + i, shape, x: g.x - 3 + i * 1.8, z: g.z + 2, ang: 0, r: 1.5, r0: 0.6, len: 3, w: 1, half: 0.7, t: 0.5, wind: 2, el: 'fuoco' });
          G.syncTeles(s, 0.5);
          const beforeImpacts = new Set(G.scene.children);
          for (const tl of s.teles) G.teleFlash({ ...tl, z: tl.z - 3 });
          proof.impacts = G.scene.children.filter((o) => !beforeImpacts.has(o)); proof.impactDisposals = 0;
          for (const o of proof.impacts) o.traverse((m) => { if (m.geometry && !m.geometry.keep) m.geometry.addEventListener('dispose', () => proof.impactDisposals++); });
          G.updateFx(0.05, 0.5, G.camera.position);
          for (const o of G.scene.children) if (!before.has(o)) {
            const id = o.id; proof.draws[id] = 0;
            o.traverse((mesh) => { if (mesh.isMesh) mesh.onBeforeRender = () => proof.draws[id]++; });
          }
        });
        for (const state of ['q', 'a', 'w']) {
          await page.evaluate((state) => {
            const D = window.__dite, s = D.state(), G = D.G, g = s.givers[0], proof = window.__renderProof;
            g.offer = state === 'q' ? {} : null; s.quest = state === 'a' ? { giver: g.id } : null;
            G.syncGivers(s, 0);
            const texture = G.giverViews[0].sp.material.map;
            proof.textures[state] = texture.uuid;
            texture.addEventListener('dispose', () => { proof.disposed[texture.uuid] = (proof.disposed[texture.uuid] || 0) + 1; });
          }, state);
          await draw();
        }
        const expired = await page.evaluate(() => {
          const D = window.__dite, p = window.__renderProof; D.G.updateFx(1, 1, D.G.camera.position);
          return { removed: p.impacts.every((o) => !o.parent), disposed: p.impactDisposals };
        });
        assert.equal(expired.removed, true, 'Gli impatti scaduti vanno rimossi'); assert.equal(expired.disposed, 2, 'Le geometrie dedicate cono/ciambella vanno liberate');
        await draw();
        const sample = await page.evaluate(() => { const p = window.__renderProof, i = window.__dite.info(); return { geo: i.geo, tex: i.tex, draws: p.draws, maps: p.maps, textures: p.textures }; });
        assert.equal(Object.keys(sample.draws).length, 8, 'Preavvisi e impatti devono avere un corpo');
        for (const n of Object.values(sample.draws)) assert.ok(n > 0, 'Ogni forma del preavviso deve arrivare al renderer');
        assert.equal(new Set(Object.values(sample.textures)).size, 3);
        for (const id of Object.values(sample.textures)) assert.ok(sample.maps[id] > 0, 'Ogni texture deve essere renderizzata prima del cambio');
        const previous = samples.filter((s) => s.theme === theme);
        if (previous.length >= (theme === 'dite' ? 2 : 1)) { const prev = previous.at(-1); assert.ok(sample.geo <= prev.geo, theme + ': geometrie accumulate ' + prev.geo + ' → ' + sample.geo); assert.ok(sample.tex <= prev.tex, theme + ': texture accumulate ' + prev.tex + ' → ' + sample.tex); }
        samples.push({ theme, geo: sample.geo, tex: sample.tex });
        console.log('ciclo memoria', cycle, theme, sample.geo, sample.tex);
      }
      console.log('memoria dopo draw reale', JSON.stringify(samples));
    }
    if (wants('particles')) {
      await fixture();
      await page.evaluate(() => {
        const G = window.__dite.G, s = window.__dite.state();
        const mesh = G.scene.children.find((o) => o.isInstancedMesh && o.instanceMatrix.count === 640);
        if (!mesh) throw new Error('Pool particelle assente');
        window.__particleMesh = mesh; window.__particleDraws = 0; mesh.onBeforeRender = () => window.__particleDraws++;
        G.burst(s.givers[0].x, 2, s.givers[0].z, 7, 0xff2200, 0, 0, 0.5, 0.2, 0);
        G.updateFx(0.01, 0, G.camera.position);
      });
      await draw();
      const alive = await page.evaluate(() => ({ count: window.__particleMesh.count, visible: window.__particleMesh.visible, draws: window.__particleDraws }));
      assert.equal(alive.count, 7); assert.equal(alive.visible, true); assert.ok(alive.draws > 0, 'Le particelle devono essere disegnate');
      const empty = await page.evaluate(() => {
        const G = window.__dite.G, mesh = window.__particleMesh; G.updateFx(10, 10, G.camera.position);
        const version = mesh.instanceMatrix.version, colorVersion = mesh.instanceColor.version;
        for (let i = 0; i < 20; i++) G.updateFx(1 / 60, 11, G.camera.position);
        return { count: mesh.count, visible: mesh.visible, version, after: mesh.instanceMatrix.version, colorVersion, colorAfter: mesh.instanceColor.version, draws: window.__particleDraws };
      });
      assert.equal(empty.count, 0); assert.equal(empty.visible, false); assert.equal(empty.after, empty.version, 'Nessun upload matrici a pool vuoto'); assert.equal(empty.colorAfter, empty.colorVersion);
      await draw();
      assert.equal(await page.evaluate(() => window.__particleDraws), empty.draws, 'Il renderer deve saltare il pool vuoto');
      await page.evaluate(() => { const G = window.__dite.G, g = window.__dite.state().givers[0]; G.spray(g.x, 2, g.z, 0, 0, 0, 3, 0x0066ff, 0, 0, 1, 0.2, 0); G.updateFx(0.01, 12, G.camera.position); });
      await draw();
      const resumed = await page.evaluate(() => {
        const m = window.__particleMesh, c = new THREE.Color(), matrix = new THREE.Matrix4(); m.getColorAt(0, c); m.getMatrixAt(0, matrix);
        return { count: m.count, visible: m.visible, draws: window.__particleDraws, color: c.getHex(), scale: new THREE.Vector3().setFromMatrixScale(matrix).toArray() };
      });
      assert.equal(resumed.count, 3); assert.equal(resumed.visible, true); assert.ok(resumed.draws > empty.draws); assert.equal(resumed.color, 0x0066ff); assert.ok(resumed.scale.every((n) => n > 0));
      console.log('pool particelle', JSON.stringify({ alive, empty, resumed }));
    }
    if (wants('zones')) {
      await fixture();
      const before = await page.evaluate(() => {
        const D = window.__dite, s = D.state(), G = D.G, p = s.player, g = s.givers[0];
        s.grid.fill(0); s.city.props = []; s.npcs = []; s.patrols = []; s.turrets = []; s.boss = null;
        p.x = g.x; p.z = g.z + 4; p.yaw = 0;
        const children = new Set(G.scene.children);
        const result = D.Core.run(s, D.Bricks.parseProg('zone @fwd5 r2 t8 mv2 grow1 dome'), { K: { el: 'gelo', cd: 3 }, slot: 2, depth: 0 });
        if (result !== true) throw new Error('Zona non creata: ' + result);
        G.syncThings(s, 0, 0);
        const o = G.scene.children.find((o) => !children.has(o)); window.__zoneObject = o; window.__zoneDraws = 0;
        o.traverse((m) => { if (m.isMesh) m.onBeforeRender = () => window.__zoneDraws++; });
        G.scene.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(o);
        return { x: s.zones[0].x, z: s.zones[0].z, r: s.zones[0].r, center: box.getCenter(new THREE.Vector3()).toArray(), size: box.getSize(new THREE.Vector3()).toArray() };
      });
      await draw();
      assert.ok(await page.evaluate(() => window.__zoneDraws) > 0, 'La zona iniziale deve essere disegnata');
      const after = await page.evaluate(() => {
        const D = window.__dite, s = D.state(), G = D.G;
        const input = { mx: 0, my: 0, yaw: 0, pitch: 0, fire: false, b: [false, false, false, false, false], use: false };
        for (let i = 0; i < 60; i++) D.Core.step(s, 1 / 60, input);
        G.syncThings(s, 1, 1); G.scene.updateMatrixWorld(true);
        const zone = s.zones[0]; if (!zone) throw new Error('La zona si e\' estinta prima del controllo');
        const box = new THREE.Box3().setFromObject(window.__zoneObject);
        return { x: zone.x, z: zone.z, r: zone.r, center: box.getCenter(new THREE.Vector3()).toArray(), size: box.getSize(new THREE.Vector3()).toArray(), draws: window.__zoneDraws };
      });
      assert.ok(Math.hypot(after.x - before.x, after.z - before.z) > 1.9, 'Core deve realmente spostare la zona');
      assert.ok(after.r > before.r + 0.9, 'Core deve realmente far crescere la zona');
      for (const value of [before, after]) {
        assert.ok(Math.abs(value.center[0] - value.x) < 0.01 && Math.abs(value.center[2] - value.z) < 0.01, 'Centro visibile diverso dalla zona logica');
        assert.ok(Math.abs(value.size[0] - value.r * 2) < 0.01 && Math.abs(value.size[2] - value.r * 2) < 0.01, 'Raggio visibile diverso dalla zona logica');
      }
      assert.ok(after.size[1] > before.size[1] + 0.9, 'Anche la cupola deve crescere');
      await draw();
      assert.ok(await page.evaluate(() => window.__zoneDraws) > after.draws, 'La zona spostata deve essere disegnata');
      await page.screenshot({ path: 'shots/rendering-zone-mobile.png' });
      console.log('zona mossa e cresciuta', JSON.stringify({ before, after }));
    }
    assert.deepEqual(errors, [], 'Errori browser/shader');
    console.log('nessun errore');
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
