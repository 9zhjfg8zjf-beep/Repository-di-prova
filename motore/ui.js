// MOTORE - icone, memoria locale, officina dei personaggi.
G.ICON = {
  orb: 'M12 7a5 5 0 1 0 0 10a5 5 0 0 0 0-10zM3 12h3M18 12h3', bolt: 'M13 2 5 13h6l-1 9 9-12h-6z', beam: 'M3 12h14M17 8l4 4-4 4M3 8v8', cone: 'M4 12 20 5v14z',
  claw: 'M6 3c0 8 2 13 5 18M11 3c0 7 1 12 3 16M16 3c0 6 .5 9 2 13', arc: 'M3 20C6 6 16 6 19 16M19 16l-4-1M19 16l1-4', dash: 'M3 12h12M11 6l6 6-6 6M19 6v12',
  blink: 'M7 8l3 4-3 4-3-4zM17 8l3 4-3 4-3-4zM11 12h2', leap: 'M3 19c3-14 15-14 18 0M17 19h4v-4', cable: 'M4 21V5M20 21V5M2 7h4M18 7h4M4 8c5 6 11 6 16 0',
  speed: 'M3 7h9M3 12h13M3 17h9M16 7l5 5-5 5', veil: 'M3 12c4-6 14-6 18 0c-4 6-14 6-18 0zM4 4l16 16', ring: 'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18zM12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6z',
  zone: 'M3 16c0-3 18-3 18 0s-18 3-18 0zM8 11V7M12 12V5M16 11V7', trap: 'M3 18h18M6 18l2-6h8l2 6M12 12V7M9 7h6', shield: 'M12 3l8 3v6c0 5-3.5 8-8 9c-4.5-1-8-4-8-9V6z', heal: 'M12 5v14M5 12h14',
  eye: 'M2 12c4-7 16-7 20 0c-4 7-16 7-20 0zM12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6z', skull: 'M6 14v-4a6 6 0 0 1 12 0v4l-2 2v3H8v-3zM9.5 11v2M14.5 11v2', chain: 'M9 8a3 3 0 0 0-6 0v2a3 3 0 0 0 6 0M15 14a3 3 0 0 0 6 0v-2a3 3 0 0 0-6 0M8 11l8 2',
  hook: 'M5 4v9a5 5 0 0 0 10 0V9M15 9l-3 3M15 9l3 3', push: 'M4 6v12M8 12h12M16 8l4 4-4 4', summon: 'M12 4a3 3 0 1 0 0 6a3 3 0 0 0 0-6zM5 14a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5zM19 14a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5z',
  clone: 'M9 4a3 3 0 1 0 0 6a3 3 0 0 0 0-6zM4 20c0-5 10-5 10 0M16 7a2.5 2.5 0 1 1 0 5M17 15c2 .5 3 2 3 5', chip: 'M6 6h12v12H6zM9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4',
  mark: 'M12 3v5M12 16v5M3 12h5M16 12h5M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6z', orbit: 'M12 10a2 2 0 1 0 0 4a2 2 0 0 0 0-4zM3 12c0-4 18-4 18 0s-18 4-18 0z', strike: 'M12 2v12M8 10l4 4 4-4M4 20h16M7 17h10',
  drain: 'M5 7c6 0 6 12 14 12M19 19l-4-1M19 19l-1-4M5 5a2 2 0 1 0 .1 0', bubble: 'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18zM12 7v5l3 2', turret: 'M8 20l4-8 4 8M7 9h10v4H7zM17 11h4', wave: 'M4 5c8 2 8 12 0 14M10 5c8 2 8 12 0 14',
  crown: 'M4 18h16l1-10-5 4-4-7-4 7-5-4z',
  absorb: 'M3 7l5 5-5 5M21 7l-5 5 5 5M12 4v4M12 16v4M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6z',
  release: 'M12 8v-5M9 6l3-3 3 3M8 12H3M6 9l-3 3 3 3M16 12h5M18 9l3 3-3 3M12 16v5M9 18l3 3 3-3',
  magnet: 'M5 4v9a7 7 0 0 0 14 0V4h-4v9a3 3 0 0 1-6 0V4zM5 8h4M15 8h4',
  transmute: 'M3 5h7v7H3zM17 13l4 4-4 4-4-4zM12 5h5v5M14 7l3 3 3-3M12 19H7v-5M4 17l3-3 3 3',
  link: 'M8 8l8 8M8 16l8-8M6 3a3 3 0 1 0 0 6a3 3 0 0 0 0-6zM18 15a3 3 0 1 0 0 6a3 3 0 0 0 0-6zM3 18h6M18 3v6',
  debt: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 7h6M9 11h6M12 14v3M10 15h4',
  disarm: 'M6 3l3 8-3 4-3-4zM6 15v6M15 4l6 6M21 4l-6 6M12 16h9M17 13l4 3-4 3',
  silence: 'M4 9h4l5-4v14l-5-4H4zM17 9l5 6M22 9l-5 6',
  cleanse: 'M12 3l2 6 6 3-6 2-2 7-2-7-6-2 6-3zM19 3v4M17 5h4',
  infect: 'M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8zM12 2v4M12 18v4M2 12h4M18 12h4M4 4l3 3M17 17l3 3M4 20l3-3M17 7l3-3',
  portal: 'M7 3c-5 0-5 18 0 18s5-18 0-18zM17 3c-5 0-5 18 0 18s5-18 0-18zM7 12h10M14 9l3 3-3 3',
  tether: 'M4 4v16M4 12c3-7 6 7 9 0s5 0 7 0M17 8l4 4-4 4',
  barrier: 'M3 20V4h18v16M3 8h18M8 4v16M16 4v16M3 15h18',
  mimic: 'M5 3h9v4H9v10H5zM10 8h9v13h-9zM13 12h3M13 16h3',
  rewindfoe: 'M4 8a9 9 0 1 1-1 8M3 3v6h6M12 7v5l-3 2',
  revive: 'M7 21v-5a5 5 0 0 1 10 0v5M12 3v7M9 6h6M4 12l-2 4M20 12l2 4',
  command: 'M12 3l4 5-4 5-4-5zM12 13v4M4 17h16M4 17v4M12 17v4M20 17v4',
  form: 'M4 14h6v6H4zM13 3h8v8h-8zM5 10V4h5M5 4l6 6M14 19h6v-6M20 19l-6-6',
  phase: 'M3 4h7v16H3M14 4h7v16h-7M8 12h8M13 9l3 3-3 3M6 8v1M6 15v1M18 8v1M18 15v1',
  flight: 'M12 3v18M12 12C8 5 4 4 2 5l4 7 6 3M12 12c4-7 8-8 10-7l-4 7-6 3M9 6l3-3 3 3',
  possess: 'M6 3a3 3 0 1 0 0 6a3 3 0 0 0 0-6zM2 20v-5a4 4 0 0 1 8 0v5M18 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6zM14 22v-2a4 4 0 0 1 8 0v2M11 5h6v3M14 5l3 3 3-3',
  pact: 'M4 4h16v16H4zM8 8h8M8 12h4M8 16h3M15 14l2 2 3-4',
  stasis: 'M7 3h10l4 9-4 9H7l-4-9zM10 8v8M14 8v8M7 3l3 5M17 21l-3-5',
  scan: 'M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5M4 12c3-5 13-5 16 0-3 5-13 5-16 0zM12 10v4M1 12h3M20 12h3',
};
G.svg = (ic) => '<svg viewBox="0 0 24 24"><path d="' + (G.ICON[ic] || G.ICON.orb) + '"/></svg>';
G.initStorage();
G.esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// La shell presenta lo stato. Il router e l'equipaggiamento effettivo appartengono a main.
G.shell = (() => {
  const B = Bricks, $ = (id) => document.getElementById(id), esc = G.esc;
  let model = null, equip = null, selected = 'active', choices = [], initialized = false;
  const clone = (r) => ({ nome:r.nome || '', desc:r.desc || '', slots:r.slots.map((s) => ({ ...s })) });
  const slotName = (i) => ['Primario','Movimento','Abilità 1','Abilità 2','Suprema'][i];
  const html = (id, value) => { const n = $(id); if (n && n.innerHTML !== value) { const scroll = n.scrollTop; n.innerHTML = value; n.scrollTop = scroll; } };
  const text = (id, value) => { const n = $(id); if (n && n.textContent !== String(value)) n.textContent = value; };
  const kitIcons = (r) => '<div class="kit">' + r.slots.map((s,i) => { const a = B.ARCH[s.id]; return '<div class="kit-power"><small>' + slotName(i) + '</small><div class="ic" style="--c:' + B.ELEM[s.el].css + '">' + G.svg(a.ic) + '</div><div class="n">' + esc(a.nome) + '</div></div>'; }).join('') + '</div>';
  const sameKit = (a,b) => !!a && !!b && a.nome === b.nome && a.slots.every((s,i) => b.slots[i] && s.id === b.slots[i].id && s.el === b.slots[i].el && s.t === b.slots[i].t && (s.m || '') === (b.slots[i].m || ''));
  function cityArt(id) {
    const shapes = {
      dite:'M0 180h220M10 180V89l20-12 20 12v91M57 180V57l27-17 27 17v123M119 180V106l20-13 20 13v74M163 180V34l24-18 24 18v146M72 47V21l12-8 12 8v26M177 24V9M20 105v10m20-20v10m35-31v14m20-27v14m-20 27v14m20-27v14m80-32v14m18-25v14m-18 24v14m18-25v14',
      cocito:'M0 180h220M8 180l18-86 21 86M40 180V73l27-21 27 21v107M100 180l22-121 21 121M147 180V45l28-24 28 24v135M51 63V24l16-13 16 13v39M157 35V12M3 142h214M6 153h210M60 89v17m17-29v17m82-33v16m30-28v16m-30 25v16m30-28v16',
      malebolge:'M0 180h220M5 180V112l20-13 20 13v68M53 180V81l25-16 26 16v99M117 180V129l23-14 23 14v51M174 180V58l23-16 22 16v122M66 71V33l12-8 13 8v38M185 49V19M4 141l62-20 65 27 83-32M4 151l62-20 65 27 83-32M15 123v11m20-20v11m30-36v13m27-26v13m93-30v13m17-25v13m-17 24v13m17-25v13'
    };
    return '<svg class="city-art" viewBox="0 0 220 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path d="' + shapes[id] + '"/></svg>';
  }
  function renderCities() {
    const descriptions = { dite:'Ferro, canali di lava e bagliori sulle mura.', cocito:'Torri gelate e un lago da attraversare.', malebolge:'Ponti sospesi sopra i fossi e la melma.' };
    const colors = { dite:'#e8ac6c', cocito:'#a7c7e7', malebolge:'#a9c990' };
    html('cities', Object.values(City.THEMES).map((t) => '<button type="button" class="city-card' + (t.id === model.theme ? ' on' : '') + '" data-city="' + t.id + '" aria-pressed="' + (t.id === model.theme) + '" style="--city:' + colors[t.id] + '">' + cityArt(t.id) + '<span class="eyebrow">' + (t.id === model.theme ? 'Destinazione attuale' : 'Nuova destinazione') + '</span><strong>' + esc(t.nome) + '</strong><span class="city-desc">' + descriptions[t.id] + '</span><span class="city-status">' + (t.id === model.theme ? '✓ Selezionata' : 'Esplora ' + esc(t.nome) + ' →') + '</span></button>').join(''));
  }
  function renderPreview() {
    const choice = choices.find((c) => c.key === selected) || choices[0]; if (!choice) return;
    const r = choice.recipe, active = sameKit(r,model.recipe), budget = B.budgetFor(model.level);
    html('loadoutPreview','<span class="eyebrow">' + (active ? 'Kit equipaggiato' : choice.adapted ? 'Anteprima · gradi adattati al tuo livello' : 'Anteprima · ' + esc(choice.group)) + '</span><h3>' + esc(r.nome || 'Senza nome') + '</h3><p>' + esc(r.desc || 'Cinque poteri, pronti per la città. Puoi modificarli in officina.') + '</p>' + kitIcons(r) + '<h4 class="preview-details-title">Le meccaniche del kit</h4>' + r.slots.map((s,i) => { const a = B.ARCH[s.id]; return '<div class="preview-power"><div class="ic" style="--c:' + B.ELEM[s.el].css + '">' + G.svg(a.ic) + '</div><div><b>' + esc(a.nome) + '</b><small>' + esc(a.desc) + '</small></div></div>'; }).join(''));
    text('loadoutBudget',B.cost(r) + ' / ' + budget + ' punti' + (B.cost(r) > budget ? ' · servono altri ' + (B.cost(r) - budget) + ' punti. Modifica il kit in officina.' : ' · livello ' + model.level)); $('loadoutBudget').classList.toggle('over',B.cost(r) > budget);
    text('equipKit',active ? 'Equipaggiato' : 'Equipaggia'); $('equipKit').disabled = active || B.cost(r) > budget;
    for (const n of $('loadoutCards').querySelectorAll('[data-loadout]')) { const on = n.dataset.loadout === selected; n.classList.toggle('selected',on); n.setAttribute('aria-pressed',String(on)); }
  }
  function renderLoadout() {
    const budget = B.budgetFor(model.level), prepare = (r) => B.fit(clone(r),budget);
    choices = [{ key:'active',group:'Il tuo kit',recipe:clone(model.recipe) }];
    if (G.Onboarding && G.Onboarding.introRecipe) { const intro = prepare(G.Onboarding.introRecipe()); if (!sameKit(intro,model.recipe)) choices.push({ key:'intro',group:'Per iniziare',recipe:intro }); }
    B.PRESETS.forEach((r,i) => { const recipe = prepare(r); choices.push({ key:'preset:' + i,group:'Kit pronti',recipe,adapted:!sameKit(r,recipe) }); });
    (G.store.saved || []).forEach((r) => choices.push({ key:'saved:' + r.uid,group:'Salvati da te',recipe:clone(r) }));
    if (!choices.some((c) => c.key === selected)) selected = 'active';
    let group = '';
    html('loadoutCards', choices.map((c) => { let out = ''; if (c.group !== group) { group = c.group; out = '<h3 class="kit-group">' + esc(group) + '</h3>'; } const r = c.recipe, a = B.ARCH[r.slots[0].id], active = sameKit(r,model.recipe); return out + '<button type="button" class="kit-card' + (c.key === selected ? ' selected' : '') + '" data-loadout="' + c.key + '" aria-pressed="' + (c.key === selected) + '" style="--c:' + B.ELEM[r.slots[0].el].css + '">' + G.svg(a.ic) + '<span><b>' + esc(r.nome || 'Senza nome') + '</b><small>' + esc(r.desc || 'Il kit che hai composto.') + '</small></span><span class="kit-marker">' + (active ? 'In uso' : B.cost(r) + ' p') + '</span></button>'; }).join(''));
    renderPreview();
  }
  function renderJournal() {
    const journal = model.journal || { missions:0,bossWins:0,recent:[],empty:true };
    text('journalMissions',journal.missions || 0); text('journalBosses',journal.bossWins || 0);
    text('journalCount',(journal.recent || []).length ? 'Le ultime ' + journal.recent.length + ' imprese' : 'La prima pagina è tua.');
    html('journalEntries',(journal.recent || []).length ? journal.recent.map((e) => {
      const theme = City.THEMES[e.city], date = e.at == null ? null : new Date(e.at), when = date && Number.isFinite(date.getTime()) ? date.toLocaleDateString('it-IT',{ day:'numeric',month:'short',year:'numeric' }) : '';
      return '<li class="journal-entry"><span class="journal-icon">' + G.svg(e.kind === 'boss' ? 'crown' : 'mark') + '</span><div><b>' + esc(e.title) + '</b><small>' + esc((e.kind === 'boss' ? 'Custode sconfitto' : 'Missione completata') + (theme ? ' · ' + theme.nome : '') + (when ? ' · ' + when : '')) + '</small></div>' + (e.fame == null ? '' : '<span class="journal-reward">+' + e.fame + '<small>Fama</small></span>') + '</li>';
    }).join('') : '<li class="journal-empty"><span class="journal-empty-mark">' + G.svg('mark') + '</span><h3>Ogni strada lascia un segno.</h3><p>Le missioni completate e i custodi sconfitti compariranno qui. Cerca un abitante con il segno ! per cominciare.</p></li>');
  }
  function init(callbacks) {
    equip = callbacks && callbacks.onEquip;
    if (initialized) return; initialized = true;
    $('loadoutCards').addEventListener('click',(e) => { const n = e.target.closest('[data-loadout]'); if (!n) return; selected = n.dataset.loadout; renderPreview(); });
    $('equipKit').addEventListener('click',() => { const c = choices.find((x) => x.key === selected); if (c && !sameKit(c.recipe,model.recipe) && B.cost(c.recipe) <= B.budgetFor(model.level) && equip) equip(clone(c.recipe)); });
    $('settings').addEventListener('click',(e) => { const n = e.target.closest('[data-settings-tab]'); if (!n) return; for (const tab of $('settings').querySelectorAll('[data-settings-tab]')) { const on = tab === n; tab.classList.toggle('on',on); tab.setAttribute('aria-selected',String(on)); $(tab.getAttribute('aria-controls')).classList.toggle('hidden',!on); } });
  }
  function render(next) {
    model = { level:B.levelFor(next.fame || 0), ...next }; if (!model.recipe) model.recipe = G.store.recipe;
    const r = model.recipe, theme = City.THEMES[model.theme] || City.THEMES.dite, prefs = model.prefs || {}, status = model.saveStatus || {};
    html('hero','<div class="hero-title"><h3 title="' + esc(r.nome || 'Senza nome') + '">' + esc(r.nome || 'Senza nome') + '</h3><span class="active-tag">In uso</span></div><p class="hero-meta">Fama ' + (model.fame || 0) + ' · livello ' + model.level + ' · ' + B.cost(r) + '/' + B.budgetFor(model.level) + ' punti</p>' + (model.journal ? '<p class="hero-records">' + model.journal.missions + ' missioni · ' + model.journal.bossWins + ' custodi nel registro</p>' : '') + kitIcons(r));
    text('lobbyCityName',model.cityName || theme.nome); text('lobbyActivity',model.citySummary || (model.session ? 'La tua esplorazione è in pausa. Riparti da dove sei.' : 'Missioni, abitanti e tre custodi da affrontare.'));
    text('lobbyProgress','Fama ' + (model.fame || 0) + ', livello ' + model.level);
    text('play',model.session ? 'Riprendi' : 'Entra a ' + theme.nome); $('play').setAttribute('aria-label','Entra nel gioco');
    text('saveStatus',status.message || 'Progressi sul dispositivo'); text('settingsSaveStatus',status.message || 'Le preferenze si applicano subito.'); $('saveStatus').dataset.state = status.state || 'ready';
    const muted = prefs.muted == null ? !!model.muted : !!prefs.muted; text('mute',muted ? 'Audio no' : 'Audio sì'); text('menuMute',muted ? 'Audio no' : 'Audio sì');
    for (const input of $('settings').querySelectorAll('[data-pref]')) { const key = input.dataset.pref; if (prefs[key] == null) continue; if (input.type === 'checkbox') input.checked = !!prefs[key]; else input.value = prefs[key]; }
    if (prefs.sens != null) { $('sens').value = Math.round(prefs.sens * 100); text('sensV',Math.round(prefs.sens * 100) + '%'); }
    text('volumeV',Math.round((prefs.volume == null ? 1 : prefs.volume) * 100) + '%');
    const haptic = $('settings').querySelector('[data-pref=haptics]'); haptic.disabled = !model.nativeHaptics;
    text('hapticsNote',model.nativeHaptics ? 'Una risposta breve alle azioni importanti.' : 'Disponibile nell’app su dispositivi compatibili.');
    text('guideMoveCopy',prefs.leftHanded ? 'Trascina nella zona destra per camminare. Trascina nella zona sinistra libera per guardarti intorno.' : 'Trascina nella zona sinistra per camminare. Trascina nella zona destra libera per guardarti intorno.');
    renderCities(); renderLoadout(); renderJournal();
  }
  return { init,render };
})();

G.initForge = function () {
  const B = Bricks, $ = (id) => document.getElementById(id), EL = B.ELEM, esc = G.esc;
  const PAGE_SIZE = 36, slotNames = ['Primario','Movimento','Abilità 1','Abilità 2','Suprema'];
  let draft = null, sel = 0, budget = 12, onUse = null, onClose = null, find = '', mode = 'all', family = 'all', visibleCount = PAGE_SIZE, pendingSave = false;
  const familyNames = new Map(B.FAMILIES.map((f) => [f.id,f.nome]));
  const copy = (r) => ({ nome:r.nome || '', desc:r.desc || '', slots:r.slots.map((b) => { const o = { id:b.id,el:b.el,t:b.t }; if (b.m) o.m = b.m; return o; }) });
  const msg = (t,error) => { $('fMsg').textContent = t || ''; $('fMsg').classList.toggle('error',!!error); };
  const saveMessage = (result) => result && result.ok ? 'Kit salvato sul dispositivo.' : result && result.pending ? 'Salvataggio…' : 'Kit disponibile solo in questa sessione.';
  function renderBudget() {
    const cost = B.cost(draft), over = cost > budget;
    $('fBudTxt').textContent = cost + ' / ' + budget; $('fBudFill').style.width = Math.min(100,100 * cost / budget) + '%'; $('fBud').classList.toggle('over',over);
    $('fUse').setAttribute('aria-describedby','fMsg fBudTxt');
    if (over) msg('Troppi punti: ' + (cost - budget) + ' oltre il limite. Abbassa un grado.',true);
    else if ($('fMsg').classList.contains('error')) msg('La bozza è nel budget. Equipaggia per usarla.');
  }
  function renderSlots() {
    $('fSlots').innerHTML = draft.slots.map((b,i) => { const a = B.ARCH[b.id]; return '<button type="button" class="slot' + (i === sel ? ' sel' : '') + '" data-slot="' + i + '" aria-pressed="' + (i === sel) + '" aria-label="' + slotNames[i] + ': ' + esc(a.nome) + ', grado ' + b.t + '" style="--c:' + EL[b.el].css + '"><span class="ic">' + G.svg(a.ic) + '</span><span><small>' + slotNames[i] + '</small><b>' + esc(a.nome) + '</b></span><span class="co">' + (a.cost[b.t - 1] + (b.m ? 1 : 0)) + '</span></button>'; }).join('');
  }
  function renderRecipes() {
    $('fPresets').innerHTML = B.PRESETS.map((p,i) => '<button class="chip" type="button" data-preset="' + i + '">' + esc(p.nome) + '</button>').join('');
    const saved = G.store.saved || [];
    $('fSavedT').style.display = saved.length ? '' : 'none';
    $('fSaved').innerHTML = saved.map((p,i) => '<div class="saved"><button class="chip" type="button" data-saved="' + i + '">' + esc(p.nome || 'Senza nome') + '</button><button class="chip x" type="button" data-del="' + i + '" aria-label="Elimina ' + esc(p.nome || 'kit senza nome') + '">×</button></div>').join('');
  }
  function renderDetail() {
    const b = draft.slots[sel], a = B.ARCH[b.id], scroll = $('fWorkbench').scrollTop;
    let h = '<div class="detail-heading"><span class="ic" style="--c:' + EL[b.el].css + '">' + G.svg(a.ic) + '</span><div><small>' + slotNames[sel] + ' · nella bozza</small><h3>' + esc(a.nome) + '</h3></div></div><p class="detail-desc">' + esc(a.desc) + '</p>';
    if (a.controls.length) h += '<p class="detail-controls">' + esc(a.controls.join(' ')) + '</p>';
    h += '<h3 class="sec">Grado · costo in punti</h3><div class="pips" role="group" aria-label="Grado del potere">' + [1,2,3].map((t) => '<button class="pip' + (b.t === t ? ' on' : '') + '" type="button" data-tier="' + t + '" aria-pressed="' + (b.t === t) + '">' + t + ' · ' + a.cost[t - 1] + ' p</button>').join('') + '</div>';
    h += '<h3 class="sec">Elemento</h3><div class="els" role="group" aria-label="Elemento del potere">' + Object.keys(EL).map((k) => '<button type="button" class="eld' + (b.el === k ? ' on' : '') + '" data-el="' + k + '" aria-pressed="' + (b.el === k) + '" style="--c:' + EL[k].css + '">' + esc(EL[k].nome) + '</button>').join('') + '</div>';
    h += '<div id="fElTxt" style="--c:' + EL[b.el].css + '"><b>' + esc(EL[b.el].nome) + '</b> · ' + esc(EL[b.el].fx) + '</div><button class="chip" type="button" data-allel="1" style="margin-top:7px">Stesso elemento ai cinque</button>';
    h += '<h3 class="sec">Innesto · 1 punto aggiuntivo</h3><div class="modifier-list">' + '<button class="chip' + (!b.m ? ' mon' : '') + '" type="button" data-mod="" aria-pressed="' + !b.m + '">Nessuno</button>' + B.MODS.map((m) => '<button class="chip' + (b.m === m ? ' mon' : '') + '" type="button" data-mod="' + m + '" aria-pressed="' + (b.m === m) + '">' + esc(B.MOD[m].nome) + '</button>').join('') + '</div><div id="fModTxt">' + (b.m ? '<b>' + esc(B.MOD[b.m].nome) + '</b> · ' + esc(B.MOD[b.m].desc) : 'Nessun innesto su questo potere.') + '</div>';
    $('fDetail').innerHTML = h; $('fWorkbench').scrollTop = scroll;
  }
  function ensureCatalogue() {
    if ($('fFind')) return;
    $('fPick').innerHTML = '<h3 class="catalogue-heading" id="fCatalogueHeading"></h3><input id="fFind" type="search" enterkeyhint="done" aria-label="Cerca poteri per nome, effetto o famiglia" placeholder="Cerca un potere o un effetto" autocomplete="off" autocapitalize="off" spellcheck="false"><div id="fFilters" class="forge-filters"></div><div id="fResults" class="forge-results" role="status" aria-live="polite"></div><div id="fList"></div>';
    $('fFind').value = find;
    $('fFind').addEventListener('input',() => { find = $('fFind').value; visibleCount = PAGE_SIZE; renderList(); });
  }
  function renderFilters(slot) {
    const counts = new Map(), inMode = B.catalogueQuery({ slot,query:find,mode });
    for (const a of inMode) for (const id of a.families) counts.set(id,(counts.get(id) || 0) + 1);
    const all = B.catalogueQuery({ slot,query:find,family }), fresh = all.filter((a) => a.isNew).length;
    let h = '<div id="fMode" class="forge-filter-tabs" role="group" aria-label="Edizione dei poteri">' + [['all','Tutti',all.length],['new','Nuovi',fresh]].map(([id,label,count]) => '<button class="chip' + (mode === id ? ' mon' : '') + '" type="button" data-mode="' + id + '" aria-pressed="' + (mode === id) + '">' + label + '<b>' + count + '</b></button>').join('') + '</div>';
    h += '<label class="forge-family" for="fFamily"><span class="sr-only">Famiglia</span><select id="fFamily"><option value="all">Tutte le famiglie (' + inMode.length + ')</option>';
    for (const f of B.FAMILIES) if (counts.has(f.id) || family === f.id) h += '<option value="' + f.id + '"' + (family === f.id ? ' selected' : '') + '>' + esc(f.nome) + ' (' + (counts.get(f.id) || 0) + ')</option>';
    $('fFilters').innerHTML = h + '</select></label>';
  }
  function renderList() {
    ensureCatalogue();
    const b = draft.slots[sel], a = B.ARCH[b.id], used = new Set(draft.slots.filter((x,i) => i !== sel).map((x) => x.id));
    $('fCatalogueHeading').textContent = slotNames[sel] + ' · scegli il potere';
    renderFilters(a.slot);
    const results = B.catalogueQuery({ slot:a.slot,query:find,mode,family });
    const selected = results.findIndex((x) => x.id === b.id); if (selected > 0) results.unshift(results.splice(selected,1)[0]);
    const shown = results.slice(0,visibleCount);
    const row = (x) => '<button type="button" class="arch' + (x.id === b.id ? ' on' : '') + (used.has(x.id) ? ' used' : '') + '" data-arch="' + esc(x.id) + '" aria-pressed="' + (x.id === b.id) + '"' + (used.has(x.id) ? ' disabled title="Già equipaggiato nell’altro spazio"' : '') + '><div class="ic">' + G.svg(x.ic) + '</div><div><b>' + esc(x.nome) + (x.isNew ? ' <em class="arch-new">NUOVO</em>' : '') + '</b><span>' + esc(x.desc) + '</span>' + (x.controls.length ? '<span class="arch-controls">Uso: ' + esc(x.controls.join(' ')) + '</span>' : '') + '<small class="arch-tags">' + x.families.slice(0,2).map((id) => esc(familyNames.get(id))).join(' · ') + (x.families.length > 2 ? ' +' + (x.families.length - 2) : '') + '</small></div><div class="co">' + x.cost[0] + '–' + x.cost[2] + ' p</div></button>';
    let h = shown.map(row).join('');
    if (!results.length) h = '<p class="forge-empty">Nessun potere con questi filtri. Cambia famiglia, ricerca o edizione.</p><button type="button" class="chip forge-more" data-reset-filters="1">Mostra tutti i poteri di questo tipo</button>';
    else if (shown.length < results.length) h += '<button id="fMore" type="button" class="chip forge-more" data-more="1">Mostra altri ' + Math.min(PAGE_SIZE,results.length - shown.length) + ' · ' + (results.length - shown.length) + ' ancora da vedere</button>';
    $('fResults').textContent = shown.length + ' di ' + results.length + ' risultati'; $('fList').innerHTML = h;
  }
  function render() { renderBudget(); renderSlots(); renderDetail(); renderRecipes(); renderList(); }
  function chooseRecipe(recipe) { draft = copy(recipe); visibleCount = PAGE_SIZE; sel = 0; $('fName').value = draft.nome; $('fDesc').value = draft.desc || ''; }
  const near = (t,attr) => t && t.closest ? t.closest('[' + attr + ']') : null;
  $('forge').addEventListener('click',(e) => {
    const t = e.target; let n;
    if ((n = near(t,'data-slot'))) { sel = +n.dataset.slot; visibleCount = PAGE_SIZE; msg(''); render(); $('fPick').scrollTop = 0; $('fWorkbench').scrollTop = 0; }
    else if ((n = near(t,'data-mode'))) { mode = n.dataset.mode === 'new' ? 'new' : 'all'; visibleCount = PAGE_SIZE; renderList(); }
    else if ((n = near(t,'data-more'))) { const scroll = $('fPick').scrollTop; visibleCount += PAGE_SIZE; renderList(); $('fPick').scrollTop = scroll; }
    else if ((n = near(t,'data-reset-filters'))) { find = ''; mode = family = 'all'; visibleCount = PAGE_SIZE; $('fFind').value = ''; renderList(); }
    else if ((n = near(t,'data-tier'))) { draft.slots[sel].t = +n.dataset.tier; render(); }
    else if ((n = near(t,'data-mod'))) { if (n.dataset.mod) draft.slots[sel].m = n.dataset.mod; else delete draft.slots[sel].m; render(); }
    else if ((n = near(t,'data-allel'))) { const el = draft.slots[sel].el; for (const b of draft.slots) b.el = el; render(); }
    else if ((n = near(t,'data-el'))) { draft.slots[sel].el = n.dataset.el; render(); }
    else if ((n = near(t,'data-arch'))) { if (draft.slots.some((b,i) => i !== sel && b.id === n.dataset.arch)) return msg('Questo potere è già nell’altro spazio.',true); const scroll = $('fPick').scrollTop; draft.slots[sel].id = n.dataset.arch; msg('Potere aggiunto alla bozza. Equipaggia per usarlo.'); render(); $('fPick').scrollTop = scroll; $('fWorkbench').scrollTop = 0; }
    else if ((n = near(t,'data-preset'))) { const p = B.PRESETS[+n.dataset.preset]; chooseRecipe(p); B.upgrade(draft,budget,Math.random); msg('Kit pronto adattato ai tuoi punti. ' + (p.desc || '')); render(); }
    else if ((n = near(t,'data-saved'))) { chooseRecipe(G.store.saved[+n.dataset.saved]); msg('Kit caricato nella bozza.'); render(); }
    else if ((n = near(t,'data-del'))) { G.store.saved.splice(+n.dataset.del,1); const result = G.save(); msg(result && result.ok ? 'Kit rimosso dai salvati.' : result && result.pending ? 'Salvataggio…' : 'Rimozione valida solo in questa sessione.'); renderRecipes(); }
  });
  $('forge').addEventListener('change',(e) => { if (e.target.id === 'fFamily') { family = e.target.value; visibleCount = PAGE_SIZE; renderList(); } });
  $('fName').addEventListener('input',() => { draft.nome = $('fName').value; });
  function keyboardViewport() {
    const viewport = window.visualViewport, focused = document.activeElement && document.activeElement.matches('#forge input[type=text],#forge input[type=search],#forge textarea');
    const open = !!(focused && viewport && window.innerHeight - viewport.height > 80);
    document.body.classList.toggle('keyboard-open',open);
    if (open) { document.documentElement.style.setProperty('--forge-height',viewport.height + 'px'); document.documentElement.style.setProperty('--forge-top',viewport.offsetTop + 'px'); }
  }
  if (window.visualViewport) { window.visualViewport.addEventListener('resize',keyboardViewport); window.visualViewport.addEventListener('scroll',keyboardViewport); }
  $('forge').addEventListener('focusin',(e) => { if (e.target.matches('input[type=text],input[type=search],textarea')) $('fKeyboardDone').classList.remove('hidden'); keyboardViewport(); });
  $('forge').addEventListener('focusout',() => { queueMicrotask(() => { if (!document.activeElement || !document.activeElement.matches('#forge input[type=text],#forge input[type=search],#forge textarea')) $('fKeyboardDone').classList.add('hidden'); keyboardViewport(); }); });
  $('forge').addEventListener('keydown',(e) => { if (e.key === 'Enter' && e.target.matches('input[type=text],input[type=search]')) { e.preventDefault(); e.target.blur(); } });
  $('fKeyboardDone').addEventListener('click',() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); $('fKeyboardDone').classList.add('hidden'); });
  $('fDesc').addEventListener('input',() => { if (draft) draft.desc = $('fDesc').value; });
  $('fCompose').addEventListener('click',() => {
    const txt = $('fDesc').value.trim(); if (!txt) return msg('Scrivi prima cosa sa fare il tuo kit.');
    const r = B.fromText(txt,budget), nome = draft.nome; draft = r.recipe; draft.nome = nome; draft.desc = txt; sel = 0; visibleCount = PAGE_SIZE;
    msg(r.found.length ? 'Riconosciuti: ' + (r.elem ? EL[r.elem].nome + ', ' : '') + r.found.join(', ') : r.tipo ? 'Riconosciuto il tipo di personaggio' + (r.elem ? ' (' + EL[r.elem].nome + ')' : '') : 'Nessun potere preciso riconosciuto: ecco un kit di base.'); render();
  });
  $('fRandom').addEventListener('click',() => { const nome = draft.nome; draft = B.randomRecipe(Math.random,budget); draft.nome = nome; sel = 0; visibleCount = PAGE_SIZE; $('fDesc').value = draft.desc || ''; msg('Una nuova combinazione nella bozza.'); render(); });
  $('fSave').addEventListener('click',() => { if (B.cost(draft) > budget) return msg('Troppi punti: abbassa un grado.',true); const list = G.store.saved = G.store.saved || [], c = copy(draft); c.nome = c.nome.trim() || 'Senza nome'; const i = list.findIndex((p) => p.nome === c.nome); if (i >= 0) { c.uid = list[i].uid; list[i] = c; } else { list.unshift(c); if (list.length > 12) list.pop(); } pendingSave = true; const result = G.save(); pendingSave = !!(result && result.pending); msg(saveMessage(result)); renderRecipes(); });
  $('fUse').addEventListener('click',() => { if (B.cost(draft) > budget) return msg('Troppi punti: abbassa un grado o cambia potere.',true); const c = copy(draft); c.nome = c.nome.trim() || 'Senza nome'; $('forge').classList.add('hidden'); if (onUse) onUse(c); });
  $('fCancel').addEventListener('click',() => { $('forge').classList.add('hidden'); if (onClose) onClose(); });
  if (G.storage && G.storage.subscribe) G.storage.subscribe((status) => { if (!pendingSave || !G.forge || !G.forge.isOpen()) return; if (status.state === 'saved') { pendingSave = false; msg('Kit salvato sul dispositivo.'); } else if (status.state === 'temporary') { pendingSave = false; msg('Kit disponibile solo in questa sessione.'); } });
  G.forge = {
    open(recipe,level,use,close) { chooseRecipe(recipe); budget = B.budgetFor(level); onUse = use; onClose = close; msg('Modifica la bozza. Il kit attivo resta al sicuro fino a Equipaggia.'); render(); $('forge').classList.remove('hidden'); $('fPick').scrollTop = 0; $('fWorkbench').scrollTop = 0; },
    isOpen:() => !$('forge').classList.contains('hidden')
  };
};
