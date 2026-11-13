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
      const D = window.__dite, s = D.state(), G = D.G, g = s.givers[0], p = s.player;
      // Tutto si svolge in pausa: nessun nuovo cast o AI cambia il campione.
      for (const id of ['home', 'menu', 'tips']) document.getElementById(id).classList.add('hidden');
      document.getElementById('banner').className = '';
      s.mobs = []; s.shots = []; s.zones = []; s.teles = []; s.marks = []; s.lobs = []; s.traps = []; s.quest = null; s.events = [];
      Object.assign(p, { x: g.x + 7, z: g.z + 7, yaw: Math.PI / 4, invuln: 999 });
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
        const sample = await page.evaluate(() => { const p = window.__renderProof, i = window.__dite.info(); return { geo: i.geo, tex: i.tex, draws: p.draws, maps: p.maps, textures: p.textures }; });
        assert.equal(Object.keys(sample.draws).length, 4);
        for (const n of Object.values(sample.draws)) assert.ok(n > 0, 'Ogni forma del preavviso deve arrivare al renderer');
        assert.equal(new Set(Object.values(sample.textures)).size, 3);
        for (const id of Object.values(sample.textures)) assert.ok(sample.maps[id] > 0, 'Ogni texture deve essere renderizzata prima del cambio');
        const previous = samples.filter((s) => s.theme === theme);
        if (previous.length >= (theme === 'dite' ? 2 : 1)) { const prev = previous.at(-1); assert.ok(sample.geo <= prev.geo, theme + ': geometrie accumulate ' + prev.geo + ' → ' + sample.geo); assert.ok(sample.tex <= prev.tex, theme + ': texture accumulate ' + prev.tex + ' → ' + sample.tex); }
        samples.push({ theme, geo: sample.geo, tex: sample.tex });
      }
      console.log('memoria dopo draw reale', JSON.stringify(samples));
    }
    assert.deepEqual(errors, [], 'Errori browser/shader');
    console.log('nessun errore');
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
