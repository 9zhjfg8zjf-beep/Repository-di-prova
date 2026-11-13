# DITE

Componi cinque poteri ed esplora tre città in prima persona, tra abitanti, missioni e custodi.
Il catalogo comprende 1343 meccaniche originali. Il gioco è pensato per il telefono in orizzontale.

**[Gioca nel browser](https://9zhjfg8zjf-beep.github.io/Repository-di-prova/arena/)**

La versione pubblicata è **3.2**. La **4.0 candidata** introduce un nuovo rifugio, comandi e interfaccia mobile,
guida giocabile, registro locale e preparazione iOS offline. Gli effetti vicini alla visuale sono più contenuti;
stati e bonus hanno riepiloghi compatti e dettagli in pausa. Comandi e guida si adattano alla modalità mancini.
La guida può ricominciare con una missione già attiva, conservandola visibile e senza richiedere un nuovo incarico.
La **candidata 17** aggiunge la pausa nelle finestre verticali, con ripresa manuale, e conserva il recupero
dei tocchi sul menu introdotto nella candidata 16.
La candidata supera **33/33 prove locali attuali** (14 Node e 19 browser/build), più packaging 8/8
e verifiche di sincronizzazione, progetto e asset.
La [quinta CI](https://github.com/9zhjfg8zjf-beep/Repository-di-prova/actions/runs/43480792340) conferma
14 Node, packaging 8/8 e bundle. La Release iOS universale compila,
ma entrambe le build Debug si fermano prima di XCTest: nessun test nativo eseguito e nessuna foto prodotta.
Le conversioni Swift sono corrette in questo ramo; la sesta CI ripeterà l'intera suite.
Il codice web verificato resta identico.
Orientamento, background e tastiera del target universale, prove fisiche e distribuzione restano da verificare.

Per lavorare sul progetto, leggere prima [AGENTS.md](AGENTS.md): contiene architettura, stato e regole di pubblicazione.
Il piano mobile è in [MOBILE_PRODUCTION.md](MOBILE_PRODUCTION.md); pipeline nativa e passaggi ancora necessari
per distribuire l'app sono in [IOS.md](IOS.md).

```sh
git pull
cd motore
npm ci
npx playwright install chromium-headless-shell
python3 build.py
node tbaseline.js all
```

Il collaudo comprende **33 comandi: 14 Node e 19 browser/build**. Le prove iOS sono separate.
`motore/` contiene i sorgenti; il build genera `motore/dist/index.html` per il bundle offline e
`motore/site/index.html` per il sito. `arena/` contiene la pagina pubblicata; `ios/` il progetto nativo.
