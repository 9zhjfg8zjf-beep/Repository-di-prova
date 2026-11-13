# DITE

Componi cinque poteri ed esplora tre città in prima persona, tra abitanti, missioni e custodi.
Il catalogo comprende 1343 meccaniche originali. Il gioco è pensato per il telefono in orizzontale.

**[Gioca nel browser](https://9zhjfg8zjf-beep.github.io/Repository-di-prova/arena/)**

La versione pubblicata è **3.2**. La **4.0 candidata** introduce un nuovo rifugio, comandi e interfaccia mobile,
guida giocabile, registro locale e preparazione iOS offline. Gli effetti vicini alla visuale sono più contenuti;
stati e bonus hanno riepiloghi compatti e dettagli in pausa. Comandi e guida si adattano alla modalità mancini.
La **4.0 supera 33/33 comandi anche in CI**, oltre al packaging; il collaudo iOS è ancora in diagnosi.
La guida può ricominciare con una missione già attiva, conservandola visibile e senza richiedere un nuovo incarico.
L'avvio iOS è risolto: build unsigned e 20 unitari per famiglia verdi, con gameplay animato.
Sono riusciti 2 dei 6 test UI per famiglia; i quattro rimanenti richiedono una nuova CI. Dispositivi fisici e distribuzione restano da verificare.

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
