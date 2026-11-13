# DITE

Componi cinque poteri ed esplora tre città in prima persona, tra abitanti, missioni e custodi.
Il catalogo comprende 1343 meccaniche originali. Il gioco è pensato per il telefono in orizzontale.

**[Gioca nel browser](https://9zhjfg8zjf-beep.github.io/Repository-di-prova/arena/)**

Versione web pubblicata: **[4.0 pubblicata](https://9zhjfg8zjf-beep.github.io/Repository-di-prova/arena/)**.
Deploy [Pages 43502528480](https://github.com/9zhjfg8zjf-beep/Repository-di-prova/actions/runs/43502528480) riuscito dal commit `fa40188750650989efa297216174234eb0425978`.
Verifica del sito: [report](docs/qa/4.0/published-web/report.json) e [revisione visiva](docs/qa/4.0/published-web/root-review.json).
DITE 4.0 introduce rifugio, kit e città, officina e HUD landscape, guida giocabile e registro locale.
Comandi e guida si adattano ai mancini; effetti, stati e bonus restano leggibili, con dettagli in pausa.
Dopo interruzioni o una finestra verticale il gioco richiede ripresa manuale.

Il collaudo locale comprende **33/33 prove verdi** (14 Node e 19 browser/build), più packaging 8/8.
CI finale [43497161293](https://github.com/9zhjfg8zjf-beep/Repository-di-prova/actions/runs/43497161293): 14/14 Node, 19/19 browser/build e packaging 8/8 verdi; 20/20 unitari e 6/6 UI per famiglia.
Il contenitore iOS offline è universale; firma, dispositivi fisici, privacy/supporto e distribuzione App Store
restano da completare.

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
