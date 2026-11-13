// Foto dei tre boss e delle forme dei colpi segnalati.
const { chromium } = require('./pw.js');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = [];
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 4).join(' | ')));
  await pg.goto('file://' + __dirname + '/dist/index.html');
  await pg.waitForTimeout(2500);
  await pg.evaluate(() => { window.__dite.lockQ = true; document.getElementById('play').click(); });
  await pg.waitForTimeout(800);
  const atks = { 0: ['corsia', 'pioggia', 'anello'], 1: ['trimorso', 'spazzata', 'croce'], 2: ['picchiata', 'pozze', 'spirale'] };
  for (const k of (process.argv[2] || '012').split('').map(Number)) {
    await pg.evaluate((k) => { const D = window.__dite, s = D.state(), A = s.city.arenas[k]; if (s.boss) { s.boss.hp = 0; } s.player.x = A.x + 3; s.player.z = A.z + 13; s.player.invuln = 999; s.level = 5; s.arenas[k].status = 'sealed'; s.arenas[k].t = 0; }, k);
    await pg.waitForTimeout(400);
    await pg.evaluate((k) => { const D = window.__dite, s = D.state(); D.Core.wakeBoss(s, k); s.boss.wait = 99; }, k);
    const lookB = () => pg.evaluate(() => { const s = window.__dite.state(), b = s.boss, p = s.player; if (b) window.__dite.setLook(Math.atan2(-(b.x - p.x), -(b.z - p.z)), -0.1); });
    await pg.waitForTimeout(1200); await lookB(); await pg.waitForTimeout(300);
    await pg.screenshot({ path: 'shots/m-boss' + k + '.png' });
    for (const a of atks[k]) {
      await pg.evaluate((a) => { const D = window.__dite, s = D.state(); s.teles.length = 0; s.boss.busy = 0; s.boss.dash = null; D.Core.bossCast(s, s.boss, a); }, a);
      await pg.waitForTimeout(520); await lookB(); await pg.waitForTimeout(120);
      await pg.screenshot({ path: 'shots/m-boss' + k + '-' + a + '.png' });
      await pg.waitForTimeout(1500);
    }
  }
  console.log(errs.length ? errs.slice(0, 12).join('\n') : 'nessun errore');
  await b.close();
})();
