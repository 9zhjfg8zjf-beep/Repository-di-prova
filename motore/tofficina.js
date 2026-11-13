// Officina su schermo touch: catalogo completo, filtri, budget e persistenza ricette.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('./pw.js');
const Catalogue = require('./catalogo.js');
const expectedInventory = { total: Catalogue.LIST.length, fresh: Catalogue.catalogueQuery({ mode: 'new' }).length };
(async () => {
  fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const context = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
    const page = await context.newPage(), errors = [];
    page.setDefaultTimeout(30000);
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text() + ' ' + (m.location().url || '')); });
    page.on('requestfailed', (r) => errors.push('request: ' + r.url() + ' ' + (r.failure() || {}).errorText));
    const snap = (name) => page.screenshot({ path: path.join(__dirname, 'shots/catalogo-' + name + '.png') });
    const open = async () => { await page.tap('#openForge'); await page.waitForSelector('#forge:not(.hidden)'); };
    const rows = () => page.locator('#fList [data-arch]').count();
    const store = () => page.evaluate(() => JSON.parse(JSON.stringify(window.__dite.store)));
    await page.goto('file://' + path.join(__dirname, 'dist/index.html'));
    await page.waitForFunction(() => !!window.__dite && window.__dite.Bricks.FAMILIES);
    const inventory = await page.evaluate(() => {
      const D = window.__dite, B = D.Bricks; D.lockQ = true;
      return { total: B.LIST.length, fresh: B.catalogueQuery({ mode: 'new' }).length, primaries: B.catalogueQuery({ slot: 'P' }).length };
    });
    assert.equal(inventory.total, expectedInventory.total, 'il build contiene tutti i poteri dei sorgenti');
    assert.equal(inventory.fresh, expectedInventory.fresh, 'il filtro Nuovi conta tutte le novita dei sorgenti');
    const original = (await store()).recipe;
    await open();
    assert.equal(await rows(), 36);
    await page.locator('#fFind').scrollIntoViewIfNeeded(); await snap('tutti');
    await page.tap('#fMore'); assert.equal(await rows(), 72, 'Mostra altri supera il vecchio limite70');
    while (await page.locator('#fMore').count()) await page.tap('#fMore');
    assert.equal(await rows(), inventory.primaries, 'tutti i primari sono raggiungibili');
    assert.equal(await page.locator('#fResults').textContent(), inventory.primaries + ' di ' + inventory.primaries + ' risultati');
    const unique = await page.locator('#fList [data-arch]').evaluateAll((nodes) => new Set(nodes.map((n) => n.dataset.arch)).size);
    assert.equal(unique, inventory.primaries);

    await page.tap('[data-slot="2"]'); assert.equal(await rows(), 36, 'cambiare slot riparte da una pagina');
    await page.locator('#fFind').fill('GRAVITÀ');
    await page.tap('[data-mode="new"]');
    await page.selectOption('#fFamily', 'telecinesi');
    const expected = await page.evaluate(() => window.__dite.Bricks.catalogueQuery({ slot: 'S', query: 'gravita', mode: 'new', family: 'telecinesi' }).map((a) => a.id));
    assert.ok(expected.length > 0, 'gravita e tag delle nuove meccaniche');
    assert.equal(await rows(), Math.min(36, expected.length));
    const filtered = await page.locator('#fList [data-arch]').evaluateAll((nodes) => nodes.map((n) => n.dataset.arch));
    assert.ok(filtered.every((id) => expected.includes(id)));
    assert.equal(await page.locator('#fList .arch-new').count(), filtered.length);
    await page.locator('#fFind').scrollIntoViewIfNeeded(); await snap('filtri');
    await page.tap('[data-slot="1"]');
    assert.equal(await page.locator('#fFind').inputValue(), 'GRAVITÀ', 'il cambio slot conserva la ricerca');
    assert.equal(await page.locator('#fFamily').inputValue(), 'telecinesi');
    assert.equal(await page.locator('[data-mode="new"]').getAttribute('aria-pressed'), 'true');
    await page.locator('#fFind').fill('nessun_potere_di_prova');
    assert.equal(await rows(), 0); assert.equal(await page.locator('#fResults').textContent(), '0 di 0 risultati');
    await page.tap('[data-reset-filters]');
    assert.equal(await page.locator('#fFind').inputValue(), ''); assert.equal(await rows(), 36);

    // Il budget blocca davvero l'uso, senza modificare il personaggio attivo.
    for (let i = 0; i < 5; i++) { await page.tap('[data-slot="' + i + '"]'); await page.tap('[data-tier="3"]'); }
    assert.ok(await page.locator('#fBud').evaluate((n) => n.classList.contains('over')));
    await page.tap('#fUse');
    assert.ok(await page.locator('#forge').isVisible());
    assert.match(await page.locator('#fMsg').textContent(), /Troppi punti/);
    assert.deepEqual((await store()).recipe, original);
    for (let i = 0; i < 5; i++) { await page.tap('[data-slot="' + i + '"]'); await page.tap('[data-tier="1"]'); }
    await page.tap('[data-slot="2"]'); await page.tap('[data-mode="new"]');
    const candidate = await page.evaluate(() => {
      const B = window.__dite.Bricks, r = window.__dite.store.recipe;
      return B.catalogueQuery({ slot: 'S', mode: 'new' }).find((a) => a.cost[0] <= B.ARCH[r.slots[2].id].cost[0] && !r.slots.some((b) => b.id === a.id)).id;
    });
    await page.tap('[data-arch="' + candidate + '"]');
    assert.equal(await page.locator('[data-arch="' + candidate + '"]').getAttribute('aria-pressed'), 'true');
    await page.locator('#fName').fill('Officina verifica');
    await page.tap('#fSave');
    let saved = (await store()).saved.find((r) => r.nome === 'Officina verifica');
    assert.ok(saved); assert.equal(saved.slots[2].id, candidate);
    for (const i of [0, 1, 3, 4]) assert.deepEqual(saved.slots[i], original.slots[i], 'selezionare un potere conserva gli altri spazi');
    assert.deepEqual((await store()).recipe, original, 'Salva non sostituisce la ricetta attiva');
    await page.locator('#fFind').scrollIntoViewIfNeeded(); await snap('selezione');
    await page.tap('#fUse'); assert.ok(await page.locator('#forge').evaluate((n) => n.classList.contains('hidden')));
    assert.deepEqual((await store()).recipe, saved);
    await page.reload(); await page.waitForFunction(() => !!window.__dite);
    assert.deepEqual((await store()).recipe, saved, 'la ricetta sopravvive al riavvio');
    assert.ok(await page.evaluate(() => window.__dite.Bricks.valid(window.__dite.store.recipe)));
    await open(); await page.tap('[data-slot="2"]');
    assert.equal(await page.locator('[data-arch="' + candidate + '"]').getAttribute('aria-pressed'), 'true');
    let bodyChecks = 0;
    for (const [family, hint] of [['volo', /Guarda in alto.*basso.*avanzi/], ['fase', /Attacchi sospesi.*Ripremi/], ['possessione', /corpo resta vulnerabile/], ['stasi', /Ripremi.*liberare/]]) {
      const example = await page.evaluate((family) => {
        const a = window.__dite.Bricks.catalogueQuery({ family, mode: 'new' }).find((a) => a.controls && a.controls.length);
        return a ? { id: a.id, nome: a.nome, slot: a.slot } : null;
      }, family);
      // Il test resta utilizzabile sui build intermedi che non caricano ancora mec13/14.
      if (!example) continue;
      await page.tap('[data-slot="' + { P: 0, M: 1, S: 2, U: 4 }[example.slot] + '"]');
      await page.locator('#fFind').fill(example.nome);
      await page.tap('[data-mode="new"]');
      await page.selectOption('#fFamily', family);
      const entry = page.locator('[data-arch="' + example.id + '"]');
      assert.equal(await entry.count(), 1);
      assert.match(await entry.locator('.arch-controls').textContent(), hint);
      await entry.scrollIntoViewIfNeeded(); await snap('corpo-' + family);
      bodyChecks++;
    }
    const starters = await page.evaluate(() => window.__dite.Bricks.PRESETS.flatMap((r, index) => r.edition === '3.2' ? [{ index, nome: r.nome, ids: r.slots.map((s) => s.id) }] : []));
    assert.ok(starters.length >= 4, 'le nuove famiglie hanno ricette pronte');
    for (const starter of starters) {
      await page.tap('[data-preset="' + starter.index + '"]');
      assert.equal(await page.locator('#fName').inputValue(), starter.nome);
      assert.ok(!(await page.locator('#fBud').evaluate((n) => n.classList.contains('over'))));
      await page.tap('#fSave');
      const ready = (await store()).saved.find((r) => r.nome === starter.nome);
      assert.ok(ready, starter.nome + ': ricetta selezionabile e salvabile');
      assert.deepEqual(ready.slots.map((s) => s.id), starter.ids, 'adattare i gradi al budget conserva i poteri');
      assert.ok(await page.evaluate((r) => { const D = window.__dite, B = D.Bricks; return B.valid(r) && B.cost(r) <= B.budgetFor(B.levelFor(D.store.fame)); }, ready));
      assert.deepEqual((await store()).recipe, saved, 'provare una ricetta pronta conserva il personaggio attivo');
    }
    await page.locator('#fPresets').scrollIntoViewIfNeeded(); await snap('ricette');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    assert.equal(overflow, false, 'nessun overflow orizzontale sullo schermo touch');
    assert.deepEqual(errors, [], 'nessun errore pagina o console/WebGL');
    console.log('officina touch: ' + inventory.total + ' poteri, ' + inventory.fresh + ' nuovi; paginazione, ricerca, filtri, budget e salvataggio OK; istruzioni corpo ' + bodyChecks + '/4; ' + starters.length + ' ricette pronte; nessun errore');
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
