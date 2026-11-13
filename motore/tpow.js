// Ricette campione nel browser vero, con creature davanti; fotografie base/DSL separate.
const { chromium } = require('./pw.js');
const fs = require('node:fs'), shotDir = __dirname + '/shots/' + (process.env.X ? 'dsl' : 'base');
fs.mkdirSync(shotDir, { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = [];
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 4).join(' | ')));
  await pg.goto((process.env.DITE_TEST_URL || 'file://' + __dirname + '/dist/index.html') + (process.env.X ? '#x' : ''));
  await pg.waitForTimeout(2500);
  await pg.evaluate(() => { window.__dite.lockQ = true; document.getElementById('play').click(); });
  await pg.waitForTimeout(600);
  const sets = await pg.evaluate(() => { const B = window.__dite.Bricks, by = { P: [], M: [], S: [], U: [] }; for (const a of B.LIST) by[a.slot].push(a.id); const els = Object.keys(B.ELEM), out = []; if (location.hash === '#x') { const bx = { P: [], M: [], S: [], U: [] }; for (const a of B.LIST) if (a.kind === 'x') bx[a.slot].push(a.id); const pick = (L, k, n) => L[Math.floor((k * L.length) / n) % L.length]; for (let i = 0; i < 34; i++) out.push({ nome: 'X' + i, slots: [pick(bx.P, i, 34), pick(bx.M, i, 34), pick(bx.S, i * 2, 68), pick(bx.S, i * 2 + 1, 68), pick(bx.U, i, 34)].map((id, k) => ({ id, el: els[(i + k) % 8], t: 1 + ((i + k) % 3) })) }); return out; } for (let i = 0; i < 19; i++) out.push({ nome: 'T' + i, slots: [[by.P[i % 17], 0], [by.M[i % 13], 1], [by.S[(i * 2) % 38], 2], [by.S[(i * 2 + 1) % 38], 3], [by.U[i % 15], 4]].map(([id, k]) => { const o = { id, el: els[(i + k) % 8], t: 1 + ((i + k) % 3) }; if ((i + k) % 3) o.m = B.MODS[(i * 5 + k) % B.MODS.length]; return o; }) }); return out; });
  const only = process.argv[2] ? process.argv[2].split(',').map(Number) : null;
  for (let i = 0; i < sets.length; i++) {
    if (only && !only.includes(i)) continue;
    const info = await pg.evaluate((r) => {
      const D = window.__dite, s = D.state(), p = s.player;
      // Questa raccolta prova anche gradi alti: il progresso deve già consentire
      // la ricetta quando il vero setter ne verifica il costo.
      D.store.fame = s.fame = 320; s.level = D.Bricks.levelFor(s.fame);
      if (!D.Bricks.valid(r) || D.Bricks.cost(r) > D.Bricks.budgetFor(s.level)) throw Error('Fixture oltre budget: ' + r.nome);
      if (D.setRecipe(r) !== true) throw Error('Ricetta non equipaggiata: ' + r.nome);
      if (JSON.stringify(s.recipe.slots) !== JSON.stringify(r.slots) || s.kit.some((k, index) => k.id !== r.slots[index].id || k.t !== r.slots[index].t)) throw Error('Kit effettivo diverso dalla ricetta: ' + r.nome);
      for (const e of s.mobs) e.dead = true;
      p.x = 13; p.z = 12; p.hp = 100; p.invuln = 999; p.res = 100; p.dead = 0; p.ride = null; p.leap = null; p.cd = [0, 0, 0, 0, 0]; D.setLook(Math.PI / 2, -0.08);
      for (const [dx, dz, k] of [[-7, 0, 'sgherro'], [-9, 1.5, 'sgherro'], [-8, -1.5, 'tiratore'], [-11, 0, 'bruto']]) { const e = D.Core.mkMob(s, k, 13 + dx, 12 + dz, 'e'); e.spawn = 0; e.atk = 99; e.hp = e.maxHp = 600; }
      return r.slots.map((b) => b.id.slice(0, 14) + (b.m ? '+' + b.m : '')).join(' ');
    }, sets[i]);
    const b0 = await pg.evaluate(() => { const r = document.getElementById('b0').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
    const cdp = await ctx.newCDPSession(pg);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: b0[0], y: b0[1], id: 5 }] });
    await pg.waitForTimeout(900);
    await pg.screenshot({ path: shotDir + '/p' + i + '-a.png' });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    for (const k of [4, 2, 3, 1]) { await pg.evaluate((k) => { const D = window.__dite, s = D.state(); if (s.player.ride) return; D.press(k); }, k); await pg.waitForTimeout(450); if (k === 3) await pg.screenshot({ path: shotDir + '/p' + i + '-b.png' }); }
    await pg.waitForTimeout(500);
    await pg.screenshot({ path: shotDir + '/p' + i + '-c.png' });
    const st = await pg.evaluate(() => { const s = window.__dite.state(); if (s.player.ride) window.__dite.press(1); return { casts: s.stats.casts.join(','), fizz: s.stats.fizz, mobs: s.mobs.map((e) => e.kind[0] + (e.team === 'a' ? '+' : '') + Math.round(e.hp)).join(' '), res: Math.round(s.player.res) }; });
    console.log(i, info, '|', JSON.stringify(st));
    await pg.waitForTimeout(900);
    if (errs.length) { console.log(errs.slice(0, 6).join('\n')); break; }
  }
  console.log(errs.length ? 'ERRORI ' + errs.length : 'nessun errore');
  await b.close();
})();
