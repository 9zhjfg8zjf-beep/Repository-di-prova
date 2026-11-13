# DITE — consegna per chi continua il lavoro

Un motore di meccaniche 3D "a mattoncini". Il giocatore compone un personaggio con 5 mattoncini
(primario, movimento, due abilita, suprema) e lo gioca in prima persona in una citta generata. Il target e il telefono
in orizzontale. La pagina pubblicata e `arena/index.html` (GitHub Pages); il contenitore iOS offline e in preparazione.

Matteo e l'architetto: decide cosa vuole, non fa i giri di prova. Chi lavora qui progetta, costruisce e **giudica da solo
la qualita** con le prove automatiche e le foto del browser. Gli si risponde in italiano, con onesta su cosa non e riuscito.

## Regole

- Niente personaggi, nomi o grafiche protette da diritto d'autore: tutto originale, nomi da Dante (pubblico dominio).
- Grafica di gioco e suoni procedurali; marchio e icone originali generati dai sorgenti in `assets/`.
  Il gioco offline e un solo HTML con motore incluso: niente CDN o asset remoti.
- Niente fuoco automatico; i poteri a interruttore devono potersi rilasciare.
- Non e uno sparatutto: citta vive, abitanti, missioni, boss con colpi annunciati a terra.
- Il repository e pubblico: non scrivere dati personali di Matteo nei file o nei commit.
- Prima di lavorare: `git pull`. Prima di ogni push: le prove qui sotto devono passare. Commit piccoli e descrittivi.
- `mec99.js` e generato (`node tbal.js scrivi`): non modificarlo a mano.
- Anche `ios/DITE/Resources/Game/` e il progetto Xcode sono generati: usare gli script indicati in `IOS.md`.

## Come si lavora (cartella `motore/`)

```sh
cd motore
npm ci                           # three 0.128 e Playwright 1.56.1 fissati nel lockfile
npx playwright install chromium-headless-shell # browser ufficiale; oppure CHROME=percorso di Chrome
python3 build.py                 # crea dist/index.html e site/index.html
node tbaseline.js all            # collaudo obbligatorio completo: 33 comandi, 14 Node + 19 browser/build
# Si possono eseguire separatamente: node tbaseline.js node ; node tbaseline.js browser
# I comandi individuali sotto servono a isolare un problema:
node tstorage.js ; node tappstate.js # migrazioni, errori di persistenza e transizioni
node tonboarding.js ; node tjournal.js # azioni reali della guida e risultati del registro
node tprog.js                    # ogni meccanica deve fare qualcosa, zero errori di caricamento
node bot.js fuzz 300             # partite casuali, non deve lanciare errori
node bot.js missioni 12          # bot che fanno le missioni
node bot.js boss 3               # chi schiva deve vincere spesso, chi sta fermo quasi mai
node tmec.js                     # meccaniche mirate e innesti
node tnuove.js ; node tcorpo.js ; node tcloni.js # contratti semantici e ciclo di vita
node tcatalogo.js ; node tespansione.js # indice, ricette, 336 nuovi poteri ai tre gradi + fuzz
node tpow.js   ;  X=1 node tpow.js   # poteri nel browser vero (lento: 10-15 minuti)
node tanim.js forme ; node tanim.js colpi ; node tanim.js linee ; node tanim.js zone
node tend.js ; node tquest.js ; node ttips.js
node tour.js boss ; node tour.js temi ; node tour.js officina
node tofficina.js ; node tvis.js ; node tcorpo_browser.js ; node tsensi_browser.js
node tmobile_browser.js ; node trendering.js # navigazione, input touch, sospensione e risorse
```
Il runner fallisce anche se una vecchia prova stampa errori ma restituisce codice 0.
`tend` verifica vittoria, ricompensa salvata, morte e respawn; `tquest` verifica tutti e sei i tipi di missione.
Le prove nuove usano condizioni osservabili e avanzamento della simulazione: i secondi di attesa del browser
non equivalgono ai secondi di gioco quando il rendering software e lento.
Le fotografie sono in `shots/`; i campioni `tpow` base e DSL hanno cartelle separate per non sovrascriversi.
La regressione tipografica mobile richiede DejaVu Sans installato (`fonts-dejavu-core` su Debian/Ubuntu):
verifica il font realmente usato dal browser e rifiuta un fallback silenzioso.

Per calibrare solo i nuovi poteri: `node tbal.js scrivi nuovi`. Misura il contributo di danno, **non** il valore di
controllo, cura, informazione e mobilita; conserva i fattori degli altri poteri. Dopo la generazione rifare le prove.
Per pubblicare: aggiornare titolo ed etichetta di versione in `index.src.html`, la sezione **Stato** qui e il README;
generare il build, completare il collaudo verde e copiare `motore/site/index.html` in `arena/index.html`.
Verificare anche manifest e icone della variante web, quindi commit piccoli e push. Controllare l'esito del deploy
e la versione realmente servita: il tempo trascorso non dimostra una pubblicazione riuscita.

La preparazione iOS usa **`motore/dist/index.html`**, senza i riferimenti PWA a manifest e icona separati.
Dalla radice del repository, dopo il build:

```sh
python3 scripts/generate_assets.py --check
python3 scripts/ios_sync.py
python3 scripts/ios_project.py
python3 scripts/ios_test.py
python3 scripts/ios_sync.py --check
python3 scripts/ios_project.py --check
```

Queste prove di packaging Linux sono aggiuntive ai 33 comandi; non compilano Swift e non eseguono XCTest.
La CI macOS e `scripts/ci_ios.sh iphone` / `ipad` preparano build unsigned e prove su simulatore.
Registrare il risultato di esecuzione, non dedurlo dalla presenza del workflow. Dettagli e limiti in `IOS.md`.

Nel browser di prova il gioco gira a pochi fotogrammi al secondo: le foto servono a giudicare forme e colori,
non la fluidita. `window.__dite` espone stato, router, input, comandi e `renderOnce` per le prove
(vedi in fondo a `main.js`). Una scena modificata in pausa richiede un disegno esplicito; il rendering continuo
e fermo. `lockQ = true` ferma le missioni automatiche e nasconde la guida iniziale nei test.

## Architettura

Nucleo di pura logica, provabile in Node, separato dal disegno (three.js r128).

- `bricks.js` — elementi (8), 83 meccaniche base, 18 innesti, **linguaggio dei poteri** (parser), costi, livelli, ricette, boss.
- `mec1.js … mec9.js` — 924 meccaniche scritte a mano, una per riga:
  `SLOT|Nome|costo a/b/c|ricarica|Descrizione|programma`. Il caricatore rifiuta doppioni di nome e di struttura.
- `mec10.js … mec15.js` — 336 nuove meccaniche esplicite, marcate `edition: '3.2'`.
- `mec99.js` — fattori di bilanciamento generati.
- `catalogo.js` — famiglie e tag ricavati anche dai programmi annidati, ricerca, sei ricette introduttive.
- `city.js` — citta generate (temi dite, cocito, malebolge): strade, canali, arene, cavi, missioni.
- `core.js` — simulazione: giocatore, creature, abitanti, missioni, boss, esecuzione dei programmi (`run`, `OPS`). Emette eventi.
- `onboarding.js` — osserva movimento, mira, primario, abilita e accettazione di una missione reali; checkpoint e salto
  distinti. Kit introduttivo solo per nuovi profili, mai sopra una ricetta esistente. Non modifica il Core.
- `journal.js` — registro locale dei veri eventi `questDone`/`bossDown` e della fama assegnata: totali e ultimi 32 risultati.
  Non ricostruisce imprese dalla fama precedente e non salva posizioni o fotogrammi.
- `storage.js` — normalizzazione/migrazione schema 3, ricette, preferenze, guida e registro; backend web o bridge iOS.
  Distingue dati in memoria, scrittura in corso, salvataggio riuscito ed errore; nativo confermato solo dopo ack.
- `app-state.js` — router puro, destinazione di ritorno, sessione e motivi di sospensione. Togliere un blocco non
  riprende automaticamente il gioco. Nessuna schermata deve gestire un secondo stato di pausa indipendente.
- `world.js`, `fx.js`, `anim.js` — disegno: mondo, creature ed effetti, animazioni dei poteri per elemento e per forma.
- `poteri-fx.js` — portali, barriere, legami, stati, corpo posseduto, cattura, rilevamento e indicatori persistenti.
- `ui.js` — rifugio, scelta kit/citta, officina, impostazioni, guida e registro; presenta il modello fornito da main.
- `main.js` — integra router, simulazione, input touch/tastiera, audio, persistenza, lifecycle e caricamento citta;
  azzera puntatori, capture e buffer quando il gioco perde attivita. Rendering solo quando attivo o invalidato.
- `index.src.html` — pagina e stili landscape con safe area; `build.py` incorpora three.js, marchio e moduli.
- `assets/`, `scripts/generate_assets.py` — marchio originale e generazione delle icone web/native.
- `ios/`, `scripts/ios_*.py`, `scripts/ci_ios.sh` — contenitore Swift/UIKit con WKWebView, bridge limitato,
  salvataggio JSON atomico con recupero, bundle offline con checksum e pipeline di collaudo nativo.
- `MOBILE_PRODUCTION.md`, `IOS.md` — audit mobile, criteri di accettazione, protocollo nativo e verifiche ancora aperte.
- `PIANO.md` — diario tecnico con il dettaglio di formato, operatori del linguaggio e stato.
- `POTERI_API.md` — contratti, limiti, stato e cleanup dei nuovi operatori.
- `RICERCA_POTERI.md` — fonti primarie, matrice delle famiglie e lacune reali; non confondere un nome con una capacita implementata.

Ordine dei file nel build: bricks, mec*, catalogo, city, core, onboarding, journal, storage, app-state,
world, fx, anim, poteri-fx, ui, main. Tutto in `'use strict'`. Gli export CommonJS devono restare su una riga
con guardia indipendente `if (typeof module !== 'undefined') ...`, rimossa dal build per il browser.

## Stato: 4.0 candidata 17 — collaudo funzionale verde, revisione visiva aperta

Aggiornato il 13 novembre 2026. Pubblicata ancora **3.2**, main
`5a50c8f70e2f214b0b6d3a704e24d39765262476`; la 4.0 e nel ramo `codex/dite-mobile`.
Il catalogo resta di 1343 meccaniche. Il ciclo include una correzione di due righe per Sisma nel Core;
il checksum sotto identifica lo stato verificato.

Rifugio, kit/citta, officina e HUD landscape usano un router unico. Input touch/pen e capture vengono
azzerati alle interruzioni; background, rotazione e canvas verticale richiedono ripresa esplicita.
La guardia osserva il canvas. Audio senza retry infinito, rendering fermo nei menu e recupero manuale
dagli errori. Preferenze per mancini, sensibilita, grafica e comfort; nomi lunghi contenuti nell'officina.
Guida basata sulle azioni reali, saltabile e riprendibile anche con una missione attiva; registro locale
delle ultime 32 imprese. Storage schema 3 conserva kit/progressi e conferma il salvataggio nativo dopo ack.
Stati e bonus sono compatti nell'HUD e completi in pausa; timer fermi con la simulazione. Coach e HUD
mantengono leggibile la missione, mentre effetti vicini alla visuale e lampi sono contenuti.

Il contenitore iOS 17+, versione 4.0/build 1, carica il bundle offline con bridge limitato e salvataggio
atomico con recupero. Target universale: due landscape per iPhone, quattro orientamenti dichiarati iPad.
La preparazione e unsigned; account/Team, firma e distribuzione App Store non sono configurati.

Il gate locale della web 17 e verde: **14 Node + 19 browser/build, 33/33**, esito 0 nei log
`/tmp/dite-final17-node.log` e `/tmp/dite-final17-browser.log`; packaging 8/8, sync, progetto e asset verdi.
La settima CI [43488987332](https://github.com/9zhjfg8zjf-beep/Repository-di-prova/actions/runs/43488987332), commit `066f8f7d3d851306ce44cf00b973952917dba1ab`, conferma:

| Verifica | Esito CI7 |
| --- | --- |
| Node, browser/build, packaging | 14/14, 19/19 e 8/8 verdi |
| iPhone | 20/20 unitari e 6/6 UI verdi |
| iPad | 20/20 unitari e 6/6 UI verdi |
| Orientamento e tastiera | landscapeRight all'avvio, live landscapeLeft, nuovo avvio landscapeLeft e officina/tastiera verdi su entrambi |
| Home e ripresa | Stati OS reali 4 → 3 → 4 su entrambi, pausa al ritorno e ripresa esplicita verdi |

**La revisione visiva finale non passa**: fra i 26 PNG originali della CI7, la lobby iPad
`F1DF7132-A72D-4969-95B5-0B55040AAD3C.png` e interamente uniforme RGB (9, 8, 11). La causa non e provata.
Una guardia nativa sui pixel e in preparazione e deve essere verificata nella CI8: centro 80%, campione
64×64 RGB, contrasto almeno 16 e attesa fino a 20 secondi senza azioni, con snapshot falliti e metriche.
Non dichiarare gia verificata questa guardia o approvato il set visivo.

| File della candidata 17 | SHA256 |
| --- | --- |
| `motore/dist/index.html` e bundle iOS | `95849cc1c7675cb0b4ac25133845bc17d40acd499023fd812c94183dd6c8fe34` |
| `motore/site/index.html` e `arena/index.html` | `4fa61a6d2776915466de8b318cb1c589e6577cde048f5919436dfe4c53d6b03a` |
| `motore/core.js` | `503a2903f3f302782e35183e859679d530443c9c56f6adeafa990a5e4a766190` |

Provenienza: originali in `ios-run43488987332` nel workspace. La selezione finale prevista di 15 PNG,
manifest e TXT in `docs/qa/4.0` e ancora da creare dopo collaudo e revisione visiva riusciti.
Il selettore scratch rifiuta PNG uniformi/trasparenti preservando originali ed EXIF; le sue 31 fixture verdi
non sono il gate della build. Sonde native solo DEBUG/`--ui-testing`, traccia JS opt-in.
Restano prove fisiche, firma e account/Team, TestFlight, privacy/supporto e metadati reali; nessuna verifica
di Minimize in Windowed Apps. Chromium e simulatore non certificano prestazioni o audio su hardware.

## Stato storico: versione 3.2

1343 meccaniche (P 206, M 197, S 680, U 260): 83 archetipi e 1260 programmi espliciti, di cui **336 nuovi**.
Restano tre citta, sei tipi di missione, tre boss, otto elementi e diciotto innesti.

Nuove interazioni: assorbimento e spesa di energia, deviazione e conversione dei proiettili, condivisione dei danni,
debito differito, disarmo, silenzio, purificazione, contagio, portali riutilizzabili, vincoli, barriere fisiche,
imitazione del primario, riavvolgimento nemico, rianimazione e ordini agli alleati. Inoltre taglia reale, fase,
volo guidato, possesso diretto con corpo vulnerabile, patti condizionali, cattura, cloni sincronizzati e rilevamento
attraverso ostacoli. Le copie replicano solo emissioni dirette compatibili del primario: non l'intero kit.

Officina: 25 famiglie combinabili con ricerca e filtro Novita; nessun limite nascosto a 70 risultati;
paginazione, sei ricette pronte entro il budget iniziale, istruzioni per i controlli particolari.
Grafica: segni persistenti dedicati, indicatori del corpo e delle risorse, proiettili alla quota corretta;
superfici ampie non additive e lampi limitati vicino alla camera. Rimossi i font remoti: pagina autosufficiente.
Correzioni: combo storiche `nth2/3/4` realmente eseguite, operatori sconosciuti rifiutati, prova rewind corretta,
uscita sicura dalla fase, blocco delle Eco incompatibili, collisione barriera/ostacolo, ricompense e missioni verificate.

Collaudo finale del 13 novembre 2026: `tbaseline.js node` e `tbaseline.js browser` entrambi verdi
(10 comandi Node + 17 browser/build, equivalenti a `tbaseline.js all`). Tutti i 1343 poteri caricati senza
errori; 1008 casi differenziali dei 336 nuovi poteri ai tre gradi, 71 prove semantiche dei nuovi operatori
e 720000 passi casuali complessivi. Nel browser: 53 kit, quattro gruppi di animazioni, vittoria/respawn,
tutti e sei i tipi di missione, officina touch e nuovi stati con attivazione, rilascio e pulizia verificati.
Foto controllate per catalogo, portali/barriere/legami, corpo, copie e rilevamento. Il collaudo usa Chromium
Headless Shell con rendering software; non sostituisce una misura delle prestazioni su iPhone fisico.
Calibrazione del danno eseguita sui 336 nuovi programmi; fattori dei 1007 precedenti invariati.

## Cosa manca

Prima di considerare la 4.0 distribuibile:

1. **CI8, revisione visiva e pubblicazione**: verificare la guardia nativa contro catture vuote, mantenere
   verdi le prove e approvare gli originali visivi. Solo dopo procedere a pubblicazione e verifica della
   versione servita. Pubblicata ancora 3.2.
2. **Prestazioni e comportamento fisico**: misurare frame time, memoria, calore, batteria, multi-touch,
   silenzioso/Bluetooth e interruzioni su dispositivi accessibili. Chromium software non certifica fluidita o audio iPhone;
   non chiedere all'utente di sostituirsi al collaudo.
3. **Firma e distribuzione**: identificatore definitivo, Apple Developer/Team, certificati e provisioning,
   build distribuibile, TestFlight e revisione App Store. Una build unsigned non completa questi passaggi.
4. **Privacy e supporto**: pubblicare policy con titolare reale e copia consultabile nell'app, supporto funzionante,
   dichiarazioni App Store, eta, export e altri metadati effettivi. Manifest privacy, policy e dichiarazioni sono distinti;
   nessun contatto o dato personale inventato. I dettagli aperti sono in `IOS.md`.

Per lo sviluppo del gioco dopo questo ciclo:

1. **Terreno e materia**: distruzione/deformazione della citta, superfici elastiche, piattaforme percorribili,
   materiali raccoglibili e trasformabili. Richiedono collisioni, percorsi e grafica coerenti, non semplici zone colorate.
2. **Copie e sensi avanzati**: corpi separati con kit completo, contromisure al rilevamento, informazioni false.
   La matrice in `RICERCA_POTERI.md` distingue quanto c'e da quanto resta aperto.
3. **Bilanciamento di controllo e utilita**: i test provano il comportamento; la stima del danno non dimostra equita
   fra difese, mobilita, evocazioni e informazione. Servono scenari di confronto dedicati.
4. **Animazioni personali delle supreme e mani**: molti gesti dipendono ancora da elemento/forma; mani ancora a blocchi.
   Le grandi superfici sono piu leggibili, ma molti anelli e il bloom possono ancora saturare localmente.
5. Il compositore "da descrizione" riconosce tipi generici, non richieste libere complesse.
