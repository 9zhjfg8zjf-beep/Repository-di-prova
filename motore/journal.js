// Registro locale di risultati reali. Non ricostruisce partite o ricompense.
const Journal = (() => {
  'use strict';
  const C = typeof Core !== 'undefined' ? Core : require('./core.js');
  const B = typeof Bricks !== 'undefined' ? Bricks : require('./bricks.js');
  const VERSION = 1, LIMIT = 32, MAX_COUNT = 1000000000;
  const quests = Object.keys(C.QINFO), bosses = Object.keys(B.BOSSES), cities = ['dite', 'cocito', 'malebolge'];
  const count = (n) => Number.isSafeInteger(n) && n >= 0 ? Math.min(MAX_COUNT, n) : 0;
  const title = (kind, key) => kind === 'quest' ? C.QINFO[key].titolo : B.BOSSES[key].nome;
  function normalize(raw) {
    const source = raw && typeof raw === 'object' && !Array.isArray(raw) && raw.version === VERSION ? raw : {};
    const totals = (keys, values) => Object.fromEntries(keys.map((key) => [key, count(values && values[key])]));
    const recent = [], ids = new Set();
    if (Array.isArray(source.recent)) for (const entry of source.recent) {
      if (!entry || typeof entry !== 'object' || !['quest', 'boss'].includes(entry.kind) || !(entry.kind === 'quest' ? quests : bosses).includes(entry.key) || !cities.includes(entry.city) || !Number.isSafeInteger(entry.id) || entry.id < 1 || entry.id >= MAX_COUNT || ids.has(entry.id)) continue;
      ids.add(entry.id); recent.push({ id: entry.id, kind: entry.kind, key: entry.key, title: title(entry.kind, entry.key), city: entry.city,
        at: Number.isSafeInteger(entry.at) && entry.at >= 0 ? entry.at : null,
        fame: Number.isSafeInteger(entry.fame) && entry.fame >= 0 && entry.fame <= MAX_COUNT ? entry.fame : null });
      if (recent.length === LIMIT) break;
    }
    const lastId = recent.reduce((n, entry) => Math.max(n, entry.id), 0), nextId = Number.isSafeInteger(source.nextId) && source.nextId > lastId && source.nextId <= MAX_COUNT ? source.nextId : lastId + 1;
    return { version: VERSION, nextId, quests: totals(quests, source.quests), bosses: totals(bosses, source.bosses), recent };
  }
  function create(options = {}) {
    const data = normalize(options.saved), seen = new WeakSet(), clock = typeof options.now === 'function' ? options.now : Date.now;
    let world = null, currentQuest = null;
    function snapshot() { return { version: VERSION, nextId: data.nextId, quests: Object.assign({}, data.quests), bosses: Object.assign({}, data.bosses), recent: data.recent.map((e) => Object.assign({}, e)) }; }
    function observe(s, events) {
      if (!s || !s.city || !Array.isArray(events)) return false;
      if (world !== s) { world = s; currentQuest = s.quest && quests.includes(s.quest.type) ? s.quest.type : null; }
      const fresh = [];
      for (const e of events) if (e && typeof e === 'object' && !seen.has(e)) { seen.add(e); fresh.push(e); }
      const rewards = { missione: [], boss: [] };
      for (const e of fresh) if (e.type === 'fame' && Object.prototype.hasOwnProperty.call(rewards, e.why) && Number.isSafeInteger(e.n) && e.n >= 0 && e.n <= MAX_COUNT) rewards[e.why].push(e.n);
      let changed = false;
      for (const e of fresh) {
        if (e.type === 'questStart') { currentQuest = quests.includes(e.q) ? e.q : null; continue; }
        if (e.type === 'questFail') { currentQuest = null; continue; }
        let kind, key, reward;
        if (e.type === 'questDone') { kind = 'quest'; key = currentQuest || quests.find((q) => C.QINFO[q].titolo === e.titolo); currentQuest = null; reward = rewards.missione.shift(); }
        else if (e.type === 'bossDown') { kind = 'boss'; key = e.key; reward = rewards.boss.shift(); }
        else continue;
        if (!(kind === 'quest' ? quests : bosses).includes(key)) continue;
        const city = s.city.theme && s.city.theme.id; if (!cities.includes(city)) continue;
        const totals = kind === 'quest' ? data.quests : data.bosses;
        totals[key] = Math.min(MAX_COUNT, totals[key] + 1);
        if (data.nextId >= MAX_COUNT) { data.recent.forEach((entry, i) => { entry.id = data.recent.length - i; }); data.nextId = data.recent.length + 1; }
        const timestamp = clock();
        data.recent.unshift({ id: data.nextId++, kind, key, title: title(kind, key), city,
          at: Number.isSafeInteger(timestamp) && timestamp >= 0 ? timestamp : null, fame: reward === undefined ? null : reward });
        if (data.recent.length > LIMIT) data.recent.length = LIMIT;
        changed = true;
      }
      if (changed && typeof options.onChange === 'function') options.onChange(snapshot());
      return changed;
    }
    function view() {
      return { local: true, empty: data.recent.length === 0, missions: quests.reduce((n, key) => n + data.quests[key], 0),
        bossWins: bosses.reduce((n, key) => n + data.bosses[key], 0), recent: snapshot().recent };
    }
    return { observe, snapshot, view };
  }
  return { VERSION, LIMIT, normalize, create };
})();
if (typeof G !== 'undefined') G.Journal = Journal;
if (typeof module !== 'undefined') module.exports = Journal;
