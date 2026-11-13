// Stato dell'applicazione, indipendente da DOM, rendering e simulazione.
const DiteAppState = (() => {
  const SCREENS = ['boot', 'lobby', 'city', 'loadout', 'forge', 'journal', 'loading', 'playing', 'pause', 'settings', 'guide', 'error'];
  const PANELS = new Set(['city', 'loadout', 'forge', 'journal', 'settings', 'guide']);
  function create() {
    let screen = 'boot', hasSession = false, reason = '';
    const history = [], blockers = new Set(), listeners = new Set();
    const snapshot = () => ({ screen, returnTo: history[history.length - 1] || null, history: history.slice(), hasSession, playing: screen === 'playing' && hasSession && blockers.size === 0, blockers: Array.from(blockers), reason });
    function emit() { const value = snapshot(); for (const fn of listeners) fn(value); return value; }
    function destination(next) { return next === 'playing' && (!hasSession || blockers.size) ? (hasSession ? 'pause' : 'lobby') : next === 'pause' && !hasSession ? 'lobby' : next; }
    function go(next, options = {}) {
      if (!SCREENS.includes(next)) return snapshot();
      next = destination(next);
      if (next === screen) return snapshot();
      if (PANELS.has(next)) {
        const back = SCREENS.includes(options.returnTo) ? options.returnTo : screen;
        if (back !== next && back !== 'boot' && back !== 'loading') history.push(back);
        if (history.length > 16) history.shift();
      } else if (!options.preserveHistory) history.length = 0;
      screen = next; reason = ''; return emit();
    }
    function back() {
      screen = destination(history.pop() || (hasSession ? 'pause' : 'lobby'));
      reason = ''; return emit();
    }
    function suspend(why = 'pause') {
      reason = String(why).slice(0, 80);
      if (screen === 'playing') { screen = hasSession ? 'pause' : 'lobby'; history.length = 0; }
      // Un pannello aperto conserva la propria bozza e la catena dei ritorni.
      for (let i = 0; i < history.length; i++) if (history[i] === 'playing') history[i] = hasSession ? 'pause' : 'lobby';
      return emit();
    }
    function setBlocker(name, on) {
      if (typeof name !== 'string' || !name || name.length > 40) return snapshot();
      const changed = on ? !blockers.has(name) : blockers.has(name);
      if (!changed) return snapshot();
      if (on) { blockers.add(name); return suspend(name); }
      blockers.delete(name); return emit(); // Rimuovere un impedimento non equivale a premere Riprendi.
    }
    function setSession(value) {
      hasSession = !!value;
      if (!hasSession) {
        for (let i = 0; i < history.length; i++) if (history[i] === 'playing' || history[i] === 'pause') history[i] = 'lobby';
        if (screen === 'playing' || screen === 'pause') screen = 'lobby';
      }
      return emit();
    }
    return { go, back, setSession, suspend, setBlocker, snapshot, subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); } };
  }
  return { SCREENS: SCREENS.slice(), create };
})();
if (typeof G !== 'undefined') G.AppState = DiteAppState;
if (typeof module !== 'undefined') module.exports = DiteAppState;
