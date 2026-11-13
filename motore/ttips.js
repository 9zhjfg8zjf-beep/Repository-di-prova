// Primo ingresso contestuale, guida dalla pausa e preferenze nel pannello dedicato.
const assert = require('node:assert/strict'), fs = require('node:fs');
const { chromium } = require('./pw.js');
(async () => {
  fs.mkdirSync(__dirname + '/shots', { recursive: true });
  const b = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const errs = [], ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true }), pg = await ctx.newPage();
    pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(process.env.DITE_TEST_URL || 'file://' + __dirname + '/dist/index.html'); await pg.waitForFunction(() => window.__dite && window.__dite.screen().screen === 'lobby');
    await pg.tap('#play'); await pg.waitForFunction(() => window.__dite.screen().playing && !document.getElementById('guideCoach').classList.contains('hidden'));
    assert.equal(await pg.evaluate(() => document.getElementById('tips').classList.contains('hidden')), true);
    await pg.tap('#menuBtn'); await pg.waitForFunction(() => window.__dite.screen().screen === 'pause');
    await pg.tap('#menuTips'); await pg.waitForFunction(() => window.__dite.screen().screen === 'guide'); await pg.screenshot({ path: __dirname + '/shots/tips.png' });
    await pg.tap('#tipsOk'); await pg.waitForFunction(() => window.__dite.screen().screen === 'pause');
    const guide = await pg.evaluate(() => ({ tips: window.__dite.store.tips, hidden: document.getElementById('tips').classList.contains('hidden'), playing: window.__dite.screen().playing }));
    assert.deepEqual(guide, { tips: true, hidden: true, playing: false }); await pg.screenshot({ path: __dirname + '/shots/menu.png' });
    await pg.tap('#menuSettings'); await pg.waitForFunction(() => window.__dite.screen().screen === 'settings');
    await pg.locator('#sens').evaluate(e => { e.value = 150; e.dispatchEvent(new Event('input', { bubbles: true })); });
    assert.equal(await pg.evaluate(() => window.__dite.store.sens), 1.5); assert.equal(await pg.locator('#sensV').textContent(), '150%');
    await pg.locator('#settings [data-nav="back"]').tap(); await pg.waitForFunction(() => window.__dite.screen().screen === 'pause');
    await pg.tap('#resume'); await pg.waitForFunction(() => window.__dite.screen().playing);
    await pg.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
    await pg.waitForFunction(() => window.__dite.screen().screen === 'pause');
    assert.equal(await pg.evaluate(() => document.getElementById('menu').classList.contains('hidden')), false);
    await pg.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
    assert.equal(await pg.evaluate(() => window.__dite.screen().playing), false);
    assert.deepEqual(errs, [], 'Errori JavaScript'); console.log('guida contestuale, ritorno alla pausa, sensibilità e sospensione verificati; nessun errore');
  } finally { await b.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
