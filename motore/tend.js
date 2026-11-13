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
  await pg.waitForTimeout(600);
  // boss abbattuto
  await pg.evaluate(() => { const D = window.__dite, s = D.state(), A = s.city.arenas[0]; s.player.x = A.x; s.player.z = A.z + 12; D.setLook(0, -0.05); D.Core.wakeBoss(s, 0); s.boss.hp = 30; });
  await pg.waitForTimeout(1200);
  const b0 = await pg.evaluate(() => { const r = document.getElementById('b0').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  const cdp = await ctx.newCDPSession(pg);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: b0[0], y: b0[1], id: 5 }] });
  await pg.waitForTimeout(1500); await pg.screenshot({ path: 'shots/r-bossdown1.png' });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await pg.waitForTimeout(1800); await pg.screenshot({ path: 'shots/r-bossdown2.png' });
  console.log('dopo il boss:', JSON.stringify(await pg.evaluate(() => { const s = window.__dite.state(); return { boss: !!s.boss, fame: s.fame, level: s.level, arena: s.arenas[0].status, stored: window.__dite.store.fame }; })));
  // caduta e ritorno
  await pg.evaluate(() => { const s = window.__dite.state(); s.player.invuln = 0; s.player.hp = 1; const e = window.__dite.Core.mkMob(s, 'sgherro', s.player.x + 1, s.player.z, 'e'); e.spawn = 0; e.atk = 0; });
  await pg.waitForTimeout(1500); await pg.screenshot({ path: 'shots/r-caduto.png' });
  await pg.waitForTimeout(4500); await pg.screenshot({ path: 'shots/r-ritorno.png' });
  console.log('dopo la caduta:', JSON.stringify(await pg.evaluate(() => { const s = window.__dite.state(), p = s.player; return { hp: p.hp, x: Math.round(p.x), z: Math.round(p.z), deaths: s.stats.deaths }; })));
  // cambio citta' ripetuto: la memoria grafica deve restare stabile
  await pg.evaluate(() => { document.getElementById('menuBtn').click(); document.getElementById('menuHome').click(); });
  for (let i = 0; i < 6; i++) { await pg.evaluate((i) => window.__dite.loadCity(['cocito', 'malebolge', 'dite'][i % 3], 10 + i), i); await pg.waitForTimeout(900); console.log('citta', i, JSON.stringify(await pg.evaluate(() => { const o = window.__dite.info(); return { geo: o.geo, tex: o.tex, calls: o.calls }; }))); }
  await pg.screenshot({ path: 'shots/r-home.png' });
  console.log(errs.length ? errs.slice(0, 12).join('\n') : 'nessun errore');
  await b.close();
})();
