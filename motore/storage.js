// Salvataggio del profilo: nessun oggetto, timer o riferimento del Core viene serializzato.
const DiteStorage = (() => {
  const VERSION = 3, KEY = 'dite2', BACKUP_KEY = 'dite2.previous';
  const PREFS = { muted: false, sens: 1, quality: 'auto', reducedMotion: false, reducedFlash: false, volume: 0.8, leftHanded: false, invertY: false, haptics: true };
  const plain = (v) => !!v && typeof v === 'object' && !Array.isArray(v) && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
  const number = (v, fallback, lo, hi, integer) => typeof v === 'number' && Number.isFinite(v) ? Math.max(lo, Math.min(hi, integer ? Math.trunc(v) : v)) : fallback;
  const string = (v, max) => typeof v === 'string' ? v.slice(0, max) : '';
  const copy = (v) => JSON.parse(JSON.stringify(v));
  function recipe(raw, bricks) {
    if (!plain(raw) || !Array.isArray(raw.slots) || raw.slots.length !== 5) return null;
    const slots = [];
    for (const b of raw.slots) {
      if (!plain(b) || typeof b.id !== 'string' || typeof b.el !== 'string' || !Number.isInteger(b.t) || b.t < 1 || b.t > 3 || (b.m != null && b.m !== '' && typeof b.m !== 'string')) return null;
      const slot = { id: b.id, el: b.el, t: b.t }; if (b.m) slot.m = b.m; slots.push(slot);
    }
    const out = { nome: string(raw.nome, 80), desc: string(raw.desc, 1000), slots };
    return bricks.valid(out) ? out : null;
  }
  function uid(r, index) { let h = 2166136261; const text = JSON.stringify(r); for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619); return 'kit-' + (h >>> 0).toString(36) + '-' + index; }
  function onboarding(raw) { return plain(raw) && raw.version === 1 ? { version: 1, step: number(raw.step, 0, 0, 5, true), skipped: raw.skipped === true } : null; }
  function journal(raw) {
    const out = { version: 1, nextId: 1, quests: {}, bosses: {}, recent: [] };
    for (const key of ['consegna', 'caccia', 'corsa', 'ripetitori', 'pubblico', 'scorta']) out.quests[key] = number(raw && raw.quests && raw.quests[key], 0, 0, 1e9, true);
    for (const key of ['malacoda', 'cerbero', 'gerione']) out.bosses[key] = number(raw && raw.bosses && raw.bosses[key], 0, 0, 1e9, true);
    if (!plain(raw) || raw.version !== 1) return out;
    if (Array.isArray(raw.recent)) for (const e of raw.recent.slice(0, 32)) {
      if (!plain(e) || !Number.isSafeInteger(e.id) || e.id < 1 || e.id >= Number.MAX_SAFE_INTEGER || !['quest', 'boss'].includes(e.kind) || !Object.prototype.hasOwnProperty.call(e.kind === 'quest' ? out.quests : out.bosses, e.key)) continue;
      out.recent.push({ id: e.id, kind: e.kind, key: e.key, title: string(e.title, 100), city: string(e.city, 80), at: number(e.at, 0, 0, 8640000000000000, true), fame: number(e.fame, 0, 0, 1e9, true) });
    }
    out.nextId = Math.max(number(raw.nextId, 1, 1, Number.MAX_SAFE_INTEGER - 1, true), ...out.recent.map((e) => e.id + 1)); return out;
  }
  function normalize(raw, bricks, defaults = {}) {
    if (!bricks || typeof bricks.valid !== 'function') throw new TypeError('Bricks richiesto per validare i salvataggi');
    raw = plain(raw) ? raw : {};
    const out = { schemaVersion: VERSION, recipe: recipe(raw.recipe, bricks) || recipe(defaults.recipe, bricks) || recipe(bricks.PRESETS[0], bricks), saved: [], fame: number(raw.fame, 0, 0, 1e9, true), seed: number(raw.seed, 1, 1, 99999, true), theme: ['dite', 'cocito', 'malebolge'].includes(raw.theme) ? raw.theme : 'dite', tips: raw.tips === true || raw.tips === 1 };
    if (!out.recipe) throw new TypeError('Ricetta iniziale non valida');
    const ids = new Set();
    if (Array.isArray(raw.saved)) for (const candidate of raw.saved) {
      const r = recipe(candidate, bricks); if (!r) continue;
      let id = typeof candidate.uid === 'string' && /^[\w-]{1,80}$/.test(candidate.uid) ? candidate.uid : uid(r, out.saved.length);
      let salt = out.saved.length; while (ids.has(id)) id = uid(r, salt++); ids.add(id); r.uid = id; out.saved.push(r); if (out.saved.length === 12) break;
    }
    for (const key of Object.keys(PREFS)) if (typeof PREFS[key] === 'boolean') out[key] = typeof raw[key] === 'boolean' ? raw[key] : typeof defaults[key] === 'boolean' ? defaults[key] : PREFS[key];
    out.sens = number(raw.sens, PREFS.sens, 0.4, 2.2); out.volume = number(raw.volume, PREFS.volume, 0, 1); out.quality = ['auto', 'performance', 'quality'].includes(raw.quality) ? raw.quality : PREFS.quality;
    out.onboarding = defaults.normalizeOnboarding ? defaults.normalizeOnboarding(raw.onboarding) : onboarding(raw.onboarding);
    // Un profilo preesistente senza checkpoint non diventa un nuovo tutorial.
    if (!plain(raw.onboarding) || raw.onboarding.version !== 1) out.onboarding = null;
    out.journal = defaults.normalizeJournal ? defaults.normalizeJournal(raw.journal) : journal(raw.journal);
    return out;
  }
  const messages = { ready: 'Progressi sul dispositivo', saved: 'Salvato sul dispositivo', pending: 'Salvataggio…', temporary: 'Salvataggio non disponibile: progressi temporanei', recovered: 'Salvataggio recuperato' };
  function create(options) {
    const { bricks, storage, postNative } = options, defaults = options.defaults || {}, native = typeof postNative === 'function';
    let source = null, raw = null, initialError = options.hostError || null, recovered = false, rawPresent = false;
    if (native) { raw = options.hostStorage; rawPresent = raw != null; if (rawPresent && !plain(raw)) { raw = null; recovered = true; } }
    else {
      try { source = storage ? storage.getItem(KEY) : null; rawPresent = source !== null; if (source !== null) { raw = JSON.parse(source); if (!plain(raw)) throw new TypeError('Profilo non valido'); } }
      catch (error) {
        recovered = rawPresent; initialError = rawPresent ? 'corrupt' : 'unavailable'; raw = null;
        try { const previous = storage && storage.getItem(BACKUP_KEY); if (previous) { const candidate = JSON.parse(previous); if (plain(candidate)) raw = candidate; } } catch (ignored) { /* i dati in RAM restano disponibili */ }
      }
      if (!storage) initialError = 'unavailable';
    }
    const isNew = !rawPresent && !initialError && !recovered, data = normalize(raw, bricks, defaults), listeners = new Set();
    if (rawPresent && (!plain(raw) || !recipe(raw.recipe, bricks) || (raw.saved != null && !Array.isArray(raw.saved)))) recovered = true;
    const damaged = (recovered || initialError === 'corrupt') && !plain(raw);
    let state = { state: initialError === 'unavailable' || damaged ? 'temporary' : recovered || initialError === 'corrupt' ? 'recovered' : 'ready', error: damaged ? 'corrupt' : initialError }, nextId = 0, pendingId = 0, timer = null, backedUp = false;
    const status = () => ({ ...state, message: state.state === 'temporary' && state.error === 'corrupt' ? 'Salvataggio danneggiato: progressi temporanei' : messages[state.state] });
    function notify(name, error = null) { state = { state: name, error }; for (const fn of listeners) fn(status()); }
    function snapshot() { return normalize(data, bricks, defaults); }
    function sync(value) { for (const key of Object.keys(data)) delete data[key]; Object.assign(data, value); }
    function save() {
      let value, text;
      try { value = snapshot(); text = JSON.stringify(value); if (text.length > 256 * 1024) throw new Error('size'); }
      catch (error) { notify('temporary', 'invalid'); return { ok: false, pending: false, error: 'invalid' }; }
      sync(value);
      if (native) {
        pendingId = ++nextId; if (timer) clearTimeout(timer);
        notify('pending');
        try {
          postNative({ v: 1, type: 'save', id: pendingId, data: value });
          if (!pendingId) return { ok: state.state === 'saved', pending: false, error: state.error };
          const waitingFor = pendingId;
          timer = setTimeout(() => { if (pendingId === waitingFor) notify('temporary', 'unavailable'); }, options.ackTimeout == null ? 6000 : options.ackTimeout);
          if (timer && timer.unref) timer.unref();
          return { ok: false, pending: true, error: null };
        } catch (error) { pendingId = 0; notify('temporary', 'unavailable'); return { ok: false, pending: false, error: 'unavailable' }; }
      }
      try {
        if (!storage) throw new Error('Storage assente');
        // La copia precedente viene scritta prima di sostituire qualsiasi profilo migrato/corrotto.
        if (!backedUp && source !== null && (!plain(raw) || raw.schemaVersion !== VERSION || recovered)) { if (storage.getItem(BACKUP_KEY) === null) storage.setItem(BACKUP_KEY, source); backedUp = true; }
        storage.setItem(KEY, text); notify('saved'); return { ok: true, pending: false, error: null };
      } catch (error) { notify('temporary', 'unavailable'); return { ok: false, pending: false, error: 'unavailable' }; }
    }
    function receiveAck(message) {
      if (!message || message.v !== 1 || message.type !== 'saveResult' || !Number.isSafeInteger(message.id) || pendingId < 1 || message.id !== pendingId || typeof message.ok !== 'boolean') return false;
      if (timer) clearTimeout(timer); timer = null; pendingId = 0;
      notify(message.ok ? 'saved' : 'temporary', message.ok ? null : message.error === 'invalid' ? 'invalid' : 'unavailable'); return true;
    }
    return { data, isNew, save, snapshot, status, receiveAck, subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); } };
  }
  return { VERSION, KEY, BACKUP_KEY, PREFS: { ...PREFS }, normalize, recipe, create };
})();
if (typeof G !== 'undefined') G.initStorage = function () {
  if (G.storage) return G.storage;
  const host = window.__DITE_HOST__, nativeHost = host && host.v === 1 && host.platform === 'ios' ? host : null;
  const listeners = new Set(), handler = nativeHost && window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.dite;
  const send = (message) => { if (!handler || typeof handler.postMessage !== 'function') return false; handler.postMessage(message); return true; };
  G.native = { available: !!handler, active: !nativeHost || nativeHost.active !== false, capabilities: nativeHost && nativeHost.capabilities || {}, send, subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); } };
  let local = null; try { local = window.localStorage; } catch (error) { /* una webview puo vietare l'accesso */ }
  const defaults = { recipe: G.Onboarding && G.Onboarding.introRecipe(), reducedMotion: !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches), normalizeOnboarding: G.Onboarding && G.Onboarding.normalize, normalizeJournal: G.Journal && G.Journal.normalize };
  G.storage = DiteStorage.create({ bricks: Bricks, storage: local, defaults, ...(handler ? { hostStorage: nativeHost.storage, hostError: nativeHost.storageError, postNative: send } : {}) });
  G.store = G.storage.data; G.save = () => G.storage.save();
  window.DiteNative = { receive(message) {
    if (!message || message.v !== 1) return false;
    if (message.type === 'saveResult') return G.storage.receiveAck(message);
    if (message.type !== 'lifecycle' || typeof message.active !== 'boolean') return false;
    G.native.active = message.active; for (const fn of listeners) fn({ v: 1, type: 'lifecycle', active: message.active, reason: typeof message.reason === 'string' ? message.reason.slice(0, 80) : '' }); return true;
  } };
  try { send({ v: 1, type: 'ready', schemaVersion: DiteStorage.VERSION }); } catch (error) { /* il prossimo salvataggio mostrera l'errore */ }
  return G.storage;
};
if (typeof module !== 'undefined') module.exports = DiteStorage;
