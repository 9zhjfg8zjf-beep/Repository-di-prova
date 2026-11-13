// Scansione oltre un palazzo reale e copie vulnerabili nel ciclo input/render completo.
'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs');
const { chromium } = require('./pw.js');
const mode = process.argv[2] || 'all';
assert.ok(['all', 'scan', 'clone', 'mimic'].includes(mode), 'Uso: node tsensi_browser.js [all|scan|clone|mimic]');
(async () => {
  fs.mkdirSync(__dirname + '/shots', { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true }), errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(process.env.DITE_TEST_URL || 'file://' + __dirname + '/dist/index.html');
    await page.waitForFunction(() => !!window.__dite);
    await page.evaluate(() => {
      const D = window.__dite; D.lockQ = true; D.begin(); document.getElementById('menuBtn').click(); document.getElementById('menu').classList.add('hidden');
      // Osserva il vero passo chiamato dal frame, senza pilotare la simulazione a parte.
      const step = D.Core.step;
      D.Core.step = function (s, dt, input) {
        const first = s.events.length; step(s, dt, input); const trace = window.__sensiTrace; if (!trace) return;
        for (const e of s.events.slice(first)) if (trace.events.length < 2000) trace.events.push({ type: e.type, id: e.id, slot: e.slot, team: e.team, x: e.x, z: e.z, wall: e.type === 'shotEnd' && D.Core.opaqueAt(s, e.x, e.z) });
        for (const q of s.shots) if (!trace.seen.has(q.id)) { trace.seen.add(q.id); trace.shots.push({ id: q.id, clone: !!q.clone, team: q.team, x: q.x, z: q.z, dmg: q.dmg }); }
      };
    });
    // Ferma la scena per la fotografia, mantenendo il suo HUD come nel frame attivo.
    const pause = async () => page.evaluate(() => { document.getElementById('menuBtn').click(); document.getElementById('menu').classList.add('hidden'); document.getElementById('ui').classList.remove('hidden'); document.getElementById('banner').className = ''; });
    const frames = async () => page.evaluate(() => { if (!window.__dite.renderOnce()) throw Error('Draw esplicito non riuscito'); });
    const advance = async (seconds) => {
      const until = await page.evaluate((seconds) => { const t = window.__dite.state().t; document.getElementById('resume').click(); return t + seconds; }, seconds);
      await page.waitForFunction((until) => window.__dite.state().t >= until, until, { timeout: 60000 });
    };
    const setup = async (power) => page.evaluate((power) => {
      const D = window.__dite, s = D.state(), p = s.player, a = D.Bricks.LIST.find((a) => a.nome === power);
      if (!a) throw Error('Meccanica assente dal build: ' + power);
      D.setRecipe({ nome: 'Prova sensi e copie', slots: ['dardo', 'scatto', a.id, 'nova', 'ira'].map((id) => ({ id, el: 'folgore', t: 1 })) });
      s.mobs.length = 0; s.shots.length = 0; s.zones.length = 0; s.events.length = 0; s.patrols.length = 0; s.quest = null;
      for (const t of s.turrets) t.stun = 999;
      Object.assign(p, { hp: 100, maxHp: 100, invuln: 999, shield: 0, shieldT: 0, res: 100, pitch: -.02 }); p.cd.fill(0);
      window.__sensiTrace = { events: [], shots: [], seen: new Set() };
      document.getElementById('banner').className = '';
    }, power);
    const cleanup = async () => {
      await pause(); await page.evaluate(() => window.__dite.setRecipe(window.__dite.Bricks.PRESETS[0])); await advance(.2); await pause();
      const state = await page.evaluate(() => { const D = window.__dite, s = D.state(); return { scan: !!s.player.scan, clones: s.mobs.filter((e) => e.cloned && !e.dead).length, scanFx: D.G.scanFxCount, allFx: D.G.powerFxCount, hudHidden: document.getElementById('powerHud').classList.contains('hidden'), cloneViews: [...D.G.mobViews.values()].filter((v) => v.kind === 'clone').length }; });
      assert.deepEqual(state, { scan: false, clones: 0, scanFx: 0, allFx: 0, hudHidden: true, cloneViews: 0 });
    };
    if (mode === 'all' || mode === 'scan') {
      await setup('Occhio del vestibolo');
      const target = await page.evaluate(() => {
        const D = window.__dite, s = D.state(), p = s.player; Object.assign(p, { x: 10, z: 0, yaw: Math.PI / 2 }); Object.assign(p.cam, { x: p.x, y: 1.7, z: p.z }); D.setLook(p.yaw, p.pitch);
        const e = D.Core.mkMob(s, 'bruto', -10, 0, 'e'); e.hp = e.maxHp = 800; e.spawn = 0; e.root = 999; e.atk = 999; return e.id;
      });
      await advance(.25); await pause();
      const before = await page.evaluate((id) => {
        const D = window.__dite, s = D.state(), G = D.G, e = s.mobs.find((e) => e.id === id), end = new THREE.Vector3(e.x, 2.35, e.z), origin = G.camera.position.clone();
        G.scene.updateMatrixWorld(true);
        const ray = new THREE.Raycaster(origin, end.clone().sub(origin).normalize(), .1, origin.distanceTo(end));
        const opaque = []; G.scene.traverseVisible((o) => { if (o.isMesh && !Array.isArray(o.material) && !o.material.transparent && o.material.depthWrite) opaque.push(o); });
        const hit = ray.intersectObjects(opaque, false).find((h) => h.distance < origin.distanceTo(end) - 2);
        const mini = document.getElementById('mini'), x = Math.round((e.x + D.Core.HALF) / (D.Core.HALF * 2) * mini.width), z = Math.round((e.z + D.Core.HALF) / (D.Core.HALF * 2) * mini.height), pixels = mini.getContext('2d').getImageData(x - 5, z - 5, 11, 11).data;
        let blue = 0; for (let i = 0; i < pixels.length; i += 4) if (pixels[i + 2] > 190 && pixels[i + 1] > 130 && pixels[i + 1] > pixels[i] + 25) blue++;
        return { los: D.Core.los(s, s.player.x, s.player.z, e.x, e.z), target: [e.x, e.z], distance: origin.distanceTo(end), blocker: hit && { distance: hit.distance, point: hit.point.toArray(), material: hit.object.material.type }, blue, aim: s.aim.kind };
      }, target);
      assert.equal(before.los, false); assert.ok(before.blocker && before.blocker.distance < before.distance - 2, 'deve esserci un palazzo realmente disegnato davanti al nemico'); assert.equal(before.aim, '');
      await frames(); await page.screenshot({ path: __dirname + '/shots/sensi-muro-prima.png' });
      await page.evaluate(() => { document.getElementById('resume').click(); window.__dite.press(2); });
      await page.waitForFunction((id) => { const p = window.__dite.state().player; return p.scan && p.scan.ids.includes(id); }, target, { timeout: 60000 });
      await advance(.25); await pause();
      const scan = await page.evaluate((id) => {
        const D = window.__dite, s = D.state(), G = D.G, e = s.mobs.find((e) => e.id === id), found = [];
        G.scene.traverse((o) => { if (o.isLineSegments && o.material.depthTest === false && o.parent.position.x === e.x && o.parent.position.z === e.z) found.push(o); });
        G.scene.updateMatrixWorld(true);
        const outline = found[0]; if (!outline) return null;
        outline.userData.draws = 0; outline.onBeforeRender = () => outline.userData.draws++;
        const center = outline.getWorldPosition(new THREE.Vector3()).project(G.camera), mini = document.getElementById('mini'), x = Math.round((e.x + D.Core.HALF) / (D.Core.HALF * 2) * mini.width), z = Math.round((e.z + D.Core.HALF) / (D.Core.HALF * 2) * mini.height), pixels = mini.getContext('2d').getImageData(x - 5, z - 5, 11, 11).data;
        let blue = 0; for (let i = 0; i < pixels.length; i += 4) if (pixels[i + 2] > 190 && pixels[i + 1] > 130 && pixels[i + 1] > pixels[i] + 25) blue++;
        return { count: G.scanFxCount, hud: document.getElementById('powerHud').textContent, visible: outline.visible && outline.parent.visible, depthTest: outline.material.depthTest, depthWrite: outline.material.depthWrite, opacity: outline.material.opacity, finite: outline.matrixWorld.elements.every(Number.isFinite), projection: center.toArray(), blue, aim: s.aim.kind };
      }, target);
      assert.ok(scan && scan.visible && scan.finite); assert.equal(scan.count, 1); assert.equal(scan.depthTest, false); assert.equal(scan.depthWrite, false); assert.ok(scan.opacity >= .8); assert.ok(scan.projection.every((n) => Number.isFinite(n) && Math.abs(n) < 1)); assert.ok(scan.hud.includes('Rilevamento · 1')); assert.ok(scan.blue > before.blue, 'la minimappa deve segnare il contatto rilevato'); assert.equal(scan.aim, '');
      await frames();
      assert.ok(await page.evaluate(() => { let n = 0; window.__dite.G.scene.traverse((o) => { if (o.isLineSegments && o.material.depthTest === false) n += o.userData.draws || 0; }); return n > 0; }), 'outline non disegnato');
      await page.screenshot({ path: __dirname + '/shots/sensi-muro-rilevato.png' });
      await page.evaluate(() => { document.getElementById('resume').click(); }); await page.keyboard.down('j');
      await page.waitForFunction(() => window.__sensiTrace.events.some((e) => e.type === 'cast' && e.slot === 0), null, { timeout: 60000 }); await page.keyboard.up('j'); await advance(.7); await pause();
      const blocked = await page.evaluate((id) => { const s = window.__dite.state(); return { hp: s.mobs.find((e) => e.id === id).hp, wallEnds: window.__sensiTrace.events.filter((e) => e.type === 'shotEnd' && e.team === 'p' && e.wall).length, shots: window.__sensiTrace.shots.filter((q) => q.team === 'p').length }; }, target);
      assert.ok(blocked.shots > 0 && blocked.wallEnds > 0, 'il primario deve impattare davvero nel muro'); assert.equal(blocked.hp, 800);
      await cleanup(); console.log('scan: palazzo opaco, outline/minimappa, colpi bloccati e cleanup verdi');
    }
    if (mode === 'all' || mode === 'clone') {
      await setup('Due ombre operose');
      await page.evaluate(() => {
        const D = window.__dite, s = D.state(), p = s.player, A = s.city.arenas[0]; Object.assign(p, { x: A.x + 10, z: A.z + 7, yaw: Math.PI / 2 }); Object.assign(p.cam, { x: p.x, y: 1.7, z: p.z }); D.setLook(p.yaw, p.pitch);
        for (const dz of [-2.3, 0, 2.3]) { const e = D.Core.mkMob(s, 'sgherro', A.x + 16, p.z + dz, 'e'); e.spawn = 0; e.root = 999; e.atk = 999; e.hp = e.maxHp = 800; e.testLane = dz; }
      });
      await advance(.2); await page.evaluate(() => window.__dite.press(2));
      await page.waitForFunction(() => window.__dite.state().mobs.filter((e) => e.cloned && !e.dead).length === 2, null, { timeout: 60000 }); await pause();
      // La posa di collaudo mette entrambe le copie davanti alla camera; restano
      // creature vere, immobilizzate, con il loro danno e la loro vulnerabilita'.
      await page.evaluate(() => { const D = window.__dite, s = D.state(); for (const e of s.mobs) if (e.cloned) e.root = 999; s.player.x -= 7; Object.assign(s.player.cam, { x: s.player.x, y: 1.7, z: s.player.z }); D.setLook(-Math.PI / 2, -.02); });
      await advance(.6); await pause();
      const idle = await page.evaluate(() => {
        const D = window.__dite, s = D.state(), G = D.G; G.scene.updateMatrixWorld(true);
        const copies = s.mobs.filter((e) => e.cloned && !e.dead).map((e) => {
          const v = G.mobViews.get(e.id), center = v.g.getWorldPosition(new THREE.Vector3()); center.y += .9; center.project(G.camera); const bad = [];
          v.root.userData.draws = 0; v.root.traverse((o) => { if (!o.matrixWorld.elements.every(Number.isFinite)) bad.push(o.id); if (o.isMesh) o.onBeforeRender = () => v.root.userData.draws++; });
          return { id: e.id, kind: v.kind, visible: v.root.visible, bad, projection: center.toArray(), hp: e.hp };
        });
        return { copies, shots: window.__sensiTrace.shots.length, fires: window.__sensiTrace.events.filter((e) => e.type === 'cloneFire').length, hp: s.mobs.filter((e) => e.testLane !== undefined).map((e) => e.hp), hud: document.getElementById('powerHud').textContent };
      });
      assert.equal(idle.copies.length, 2); assert.equal(idle.shots, 0); assert.equal(idle.fires, 0); assert.deepEqual(idle.hp, [800, 800, 800]); assert.ok(idle.hud.includes('Copie attive · 2'));
      for (const c of idle.copies) { assert.equal(c.kind, 'clone'); assert.equal(c.visible, true); assert.deepEqual(c.bad, []); assert.ok(c.projection.every((n) => Number.isFinite(n) && Math.abs(n) < 1)); }
      await frames(); assert.ok(await page.evaluate(() => [...window.__dite.G.mobViews.values()].filter((v) => v.kind === 'clone').every((v) => v.root.userData.draws > 0)), 'copie non disegnate');
      await page.screenshot({ path: __dirname + '/shots/sensi-copie.png' });
      await page.evaluate(() => { document.getElementById('resume').click(); }); await page.keyboard.down('j');
      await page.waitForFunction(() => window.__sensiTrace.events.filter((e) => e.type === 'cloneFire').length >= 2, null, { timeout: 60000 }); await page.keyboard.up('j'); await advance(.6); await pause();
      const attack = await page.evaluate(() => ({ shots: window.__sensiTrace.shots.filter((q) => q.clone), hp: window.__dite.state().mobs.filter((e) => e.testLane !== undefined).map((e) => e.hp) }));
      assert.ok(attack.shots.length >= 2); assert.ok(new Set(attack.shots.map((q) => Math.round(q.z * 10))).size >= 2, 'origini delle repliche distinte'); assert.ok(attack.shots.every((q) => q.team === 'a' && q.dmg > 0 && q.dmg < 10)); assert.ok(attack.hp.every((hp) => hp < 800), 'primario e copie devono colpire le tre corsie');
      const hurt = await page.evaluate(() => { const D = window.__dite, s = D.state(), c = s.mobs.find((e) => e.cloned && !e.dead), e = D.Core.mkMob(s, 'sgherro', c.x, c.z + 1.2, 'e'); e.spawn = 0; e.root = 999; e.atk = 0; e.aggro = 99; return { id: c.id, hp: c.hp }; });
      await advance(.1); await page.waitForFunction(({ id, hp }) => { const e = window.__dite.state().mobs.find((e) => e.id === id); return e && e.hp < hp; }, hurt, { timeout: 60000 }); await pause();
      assert.ok(await page.evaluate((id) => window.__dite.G.mobViews.get(id).bar.visible, hurt.id), 'ferita della copia senza barra vita');
      await frames(); await page.screenshot({ path: __dirname + '/shots/sensi-copie-ferite.png' });
      await cleanup(); console.log('clone: modelli, nessun fuoco autonomo, repliche dannose, vulnerabilita e cleanup verdi');
    }
    if (mode === 'all' || mode === 'mimic') {
      await setup('Maschera del dannato');
      await page.evaluate(() => {
        const D = window.__dite, s = D.state(), p = s.player, A = s.city.arenas[0]; Object.assign(p, { x: A.x + 10, z: A.z + 7, yaw: Math.PI / 2 }); Object.assign(p.cam, { x: p.x, y: 1.7, z: p.z }); D.setLook(p.yaw, p.pitch);
        const e = D.Core.mkMob(s, 'sgherro', A.x + 2, p.z, 'e'); e.spawn = 0; e.root = 999; e.atk = 999; e.hp = e.maxHp = 800;
        window.__mimicOriginal = s.kit[0]; window.__mimicButton = document.getElementById('b0').querySelector('.svg').innerHTML;
      });
      await advance(.2); await page.evaluate(() => window.__dite.press(2));
      await page.waitForFunction(() => !!window.__dite.state().player.mimic, null, { timeout: 60000 }); await pause();
      const copied = await page.evaluate(() => {
        const D = window.__dite, s = D.state(), button = document.getElementById('b0'), expected = document.createElement('div'); expected.innerHTML = D.G.svg('claw');
        return { attack: s.player.mimic.attack, label: button.querySelector('.nm').textContent, claw: button.querySelector('.svg').innerHTML === expected.innerHTML, hud: document.getElementById('powerHud').textContent, changed: s.kit[0] !== window.__mimicOriginal, duration: s.player.mimic.t };
      });
      assert.equal(copied.attack, 'artiglio'); assert.equal(copied.label, 'ARTIGLIO'); assert.equal(copied.claw, true); assert.equal(copied.changed, true); assert.ok(copied.duration > 7); assert.match(copied.hud, /Imitazione.*Artiglio/);
      await frames(); await page.screenshot({ path: __dirname + '/shots/sensi-imitazione.png' });
      // Comprime soltanto l'attesa: scadenza, ripristino e aggiornamento DOM passano dal frame reale.
      await page.evaluate(() => { window.__dite.state().player.mimic.t = .05; }); await advance(.2); await pause();
      const restored = await page.evaluate(() => { const D = window.__dite, s = D.state(), button = document.getElementById('b0'); return { mimic: !!s.player.mimic, samePrimary: s.kit[0] === window.__mimicOriginal, label: button.querySelector('.nm').textContent, sameIcon: button.querySelector('.svg').innerHTML === window.__mimicButton, hud: document.getElementById('powerHud').textContent, ended: window.__sensiTrace.events.some((e) => e.type === 'mimicEnd') }; });
      assert.equal(restored.mimic, false); assert.equal(restored.samePrimary, true); assert.match(restored.label, /^dardo$/i); assert.equal(restored.sameIcon, true); assert.equal(restored.ended, true); assert.doesNotMatch(restored.hud, /imitazione/i);
      await cleanup(); console.log('mimic: input reale, ARTIGLIO/icona/HUD e ripristino Dardo alla scadenza verdi');
    }
    assert.deepEqual(errors, [], 'errori browser o shader'); console.log('nessun errore');
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
