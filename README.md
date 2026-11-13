# DITE

Componi cinque poteri ed esplora tre città in prima persona, tra abitanti, missioni e custodi.
Il catalogo comprende 1343 meccaniche originali. Il gioco è pensato per il telefono in orizzontale.

**[Gioca nel browser](https://9zhjfg8zjf-beep.github.io/Repository-di-prova/arena/)**

La versione pubblicata è **3.2**. La **4.0 candidata 17** introduce rifugio, kit/città, officina e HUD
landscape, guida giocabile, registro locale e contenitore iOS offline. Comandi e guida si adattano ai mancini;
stati e bonus hanno dettagli in pausa. Dopo interruzioni o una finestra verticale serve ripresa manuale.

Il collaudo funzionale è verde: 33/33 prove locali e packaging 8/8; la [settima CI](https://github.com/9zhjfg8zjf-beep/Repository-di-prova/actions/runs/43488987332)
supera 14 Node, 19 browser/build, packaging 8 e, su ogni famiglia iPhone/iPad, 20 unitari e 6 UI.
Home con vero background, ripresa esplicita, orientamenti e tastiera sono verificati sui simulatori.
**La revisione visiva resta aperta**: una cattura della lobby iPad è uniforme, con causa non ancora provata.
La guardia nativa contro catture vuote attende la CI8; il set QA finale non è stato creato.
Prove fisiche, firma, privacy/supporto e distribuzione App Store restano da completare.

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
