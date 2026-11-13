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
  await pg.waitForTimeout(2800);
  await pg.screenshot({ path: 'shots/q0-inizio.png' });
  const q = () => pg.evaluate(() => { const s = window.__dite.state(), q = s.quest; return q ? { type: q.type, line: q.line, time: Math.round(q.time), obj: q.obj } : { use: s.hint.use && s.hint.use.label, fame: s.fame, offers: s.givers.map((g) => (g.offer ? g.offer.type : '-')).join(',') }; });
  for (let n = 0; n < 6; n++) {
    await pg.evaluate((n) => { const s = window.__dite.state(), g = s.givers[n % s.givers.length], p = s.player; p.x = g.x + 2.5; p.z = g.z + 1; p.invuln = 999; window.__dite.setLook(Math.atan2(-(g.x - p.x), -(g.z - p.z)), 0); }, n);
    await pg.waitForTimeout(700);
    await pg.screenshot({ path: 'shots/q' + n + '-a.png' });
    console.log(n, 'davanti al committente:', JSON.stringify(await q()));
    // tocco vero sul tasto contestuale
    const ub = await pg.evaluate(() => { const r = document.getElementById('useBtn').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2, r.width]; });
    if (ub[2] > 0) await pg.touchscreen.tap(ub[0], ub[1]);
    await pg.waitForTimeout(900);
    const st = await q(); console.log(n, 'dopo il tocco:', JSON.stringify(st));
    await pg.screenshot({ path: 'shots/q' + n + '-b.png' });
    if (st.type) {
      await pg.evaluate(() => { const s = window.__dite.state(), q = s.quest, p = s.player; if (q.obj) { p.x = q.obj.x + 6; p.z = q.obj.z + 0.5; window.__dite.setLook(Math.PI / 2, -0.1); } });
      await pg.waitForTimeout(900); await pg.screenshot({ path: 'shots/q' + n + '-c.png' });
      // completa di forza per vedere il banner e liberare il committente
      await pg.evaluate(() => { const s = window.__dite.state(), q = s.quest, p = s.player; if (!q) return; if (q.type === 'consegna') { p.x = q.obj.x; p.z = q.obj.z; } else if (q.type === 'caccia') { for (const e of s.mobs) if (e.tag === 'q') e.hp = 1; q.left = 0; } else if (q.type === 'corsa') { q.i = q.pts.length - 1; q.obj = q.pts[q.i]; p.x = q.obj.x; p.z = q.obj.z; } else if (q.type === 'ripetitori') { q.i = 2; q.obj = q.pts[2]; q.pts[2].woke = true; p.x = q.obj.x; p.z = q.obj.z; } else if (q.type === 'pubblico') { for (let i = 0; i < 8; i++) { const c = s.npcs[i]; c.st = 'follow'; c.t = 50; c.x = 2 + i; c.z = 8; } p.x = 4; p.z = 10; } else if (q.type === 'scorta') { const a = s.mobs.find((e) => e.id === q.anima); if (a) { a.pi = a.path.length; } } });
      await pg.waitForTimeout(2600); await pg.screenshot({ path: 'shots/q' + n + '-d.png' });
      console.log(n, 'fine:', JSON.stringify(await q()));
    }
  }
  console.log(errs.length ? errs.slice(0, 12).join('\n') : 'nessun errore');
  await b.close();
})();
