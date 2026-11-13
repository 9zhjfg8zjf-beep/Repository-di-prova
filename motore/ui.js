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
G.store = (() => { let d = {}; try { d = JSON.parse(localStorage.getItem('dite2') || '{}') || {}; } catch (e) { d = {}; } return d; })();
G.save = () => { try { localStorage.setItem('dite2', JSON.stringify(G.store)); } catch (e) { /* senza memoria locale si gioca lo stesso */ } };
G.esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

G.initForge = function () {
  const B = Bricks, $ = (id) => document.getElementById(id), EL = B.ELEM, esc = G.esc;
  const PAGE_SIZE = 36;
  let draft = null, sel = 0, budget = 12, onUse = null, onClose = null, find = '', mode = 'all', family = 'all', visibleCount = PAGE_SIZE;
  const familyNames = new Map(B.FAMILIES.map((f) => [f.id, f.nome]));
  const copy = (r) => ({ nome: r.nome || '', desc: r.desc || '', slots: r.slots.map((b) => { const o = { id: b.id, el: b.el, t: b.t }; if (b.m) o.m = b.m; return o; }) });
  const msg = (t) => { $('fMsg').textContent = t || ''; };
  function render() {
    const cost = B.cost(draft), over = cost > budget;
    $('fBudTxt').textContent = cost + ' / ' + budget; $('fBudFill').style.width = Math.min(100, (100 * cost) / budget) + '%'; $('fBud').classList.toggle('over', over);
    $('fSlots').innerHTML = draft.slots.map((b, i) => { const a = B.ARCH[b.id]; return '<div class="slot' + (i === sel ? ' sel' : '') + '" data-slot="' + i + '" style="--c:' + EL[b.el].css + '"><div class="ic">' + G.svg(a.ic) + '</div><div><small>' + B.SLOT_NAME[a.slot] + (i === 3 ? ' 2' : i === 2 ? ' 1' : '') + ' · ' + EL[b.el].nome + ' · grado ' + b.t + '</small><b>' + a.nome + (b.m ? ' <span style="color:var(--gd);font-weight:500">+ ' + B.MOD[b.m].nome + '</span>' : '') + '</b></div><div class="co">' + (a.cost[b.t - 1] + (b.m ? 1 : 0)) + '</div></div>'; }).join('');
    $('fPresets').innerHTML = B.PRESETS.map((p, i) => '<button class="chip" type="button" data-preset="' + i + '" style="--c:' + EL[p.slots[0].el].css + '">' + esc(p.nome) + '</button>').join('');
    const saved = G.store.saved || [];
    $('fSavedT').style.display = saved.length ? '' : 'none';
    $('fSaved').innerHTML = saved.map((p, i) => '<div class="saved"><button class="chip" type="button" data-saved="' + i + '" style="--c:' + EL[p.slots[0].el].css + '">' + esc(p.nome || 'Senza nome') + '</button><button class="chip x" type="button" data-del="' + i + '">×</button></div>').join('');
    const b = draft.slots[sel], a = B.ARCH[b.id];
    let h = '<div class="sec" style="margin-top:0">' + B.SLOT_NAME[a.slot] + ': grado</div><div class="pips">' + [1, 2, 3].map((t) => '<button class="pip' + (b.t === t ? ' on' : '') + '" type="button" data-tier="' + t + '">' + t + ' · ' + a.cost[t - 1] + 'p</button>').join('') + '</div>';
    h += '<div class="sec">Elemento</div><div class="els">' + Object.keys(EL).map((k) => '<div class="eld' + (b.el === k ? ' on' : '') + '" data-el="' + k + '" style="--c:' + EL[k].css + '"></div>').join('') + '</div>';
    h += '<div id="fElTxt" style="--c:' + EL[b.el].css + '"><b>' + EL[b.el].nome.toUpperCase() + '</b> · ' + EL[b.el].fx + ' <button class="chip" type="button" data-allel="1" style="margin-left:6px">a tutti</button></div>';
    h += '<div class="sec">Innesto (1 punto): cambia come si comporta il potere</div><div class="row">' + '<button class="chip' + (!b.m ? ' mon' : '') + '" type="button" data-mod="">Nessuno</button>' + B.MODS.map((m) => '<button class="chip' + (b.m === m ? ' mon' : '') + '" type="button" data-mod="' + m + '">' + B.MOD[m].nome + '</button>').join('') + '</div><div id="fElTxt" style="margin-top:5px">' + (b.m ? '<b style="color:var(--gd)">' + B.MOD[b.m].nome.toUpperCase() + '</b> · ' + B.MOD[b.m].desc : 'Nessun innesto su questo potere.') + '</div>';
    const tot = B.LIST.filter((x) => x.slot === a.slot).length;
    h += '<div class="sec">Meccaniche di questo tipo: ' + tot + '</div><input id="fFind" type="search" aria-label="Cerca poteri per nome, effetto o famiglia" placeholder="Cerca nome, effetto o famiglia" autocomplete="off" autocapitalize="off" spellcheck="false" value="' + esc(find) + '"><div id="fFilters" class="forge-filters"></div><div id="fResults" class="forge-results" role="status" aria-live="polite"></div><div id="fList"></div>';
    $('fPick').innerHTML = h; renderList(); $('fFind').addEventListener('input', () => { find = $('fFind').value; visibleCount = PAGE_SIZE; renderList(); });
  }
  function renderFilters(slot) {
    const counts = new Map(), inMode = B.catalogueQuery({ slot, query: find, mode });
    for (const a of inMode) for (const id of a.families) counts.set(id, (counts.get(id) || 0) + 1);
    const all = B.catalogueQuery({ slot, query: find, family }), fresh = all.filter((a) => a.isNew).length;
    let h = '<div id="fMode" class="forge-filter-tabs" role="group" aria-label="Edizione dei poteri">' + [['all', 'Tutti', all.length], ['new', 'Nuovi', fresh]].map(([id, label, count]) => '<button class="chip' + (mode === id ? ' mon' : '') + '" type="button" data-mode="' + id + '" aria-pressed="' + (mode === id) + '">' + label + ' (' + count + ')</button>').join('') + '</div>';
    h += '<label class="forge-family" for="fFamily">Famiglia<select id="fFamily"><option value="all">Tutte le famiglie (' + inMode.length + ')</option>';
    for (const f of B.FAMILIES) if (counts.has(f.id) || family === f.id) h += '<option value="' + f.id + '"' + (family === f.id ? ' selected' : '') + '>' + esc(f.nome) + ' (' + (counts.get(f.id) || 0) + ')</option>';
    $('fFilters').innerHTML = h + '</select></label>';
  }
  function renderList() {
    const b = draft.slots[sel], a = B.ARCH[b.id], used = new Set(draft.slots.filter((x, i) => i !== sel).map((x) => x.id));
    renderFilters(a.slot);
    const results = B.catalogueQuery({ slot: a.slot, query: find, mode, family });
    const selected = results.findIndex((x) => x.id === b.id); if (selected > 0) results.unshift(results.splice(selected, 1)[0]);
    const shown = results.slice(0, visibleCount);
    const row = (x) => '<button type="button" class="arch' + (x.id === b.id ? ' on' : '') + (used.has(x.id) ? ' used' : '') + '" data-arch="' + esc(x.id) + '" aria-pressed="' + (x.id === b.id) + '"' + (used.has(x.id) ? ' disabled title="Gia equipaggiato nell’altro spazio"' : '') + '><div class="ic">' + G.svg(x.ic) + '</div><div><b>' + esc(x.nome) + (x.isNew ? ' <em class="arch-new">NUOVO</em>' : '') + '</b><span>' + esc(x.desc) + '</span>' + (x.controls.length ? '<span class="arch-controls">Uso: ' + esc(x.controls.join(' ')) + '</span>' : '') + '<small class="arch-tags">' + x.families.slice(0, 2).map((id) => esc(familyNames.get(id))).join(' · ') + (x.families.length > 2 ? ' +' + (x.families.length - 2) : '') + '</small></div><div class="co">' + x.cost[0] + '-' + x.cost[2] + 'p</div></button>';
    let h = shown.map(row).join('');
    if (!results.length) h = '<p class="forge-empty">Nessun potere con questi filtri. Cambia famiglia, ricerca o edizione.</p><button type="button" class="chip forge-more" data-reset-filters="1">Mostra tutti i poteri di questo tipo</button>';
    else if (shown.length < results.length) h += '<button id="fMore" type="button" class="chip forge-more" data-more="1">Mostra altri ' + Math.min(PAGE_SIZE, results.length - shown.length) + ' · ' + (results.length - shown.length) + ' ancora da vedere</button>';
    $('fResults').textContent = shown.length + ' di ' + results.length + ' risultati';
    $('fList').innerHTML = h;
  }
  const near = (t, attr) => (t && t.closest ? t.closest('[' + attr + ']') : null);
  $('forge').addEventListener('click', (e) => {
    const t = e.target; let n;
    if ((n = near(t, 'data-slot'))) { sel = +n.dataset.slot; visibleCount = PAGE_SIZE; msg(''); render(); $('fPick').scrollTop = 0; }
    else if ((n = near(t, 'data-mode'))) { mode = n.dataset.mode === 'new' ? 'new' : 'all'; visibleCount = PAGE_SIZE; renderList(); }
    else if ((n = near(t, 'data-more'))) { const scroll = $('fPick').scrollTop; visibleCount += PAGE_SIZE; renderList(); $('fPick').scrollTop = scroll; }
    else if ((n = near(t, 'data-reset-filters'))) { find = ''; mode = family = 'all'; visibleCount = PAGE_SIZE; $('fFind').value = ''; renderList(); }
    else if ((n = near(t, 'data-tier'))) { draft.slots[sel].t = +n.dataset.tier; render(); }
    else if ((n = near(t, 'data-mod'))) { if (n.dataset.mod) draft.slots[sel].m = n.dataset.mod; else delete draft.slots[sel].m; render(); }
    else if ((n = near(t, 'data-allel'))) { const el = draft.slots[sel].el; for (const b of draft.slots) b.el = el; render(); }
    else if ((n = near(t, 'data-el'))) { draft.slots[sel].el = n.dataset.el; render(); }
    else if ((n = near(t, 'data-arch'))) { if (draft.slots.some((b, i) => i !== sel && b.id === n.dataset.arch)) return msg('Quel mattoncino e gia nell\'altro spazio'); draft.slots[sel].id = n.dataset.arch; render(); }
    else if ((n = near(t, 'data-preset'))) { const p = B.PRESETS[+n.dataset.preset]; draft = copy(p); visibleCount = PAGE_SIZE; $('fName').value = draft.nome; B.upgrade(draft, budget, Math.random); msg(p.desc); render(); }
    else if ((n = near(t, 'data-saved'))) { draft = copy(G.store.saved[+n.dataset.saved]); B.fit(draft, budget); visibleCount = PAGE_SIZE; $('fName').value = draft.nome; msg(''); render(); }
    else if ((n = near(t, 'data-del'))) { G.store.saved.splice(+n.dataset.del, 1); G.save(); render(); }
  });
  $('forge').addEventListener('change', (e) => { if (e.target.id === 'fFamily') { family = e.target.value; visibleCount = PAGE_SIZE; renderList(); } });
  $('fName').addEventListener('input', () => { draft.nome = $('fName').value; });
  $('fCompose').addEventListener('click', () => {
    const txt = $('fDesc').value.trim(); if (!txt) return msg('Scrivi prima cosa sa fare');
    const r = B.fromText(txt, budget), nome = draft.nome; draft = r.recipe; draft.nome = nome; draft.desc = txt; sel = 0; visibleCount = PAGE_SIZE;
    msg(r.found.length ? 'Ho riconosciuto: ' + (r.elem ? EL[r.elem].nome + ', ' : '') + r.found.join(', ') : r.tipo ? 'Ho riconosciuto il tipo di personaggio' + (r.elem ? ' (' + EL[r.elem].nome + ')' : '') : 'Non ho riconosciuto poteri precisi: ti ho messo un kit di base'); render();
  });
  $('fRandom').addEventListener('click', () => { const nome = draft.nome; draft = B.randomRecipe(Math.random, budget); draft.nome = nome; sel = 0; visibleCount = PAGE_SIZE; msg('Tirato a caso'); render(); });
  $('fSave').addEventListener('click', () => { if (B.cost(draft) > budget) return msg('Troppi punti: abbassa un grado'); const list = (G.store.saved = G.store.saved || []), c = copy(draft); c.nome = (c.nome || '').trim() || 'Senza nome'; const i = list.findIndex((p) => p.nome === c.nome); if (i >= 0) list[i] = c; else { list.unshift(c); if (list.length > 12) list.pop(); } G.save(); msg('Salvato'); render(); });
  $('fUse').addEventListener('click', () => { if (B.cost(draft) > budget) return msg('Troppi punti: abbassa un grado o cambia mattoncino'); const c = copy(draft); c.nome = (c.nome || '').trim() || 'Senza nome'; $('forge').classList.add('hidden'); if (onUse) onUse(c); });
  $('fCancel').addEventListener('click', () => { $('forge').classList.add('hidden'); if (onClose) onClose(); });
  G.forge = { open(recipe, level, use, close) { draft = copy(recipe); budget = B.budgetFor(level); sel = 0; visibleCount = PAGE_SIZE; onUse = use; onClose = close; $('fName').value = draft.nome; $('fDesc').value = draft.desc || ''; msg(B.cost(draft) > budget ? 'Troppi punti: abbassa un grado' : 'Fama livello ' + level + ': ' + budget + ' punti. ' + B.LIST.length + ' meccaniche, ' + B.FAMILIES.length + ' famiglie, ' + B.MODS.length + ' innesti'); render(); $('forge').classList.remove('hidden'); }, isOpen: () => !$('forge').classList.contains('hidden') };
};
