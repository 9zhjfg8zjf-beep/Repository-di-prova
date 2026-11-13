// Prova visiva delle animazioni: per ogni elemento forme e proiettili davanti alla camera, con foto.
const { chromium } = require('./pw.js');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = []; const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  const pg = await ctx.newPage(); pg.on('pageerror', (e) => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(1, 4).join(' | ')));
  await pg.goto('file://' + __dirname + '/dist/index.html'); await pg.waitForTimeout(2500);
  await pg.evaluate(() => { window.__dite.lockQ = true; document.getElementById('play').click(); }); await pg.waitForTimeout(600);
  const els = ['fuoco', 'gelo', 'folgore', 'veleno', 'ombra', 'luce', 'sangue', 'vento'];
  const what = process.argv[2] || 'forme';
  for (const el of els) {
    await pg.evaluate(([el, what]) => {
      const D = window.__dite, s = D.state(), p = s.player; for (const e of s.mobs) e.dead = true; p.x = 13; p.z = 12; p.invuln = 999; D.setLook(Math.PI / 2, -0.12);
      const ang = -Math.PI / 2;
      if (what === 'forme') {
        s.events.push({ type: 'shape', shape: 'circle', x: 2, z: 8, ang, r: 4, el, n: 1 });
        s.events.push({ type: 'shape', shape: 'circle', x: 3, z: 16, ang, r: 3, el, n: 1, late: true });
        s.events.push({ type: 'shape', shape: 'cone', x: p.x, z: p.z, ang, r: 7, half: 0.7, el, n: 1 });
      } else if (what === 'linee') {
        s.events.push({ type: 'shape', shape: 'line', x: p.x, z: p.z + 1.5, ang, len: 22, w: 1.6, el, n: 1 });
        s.events.push({ type: 'shape', shape: 'donut', x: 1, z: 9, ang, r: 5, r0: 2.5, el, n: 1 });
      } else if (what === 'colpi') {
        const mk = (z, o) => s.shots.push(Object.assign({ id: s.nextId++, team: 'p', x: 8.5, z: 12 + (z - 12) * 0.8, vx: -4, vz: 0, life: 3, dmg: 1, el, r: 0.5, hom: '' }, o));
        mk(8, {}); mk(9.5, { w: 2.2, hitSet: new Set() }); mk(11.5, { boom: 3 }); mk(12.6, { hitSet: new Set() }); mk(13.8, { back: 1, hitSet: new Set() }); mk(15, { hom: 'x' }); s.shots.push({ id: s.nextId++, team: 'p', x: 5, z: 15.5, vx: -0.3, vz: 0, life: 3, dmg: 1, el, r: 0.5, hom: '', aura: 2.4 });
      } else {
        s.zones.push({ id: s.nextId++, team: 'p', kind: 'dmg', x: 5, z: 9, r: 3.5, t: 0, dur: 4, dps: 5, el, tick: 0, pull: 3 });
        s.zones.push({ id: s.nextId++, team: 'p', kind: 'dmg', x: 4, z: 16, r: 2.5, t: 0, dur: 4, dps: 5, el, tick: 0, px: { o: { mv: 1 } } });
        const e = D.Core.mkMob(s, 'colosso', 7, 12.5, 'a'); e.el = el; e.spawn = 0;
      }
    }, [el, what]);
    await pg.waitForTimeout(what === 'zone' ? 1500 : what === 'colpi' ? 250 : 90); await pg.screenshot({ path: 'shots/an-' + what + '-' + el + '.png' });
    if (what === 'forme' || what === 'linee') { await pg.waitForTimeout(60); await pg.screenshot({ path: 'shots/an-' + what + '-' + el + '-2.png' }); }
    await pg.evaluate(() => { const s = window.__dite.state(); s.shots.length = 0; s.zones.length = 0; for (const e of s.mobs) e.dead = true; }); await pg.waitForTimeout(1600);
    if (errs.length) break;
  }
  console.log(errs.length ? errs.slice(0, 5).join('\n') : 'nessun errore'); await b.close();
})();
