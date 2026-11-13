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

## Stato: 4.0 candidata mobile — collaudo locale verde

Aggiornato il 13 novembre 2026. La versione pubblicata resta **3.2**; la 4.0 e nel ramo `codex/dite-mobile`.
Titolo e interfaccia sorgente indicano 4.0, ma un artifact di sviluppo non e una release pubblicata.
Il catalogo resta di **1343 meccaniche**, senza cambi a danni o programmi in questo ciclo.

Implementati rifugio e navigazione coerente, scelta kit/citta, HUD e officina landscape, preferenze di comandi,
audio, qualita e comfort. Router unico con ritorno al pannello chiamante, pulizia input, pausa esplicita dopo
background e rotazione, cambio citta con recupero dagli errori. Storage schema 3 condiviso web/iOS, migrazioni
e indicazione onesta dell'esito di salvataggio. I vecchi profili conservano il kit e non avviano automaticamente la guida.

Primo ingresso con Dardo, Scatto, Scudo, Nova e Cataclisma con costo 8 sul budget iniziale di 12; guida breve, saltabile e riprendibile,
che avanza su azioni del gioco. Aiuto riapribile e registro delle ultime 32 imprese reali, senza premi o progressi fittizi.
Rendering fermo nei menu, profili grafici e comfort, correzione del rilascio risorse e delle zone mobili/crescenti.
Sisma mantiene preavvisi e scoppi vicino al terreno, senza generare fulmini dal cielo all'impatto.
I corpi dei proiettili del giocatore sfumano vicino alla camera; i colpi nemici conservano il proprio corpo visibile.
I fasci hanno larghezza apparente limitata e nucleo colorato, con attenuazione dei bagliori e rispetto di Lampi ridotti.
L'HUD degli stati del potere occupa al massimo tre righe: oltre tre stati mostra i primi due e il conteggio
degli altri, mantenendo prioritari corpo alternativo e stasi. In pausa, Stati del potere riporta nomi, tempi,
risorse e istruzioni di rilascio. Il riepilogo separato dei bonus mostra un solo effetto prioritario e `+N`;
copre invulnerabilita, riflessione, Fenice, occultamento, cura nel tempo, furia, velocita e orbite.
Potenziamenti in pausa usa lo stesso elenco dei bonus rilevati, con nomi completi e secondi residui reali.
I timer restano fermi insieme alla simulazione. Comandi mancini sposta movimento a destra, poteri a sinistra,
rispecchia i gruppi HUD e adatta le istruzioni della guida. Il coach segue il lato scelto e nasconde il solo
promemoria di ricerca missione quando nessuna missione e attiva.

Preparato contenitore iOS 17+, versione applicazione 4.0/build 1: WKWebView con HTML locale completo,
rete del gioco bloccata, bridge versionato per lifecycle/salvataggio/haptic e JSON atomico con copie di recupero.
Generazione deterministica del progetto, sincronizzazione bundle/licenza/checksum e workflow macOS presenti.
La distribuzione non e predisposta: identificatore tecnico unsigned, nessun Team/certificato/profilo configurato.

Verifiche gia svolte in questo ciclo: baseline 3.2 prima degli edit; prove mirate storage (19), router
(11 casi e 2000 transizioni), guida (17), registro (11); 8 prove Linux di packaging/metadati iOS.
**Collaudo locale finale verde: 33 comandi, 14 Node e 19 browser/build**, entrambe le sequenze concluse con esito 0.
Log della sessione: `/tmp/dite-final3-node.log` e `/tmp/dite-final9-browser.log`. Foto campione finali controllate
e approvate, senza regressioni concrete rilevate. Verdi anche le 8 prove di packaging iOS e i controlli
di aggiornamento del progetto, sincronizzazione bundle e asset. Candidata 4.0 locale pronta per il push.

| File verificato | SHA256 |
| --- | --- |
| `motore/dist/index.html` | `eb83e58dec2afd966427b73299ad36f6113b957da2e74b073e76f5984787de22` |
| `motore/site/index.html` | `5d7a465b48b93e4f299723ff2a263997be720409bde0122b07a325a954b3be1c` |
| `motore/core.js` | `503a2903f3f302782e35183e859679d530443c9c56f6adeafa990a5e4a766190` |

Compilazione Swift, XCTest e schermate iOS su macOS ancora da eseguire; nessun risultato su dispositivi fisici.
La versione pubblicata resta 3.2: dopo il push verificare il deploy e registrare la versione realmente servita.

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

1. **Pubblicare la candidata verificata**: trasferire i bundle con i checksum sopra, completare push e deploy,
   poi verificare la versione servita. Il collaudo locale dei 33 comandi e la revisione delle foto sono conclusi.
2. **Eseguire davvero la pipeline macOS**: compilazione Swift, XCTest iPhone/iPad, screenshot, rotazione,
   tastiera, lifecycle, avvio offline, persistenza e recupero. Conservare link, commit e artifact della CI riuscita.
3. **Prestazioni e comportamento fisico**: misurare frame time, memoria, calore, batteria, multi-touch,
   silenzioso/Bluetooth e interruzioni su dispositivi accessibili. Chromium software non certifica fluidita o audio iPhone;
   non chiedere all'utente di sostituirsi al collaudo.
4. **Firma e distribuzione**: identificatore definitivo, Apple Developer/Team, certificati e provisioning,
   build distribuibile, TestFlight e revisione App Store. Una build unsigned non completa questi passaggi.
5. **Privacy e supporto**: pubblicare policy con titolare reale e copia consultabile nell'app, supporto funzionante,
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
