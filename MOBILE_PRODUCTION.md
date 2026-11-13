# DITE — direzione mobile e preparazione iOS

Stato: **4.0 candidata, web verificato in CI e diagnosi UI iOS in corso**, non ancora pubblicata. Aggiornato il 13 novembre 2026.
Base verificata: DITE 3.2, commit 5a50c8f70e2f214b0b6d3a704e24d39765262476.
La versione pubblicata resta 3.2. Il lavoro è nel ramo `codex/dite-mobile`.

## Obiettivo

Portare DITE a un'esperienza mobile orizzontale curata, riconoscibile e pronta per un percorso di distribuzione iOS.
La composizione di cinque poteri, le tre città, gli abitanti, le missioni e i boss restano il centro del gioco.
Il numero di poteri non è una misura della qualità dell'interfaccia: ingresso, comprensione, risposta ai comandi,
leggibilità, stabilità e prestazioni devono avere verifiche proprie.

L'obiettivo qualitativo indicato dall'utente è ambizioso. Non dichiarare “livello SOTA”, “App Store ready” o
“60 fps su iPhone” sulla base di un restyling, di una compilazione o di screenshot del browser.

## Lavoro svolto in questo ciclo

- Git pull eseguito prima dell'audit; checkout inizialmente pulito e aggiornato.
- Lettura dei sorgenti 3.2 tramite GitHub, con audit indipendenti di navigazione, persistenza, input e rendering.
- Ricerca in documentazione ufficiale Apple, Supercell, Riot e Activision.
- Dopo la riconnessione, clone e pull aggiornati; tutte le 27 prove iniziali eseguite sullo stesso codice 3.2.
  Il primo `tend` ha perso il banner transitorio pur avendo già verificato vittoria, premio e salvataggio;
  la ripetizione identica è passata. Le nuove prove osservano il vero annuncio prima dell'azione e fissano
  la camera per confrontare risorse realmente renderizzate.
- Audit visivo della 3.2: 25 foto a 667×375, 844×390, 932×430 e 1024×768, compresi inset simulati.
  Rilevati comandi tagliati, ricerca nascosta, sovrapposizione missione/suprema e saturazione durante i poteri.
- Implementati router, pulizia input, storage schema 3, tutorial basato sulle azioni, registro dei risultati,
  nuova shell orizzontale, impostazioni, risorse grafiche e progetto iOS. I gruppi vengono integrati e verificati
  separatamente: non leggere questa lista come certificazione della release completa.
- Prove mirate nuove: storage 19 casi, router 11 casi e 2.000 transizioni, tutorial 18 casi, registro 11 casi.
  Le prove browser verificano input touch reali, sospensione, rendering fermo, quota storage, cambio città e retry.
- Risorse: perdita di una texture del committente riprodotta sul codice precedente e risolta; plateau dopo
  disegno delle quattro forme di preavviso, delle tre texture e degli impatti. Pool inattivi senza upload;
  le zone mobili e crescenti ora seguono i dati del Core anche nel mondo disegnato.
- Leggibilità degli effetti: Sisma mantiene il preavviso basso e non produce fulmini dal cielo all'impatto.
  I corpi dei proiettili propri sfumano vicino alla camera, mentre quelli nemici conservano la loro visibilità.
  I fasci hanno larghezza apparente limitata e nucleo colorato, evitando che la sovrapposizione sommi solo bianco;
  l'attenuazione rispetta anche l'opzione Lampi ridotti.
- Bonus: un solo potenziamento prioritario nel riepilogo HUD, seguito da `+N` quando ce ne sono altri.
  Copre otto bonus: invulnerabilità, riflessione, Fenice, occultamento, cura nel tempo, furia, velocità e orbite.
  Il pannello Potenziamenti in pausa mostra nomi completi e secondi residui dagli stessi timer della simulazione,
  che in pausa non avanzano. Il riepilogo non cambia effetti o durata dei poteri.
- Stati del potere: riepilogo limitato a tre righe, con corpo alternativo e stasi prioritari; oltre tre stati,
  due righe e conteggio degli altri. Il dettaglio espandibile in pausa conserva tempi, risorse e istruzioni.
  La modalità mancini rispecchia controlli e gruppi HUD; la guida adatta le istruzioni al lato scelto.
- Coach: due ancoraggi scelti dagli ingombri reali, ResizeObserver e cache senza misure nei frame stabili.
  La missione attiva resta visibile. Riavviare la guida conserva l'incarico reale e completa il percorso dopo
  le quattro azioni di movimento, mira, primario e abilità, senza seconda missione o premio aggiuntivo.
  QA verde su 112 snapshot: sei missioni, touch/tastiera, due lati, font, nome lungo, stati e boss.
- Gate locale finale **33/33 verde**: 14 Node (`/tmp/dite-final11-node.log`) e 19 browser/build
  (`/tmp/dite-final13-browser.log`), esito 0; sequenza browser continua senza modifiche o riavvii.
  Verdi i mirati coach/bonus/contatore (`/tmp/dite-final13-mirato.log`), compresi scena densa e Fama lunga.
  Arena/iOS sincronizzati; packaging 8/8 e controlli sync/progetto/asset/diff verdi. Il bundle finale
  della candidata 13 è identificato dai checksum in `AGENTS.md`.
- Seconda CI [43447046606](https://github.com/9zhjfg8zjf-beep/Repository-di-prova/actions/runs/43447046606)
  su `ba105b4`: 14 Node, 19 browser/build e packaging 8 verdi; Release unsigned, 20 unitari e 2/6 UI per famiglia
  riusciti. Filtro WebKit e font della prima CI corretti; avvio e gameplay animato osservati.
  Passano officina/tastiera e retry WebGL. Fra i quattro UI falliti, corretto il selettore della preferenza
  (leggeva StaticText, ora Switch e inversione 0/1); tre casi tap/pausa/background ancora in diagnosi.
  Verificato l'orientamento reale landscapeRight, non ancora il secondo verso. La prossima CI raccoglierà
  tracce passive solo DEBUG/--ui-testing anche sui test riusciti e verificherà lo stato OS nel test background.
  I controlli Riprendi usano l'attesa exists+hittable di 20 s, senza doppi tap e conservando le verifiche geometriche.
  Il bundle web e i suoi checksum restano invariati; la diagnostica e esclusa da Release. WPE WebKit Linux supera 11 tap reali senza errori JS,
  evidenza complementare a iOS. I 9 PNG e 4 video per dispositivo sono materiale di diagnosi, non ancora Store.
  La versione pubblicata resta 3.2.

## Riferimenti e applicazione originale

| Riferimento ufficiale | Evidenza letta | Scelta per DITE |
| --- | --- | --- |
| mo.co, rilancio | Rooftop HQ, armi con abilità predefinite, accesso diretto alle attività. | Rifugio riconoscibile e kit pronti all'ingresso; conservare l'officina completa. |
| mo.co, note UI di maggio | Equipaggiamento attivo più evidente, ritorno alla schermata di provenienza, VFX meno affaticanti. | Selezione ed equipaggiamento distinti, navigazione con contesto, segnali leggibili al picco degli effetti. |
| Brawl Stars, squadra | Documentazione del flusso squadra; asset osservato limitato alla barra squadra, non a una lobby completa. | Rendere immediati “con cosa gioco?” e “cosa faccio adesso?”, senza attribuire una verifica visiva della lobby non svolta. |
| Wild Rift 5.0 | HUD iniziale semplice e impostazioni per personalizzarne l'aspetto. | Buone impostazioni iniziali e dettagli avanzati separati. |
| COD Mobile, guida 2019 | Movimento a sinistra, camera a destra, azioni contestuali e controlli personalizzabili. | Riferimento pertinente alla prima persona; guida storica, non verifica dell'interfaccia attuale. |
| Apple, HIG e WWDC | Controlli raggiungibili, aree sicure, feedback percepibile e interfacce adattive. | Gruppi ancorati ai bordi, spazio centrale libero, dimensioni comode e impostazioni di comfort. |

Sono state lette le pagine e le trascrizioni ufficiali e osservati gli asset mo.co HQ/profilo e COD HUD/editor.
Gli asset Brawl disponibili non mostrano una lobby completa; nessuna affermazione di aver visionato filmati
o analizzato pixel non accessibili.
Non importare grafica, personaggi, suoni o testi dei giochi di riferimento.

## Difetti riscontrati nel codice 3.2

I riferimenti sono al commit base, non a numeri di riga futuri.

| Priorità | Riscontro | Correzione e prova necessarie |
| --- | --- | --- |
| P0 | main.js: pausa, blur e guida non azzerano tutti i puntatori, joystick e buffer; pointermove può continuare dietro i menu. | Una funzione di reset completa per ogni uscita dal gioco attivo. Multi-touch mantenuto → pausa → ripresa: zero input residui. |
| P0 | main.js: la guida aperta dalla pausa riprende direttamente il gioco; il primo aiuto è aperto da un timer non collegato allo stato corrente. | Destinazione di ritorno esplicita e transizioni centralizzate. Nessun timer può aprire una schermata ormai fuori contesto. |
| P0 | ui.js/main.js: dati salvati non normalizzati; JSON sintatticamente valido ma di forma errata può rompere l'officina. Gli errori di scrittura sono nascosti. | Schema, migrazione e validazione. Messaggio “salvato” soltanto dopo scrittura riuscita; stato temporaneo comprensibile se storage indisponibile. |
| P0 | main.js: cambio città salva prima della riuscita, distrugge il mondo precedente e consente richieste ripetute durante il caricamento. | Una sola operazione attiva, token di caricamento, conferma e recupero. Salvare selezione dopo successo. |
| P0 | main.js: trascinare sul primario ignora la sensibilità applicata al canvas. | Stesso calcolo per entrambe le superfici; confronto degli angoli a sensibilità diverse. |
| P1 | index.src.html: pausa 30×24 px; selettori grado/elemento alti 30 px. | Obiettivo DITE di almeno 44×44 CSS px per aree interattive, da verificare anche nel contenitore nativo. |
| P1 | ui.js: ricerca/catalogo dopo grado, elementi e innesti; errore budget in una colonna scorrevole. | Ricerca immediata, dettaglio progressivo e stato del budget vicino al comando Equipaggia sempre raggiungibile. |
| P1 | main.js: i nomi equipaggiati sono ridotti alla prima parola; poteri diversi diventano indistinguibili. | Nome leggibile o abbreviazione univoca, dettaglio accessibile, verifica con nomi lunghi e simili. |
| P1 | main.js: compositore ridisegnato ogni RAF in pausa; città animata anche sotto home/officina. | Rendering su invalidazione nei pannelli; eventuale sfondo della lobby a frequenza limitata. Contatore di frame realmente disegnati. |
| P1 | main.js: audio continuo non sospeso coerentemente; visibilitychange può riprenderlo mentre il gioco resta in pausa. | Audio derivato da stato applicazione/visibilità/preferenze; ripresa da gesto esplicito, Promise gestite. |
| P1 | main.js: mancano percorsi applicativi di recupero per context loss, pagehide/pageshow e processo WebKit terminato. | Stato di errore recuperabile, input e simulazione sospesi, nessun ciclo di ricaricamento infinito. |
| P1 | fx.js/world.js: geometrie locali ricreate con keep=true e texture non più collegate all'albero possono sfuggire al cleanup. | Proprietà esplicita delle risorse; test di molti cambi città dopo aver realmente disegnato i relativi effetti. |
| P2 | Qualità e movimento non personalizzabili; particelle/modelli inattivi possono aggiornarsi inutilmente. | Profili di qualità e comfort, poi ottimizzazione misurata di pool e visibilità. |

Gli inset safe-area sono già presenti. Non ricostruirli come se mancassero: verificare ingombri reali,
tastiera, rotazione, notch e home indicator. Conservare le protezioni anti-bagliore introdotte nella 3.2.
Nella 3.2 l'aiuto indicava metà sinistra, mentre il movimento usava il 42% dello schermo. Nella candidata
la guida indica la zona di movimento effettiva, invertendo destra e sinistra con Comandi per mancini.

## Esperienza proposta

### Rifugio e ingresso

Una schermata orizzontale con identità del personaggio, città e attività attuale.
Un'azione dominante: Entra a Dite oppure Riprendi, quest'ultima solo quando esiste davvero una sessione in memoria.
Accessi secondari a Poteri, Città, Guida e Impostazioni. Nessun catalogo di 1343 voci come prima barriera.
Nessun negozio, valuta o funzione sociale fittizia.

La guida iniziale deve insegnare attraverso azioni brevi e verificabili nel gioco; la spiegazione estesa
rimane riapribile. Le istruzioni mostrate corrispondono ai comandi touch o tastiera realmente usati.

### Poteri e officina

Primo livello: kit introduttivi e salvati con stile di gioco, cinque icone e comando Equipaggia.
Secondo livello: officina completa, con cinque slot stabili e uno solo in modifica.
Ricerca e famiglia visibili; selezione apre un dettaglio con effetto, controlli, costo e requisiti.
Grado, elemento e innesto sono modifiche del dettaglio, non ostacoli prima della ricerca.
Bozza e kit equipaggiato sono distinti; filtri e posizione si conservano durante la navigazione.
Budget e causa di un rifiuto rimangono vicino all'azione finale.

### HUD, pausa e impostazioni

Movimento a sinistra, camera nella zona destra libera, primario dominante e quattro poteri vicini al pollice.
Comandi per mancini inverte i lati e adatta guida e coach. Quando il coach è visibile, il solo promemoria
per cercare una missione viene nascosto; un obiettivo già accettato resta nell'HUD.
Mantenere icona, ricarica e verbo di rilascio degli stati reversibili. Nessun dato essenziale affidato soltanto al colore.
Pausa con Riprendi prioritario; sottopannelli tornano al chiamante senza riattivare la simulazione.
Per i bonus temporanei, il nome prioritario e il conteggio aggiuntivo lasciano spazio al gioco;
il dettaglio espandibile in pausa permette di leggere tutti i nomi e il tempo rimanente.
Impostazioni per comandi, audio, grafica e comfort; anteprima e ripristino dei valori.
Direzione visiva originale: antracite caldo, ambra per azione, ciano per informazione, rosso per pericolo;
meno maiuscole decorative, gerarchia tipografica più chiara e superfici meno luminose.

## Architettura proposta

- Stato unico delle schermate: boot, lobby, città, kit, officina, caricamento, gioco, pausa, impostazioni,
  guida, rotazione e errore. Running/paused derivati, non variabili modificate in molti punti.
- Transizione unica: reset input e capture, clock/accumulatore, focus, pointer lock, audio e pannelli.
- Sospensione in background o orientamento inadatto; ripresa esplicita. Una tastiera aperta in officina
  non va confusa con una rotazione del dispositivo.
- Persistenza normalizzata e versionata, con migrazione non distruttiva del salvataggio esistente.
  Non serializzare indiscriminatamente il Core: contiene riferimenti e callback.
- Distinguere ripresa della sessione in RAM da riavvio dell'app: il secondo conserva progressi/kit/preferenze,
  ma il combattimento esatto non è persistito finché non esiste un sistema dedicato.
- Conservare le API di collaudo esistenti. Aggiungere snapshot di schermata/input e renderOnce:
  tvis modifica appositamente una scena in pausa e deve richiedere il nuovo disegno.
- Un unico proprietario di main.js. Ownership separate per interfaccia, rendering, progetto iOS e prove.
  Il nucleo dei 1343 poteri rimane stabile durante questo ciclo di esperienza mobile.

## Percorso iOS

Proposta: Swift/UIKit e WKWebView, con HTML e asset del gioco inclusi nel bundle, senza server locale o CDN.
Caricamento limitato al file/cartella del gioco; navigazione esterna soltanto su azione esplicita.
Bridge nativo piccolo e versionato per lifecycle, preferenze e feedback tattile, con messaggi consentiti espliciti.
Entrambi i landscape, safe area gestite senza sommare due volte gli inset UIKit e CSS.
Audio rispettoso del silenzioso e della musica dell'utente, da verificare su dispositivo.

Preparare progetto Xcode, schema condiviso, risorse, licenze e procedura di sincronizzazione con checksum.
Aggiungere CI macOS per build unsigned e test su simulatore; una workflow è verificata solo dopo esecuzione riuscita.
Alla data dell'audit gli upload richiedono Xcode 26+ e SDK iOS 26+: il deployment target è una scelta distinta.
La compatibilità iPad va provata anche se il progetto nasce per iPhone.

Privacy policy, manifest privacy e dichiarazioni App Store Connect sono elementi distinti:
compilarli dai comportamenti reali, senza dichiarare automaticamente assenza di raccolta o API usate.
Titolare, supporto, identità di firma e metadati legali devono essere reali; non inventarli né recuperarli
da memoria personale per inserirli in un repository pubblico.

Compilazione unsigned, firma, TestFlight e pubblicazione sono fasi diverse.
Account Apple Developer, credenziali di firma e accesso a dispositivi fisici non risultano disponibili in questo ambiente.
Non chiedere all'utente di fare i giri di prova: serviranno dispositivi accessibili o un servizio di collaudo,
e l'eventuale accesso va affrontato quando esiste una build concreta.

## Criteri di accettazione

1. Conservare verdi tutti i gruppi di tbaseline.js; aggiungere prove indipendenti per router e migrazioni.
2. Percorso completo prima apertura → kit → gioco → pausa → impostazioni/guida → ripresa.
3. Nessun movimento, tiro o abilità residui dopo pausa, perdita capture, blur, background o rotazione.
4. Nessuna perdita del kit attivo per annullamento, quota storage, JSON corrotto o doppio tap.
5. Layout e foto a 667×375, 844×390, 932×430 e 1024×768, con inset e tastiera.
6. Tutti i 1343 poteri raggiungibili; budget, selezione, equipaggiamento e requisiti comprensibili.
7. Modalità movimento ridotto e profili grafici mantengono leggibili nemici e annunci dei boss.
8. Rendering fermo quando non serve; invalidazione e ripresa corrette, memoria in plateau dopo cicli con effetti attivati.
9. App iOS: avvio offline, entrambi i landscape, lifecycle, bridge, persistenza e recupero su simulatore.
10. Su hardware fisico: multi-touch, frame time, memoria, temperatura, batteria, audio e interruzioni.
    Il rendering software del browser non certifica questi risultati.
11. Icona, screenshot reali, supporto, privacy e note revisore corrispondono alla build distribuibile.
    L'approvazione finale dipende da App Review.

## Sequenza di piccoli commit

1. Router, reset input e persistenza, con regressioni mirate.
2. Lobby, scelta kit/città e navigazione coerente.
3. Officina e HUD adattivi, impostazioni e comfort.
4. Lifecycle grafico/audio, risorse e profili qualità.
5. Progetto iOS offline e bridge limitato.
6. CI macOS, prove simulator e preparazione metadati.
7. Collaudo completo, versione e Stato di AGENTS.md aggiornati, pubblicazione verificata.

Non pubblicare modifiche al gioco senza prove verdi. In caso di riconnessione, leggere `AGENTS.md`,
controllare ramo e modifiche presenti, fare pull e riprendere dai risultati verificati senza scambiare
gli artifact di sviluppo per una release pubblicata. `IOS.md` distingue packaging, compilazione,
simulatore, firma e distribuzione; una workflow scritta non equivale a una sua esecuzione riuscita.

## Fonti ufficiali consultate

- [Apple: Game controls](https://developer.apple.com/design/human-interface-guidelines/game-controls)
- [Apple: Designing for games](https://developer.apple.com/design/human-interface-guidelines/designing-for-games)
- [Apple WWDC26: Make your game great with touch](https://developer.apple.com/videos/play/wwdc2026/358/)
- [mo.co: We are so back](https://mo.co/en/news/release-notes/we-are-so-back/)
- [mo.co: May Optional Update](https://mo.co/en/news/news/may-optional-update/)
- [Brawl Stars: Teams and Friendly Battles](https://sc-brawlstars.zendesk.com/hc/en-us/articles/49526642112027-Teams-Friendly-Battles)
- [Wild Rift: Patch Notes 5.0](https://wildrift.leagueoflegends.com/en-us/news/game-updates/wild-rift-patch-notes-5-0/)
- [Activision: COD Mobile controls, 2019](https://blog.activision.com/call-of-duty/2019-10/Getting-a-Grip-on-the-Call-of-Duty-Mobile-Controls.html)
- [Apple: requisiti SDK](https://developer.apple.com/news/upcoming-requirements/)
- [Apple: App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Apple: prove sui dispositivi compatibili](https://developer.apple.com/help/app-review/before-submitting-for-review/test-compatible-devices)
- [Apple: WKWebView, loadFileURL](https://developer.apple.com/documentation/webkit/wkwebview/loadfileurl(_:allowingreadaccessto:))
- [Apple: App privacy details](https://developer.apple.com/app-store/app-privacy-details/)
- [Apple: required-reason API](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api)
