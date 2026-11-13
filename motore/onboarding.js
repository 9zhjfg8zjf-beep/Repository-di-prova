// Percorso introduttivo: osserva azioni del Core, senza modificarne lo stato.
const Onboarding = (() => {
  'use strict';
  const VERSION = 1, TOTAL = 5;
  const finite = (n) => typeof n === 'number' && Number.isFinite(n);
  const angle = (n) => Math.atan2(Math.sin(n), Math.cos(n));
  function normalize(raw) {
    const valid = raw && typeof raw === 'object' && !Array.isArray(raw) && raw.version === VERSION;
    const step = valid && Number.isInteger(raw.step) && raw.step >= 0 && raw.step <= TOTAL ? raw.step : 0;
    return { version: VERSION, step, skipped: step < TOTAL && !!(valid && raw.skipped === true) };
  }
  function introRecipe() {
    return { nome: 'Primi passi', desc: 'Dardo, scatto e scudo per conoscere la citta.', slots: ['dardo', 'scatto', 'scudo', 'nova', 'cataclisma'].map((id) => ({ id, el: 'gelo', t: 1 })) };
  }
  function create(options = {}) {
    let saved = normalize(options.saved), active = false, world = null, prev = null, walked = 0, turned = 0;
    const learned = { primary: false, ability: false, quest: false };
    const snapshot = () => ({ version: VERSION, step: saved.step, skipped: saved.skipped });
    const notify = () => { if (typeof options.onChange === 'function') options.onChange(snapshot()); };
    function frame(s, inp) {
      const p = s.player;
      return { x: p.x, z: p.z, yaw: p.yaw, pitch: p.pitch, t: s.t, dead: p.dead > 0,
        carried: !!(p.dash || p.leap || p.ride || p.possession), casts: s.stats.casts[0],
        inputYaw: inp && finite(inp.yaw) ? inp.yaw : null, inputPitch: inp && finite(inp.pitch) ? inp.pitch : null };
    }
    function bind(s) { world = s; prev = s && s.player ? frame(s, null) : null; walked = turned = 0; }
    function start(s, config = {}) {
      const before = snapshot();
      if (config.restart) { saved = normalize(null); for (const key of Object.keys(learned)) learned[key] = false; }
      if (saved.step >= TOTAL) { active = false; return false; }
      saved.skipped = false; active = true; bind(s);
      if (before.step !== saved.step || before.skipped !== saved.skipped) notify();
      return true;
    }
    function skip() {
      if (saved.step >= TOTAL) return false;
      active = false; if (saved.skipped) return false;
      saved.skipped = true; notify(); return true;
    }
    function observe(s, inp, events) {
      if (!active || saved.skipped || saved.step >= TOTAL || !s || !s.player || !inp) return false;
      if (world !== s || !prev) bind(s);
      const p = s.player, now = frame(s, inp), batch = Array.isArray(events) ? events : [], before = saved.step;
      const live = !now.dead && !prev.dead, elapsed = now.t - prev.t;
      if (live) {
        const missed = batch.some((e) => e.type === 'miss' || (e.type === 'fizzle' && e.slot === 0));
        const castPrimary = batch.some((e) => e.type === 'cast' && e.slot === 0);
        const continuous = now.casts > prev.casts && !!(p.beam && p.beam.on || p.cone);
        if (inp.fire && !missed && (castPrimary || continuous)) learned.primary = true;
        if (batch.some((e) => e.type === 'cast' && (e.slot === 2 || e.slot === 3) && inp.b && inp.b[e.slot])) learned.ability = true;
        if (inp.use && batch.some((e) => e.type === 'questStart')) learned.quest = true;
        if (saved.step === 0 && elapsed > 0 && elapsed <= .1 && !now.carried && !prev.carried && Math.hypot(inp.mx || 0, inp.my || 0) > .1) {
          const distance = Math.hypot(now.x - prev.x, now.z - prev.z);
          // Non scambiare un teletrasporto o una modifica della scena per una camminata.
          if (distance <= Math.max(.6, elapsed * 40)) walked += distance;
          if (walked >= 2) saved.step = 1;
        } else if (saved.step === 1 && elapsed > 0 && prev.inputYaw !== null && prev.inputPitch !== null && finite(inp.yaw) && finite(inp.pitch)) {
          const dy = angle(inp.yaw - prev.inputYaw), dp = inp.pitch - prev.inputPitch;
          if (Math.abs(angle(now.yaw - prev.yaw) - dy) < .01 && Math.abs((now.pitch - prev.pitch) - dp) < .01) turned += Math.abs(dy) + Math.abs(dp);
          if (turned >= Math.PI / 9) saved.step = 2;
        }
        while ((saved.step === 2 && learned.primary) || (saved.step === 3 && learned.ability) || (saved.step === 4 && learned.quest)) saved.step++;
      }
      prev = now;
      if (saved.step === before) return false;
      if (saved.step === TOTAL) active = false;
      notify();
      if (saved.step === TOTAL && typeof options.onDone === 'function') options.onDone(snapshot());
      return true;
    }
    function view(s, mode = {}) {
      if (typeof mode === 'string') mode = { kind: mode };
      const touch = mode.kind !== 'keyboard', moveRight = mode.movementSide === 'right';
      const primary = s && s.kit && s.kit[0] ? s.kit[0].nome : 'il primario';
      const shield = !!(s && s.kit && s.kit[2] && s.kit[2].id === 'scudo');
      const steps = [
        ['move', 'Cammina', touch ? 'Trascina nella zona ' + (moveRight ? 'destra' : 'sinistra') + ' per camminare.' : 'Usa W A S D o le frecce per camminare.', 'move'],
        ['look', 'Guardati intorno', touch ? 'Trascina nella zona ' + (moveRight ? 'sinistra' : 'destra') + ' libera per girare lo sguardo.' : 'Muovi il mouse, oppure trascina sulla scena, per girare lo sguardo.', 'look'],
        ['primary', 'Prova il primario', touch ? 'Tieni premuto il tasto grande per usare ' + primary + '.' : 'Tieni premuto il tasto sinistro del mouse o J per usare ' + primary + '.', 'primary'],
        ['ability', 'Prova un potere', shield ? (touch ? 'Tocca Scudo per proteggerti.' : 'Premi Q per attivare Scudo.') : (touch ? 'Tocca una delle due abilita quando ha un bersaglio o le risorse richieste.' : 'Premi Q oppure E per usare una delle due abilita quando disponibile.'), 'ability'],
        ['quest', 'Incontra un committente', touch ? 'Segui il !, avvicinati e tocca Accetta per iniziare una missione.' : 'Segui il !, avvicinati e premi F per accettare una missione.', 'use'],
      ];
      const row = steps[saved.step] || ['done', 'Pronto a esplorare', s && s.quest ? 'Segui l\'obiettivo della missione. La guida resta disponibile dalla pausa.' : 'Cerca una missione o esplora la citta. La guida resta disponibile dalla pausa.', ''];
      return { visible: active && !saved.skipped && saved.step < TOTAL, stepId: row[0], index: Math.min(TOTAL, saved.step + 1), total: TOTAL,
        title: row[1], text: row[2], highlight: row[3], skipped: saved.skipped, done: saved.step === TOTAL,
        progress: saved.step === 0 ? Math.min(1, walked / 2) : saved.step === 1 ? Math.min(1, turned / (Math.PI / 9)) : 0 };
    }
    return { start, observe, skip, snapshot, view };
  }
  return { VERSION, introRecipe, normalize, create };
})();
if (typeof G !== 'undefined') G.Onboarding = Onboarding;
if (typeof module !== 'undefined') module.exports = Onboarding;
