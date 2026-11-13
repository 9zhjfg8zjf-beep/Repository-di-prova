// Vittoria, ricompensa e ritorno devono avvenire davvero, anche a pochi fps.
const assert = require('node:assert/strict'), fs = require('node:fs');
const { chromium } = require('./pw.js');

(async () => {
  fs.mkdirSync('shots', { recursive: true });
  const b = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const errs = [], ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
    const pg = await ctx.newPage();
    pg.on('pageerror', (e) => errs.push(e.stack || e.message));
    const rendered = () => pg.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await pg.goto(process.env.DITE_TEST_URL || 'file://' + __dirname + '/dist/index.html');
    await pg.waitForFunction(() => window.__dite && window.__dite.state());
    await pg.evaluate(() => { window.__dite.lockQ = true; document.getElementById('play').click(); });
    await rendered();

    // La vittoria e il livello possono annunciare messaggi consecutivi tra due
    // RAF lenti. Osserva le vere transizioni DOM prima dell'azione, senza esigere
    // che il polling campioni proprio il breve intervallo del primo annuncio.
    await pg.evaluate(() => {
      const banner = document.getElementById('banner');
      window.__endBanners = [];
      window.__endBannerObserver = new MutationObserver(() => {
        if (!banner.classList.contains('go')) return;
        const text = banner.textContent;
        if (window.__endBanners.at(-1) !== text) window.__endBanners.push(text);
      });
      window.__endBannerObserver.observe(banner, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class'] });
    });

    // Fixture: boss ferito. Il colpo finale passa dal vero primario e da Core.step;
    // nessuna assegnazione a boss=null, fama, vittorie o stato del sigillo.
    const victory = await pg.evaluate(() => {
      const D = window.__dite, s = D.state(), p = s.player;
      D.setRecipe({ nome: 'Prova vittoria', slots: ['dardo', 'scatto', 'nova', 'nova', 'ira'].map((id) => ({ id, el: 'luce', t: 1 })) });
      s.mobs = []; s.shots = []; s.zones = []; p.invuln = 999;
      D.Core.wakeBoss(s, 0); s.boss.hp = 30;
      p.x = s.boss.x; p.z = s.boss.z + 8; D.setLook(0, 0);
      const before = { fame: s.fame, wins: s.stats.bossWins }, reward = s.boss.def.fame;
      const input = { mx: 0, my: 0, yaw: 0, pitch: 0, fire: true, b: [false, false, false, false, false], use: false };
      let frames = 0;
      for (; frames < 600 && s.boss; frames++) D.Core.step(s, 1 / 60, input);
      return { before, reward, frames, boss: !!s.boss, fame: s.fame, wins: s.stats.bossWins, arena: s.arenas[0].status, events: s.events.map((e) => e.type), damage: s.stats.dmg, casts: s.stats.casts[0] };
    });
    assert.equal(victory.boss, false, 'Il primario deve abbattere il boss');
    assert.ok(victory.casts > 0 && victory.damage >= 30, 'Servono lanci e danni reali');
    assert.equal(victory.arena, 'cleared');
    assert.equal(victory.wins, victory.before.wins + 1);
    assert.equal(victory.fame, victory.before.fame + victory.reward);
    assert.ok(victory.events.includes('bossDown') && victory.events.includes('fame'));
    await pg.waitForFunction((fame) => window.__dite.store.fame === fame, victory.fame);
    await pg.waitForFunction(() => window.__endBanners.some((text) => text.includes('ABBATTUTO')));
    assert.ok(await pg.evaluate(() => window.__endBanners.some((text) => text.includes('ABBATTUTO') && text.includes('il sigillo riposa'))), 'L’annuncio di vittoria deve attraversare davvero il DOM');
    await pg.screenshot({ path: 'shots/r-bossdown1.png' });
    await rendered(); await pg.screenshot({ path: 'shots/r-bossdown2.png' });
    console.log('vittoria verificata:', JSON.stringify({ frames: victory.frames, fame: victory.fame, arena: victory.arena, wins: victory.wins, stored: await pg.evaluate(() => window.__dite.store.fame) }));

    // Un nemico infligge il danno letale; la simulazione deve poi ripristinare
    // vita e posizione. I tre secondi sono tempo di gioco, non del computer.
    const death = await pg.evaluate(() => {
      const D = window.__dite, s = D.state(), p = s.player, before = s.stats.deaths;
      s.mobs = []; s.shots = []; s.zones = []; p.invuln = 0; p.shield = 0; p.hp = 1;
      const e = D.Core.mkMob(s, 'sgherro', p.x + 1, p.z, 'e'); e.spawn = 0; e.atk = 0;
      const input = { mx: 0, my: 0, yaw: p.yaw, pitch: 0, fire: false, b: [false, false, false, false, false], use: false };
      for (let i = 0; i < 120 && p.dead <= 0; i++) D.Core.step(s, 1 / 60, input);
      return { before, hp: p.hp, timer: p.dead, deaths: s.stats.deaths, hit: s.events.some((e) => e.type === 'playerHit'), down: s.events.some((e) => e.type === 'down') };
    });
    assert.equal(death.hp, 0); assert.ok(death.timer > 0 && death.hit && death.down);
    assert.equal(death.deaths, death.before + 1);
    await pg.waitForFunction(() => window.__endBanners.some((text) => text.includes('SEI CADUTO')));
    await pg.screenshot({ path: 'shots/r-caduto.png' });
    const respawn = await pg.evaluate(() => {
      const D = window.__dite, s = D.state(), p = s.player;
      const input = { mx: 0, my: 0, yaw: p.yaw, pitch: 0, fire: false, b: [false, false, false, false, false], use: false };
      let frames = 0;
      for (; frames < 190 && p.dead > 0; frames++) D.Core.step(s, 1 / 60, input);
      return { frames, hp: p.hp, maxHp: p.maxHp, dead: p.dead, x: p.x, z: p.z, spawn: s.city.spawn, deaths: s.stats.deaths, event: s.events.some((e) => e.type === 'respawn') };
    });
    assert.equal(respawn.dead, 0); assert.equal(respawn.hp, respawn.maxHp);
    assert.equal(respawn.deaths, death.deaths); assert.equal(respawn.event, true);
    assert.ok(Math.hypot(respawn.x - respawn.spawn.x, respawn.z - respawn.spawn.z) < 0.01, 'Si torna nel punto di partenza');
    await rendered(); await pg.screenshot({ path: 'shots/r-ritorno.png' });
    console.log('ritorno verificato:', JSON.stringify(respawn));

    // Ogni tema torna sullo stesso seed: dopo il riscaldamento, ricaricarlo
    // non deve accumulare geometrie o texture permanenti.
    await pg.evaluate(() => { document.getElementById('menuBtn').click(); document.getElementById('menuHome').click(); });
    const memory = [];
    for (let i = 0; i < 9; i++) {
      const theme = ['cocito', 'malebolge', 'dite'][i % 3];
      // La camera della lobby animata vedeva risorse differenti a ogni giro.
      // Stessa vista e stesso draw eliminano quella variazione di allocazione lazy.
      await pg.evaluate(({ theme, seed }) => {
        const D = window.__dite, G = D.G; D.loadCity(theme, seed);
        const s = D.state(), p = s.player;
        Object.assign(p.cam, { x: p.x, y: 1.7, z: p.z });
        G.camera.position.set(p.x, 1.7, p.z); G.camera.rotation.set(.04, Math.PI / 2, 0, 'YXZ'); G.camera.updateMatrixWorld();
        G.syncMobs(s, 0, 0); G.syncNpcs(s, 0, 0); G.syncGivers(s, 0); G.syncThings(s, 0, 0);
        if (!D.renderOnce()) throw Error('Draw esplicito della città non riuscito');
      }, { theme, seed: 10 + i % 3 });
      const info = await pg.evaluate(() => { const o = window.__dite.info(); return { geo: o.geo, tex: o.tex, calls: o.calls }; });
      assert.ok(info.geo > 0 && info.tex > 0 && info.calls > 0, 'La città deve essere disegnata');
      if (i >= 6) { assert.ok(info.geo <= memory[i - 3].geo + 1, theme + ': geometrie accumulate'); assert.ok(info.tex <= memory[i - 3].tex + 1, theme + ': texture accumulate'); }
      memory.push(info); console.log('città', i, theme, JSON.stringify(info));
    }
    await pg.screenshot({ path: 'shots/r-home.png' });
    assert.deepEqual(errs, [], 'Errori JavaScript nel browser');
    console.log('nessun errore');
  } finally { await b.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
