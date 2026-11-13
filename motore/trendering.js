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
    const fixture = (theme, seed = 14) => page.evaluate(({ theme, seed }) => {
      const D = window.__dite, old = window.__renderProof; if (theme) D.loadCity(theme, seed);
      const s = D.state(), G = D.G, g = s.givers[0], p = s.player, arena = s.city.arenas[0];
      G.renderPrefs = { quality: 'quality', reducedMotion: false, reducedFlash: false };
      // Tutto si svolge in pausa: nessun nuovo cast o AI cambia il campione.
      for (const id of ['home', 'menu', 'tips']) document.getElementById(id).classList.add('hidden');
      document.getElementById('banner').className = '';
      s.mobs = []; s.shots = []; s.zones = []; s.teles = []; s.marks = []; s.lobs = []; s.traps = []; s.quest = null; s.events = [];
      // Corsia libera dell'arena: i draw non devono finire dietro un edificio.
      g.x = arena.x; g.z = arena.z + 7; G.giverViews[0].root.position.set(g.x, 0, g.z);
      Object.assign(p, { x: g.x + 10, z: g.z + 5, yaw: Math.PI / 4, invuln: 999, fury: 0, phoenix: 0, orbit: 0 });
      Object.assign(p.cam, { x: p.x, y: 7, z: p.z });
      G.camera.position.set(p.x, 7, p.z); G.camera.lookAt(g.x, 1, g.z); G.camera.updateMatrixWorld();
      G.syncMobs(s, 0, 0); G.syncThings(s, 0, 0); G.syncTeles(s, 0); G.animZones(s, 0, 0); G.syncPowerFx(0);
      G.animUpdate(100); G.updateFx(100, 0, G.camera.position);
      G.syncOrbs(s, 0, 0); Object.assign(G.hands, { hold: 0, both: 0, lift: 0, push: 0, zap: 0 }); G.updateHands(1, 0, false, 844 / 390);
      window.__renderProof = { draws: {}, maps: {}, textures: {}, disposed: {} };
      const proof = window.__renderProof, sp = G.giverViews[0].sp;
      sp.onBeforeRender = () => { const id = sp.material.map.uuid; proof.maps[id] = (proof.maps[id] || 0) + 1; };
      // Consuma il dirty della lobby prima che un RAF scelga una camera diversa.
      if (D.renderOnce) D.renderOnce();
      return { x: g.x, z: g.z, disposal: old ? old.disposed : null };
    }, { theme, seed });
    if (wants('memory')) {
      const samples = [], themes = ['dite', 'dite', 'dite', 'cocito', 'malebolge', 'dite', 'cocito', 'malebolge', 'dite'];
      for (let cycle = 0; cycle < themes.length; cycle++) {
        const theme = themes[cycle];
        const { disposal } = await fixture(theme);
        if (cycle > 0) { assert.equal(Object.keys(disposal).length, 3, 'Tre texture dei committenti devono essere liberate'); for (const n of Object.values(disposal)) assert.equal(n, 1, 'Ogni texture va liberata una sola volta'); }
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
        const mesh = G.scene.getObjectByName('dite-particles') || G.scene.children.find((o) => o.isInstancedMesh && o.instanceMatrix.count === 640); // compatibile con la controprova 3.2
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
    const photo = async (name) => {
      const tag = (process.env.DITE_RENDER_TAG || '').replace(/[^a-z0-9-]/gi, ''), path = 'shots/rendering-' + name + (tag ? '-' + tag : '') + '.png';
      const png = await page.screenshot({ path });
      return page.evaluate(async (data) => {
        const image = new Image(); image.src = 'data:image/png;base64,' + data; await image.decode();
        const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height; const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0);
        const pixels = ctx.getImageData(210, 65, 430, 230).data; let white = 0, colored = 0;
        for (let i = 0; i < pixels.length; i += 4) { const hi = Math.max(pixels[i], pixels[i + 1], pixels[i + 2]), lo = Math.min(pixels[i], pixels[i + 1], pixels[i + 2]); if (lo >= 245) white++; if (hi - lo >= 35) colored++; }
        return { white: white / (pixels.length / 4), colored: colored / (pixels.length / 4) };
      }, png.toString('base64'));
    };
    if (wants('environment')) {
      const samples = [];
      for (const theme of ['dite', 'cocito', 'malebolge']) {
        await fixture(theme, 3);
        await page.evaluate(() => {
          const D = window.__dite, s = D.state(), G = D.G, p = s.player, c = s.city.canals[0], v = 6 * c.k * D.Core.CELL - D.Core.HALF + 4;
          p.x = c.horiz ? 2 : v - 9; p.z = c.horiz ? v - 9 : 2;
          Object.assign(p.cam, { x: p.x, y: 1.7, z: p.z }); G.camera.position.set(p.x, 1.7, p.z); G.camera.rotation.set(-0.15, c.horiz ? Math.PI + 0.5 : -Math.PI / 2 + 0.5, 0, 'YXZ'); G.camera.updateMatrixWorld();
          G.sky.position.copy(G.camera.position); G.sky.material.uniforms.time.value = 3;
          for (const material of G.liqMats) material.uniforms.time.value = 3;
          G.syncGivers(s, 3); G.syncNpcs(s, 0, 3); G.syncSeals(s, 3); G.drawScreens(0, 3);
          Object.assign(G.hands, { visible: 1, hold: 0, both: 0, lift: 0, push: 0, zap: 0 }); G.updateHands(1, 3, false, 844 / 390);
        });
        await draw(); const result = await photo('canal-' + theme); samples.push({ theme, ...result });
        assert.ok(result.white < 0.12, theme + ': canale sbiancato ' + result.white);
      }
      console.log('canali senza poteri', JSON.stringify(samples));
    }
    if (wants('readability')) {
      await fixture('dite');
      const setup = await page.evaluate(() => {
        const D = window.__dite, G = D.G, s = D.state(), p = s.player, arena = s.city.arenas[0];
        p.x = arena.x + 10; p.z = arena.z + 7; p.yaw = Math.PI / 2; p.pitch = -0.12; p.res = 100;
        Object.assign(p.cam, { x: p.x, y: 1.7, z: p.z }); G.camera.position.set(p.x, 1.7, p.z); G.camera.rotation.set(-0.12, Math.PI / 2, 0, 'YXZ'); G.camera.updateMatrixWorld();
        for (const v of G.giverViews) v.root.visible = false;
        const recipe = (ult) => ({ nome: 'Sovrapposizione', slots: ['frusta', 'scatto', 'zona', 'nova', ult].map((id) => ({ id, el: 'vento', t: 1 })) });
        const input = { mx: 0, my: 0, yaw: p.yaw, pitch: p.pitch, fire: false, b: [false, false, false, false, true], use: false };
        D.Core.setRecipe(s, recipe('fenice')); D.Core.step(s, 1 / 60, input);
        D.Core.setRecipe(s, recipe('turbine')); p.res = 100; p.cd[4] = 0; D.Core.step(s, 1 / 60, input);
        D.Core.run(s, D.Bricks.parseProg('buff t20 fury1.6'), { K: { el: 'sangue' }, slot: 2, depth: 0 });
        s.mobs = []; window.__overlapDraws = 0;
        for (const [dx, dz, kind] of [[-2, 0, 'tiratore'], [-4, -3, 'sgherro'], [-5, 3, 'bruto']]) { const e = D.Core.mkMob(s, kind, arena.x + dx, p.z + dz, 'e'); e.spawn = 0; e.atk = 99; e.hp = e.maxHp = 800; }
        for (const el of ['luce', 'vento', 'folgore']) {
          D.Core.run(s, D.Bricks.parseProg('zone @fwd8 r5.5 t8 dps5 dome'), { K: { el }, slot: 2, depth: 0 });
          const z = s.zones.at(-1); G.teleFlash({ shape: 'circle', x: z.x, z: z.z, r: z.r, ang: 0, el }); G.ring(z.x, 0.12, z.z, 2, 6, 0.5, D.Bricks.ELEM[el].c);
        }
        G.syncMobs(s, 0.1, 1); G.syncThings(s, 0.05, 1); G.animZones(s, 0.05, 1); G.syncOrbs(s, 1); G.updateFx(0.05, 1, G.camera.position);
        for (const v of G.mobViews.values()) { v.flash = 0.06; v.g.traverse((o) => { if (o.isMesh) o.onBeforeRender = () => window.__overlapDraws++; }); }
        G.syncMobs(s, 0.01, 1); G.hands.visible = 1; G.hands.both = 0.9; G.gesture('slash', 'vento'); G.updateHands(0.08, 1, false, 844 / 390); G.animUpdate(0.05);
        return { fury: p.fury, phoenix: p.phoenix, orbit: p.orbit, zones: s.zones.length };
      });
      assert.ok(setup.fury > 0 && setup.phoenix > 0 && setup.orbit > 0 && setup.zones === 3, 'La fixture deve sovrapporre buff e zone espliciti');
      await draw(); const impact = await photo('overlap-impact');
      assert.ok(await page.evaluate(() => window.__overlapDraws) > 0, 'I nemici nella sovrapposizione devono arrivare al renderer');
      await page.evaluate(() => { const D = window.__dite, G = D.G, s = D.state(); G.updateFx(0.6, 1.6, G.camera.position); G.animUpdate(0.6); G.syncMobs(s, 0.6, 1.6); G.syncThings(s, 0.6, 1.6); G.syncOrbs(s, 1.6); G.updateHands(0.6, 1.6, false, 844 / 390); });
      await draw(); const persistent = await photo('overlap-persistent');
      console.log('sovrapposizione esplicita', JSON.stringify({ setup, impact, persistent }));
      for (const [name, result] of [['impatto', impact], ['persistente', persistent]]) { assert.ok(result.white < 0.12, name + ': centro sbiancato ' + result.white); assert.ok(result.colored > 0.15, name + ': colori scomparsi'); }
      // Il boss annuncia un colpo vero: il confine deve esistere fin dall'inizio.
      await fixture();
      await page.evaluate(() => {
        const D = window.__dite, G = D.G, s = D.state(), a = s.city.arenas[0];
        s.player.x = a.x; s.player.z = a.z + 7; D.Core.wakeBoss(s, 0);
        const attack = Object.keys(D.Bricks.ATK).find((id) => D.Bricks.ATK[id].shape === 'circle'); D.Core.bossCast(s, s.boss, attack);
        s.teles[0].t = s.teles[0].wind * 0.15; G.syncTeles(s, 0); G.syncBoss(s, 0.1, 0); G.scene.updateMatrixWorld(true);
        window.__teleDraws = 0; const o = G.scene.children.find((o) => o.name === 'dite-telegraph-' + s.teles[0].id); if (o) o.traverse((m) => { if (m.isMesh) m.onBeforeRender = () => window.__teleDraws++; });
      });
      await draw(); await photo('boss-early');
      await page.evaluate(() => { const D = window.__dite, s = D.state(); s.teles[0].t = s.teles[0].wind * 0.9; D.G.syncTeles(s, 1); });
      await draw(); await photo('boss-late');
      assert.ok(await page.evaluate(() => window.__teleDraws) > 0, 'Il preavviso del boss deve essere disegnato');
    }
    if (wants('comfort')) {
      await fixture('dite');
      const result = await page.evaluate(() => {
        const G = window.__dite.G, s = window.__dite.state(), g = s.givers[0];
        G.renderPrefs = { quality: 'performance', reducedMotion: true, reducedFlash: true };
        G.hypT = 0; G.drawScreens(1, 10); const still = G.screenTex.version;
        G.drawScreens(1, 11); const unchanged = G.screenTex.version;
        G.hypT = 2; G.drawScreens(0.1, 12); const hypnosis = G.screenTex.version;
        G.drawScreens(3, 15); const ended = G.screenTex.version;
        G.burst(g.x, 2, g.z, 40, 0xff2200, 0, 0, 1, 0.2, 0); G.updateFx(0.01, 0, G.camera.position);
        const info = G.fxInfo(); return { still, unchanged, hypnosis, ended, particles: info.drawnParticles };
      });
      assert.equal(result.still, result.unchanged, 'Schermo fermo: nessun nuovo upload'); assert.ok(result.hypnosis > result.unchanged && result.ended > result.hypnosis, 'L\'ipnosi deve restare indicata anche senza animazioni'); assert.ok(result.particles > 0 && result.particles < 40, 'Prestazioni riduce solo la decorazione');
      const paused = await page.evaluate(() => {
        const D = window.__dite, G = D.G, s = D.state(), p = s.player;
        G.renderPrefs.reducedMotion = false;
        D.Core.run(s, D.Bricks.parseProg('buff t20 orbit20 r3; zone @fwd5 r3 t8 dps5'), { K: { el: 'fuoco' }, slot: 2, depth: 0 });
        const e = D.Core.mkMob(s, 'sgherro', p.x - 5, p.z, 'e'); e.spawn = 0; e.burnT = 2; e.thrown = { el: 'fuoco' };
        G.animMobs(s, 0.01); G.updateFx(10, 0, G.camera.position);
        const before = G.fxInfo();
        for (let i = 0; i < 40; i++) { G.syncMobs(s, 0, i); G.syncThings(s, 0, i); G.animZones(s, 0, i); G.syncOrbs(s, i, 0); G.animMobs(s, 0); G.updateFx(0, i, G.camera.position); }
        return { before, after: G.fxInfo() };
      });
      assert.equal(paused.after.activeParticles, paused.before.activeParticles, 'Un refresh in pausa non emette particelle'); assert.equal(paused.after.impacts, paused.before.impacts); assert.equal(paused.after.particleMatrixVersion, paused.before.particleMatrixVersion);
      await draw(); console.log('comfort', JSON.stringify({ ...result, paused }));
    }
    assert.deepEqual(errors, [], 'Errori browser/shader');
    console.log('nessun errore');
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
