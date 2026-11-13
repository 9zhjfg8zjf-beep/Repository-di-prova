const { chromium } = require('./pw.js');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = []; const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });
  const pg = await ctx.newPage(); pg.on('pageerror', (e) => errs.push(e.message));
  await pg.goto('file://' + __dirname + '/dist/index.html'); await pg.waitForTimeout(2500);
  await pg.tap('#play'); await pg.waitForTimeout(700); await pg.screenshot({ path: 'shots/tips.png' });
  await pg.tap('#tipsOk'); await pg.waitForTimeout(500);
  const r1 = await pg.evaluate(() => ({ tips: window.__dite.store.tips, hid: document.getElementById('tips').classList.contains('hidden') }));
  await pg.tap('#menuBtn'); await pg.waitForTimeout(300); await pg.screenshot({ path: 'shots/menu.png' });
  await pg.evaluate(() => { const e = document.getElementById('sens'); e.value = 150; e.dispatchEvent(new Event('input')); });
  const r2 = await pg.evaluate(() => window.__dite.store.sens);
  await pg.tap('#resume'); await pg.waitForTimeout(300);
  // pausa automatica
  await pg.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await pg.waitForTimeout(200); const r3 = await pg.evaluate(() => !document.getElementById('menu').classList.contains('hidden'));
  console.log(JSON.stringify({ r1, sens: r2, autopausa: r3 }), errs.length ? errs.join('\n') : 'nessun errore'); await b.close();
})();
