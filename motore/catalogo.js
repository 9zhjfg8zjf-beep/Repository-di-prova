// Indice dell'officina: famiglie dedotte dai comportamenti, anche nei programmi annidati.
// Va caricato dopo mec*. Non cambia costi o parametri; aggiunge ricette introduttive.
(function (B) {
  'use strict';
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const norm = (t) => String(t == null ? '' : t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const definitions = [
    ['tiro', 'Proiettili e raggi', 'orb', 'proiettile raggio tiro distanza mira raffica'],
    ['mischia', 'Corpo a corpo', 'claw', 'mischia corpo a corpo fendente pugno lama'],
    ['aree', 'Zone ed esplosioni', 'zone', 'area zona esplosione campo cerchio'],
    ['mobilita', 'Movimento', 'dash', 'movimento mobilita scatto salto velocita fuga'],
    ['spazio', 'Spazio e portali', 'portal', 'spazio portale teletrasporto scambio ritorno'],
    ['telecinesi', 'Forze e gravita', 'magnet', 'telecinesi gravita magnetismo attrazione repulsione sollevamento'],
    ['controllo', 'Controllo', 'chain', 'controllo impedimento'],
    ['mente', 'Mente e illusioni', 'eye', 'mente illusione psichico'],
    ['difesa', 'Difesa e assorbimento', 'shield', 'difesa protezione'],
    ['cura', 'Cura e rinascita', 'heal', 'cura guarigione sostegno'],
    ['evocazione', 'Evocazioni', 'summon', 'evocazione alleato servitore torretta esercito comando'],
    ['tempo', 'Tempo', 'bubble', 'tempo cronologia'],
    ['energia', 'Energia e conversione', 'absorb', 'energia risorsa'],
    ['maledizioni', 'Patti e maledizioni', 'debt', 'patto maledizione'],
    ['trappole', 'Trappole', 'trap', 'trappola mina agguato innesco'],
    ['metamorfosi', 'Metamorfosi', 'mimic', 'metamorfosi trasformazione copia mimetismo polimorfo'],
    ['corpo', 'Taglia e corpo', 'form', 'taglia corpo ingrandimento rimpicciolimento'],
    ['fase', 'Intangibilita', 'phase', 'intangibilita fase attraversamento muri'],
    ['volo', 'Volo', 'flight', 'volo quota ascesa discesa'],
    ['possessione', 'Possessione', 'possess', 'possessione ospite controllo diretto'],
    ['patti', 'Patti condizionali', 'pact', 'patto condizione vincolo punizione'],
    ['stasi', 'Cattura e stasi', 'stasis', 'cattura stasi prigioniero sospensione'],
    ['duplicazione', 'Duplicazione', 'clone', 'duplicazione clone duplicato replica eco'],
    ['percezione', 'Percezione', 'scan', 'percezione scansione rilevamento visione ostacoli'],
    ['combinazioni', 'Combinazioni', 'crown', 'combinazione sequenza ripetizione reazione condizione'],
  ].map(([id, nome, ic, words]) => ({ id, nome, ic, tags: words.split(' ') }));
  const familyMap = new Map(definitions.map((f) => [f.id, f]));
  const freshOps = new Set(['absorb', 'release', 'magnet', 'transmute', 'link', 'debt', 'disarm', 'silence', 'cleanse', 'infect', 'portal', 'tether', 'barrier', 'mimic', 'rewindfoe', 'revive', 'command', 'form', 'phase', 'flight', 'possess', 'pact', 'stasis', 'clone', 'scan']);
  const opFamilies = new Map([
    ['shot', ['tiro']], ['chain', ['tiro']], ['line', ['tiro']], ['cone', ['aree']], ['circ', ['aree']], ['ring', ['aree']], ['zone', ['aree']],
    ['dash', ['mobilita']], ['leap', ['mobilita']], ['blink', ['mobilita', 'spazio']], ['ret', ['mobilita', 'spazio']], ['mem', ['spazio']],
    ['sum', ['evocazione']], ['heal', ['cura']], ['freeze', ['tempo', 'controllo']], ['cdr', ['tempo']], ['res', ['energia']], ['cost', ['maledizioni']],
    ['trig', ['combinazioni']], ['if', ['combinazioni']], ['nth', ['combinazioni']], ['rep', ['combinazioni']], ['pop', ['maledizioni', 'aree']],
    ['absorb', ['difesa', 'energia']], ['release', ['energia']], ['magnet', ['telecinesi']], ['transmute', ['energia', 'metamorfosi']],
    ['link', ['maledizioni']], ['debt', ['maledizioni']], ['disarm', ['controllo']], ['silence', ['controllo']], ['cleanse', ['cura']],
    ['infect', ['maledizioni']], ['portal', ['spazio', 'mobilita']], ['tether', ['telecinesi', 'controllo']], ['barrier', ['difesa']],
    ['mimic', ['metamorfosi']], ['rewindfoe', ['tempo', 'controllo']], ['revive', ['cura', 'evocazione']], ['command', ['evocazione']],
    ['form', ['corpo', 'metamorfosi']], ['phase', ['fase', 'mobilita', 'difesa']], ['flight', ['volo', 'mobilita']],
    ['possess', ['possessione', 'mente']], ['pact', ['patti', 'maledizioni']], ['stasis', ['stasi', 'controllo']],
    ['clone', ['duplicazione', 'evocazione']], ['scan', ['percezione']],
  ]);
  const kindFamilies = new Map([
    ['proj', ['tiro']], ['beam', ['tiro']], ['cone', ['tiro', 'aree']], ['melee', ['mischia']], ['lob', ['tiro', 'aree']],
    ['nova', ['aree']], ['cata', ['aree']], ['strike', ['aree']], ['storm', ['aree']], ['judge', ['aree']], ['wave', ['aree']], ['quake', ['aree']],
    ['dash', ['mobilita']], ['leap', ['mobilita']], ['backflip', ['mobilita']], ['cable', ['mobilita']], ['haste', ['mobilita']],
    ['blink', ['mobilita', 'spazio']], ['behind', ['mobilita', 'spazio']], ['anchor', ['mobilita', 'spazio']], ['swap', ['spazio']], ['rewind', ['tempo', 'mobilita']],
    ['zone', ['aree']], ['orbit', ['aree']], ['trap', ['trappole']], ['cluster', ['trappole']], ['shield', ['difesa']], ['reflect', ['difesa']], ['heal', ['cura']],
    ['charm', ['mente']], ['domin', ['mente']], ['fear', ['mente', 'controllo']], ['veil', ['mente']], ['possess', ['mente']], ['decoy', ['mente', 'evocazione']], ['decoys', ['mente', 'evocazione']],
    ['root', ['controllo']], ['snare', ['controllo']], ['taunt', ['controllo']], ['pull', ['telecinesi']], ['push', ['telecinesi']], ['grab', ['telecinesi']], ['lift', ['telecinesi']],
    ['summon', ['evocazione']], ['sentry', ['evocazione']], ['giant', ['evocazione']], ['bubble', ['tempo']], ['timestop', ['tempo']], ['reset', ['tempo']],
    ['mark', ['maledizioni']], ['drain', ['maledizioni', 'cura']], ['sacr', ['maledizioni']], ['phoenix', ['cura']], ['poly', ['metamorfosi', 'controllo']],
    ['oc', ['energia', 'metamorfosi']], ['rage', ['metamorfosi']], ['eclipse', ['mente', 'difesa', 'cura']],
  ]);
  const flagFamilies = new Map([
    ['stun', ['controllo']], ['root', ['controllo']], ['slow', ['controllo']], ['chill', ['controllo']], ['weak', ['controllo']],
    ['fear', ['mente', 'controllo']], ['charm', ['mente']], ['veil', ['mente']], ['inv', ['mente']], ['poly', ['metamorfosi', 'controllo']],
    ['pull', ['telecinesi']], ['push', ['telecinesi']], ['yank', ['telecinesi']], ['fling', ['telecinesi']], ['lift', ['telecinesi']], ['zpull', ['telecinesi']],
    ['shield', ['difesa']], ['armor', ['difesa']], ['ward', ['difesa']], ['reflect', ['difesa']], ['invuln', ['difesa']],
    ['heal', ['cura']], ['zheal', ['cura']], ['hot', ['cura']], ['ls', ['cura', 'maledizioni']], ['pois', ['maledizioni']], ['burn', ['maledizioni']], ['mark', ['maledizioni']],
    ['haste', ['mobilita']], ['cdr', ['tempo']], ['resrate', ['energia']], ['dome', ['tempo']], ['trap', ['trappole']], ['muro', ['difesa']], ['esca', ['mente']], ['guaritore', ['cura']],
    ['boom', ['aree']], ['aura', ['aree']], ['orbit', ['aree']], ['trail', ['aree']], ['in', ['combinazioni']], ['split', ['combinazioni']], ['then', ['combinazioni']], ['die', ['combinazioni']],
  ]);
  const featureTags = new Map([
    ['pierce', 'perforante attraversa'], ['bnc', 'rimbalzo muri'], ['back', 'boomerang ritorno'], ['hom', 'inseguimento guidato'], ['wide', 'onda larga'],
    ['ringall', 'radiale'], ['spirito', 'spiriti'], ['arciere', 'arciere'], ['colosso', 'gigante'], ['bomba', 'bomba'], ['torretta', 'torretta'],
    ['stun', 'stordimento'], ['root', 'immobilizzazione radici'], ['slow', 'rallentamento'], ['chill', 'congelamento'], ['weak', 'indebolimento'],
    ['fear', 'paura terrore'], ['charm', 'ipnosi controllo mentale'], ['veil', 'invisibilita occultamento'], ['poly', 'polimorfo'],
    ['shield', 'scudo'], ['armor', 'armatura'], ['ward', 'cupola barriera'], ['reflect', 'riflessione contrattacco'], ['invuln', 'invulnerabilita'],
    ['hot', 'rigenerazione'], ['ls', 'vampirismo furto vita'], ['pois', 'veleno tossina'], ['burn', 'bruciatura incendio'], ['mark', 'marchio'],
    ['zpull', 'vortice attrazione'], ['pull', 'attrazione'], ['push', 'repulsione'], ['lift', 'levitazione'], ['trap', 'mina'], ['muro', 'muro'],
  ]);
  const opTags = new Map([
    ['absorb', 'assorbimento accumulo'], ['release', 'rilascio scarica'], ['magnet', 'magnetismo'], ['transmute', 'trasmutazione conversione'],
    ['link', 'legame condivisione'], ['debt', 'debito ritardo'], ['disarm', 'disarmo'], ['silence', 'silenzio interruzione'], ['cleanse', 'purificazione dissipazione'],
    ['infect', 'infezione contagio'], ['portal', 'portale varco'], ['tether', 'vincolo catena'], ['barrier', 'barriera muro'],
    ['mimic', 'copia mimetismo'], ['rewindfoe', 'riavvolgimento ritorno'], ['revive', 'rinascita resurrezione'], ['command', 'comando alleati'],
    ['freeze', 'stasi arresto'], ['cdr', 'ricarica'],
    ['form', 'taglia dimensioni ingombro'], ['phase', 'intangibilita attraversamento'], ['flight', 'volo quota'],
    ['possess', 'possessione ospite'], ['pact', 'patto condizionale'], ['stasis', 'cattura prigionia'],
    ['clone', 'clonazione replica emissioni primario compatibile'], ['scan', 'scansione visione ostacoli rilevamento'],
  ]);
  const controlHints = new Map([
    ['form', 'La taglia cambia ingombro, portata e velocita.'],
    ['phase', 'Attacchi sospesi. Ripremi per tornare solido.'],
    ['flight', 'Guarda in alto o in basso mentre avanzi per cambiare quota. Ripremi per atterrare.'],
    ['possess', 'Muovi e attacca attraverso l’ospite. Il tuo corpo resta vulnerabile; ripremi per rientrare.'],
    ['pact', 'La punizione scatta solo se il bersaglio viola la condizione.'],
    ['stasis', 'Ripremi per liberare il prigioniero.'],
    ['clone', 'Attacca con un primario compatibile: i cloni ne replicano soltanto le emissioni.'],
    ['scan', 'Rivela i nemici attraverso gli ostacoli per una durata limitata.'],
  ]);
  function classify(a) {
    const ids = new Set(kindFamilies.get(a.kind) || []), tags = new Set(), controls = new Set(), seen = new WeakSet();
    let newOp = '';
    const add = (list) => { if (list) for (const id of list) ids.add(id); };
    function walk(o) {
      if (!o || typeof o !== 'object' || seen.has(o)) return;
      seen.add(o);
      if (Array.isArray(o)) { for (const item of o) walk(item); return; }
      if (own(o, 'op')) { add(opFamilies.get(o.op)); if (!newOp && freshOps.has(o.op)) newOp = o.op; const words = opTags.get(o.op); if (words) for (const word of words.split(' ')) tags.add(word); if (controlHints.has(o.op)) controls.add(controlHints.get(o.op)); }
      for (const key of Object.keys(o)) {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
        const value = o[key];
        if (value !== false && value != null && value !== 0) {
          add(flagFamilies.get(key));
          const extra = featureTags.get(key); if (extra) for (const word of extra.split(' ')) tags.add(word);
        }
        if (value && typeof value === 'object') walk(value);
      }
    }
    walk(a.prog); walk(a.p);
    if (!ids.size) ids.add('combinazioni');
    a.families = definitions.filter((f) => ids.has(f.id)).map((f) => f.id);
    for (const id of a.families) for (const word of familyMap.get(id).tags) tags.add(word);
    a.tags = Array.from(tags);
    a.controls = Array.from(controls);
    a.isNew = a.edition === '3.2' || !!newOp;
    if (newOp && a.kind === 'x') a.ic = newOp;
    a.searchText = norm([a.nome, a.desc, ...a.tags, ...a.controls, ...a.families.map((id) => familyMap.get(id).nome)].join(' '));
  }
  B.refreshCatalogue = function () {
    const used = new Set();
    for (const a of B.LIST) { classify(a); for (const id of a.families) used.add(id); }
    B.FAMILIES = definitions.filter((f) => used.has(f.id)).map(({ id, nome, ic }) => ({ id, nome, ic }));
  };
  B.familiesOf = function (value) {
    const a = typeof value === 'string' ? (own(B.ARCH, value) ? B.ARCH[value] : null) : value;
    return a && Array.isArray(a.families) ? a.families.slice() : [];
  };
  B.catalogueNormalize = norm;
  B.catalogueQuery = function (options) {
    const o = options || {}, words = norm(o.query).trim().split(/\s+/).filter(Boolean);
    return B.LIST.filter((a) => (!o.slot || a.slot === o.slot) && (o.mode !== 'new' || a.isNew) && (!o.family || o.family === 'all' || a.families.includes(o.family)) && words.every((w) => a.searchText.includes(w)));
  };
  B.refreshCatalogue();
  // Le ricette storiche mantengono gli stessi indici (DEFAULTS e salvataggi).
  // Ogni kit introduce pochi comportamenti e funziona dal budget iniziale.
  const starters = [
    ['Il Portinaio', 'Apri un varco, attraversalo e alza una barriera per dividere il campo.', 'vento', ['dardo', 'cerniera_del_lete', 'argine_dello_stige', 'cura', 'cataclisma']],
    ['La Tesoreria', 'Intercetta i proiettili: la cedola li restituisce, l’obolo li converte in cura.', 'folgore', ['dardo', 'passo_del_tributo', 'cedola_di_brace', 'obolo_del_convalescente', 'sovraccarico']],
    ['Il Corriere Febbrile', 'Vola guardando in alto o in basso mentre avanzi e diffondi il contagio.', 'veleno', ['dardo', 'ali_del_pellegrino', 'febbre_del_vestibolo', 'scudo', 'pioggia']],
    ['L’Ospite', 'Attiva lo scudo e possiedi un nemico leggero. Il tuo corpo resta vulnerabile.', 'ombra', ['dardo', 'scatto', 'inquilino_dello_stige', 'scudo', 'fenice']],
    ['Il Custode dei Patti', 'Cattura un nemico; ripremi per liberarlo e punisci chi rompe il patto attaccando.', 'gelo', ['dardo', 'corsa', 'ampolla_dello_stige', 'giuramento_della_lama', 'cataclisma']],
    ['La Montagna Errante', 'Ingrandisciti per aumentare portata e ingombro, poi scatena gli artigli.', 'sangue', ['artigli', 'scatto', 'spalle_della_montagna', 'cura', 'ira']],
  ];
  for (const [nome, desc, el, powers] of starters) {
    if (B.PRESETS.some((r) => r.nome === nome) || powers.some((id) => !own(B.ARCH, id))) continue;
    B.PRESETS.push({ nome, desc, edition: '3.2', slots: powers.map((id) => ({ id, el, t: 1 })) });
  }
})(typeof Bricks !== 'undefined' ? Bricks : require('./bricks.js'));
if (typeof module !== 'undefined') module.exports = require('./bricks.js');
