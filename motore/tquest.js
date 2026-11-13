// Tutti i sei incarichi: il tocco accetta, la simulazione avanza gli obiettivi.
// Le fixture accorciano spostamenti e combattimenti, senza assegnare progressi,
// completamenti o premi direttamente alla missione.
const assert = require('node:assert/strict'), fs = require('node:fs');
const { chromium } = require('./pw.js');

(async () => {
  fs.mkdirSync('shots', { recursive: true });
  const b = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const errs = [], ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
    const pg = await ctx.newPage();
    pg.on('pageerror', (e) => errs.push(e.stack || e.message));
    const rendered = () => pg.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await pg.goto('file://' + __dirname + '/dist/index.html');
    await pg.waitForFunction(() => window.__dite && window.__dite.state());
    await pg.evaluate(() => {
      const D = window.__dite; D.lockQ = true;
      D.setRecipe({ nome: 'Prova missioni', slots: ['dardo', 'scatto', 'nova', 'nova', 'ira'].map((id) => ({ id, el: 'luce', t: 1 })) });
      document.getElementById('play').click(); D.state().player.invuln = 99999;
    });
    await rendered(); await pg.screenshot({ path: 'shots/q0-inizio.png' });
    const types = ['consegna', 'caccia', 'corsa', 'ripetitori', 'pubblico', 'scorta'];
    let totalReward = 0;
    for (const [n, type] of types.entries()) {
      const before = await pg.evaluate((type) => {
        const D = window.__dite, s = D.state(), p = s.player, g = s.givers[0], info = D.Core.QINFO[type];
        if (s.quest) throw new Error('La missione precedente è ancora attiva');
        // Il tipo dell'offerta è una fixture; accettazione e stato provengono dal gioco.
        g.offer = { type, ...info, fama: info.fama + 2 * s.level }; g.cool = 0;
        p.x = g.x + 2.5; p.z = g.z + 1; p.invuln = 99999;
        s.mobs = []; s.shots = []; s.zones = [];
        D.setLook(Math.atan2(g.x - p.x, g.z - p.z) + Math.PI, 0);
        return { fame: s.fame, quests: s.stats.quests, failures: s.stats.qfail, reward: g.offer.fama };
      }, type);
      await pg.waitForFunction((type) => {
        const s = window.__dite.state(), button = document.getElementById('useBtn');
        return s.hint.use && s.hint.use.kind === 'giver' && button.textContent.includes(window.__dite.Core.QINFO[type].titolo) && button.getBoundingClientRect().width > 0;
      }, type);
      await pg.screenshot({ path: 'shots/q' + n + '-a.png' });
      await pg.locator('#useBtn').tap();
      await pg.waitForFunction(() => !!window.__dite.state().quest);
      assert.equal(await pg.evaluate(() => window.__dite.state().quest.type), type, 'Il tocco deve accettare ' + type);
      await pg.screenshot({ path: 'shots/q' + n + '-b.png' });

      const result = await pg.evaluate((type) => {
        const D = window.__dite, C = D.Core, s = D.state(), p = s.player, q = s.quest;
        const check = (ok, message) => { if (!ok) throw new Error(type + ': ' + message); };
        check(q && q.type === type, 'missione attiva errata');
        const progress = [], counts = {}, keep = [], significant = new Set(['questDone', 'questFail', 'fame', 'level', 'step', 'ring', 'ambush', 'invite']);
        let frames = 0, last = [];
        const step = (input = {}) => {
          s.events.length = 0;
          C.step(s, 1 / 60, { mx: 0, my: 0, yaw: p.yaw, pitch: 0, fire: false, b: [false, false, false, false, false], use: false, ...input });
          frames++; last = s.events.slice();
          for (const e of last) { counts[e.type] = (counts[e.type] || 0) + 1; if (significant.has(e.type)) keep.push(e); }
        };
        const move = (o, dx = 0, dz = 0) => { p.x = o.x + dx; p.z = o.z + dz; };
        // I nemici di contorno non devono rendere casuale una prova degli obiettivi.
        const protect = () => { for (const e of s.mobs) if (e.team === 'e') { e.atk = 999; e.root = 999; } };
        protect();
        if (type === 'consegna') {
          move(q.obj, 8); step(); check(!!s.quest, 'consegna riuscita da fuori raggio');
          move(q.obj); step(); progress.push('dentro il raggio di consegna');
        } else if (type === 'caccia') {
          const targets = s.mobs.filter((e) => e.tag === 'q');
          check(targets.length === q.left && targets.length >= 5, 'banda mancante');
          const startKills = s.stats.kills;
          for (const target of targets) {
            if (target.dead) continue;
            target.hp = 1; target.spawn = 0; target.atk = 999; target.root = 999;
            const spots = [[0, 3], [3, 0], [0, -3], [-3, 0]];
            const offset = spots.find(([x, z]) => !C.solidAt(s, target.x + x, target.z + z) && C.los(s, target.x + x, target.z + z, target.x, target.z));
            check(!!offset, 'nessuna posizione di tiro libera'); move(target, ...offset);
            const yaw = Math.atan2(-(target.x - p.x), -(target.z - p.z));
            for (let i = 0; i < 300 && !target.dead; i++) { protect(); step({ yaw, fire: true }); }
            check(target.dead, 'il primario non ha ucciso un bersaglio');
            progress.push(q.left);
          }
          step(); check(s.stats.kills - startKills === targets.length, 'uccisioni della banda non contabilizzate');
          check(counts.kill === targets.length, 'mancano eventi di uccisione reali');
        } else if (type === 'corsa') {
          const total = q.pts.length;
          for (let i = 0; i < total; i++) { move(q.pts[i]); step(); check(q.i === i + 1, 'anello saltato'); progress.push(q.i); }
          check(counts.step === total, 'ogni anello deve produrre un progresso');
        } else if (type === 'ripetitori') {
          move(q.obj); for (let i = 0; i < 30; i++) step();
          check(q.i === 0 && q.hold > 0 && q.hold < 1.6, 'attivazione troppo rapida');
          move(q.obj, 8); for (let i = 0; i < 30; i++) step();
          check(q.i === 0 && q.hold === 0, 'uscire dal cerchio deve consumare il progresso');
          for (let i = 0; i < 3; i++) {
            move(q.pts[i]); for (let f = 0; f < 120 && s.quest && q.i === i; f++) { protect(); step(); }
            check(q.i === i + 1 && q.pts[i].on, 'ripetitore non acceso'); progress.push(q.i);
          }
          check(q.pts[1].woke && q.pts[2].woke, 'le guardie dei ripetitori non si sono attivate');
          check(counts.step === 3, 'servono tre attivazioni');
        } else if (type === 'pubblico') {
          const spot = s.city.crossings.find((o) => Math.hypot(o.x, o.z) > 30 && s.givers.every((g) => Math.hypot(g.x - o.x, g.z - o.z) > 8));
          check(!!spot, 'nessun posto per invitare gli abitanti'); move(spot);
          const crowd = s.npcs.slice(0, q.need);
          for (const c of s.npcs) { c.x = p.x + 20; c.z = p.z + 20; c.st = 'wander'; c.t = 50; }
          for (const c of crowd) {
            for (const other of crowd) if (other !== c) { other.x = p.x + 10; other.z = p.z + 10; }
            c.x = p.x; c.z = p.z - 1.5;
            step({ yaw: 0, use: true }); check(c.st === 'follow', 'invito contestuale non riuscito');
          }
          check(counts.invite === q.need, 'servono inviti veri per ogni abitante');
          check(!!s.quest, 'missione riuscita fuori piazza');
          p.x = 0; p.z = 8;
          crowd.forEach((c, i) => { c.x = (i - 2) * 0.4; c.z = 22; });
          for (let i = 0; i < 600 && s.quest; i++) step();
          check(crowd.every((c) => c.st === 'watch'), 'gli invitati devono arrivare e fermarsi in piazza');
          progress.push({ invited: counts.invite, arrived: q.have });
        } else if (type === 'scorta') {
          const a = s.mobs.find((e) => e.id === q.anima); check(!!a && a.path.length >= 6, 'percorso della scorta mancante');
          move(a, 20); const start = a.pi;
          for (let i = 0; i < 30; i++) step(); check(a.pi === start, 'la scorta si muove senza giocatore');
          for (let i = 0; i < 12000 && s.quest; i++) { move(a, 1, 1); protect(); step(); }
          check(a.pi === a.path.length, 'la scorta non ha percorso tutti i punti');
          check(counts.ambush === 3, 'mancano le tre imboscate');
          progress.push({ path: a.pi, total: a.path.length, ambushes: counts.ambush });
        }
        check(!s.quest, 'missione ancora attiva');
        check(counts.questDone === 1 && !counts.questFail, 'completamento deve avvenire una sola volta senza fallimenti');
        // Consegnare al renderer gli eventi importanti, evitando migliaia di effetti
        // simultanei prodotti dall'avanzamento rapido della simulazione.
        s.events.length = 0; s.events.push(...keep, ...last.filter((e) => !significant.has(e.type)));
        return { type, frames, progress, fame: s.fame, quests: s.stats.quests, failures: s.stats.qfail, reward: q.fama, counts };
      }, type);
      assert.equal(result.reward, before.reward);
      assert.equal(result.fame, before.fame + before.reward, type + ': premio errato');
      assert.equal(result.quests, before.quests + 1); assert.equal(result.failures, before.failures);
      totalReward += before.reward;
      await pg.waitForFunction((fame) => window.__dite.store.fame === fame, result.fame);
      await pg.waitForFunction(() => document.getElementById('banner').textContent.includes('MISSIONE RIUSCITA'));
      await pg.screenshot({ path: 'shots/q' + n + '-d.png' });
      console.log('missione verificata:', JSON.stringify({ type, frames: result.frames, progress: result.progress, reward: result.reward, fame: result.fame }));
    }
    const final = await pg.evaluate(() => { const s = window.__dite.state(); return { quests: s.stats.quests, failures: s.stats.qfail, fame: s.fame, stored: window.__dite.store.fame }; });
    assert.equal(final.quests, types.length); assert.equal(final.failures, 0);
    assert.equal(final.fame, totalReward); assert.equal(final.stored, totalReward);
    assert.deepEqual(errs, [], 'Errori JavaScript nel browser');
    console.log('sei tipi completati:', JSON.stringify(final));
    console.log('nessun errore');
  } finally { await b.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
