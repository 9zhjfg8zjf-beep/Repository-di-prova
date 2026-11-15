// Esplorazione persistente. Il Core continua a possedere combattimento e movimento.
const DiteAdventure = (() => {
  'use strict';
  const BOOK = {
    dite: [
      { name:'Fonderia delle Ceneri', kind:'forge', keeper:'Alighiero', role:'Custode delle fornaci', element:'gelo', color:'#ed9d55', relic:'Cuore di scoria', herb:'Salvia di cenere', story:'La fornace ha smesso di ascoltare chi la accende. Non serve altro fuoco: raffredda il sigillo, poi apri la grata. Dentro riposa il primo frammento della città.', lore:'Le fornaci non bruciavano anime: custodivano i ricordi che nessuno voleva perdere. Quando i custodi tacquero, il calore rimase senza misura.' },
      { name:'Archivio dei Nomi', kind:'archive', keeper:'Lia', role:'Rilegatrice dei ricordi', element:'luce', color:'#e1bd82', relic:'Nome senza voce', herb:'Inchiostro vivo', story:'Qui conserviamo i nomi di chi attraversa le mura. Una pagina è scomparsa dietro la grata. La luce rimette in ordine le lettere del sigillo.', lore:'Ogni scaffale ha un posto vuoto. Non è una dimenticanza: un archivio completo non lascerebbe spazio a chi deve ancora arrivare.' },
      { name:'Specola del Vespro', kind:'observatory', keeper:'Brunetto', role:'Lettore di orbite', element:'folgore', color:'#b9a0ff', relic:'Astrolabio infranto', herb:'Polvere di stelle', story:'Le orbite sono ferme da anni. Un impulso di folgore al sigillo ridarà movimento alla macchina. Tre frammenti possono cambiare il destino di Dite.', lore:'La specola non predice il futuro. Mostra quante strade restano aperte. Questa notte, per la prima volta, ne è apparsa una nuova.' },
    ],
    cocito: [
      { name:'Serra del Disgelo', kind:'garden', keeper:'Matelda', role:'Giardiniera dell’inverno', element:'fuoco', color:'#83d9ba', relic:'Seme d’inverno', herb:'Menta di brina', story:'Le radici sono vive sotto il ghiaccio. Scalda il sigillo con il fuoco, senza distruggere il giardino. Dietro la grata c’è l’ultimo seme della prima estate.', lore:'Le foglie crescono verso il basso per cercare il tepore della terra. I giardinieri hanno imparato a leggere le stagioni nelle radici.' },
      { name:'Chiostro del Silenzio', kind:'cloister', keeper:'Piccarda', role:'Custode delle campane', element:'vento', color:'#b8d4f5', relic:'Voce di cristallo', herb:'Fiore di silenzio', story:'La campana non ha perduto la voce: le manca il respiro. Porta il vento al sigillo. Ascolta ciò che cambia prima di varcare il passaggio.', lore:'Nessuno qui ha fatto voto di tacere. Il silenzio è uno spazio lasciato agli altri, non un ordine imposto a sé stessi.' },
      { name:'Darsena delle Stelle', kind:'docks', keeper:'Ulisse', role:'Cartografo dei ghiacci', element:'luce', color:'#8cc8ff', relic:'Bussola immobile', herb:'Sale lunare', story:'Le barche aspettano una rotta. La bussola dietro il sigillo cerca luce, non nord. Raccogli i tre frammenti e scegli a chi affidare il viaggio.', lore:'Sotto il ghiaccio si vede un cielo diverso. I marinai tracciano le rotte osservando le stelle ai propri piedi.' },
    ],
    malebolge: [
      { name:'Orto degli Alchimisti', kind:'garden', keeper:'Arnaldo', role:'Coltivatore di rimedi', element:'veleno', color:'#a5ce67', relic:'Ampolla del mutamento', herb:'Radice amara', story:'Una goccia cambia il rimedio in veleno. Il nostro sigillo riconosce entrambi. Porta l’elemento veleno alla vasca e libera l’ampolla.', lore:'Ogni vaso reca due nomi: quello della malattia e quello della cura. Spesso sono la stessa parola, con una dose diversa.' },
      { name:'Mercato Sommerso', kind:'docks', keeper:'Forese', role:'Mercante delle cose perdute', element:'gelo', color:'#ddbb6a', relic:'Moneta senza padrone', herb:'Loto di pece', story:'La pressione tiene chiusa la grata. Il gelo può fermare la macchina abbastanza a lungo. Quella moneta non si compra: si restituisce.', lore:'Qui si scambiano oggetti perduti, mai persone. Il prezzo di ogni merce è il racconto del viaggio che l’ha portata fin qui.' },
      { name:'Teatro degli Echi', kind:'theatre', keeper:'Sordello', role:'Regista delle voci', element:'ombra', color:'#cf9bdf', relic:'Maschera sincera', herb:'Petalo d’eco', story:'Il palcoscenico ripete le voci più forti. L’ombra può spegnere il sigillo e lasciare parlare le altre. Dopo il terzo frammento, la scelta sarà tua.', lore:'Le maschere non nascondono il volto. Permettono di pronunciare una verità che, a viso aperto, non si riuscirebbe ancora a dire.' },
    ],
  };
  const THEMES = Object.keys(BOOK), TYPES = ['keeper','lore','rune','lever','chest','herb','rest'];
  const plain = x => !!x && typeof x === 'object' && !Array.isArray(x);
  const initial = () => ({ version:1, cities:{}, supplies:0, tracked:null });
  function normalize(raw) {
    const out = initial();
    for (const theme of THEMES) {
      const old = plain(raw) && raw.version === 1 && plain(raw.cities) && plain(raw.cities[theme]) ? raw.cities[theme] : {};
      out.cities[theme] = { ending:['share','preserve'].includes(old.ending) ? old.ending : '', sites:[] };
      for (let i=0;i<3;i++) { const v = Array.isArray(old.sites) && plain(old.sites[i]) ? old.sites[i] : {};
        const site = {}; for (const key of ['discovered','met','read','charged','opened','claimed','harvested']) site[key] = v[key] === true;
        // Dipendenze chiuse: dati malformati non generano ricompense retroattive.
        if (site.claimed) site.opened = site.charged = site.discovered = true;
        if (site.opened) site.charged = true;
        out.cities[theme].sites.push(site);
      }
      if (!out.cities[theme].sites.every(v => v.claimed)) out.cities[theme].ending = '';
    }
    if (plain(raw) && raw.version === 1) {
      out.supplies = typeof raw.supplies === 'number' && Number.isFinite(raw.supplies) ? Math.max(0,Math.min(9,Math.floor(raw.supplies))) : 0;
      if (plain(raw.tracked) && THEMES.includes(raw.tracked.theme) && Number.isInteger(raw.tracked.site) && raw.tracked.site >= 0 && raw.tracked.site < 3) out.tracked = { theme:raw.tracked.theme, site:raw.tracked.site };
    }
    return out;
  }
  function attach(s, raw) {
    const progress = normalize(raw), theme = s.city.theme.id;
    const fields = s.city.fields.slice().sort((a,b) => Math.hypot(a.x-s.city.spawn.x,a.z-s.city.spawn.z)-Math.hypot(b.x-s.city.spawn.x,b.z-s.city.spawn.z));
    if (fields.length < 3) throw Error('Servono tre luoghi liberi per l’esplorazione');
    const sites = BOOK[theme].map((entry,i) => ({ ...entry, id:i, x:fields[i].x, z:fields[i].z, progress:progress.cities[theme].sites[i] }));
    s.city.props = s.city.props.filter(p => !sites.some(site => Math.abs(p.x-site.x) < 8 && Math.abs(p.z-site.z) < 8));
    const objects = [], add = (site,type,dx,dz) => objects.push({ id:site.id+':'+type, site:site.id,type,x:site.x+dx,z:site.z+dz });
    for (const site of sites) {
      add(site,'keeper',-4,-4); add(site,'lore',4,-4); add(site,'rune',0,-2.5); add(site,'lever',3, -1.5);
      add(site,'chest',0,3); add(site,'herb',-4,2.5); add(site,'rest',4,2.5);
      for (const x of [-4,0,4]) s.city.props.push({x:site.x+x,z:site.z+6,hx:2,hz:.4,adventure:true});
      for (const x of [-6,6]) for (const z of [1.5,4.5]) s.city.props.push({x:site.x+x,z:site.z+z,hx:.4,hz:1.5,adventure:true});
      for (const x of [-4,4]) s.city.props.push({x:site.x+x,z:site.z,hx:2,hz:.35,adventure:true});
      site.gate = {x:site.x,z:site.z,hx:2,hz:.35,adventure:true};
      if (!site.progress.opened) s.city.props.push(site.gate);
    }
    s.adventure = { progress, sites, objects, revision:0, seenRevision:-1, target:null, restUntil:0, primaryCasts:s.stats.casts[0] };
    return s.adventure;
  }
  const snapshot = s => normalize(s.adventure.progress);
  const changed = s => { s.adventure.revision++; };
  const ready = s => s.player.dead <= 0 && !['phase','possession','ride','leap','flight','dash','form'].some(key=>s.player[key]);
  function visible(s,x,z,core) {
    const p=s.player;if(!core.los(s,p.x,p.z,x,z))return false;
    // The world grid does not contain the physical walls of these chambers.
    const dx=x-p.x,dz=z-p.z,steps=Math.ceil(Math.hypot(dx,dz)/.15);
    for(let i=1;i<steps;i++){const q=i/steps,px=p.x+dx*q,pz=p.z+dz*q;if(s.city.props.some(w=>w.adventure&&Math.abs(px-w.x)<w.hx&&Math.abs(pz-w.z)<w.hz))return false;}
    return true;
  }
  function nearest(s, core) {
    if (!s.adventure || !ready(s)) return null;
    const p=s.player;
    return s.adventure.objects.filter(o => {
      const dx=o.x-p.x,dz=o.z-p.z,d=Math.hypot(dx,dz);
      return d < 3.5 && (d < .5 || (-Math.sin(p.yaw)*dx-Math.cos(p.yaw)*dz)/d > .62) && visible(s,o.x,o.z,core);
    }).sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z))[0] || null;
  }
  function label(s,o) { const site=s.adventure.sites[o.site]; return ({ keeper:'Parla con '+site.keeper,lore:'Leggi il reperto',rune:site.progress.charged?'Sigillo accordato':'Esamina il sigillo',lever:site.progress.opened?'Passaggio aperto':'Aziona la grata',chest:site.progress.claimed?'Reliquiario vuoto':'Apri il reliquiario',herb:site.progress.harvested?'Risorsa raccolta':'Raccogli '+site.herb,rest:'Riposa sulla panca' })[o.type]; }
  function tick(s, events, core) {
    const a=s.adventure; if (!a) return;
    const continuous = s.stats.casts[0] > a.primaryCasts && (s.player.beam.on || s.player.cone);
    a.primaryCasts = s.stats.casts[0];
    const elements = events.filter(e=>e.type==='cast').map(e=>String(e.el).split('+')[0]);
    if (continuous) elements.push(s.kit[0].el.split('+')[0]);
    for (const site of a.sites) {
      const v=site.progress;
      if (!v.discovered && Math.hypot(s.player.x-site.x,s.player.z-site.z)<13) { v.discovered=true; changed(s); s.events.push({type:'discovery',title:site.name}); }
      if (!v.charged && ready(s)) {
        const target=a.objects.find(o=>o.site===site.id&&o.type==='rune'),p=s.player,dx=target.x-p.x,dz=target.z-p.z,d=Math.hypot(dx,dz);
        // Risonanza dichiarata: un cast riuscito, vicino al sigillo e rivolto verso di esso.
        // Non spaccia un evento di cast per una collisione di proiettile.
        if (d<7 && d>.1 && Math.abs(p.pitch)<.65 && (-Math.sin(p.yaw)*dx-Math.cos(p.yaw)*dz)/d>.92 && visible(s,target.x,target.z,core) && elements.includes(site.element)) {
          v.charged=true; changed(s); s.events.push({type:'resonance',title:site.name,el:site.element,x:target.x,z:target.z});
        }
      }
    }
    a.target=nearest(s,core);
    if (a.target) s.hint.use={kind:'adventure',id:a.target.id,label:label(s,a.target)};
  }
  function view(s,id) {
    const a=s.adventure,o=a.objects.find(o=>o.id===id); if (!o) return null;
    const site=a.sites[o.site],v=site.progress,city=a.progress.cities[s.city.theme.id];
    let title=site.name,eyebrow='',text='',choices=[];
    if (o.type==='keeper') {
      title=site.keeper; eyebrow=site.role+' · '+site.name; text=site.story;
      choices=[{id:'track',label:'Segna questo luogo sull’atlante'},{id:'ask',label:'Raccontami questo luogo'}];
      if (v.claimed) text='Hai recuperato '+site.relic+'. '+site.keeper+' riconosce il tuo passaggio. '+site.lore;
      if (city.sites.every(v=>v.claimed)) {
        text=city.ending ? (city.ending==='share'?'I frammenti sono tornati agli abitanti. Il luogo ora porta la luce della città.':'I frammenti sono custoditi nell’archivio. Il luogo ora porta il colore della memoria.') : 'I tre frammenti sono riuniti. Puoi condividerli con gli abitanti, oppure preservarli nell’archivio. La scelta resta nel tuo viaggio; cambia il titolo e la luce dei luoghi, non cancella poteri o missioni.';
        choices=city.ending ? [{id:'track',label:'Rivedi il luogo nell’atlante'}] : [{id:'share',label:'Condividi con gli abitanti · titolo Custode dei legami'},{id:'preserve',label:'Preserva nell’archivio · titolo Custode della memoria'}];
      }
    } else if (o.type==='lore') { title='Memoria del luogo';eyebrow=site.name;text=site.lore;choices=[{id:'read',label:v.read?'Riletto · torna in città':'Conserva nel diario'}]; }
    else if(o.type==='rune') { title='Sigillo di '+site.element;eyebrow=site.name;text=v.charged?'Il sigillo risponde. La leva accanto alla grata ora può aprire il passaggio.':'Avvicinati, guarda il sigillo e lancia un potere di '+site.element+'. La risonanza di un cast riuscito entro sette passi lo accorda. Se manca quell’elemento, cambialo nell’officina.';choices=[{id:'forge',label:'Prepara i poteri nell’officina'},{id:'track',label:'Segna il luogo'}]; }
    else if(o.type==='lever') { title='Grata del reliquiario';text=v.opened?'Il passaggio è aperto.':v.charged?'Il meccanismo è pronto. Aprendo la grata potrai entrare nella camera.':'La leva è bloccata: accorda prima il sigillo davanti al passaggio.';choices=v.charged&&!v.opened?[{id:'open',label:'Apri il passaggio'}]:[]; }
    else if(o.type==='chest') { title=site.relic;eyebrow=site.name;text=v.claimed?'Hai già recuperato questo frammento. È registrato nel tuo viaggio.':!v.opened?'La camera è ancora sigillata.':'Il frammento attende nel reliquiario. Recuperalo per completare questo luogo: +18 Fama.';choices=!v.claimed&&v.opened?[{id:'claim',label:'Recupera il frammento · +18 Fama'}]:[]; }
    else if(o.type==='herb') { title=site.herb;text=v.harvested?'Hai già raccolto questa risorsa.':a.progress.supplies>=9?'La borsa contiene già nove scorte. Usa un rimedio dalla pausa prima di raccoglierne altre.':'Una risorsa per i tuoi rimedi. Ogni scorta ripristina 35 punti vita dalla pausa, fuori dal combattimento.';choices=!v.harvested&&a.progress.supplies<9?[{id:'harvest',label:'Raccogli una scorta'}]:[]; }
    else { title='Una sosta';text='Riprendi fiato e recupera tutta la vita. Devi essere al sicuro: nessun nemico entro dodici passi. La panca si può usare ogni trenta secondi di gioco.';choices=[{id:'rest',label:'Riposa e recupera'}]; }
    return {id,title,eyebrow:eyebrow||site.name,text,choices,color:site.color};
  }
  function safe(s,x=s.player.x,z=s.player.z) { return !s.boss && !s.mobs.some(e=>e.team==='e'&&!e.dead&&Math.hypot(e.x-x,e.z-z)<12) && !s.turrets.some(t=>t.state==='hostile'&&Math.hypot(t.x-x,t.z-z)<12); }
  function travel(s,id) {
    const site=s.adventure.sites[id],p=s.player;
    if(!site||!site.progress.discovered||!ready(s)||s.quest||p.grab||p.captive||p.anchor||p.mem||!safe(s)||!safe(s,site.x,site.z-6))return {ok:false,message:'Viaggio non disponibile: termina la missione, rilascia i poteri attivi e assicurati che partenza e arrivo siano al sicuro.'};
    p.x=site.x;p.z=site.z-6;p.cam.x=p.x;p.cam.z=p.z;p.hist.length=0;return {ok:true};
  }
  function act(s,id,action,core) {
    const a=s.adventure,o=a.objects.find(o=>o.id===id);
    if (!o || !ready(s) || Math.hypot(o.x-s.player.x,o.z-s.player.z)>4 || !visible(s,o.x,o.z,core)) return {ok:false,message:'Avvicinati di nuovo al luogo.'};
    const site=a.sites[o.site],v=site.progress,city=a.progress.cities[s.city.theme.id];
    if (action==='track') { a.progress.tracked={theme:s.city.theme.id,site:site.id};v.met=o.type==='keeper'||v.met;changed(s);return {ok:true,message:'Luogo segnato sull’atlante.'}; }
    if (action==='ask'&&o.type==='keeper') { v.met=true;v.read=true;changed(s);return {ok:true,message:site.lore,stay:true}; }
    if (action==='read'&&o.type==='lore') {v.read=true;changed(s);return {ok:true,message:'Memoria aggiunta al diario.'};}
    if (action==='open'&&o.type==='lever'&&v.charged&&!v.opened) {v.opened=true;s.city.props=s.city.props.filter(p=>p!==site.gate);changed(s);return {ok:true,message:'La grata si apre. Entra nella camera.'};}
    if (action==='claim'&&o.type==='chest'&&v.opened&&!v.claimed&&s.player.z>site.z+.8) {v.claimed=true;changed(s);core.gainFame(s,18,'esplorazione');return {ok:true,message:'Frammento recuperato · +18 Fama'};}
    if (action==='harvest'&&o.type==='herb'&&!v.harvested&&a.progress.supplies<9) {v.harvested=true;a.progress.supplies++;changed(s);return {ok:true,message:'Una scorta aggiunta alla borsa.'};}
    if (action==='rest'&&o.type==='rest') {if(!safe(s))return {ok:false,message:'Ci sono minacce vicine. Trova prima un momento sicuro.'};if(s.t<a.restUntil)return {ok:false,message:'Attendi '+Math.ceil(a.restUntil-s.t)+' secondi prima di riposare ancora.'};s.player.hp=s.player.maxHp;a.restUntil=s.t+30;return {ok:true,message:'Vita recuperata.'};}
    if (['share','preserve'].includes(action)&&o.type==='keeper'&&!city.ending&&city.sites.every(v=>v.claimed)) {city.ending=action;changed(s);core.gainFame(s,30,'esplorazione');return {ok:true,message:'Scelta effettuata · +30 Fama'};}
    return {ok:false,message:'Questa azione non è disponibile.'};
  }
  function remedy(s) {const a=s.adventure;if(!ready(s)||!safe(s)||a.progress.supplies<1||s.player.hp>=s.player.maxHp)return {ok:false,message:'Serve una scorta, vita da recuperare e nessuna minaccia vicina.'};a.progress.supplies--;s.player.hp=Math.min(s.player.maxHp,s.player.hp+35);changed(s);return {ok:true,message:'Rimedio usato · fino a 35 vita recuperata.'};}
  return {BOOK,TYPES,normalize,attach,snapshot,nearest,label,tick,view,act,remedy,safe,travel};
})();
if (typeof module !== 'undefined') module.exports = DiteAdventure;
