'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs');
const { chromium } = require('./pw.js');
(async () => {
  fs.mkdirSync('shots', { recursive: true });
  const browser = await chromium.launch({ args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const context = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });
    const page = await context.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto('file://' + __dirname + '/dist/index.html');
    await page.waitForFunction(() => window.__dite && window.__dite.screen().screen === 'lobby');
    await page.evaluate(() => { window.__dite.lockQ = true; window.__dite.navigate('settings'); });
    for (const [id, value] of [['controlScale', '1.15'], ['controlOpacity', '.7'], ['stickRadius', '64']]) {
      await page.locator('#' + id).evaluate((node, value) => { node.value = value; node.dispatchEvent(new Event('input', { bubbles: true })); }, value);
    }
    await page.locator('#settings .screen-content').evaluate(n => n.scrollTop = 0);
    await page.screenshot({ path: 'shots/controls-settings.png' });
    await page.reload(); await page.waitForFunction(() => window.__dite && window.__dite.screen().screen === 'lobby');
    assert.deepEqual(await page.evaluate(() => { const s = window.__dite.store; return [s.controlScale, s.controlOpacity, s.stickRadius]; }), [1.15, .7, 64]);
    await page.evaluate(() => { window.__dite.lockQ = true; window.__dite.begin(); document.getElementById('guideSkip').click(); });
    for (const [width, height] of [[568,320], [667,375], [844,390], [932,430], [1024,768], [1366,1024]]) {
      await page.setViewportSize({ width, height });
      for (const leftHanded of [false, true]) for (const scale of [.9, 1.15]) {
        const layout = await page.evaluate(({leftHanded, scale}) => {
          const D = window.__dite; D.setPreference('leftHanded', leftHanded); D.setPreference('controlScale', scale);
          document.documentElement.style.setProperty('--sl', '44px'); document.documentElement.style.setProperty('--sr', '44px'); document.documentElement.style.setProperty('--sb', '21px');
          window.dispatchEvent(new Event('resize')); D.begin();
          return [...document.querySelectorAll('#btns .ab')].map(n => ({ id:n.id, ...n.getBoundingClientRect().toJSON() }));
        }, {leftHanded, scale});
        for (const r of layout) { assert.ok(r.width >= 44 && r.height >= 44); assert.ok(r.left >= 44 && r.right <= width - 44 && r.top >= 0 && r.bottom <= height - 21, JSON.stringify({width, height, leftHanded, scale,r})); }
        for (let i = 0; i < layout.length; i++) for (let j = i+1; j < layout.length; j++) {
          const a = layout[i], b = layout[j];
          // Circular hit targets must have separated centres; boxes can overlap at corners.
          assert.ok(Math.hypot(a.x+a.width/2-b.x-b.width/2, a.y+a.height/2-b.y-b.height/2) >= (a.width+b.width)/2-1);
        }
      }
    }
    await page.setViewportSize({width:844,height:390});
    await page.evaluate(() => { window.__dite.setPreference('leftHanded',false); window.__dite.begin(); });
    const cdp = await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type:'touchStart', touchPoints:[{x:120,y:300,id:1}] });
    await cdp.send('Input.dispatchTouchEvent', { type:'touchMove', touchPoints:[{x:122,y:300,id:1}] });
    assert.equal(await page.evaluate(() => window.__dite.inputSnapshot().joy.x),0);
    await cdp.send('Input.dispatchTouchEvent', { type:'touchMove', touchPoints:[{x:184,y:300,id:1}] });
    assert.equal(await page.evaluate(() => window.__dite.inputSnapshot().joy.x),1);
    const b0 = await page.locator('#b0').boundingBox();
    await cdp.send('Input.dispatchTouchEvent', { type:'touchStart', touchPoints:[{x:184,y:300,id:1},{x:b0.x+b0.width/2,y:b0.y+b0.height/2,id:2}] });
    assert.equal(await page.locator('#b0').evaluate(n => n.classList.contains('pressed')),true);
    await page.evaluate(() => window.__dite.navigate('pause'));
    assert.equal(await page.locator('.pressed').count(),0); assert.equal(await page.evaluate(() => window.__dite.inputSnapshot().fireBtn),false);
    await cdp.send('Input.dispatchTouchEvent', {type:'touchEnd',touchPoints:[]});
    await page.evaluate(() => { window.__dite.begin(); }); await page.screenshot({path:'shots/controls-game.png'});
    const stale = await page.evaluate(() => new Promise(resolve => {
      const native=requestAnimationFrame;window.requestAnimationFrame=callback=>native(time=>{
        if(callback.name!=='frame'){callback(time);return;}
        window.requestAnimationFrame=native;const before=window.__dite.state().t;callback(time-5000);resolve({before,after:window.__dite.state().t});
      });
    }));
    assert.ok(stale.after>=stale.before,'Un RAF antecedente alla ripresa non deve invertire la simulazione');
    assert.deepEqual(errors,[]); console.log('Comandi: persistenza, 24 layout con safe area, joystick reale, multitouch e reset in pausa; nessun errore');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
