// Giro fotografico: arena, boss, temi, officina.
const { chromium } = require('./pw.js');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = [];
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 4).join(' | ')));
  await pg.goto('file://' + __dirname + '/dist/index.html');
  await pg.waitForTimeout(2500);
  const which = process.argv[2] || 'boss';
  const shot = async (n) => { await pg.screenshot({ path: 'shots/' + n + '.png' }); };
  await pg.evaluate(() => { window.__dite.lockQ = true; });
  if (which === 'boss') {
    await pg.evaluate(() => { document.getElementById('play').click(); });
    await pg.waitForTimeout(800);
    await pg.evaluate(() => { const s = window.__dite.state(), A = s.city.arenas[0]; s.player.x = A.x; s.player.z = A.z + 15; window.__dite.setLook(0, -0.05); });
    await pg.waitForTimeout(1500); await shot('e-arena');
    await pg.evaluate(() => { const s = window.__dite.state(), A = s.city.arenas[0]; s.player.x = A.x + 2; s.player.z = A.z + 5; });
    await pg.waitForTimeout(700); await shot('e-sigillo');
    await pg.evaluate(() => { const s = window.__dite.state(), A = s.city.arenas[0]; window.__dite.use(); });
    await pg.waitForTimeout(600);
    await pg.evaluate(() => { const s = window.__dite.state(), A = s.city.arenas[0]; s.player.x = A.x; s.player.z = A.z + 14; s.player.hp = 100; s.player.invuln = 99; });
    for (let i = 0; i < 6; i++) { await pg.waitForTimeout(1600); await pg.evaluate(() => { const s = window.__dite.state(), b = s.boss, p = s.player; if (b) window.__dite.setLook(Math.atan2(-(b.x - p.x), -(b.z - p.z)), -0.12); }); await pg.waitForTimeout(250); await shot('f-boss' + i); console.log(i, JSON.stringify(await pg.evaluate(() => { const s = window.__dite.state(); return s.boss ? { hp: Math.round(s.boss.hp), cast: s.boss.cast, teles: s.teles.map((t) => t.shape + ':' + (t.wind - t.t).toFixed(1)), mobs: s.mobs.length } : null; }))); }
  } else if (which === 'temi') {
    for (const th of ['cocito', 'malebolge']) {
      await pg.evaluate((th) => { window.__dite.loadCity(th, 3); }, th);
      await pg.waitForTimeout(1500);
      await pg.evaluate(() => { document.getElementById('play').click(); });
      await pg.waitForTimeout(1500); await shot('g-' + th + '-1');
      await pg.evaluate(() => { const s = window.__dite.state(), c = s.city.canals[0], v = 6 * c.k * 4 - 88 + 4; s.player.x = c.horiz ? 2 : v - 9; s.player.z = c.horiz ? v - 9 : 2; window.__dite.setLook(c.horiz ? Math.PI + 0.5 : -Math.PI / 2 + 0.5, -0.15); });
      await pg.waitForTimeout(1500); await shot('g-' + th + '-2');
      await pg.evaluate(() => { const s = window.__dite.state(), A = s.city.arenas[1]; s.player.x = A.x; s.player.z = A.z + 16; window.__dite.setLook(0, 0.05); });
      await pg.waitForTimeout(1500); await shot('g-' + th + '-3');
      console.log(th, JSON.stringify(await pg.evaluate(() => window.__dite.info())));
      await pg.evaluate(() => { document.getElementById('menuBtn').click(); }); await pg.waitForTimeout(300); await shot('g-' + th + '-menu');
      await pg.evaluate(() => { document.getElementById('menuHome').click(); }); await pg.waitForTimeout(300);
    }
  } else if (which === 'officina') {
    await pg.evaluate(() => { document.getElementById('openForge').click(); });
    await pg.waitForTimeout(400); await shot('h-officina1');
    await pg.evaluate(() => { document.getElementById('fDesc').value = 'un ninja di ghiaccio invisibile che lancia lame e ferma il tempo'; document.getElementById('fCompose').click(); });
    await pg.waitForTimeout(300); await shot('h-officina2');
    await pg.evaluate(() => { document.querySelectorAll('.slot')[2].click(); });
    await pg.waitForTimeout(300); await shot('h-officina3');
    await pg.evaluate(() => { document.getElementById('fName').value = 'Prova'; document.getElementById('fName').dispatchEvent(new Event('input')); document.getElementById('fSave').click(); document.getElementById('fUse').click(); });
    await pg.waitForTimeout(300); await shot('h-home2');
    console.log(JSON.stringify(await pg.evaluate(() => window.__dite.store.recipe)));
  }
  console.log(errs.length ? errs.slice(0, 12).join('\n') : 'nessun errore');
  await b.close();
})();
