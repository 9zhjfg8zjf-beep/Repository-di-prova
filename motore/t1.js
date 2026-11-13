const { chromium } = require('./pw.js');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = [];
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 4).join(' | ')));
  pg.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text().slice(0, 300)); });
  const t0 = Date.now();
  await pg.goto('file://' + __dirname + '/dist/index.html');
  await pg.waitForTimeout(2500);
  console.log('caricato in', Date.now() - t0, 'ms');
  await pg.screenshot({ path: 'shots/a-home.png' });
  if (errs.length) { console.log(errs.join('\n')); }
  await pg.evaluate(() => { window.__dite.lockQ = true; document.getElementById('play').click(); });
  await pg.waitForTimeout(3500);
  await pg.screenshot({ path: 'shots/b-spawn.png' });
  console.log(JSON.stringify(await pg.evaluate(() => window.__dite.info())));
  await pg.evaluate(() => { window.__dite.setLook(0, 0.05); });
  await pg.waitForTimeout(1500);
  await pg.screenshot({ path: 'shots/c-torre.png' });
  await pg.evaluate(() => { window.__dite.setLook(Math.PI / 2, -0.05); });
  await pg.waitForTimeout(1500);
  await pg.screenshot({ path: 'shots/d-strada.png' });
  console.log(errs.length ? errs.slice(0, 12).join('\n') : 'nessun errore');
  await b.close();
})();
