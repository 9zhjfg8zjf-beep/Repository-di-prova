# DITE

Componi cinque poteri ed esplora tre città in prima persona, tra abitanti, missioni e custodi.
Il catalogo comprende 1343 meccaniche originali. Il gioco è pensato per il telefono in orizzontale.

**[Gioca nel browser](https://9zhjfg8zjf-beep.github.io/Repository-di-prova/arena/)**

La versione pubblicata è **3.2**. La **4.0 candidata** introduce un nuovo rifugio, comandi e interfaccia mobile,
guida giocabile, registro locale e preparazione iOS offline. Gli effetti vicini alla visuale sono più contenuti;
i bonus mostrano un riepilogo nel gioco e nomi e tempi residui in pausa. Le 14 prove Node finali sono verdi;
il collaudo browser finale è in corso. Compilazione Swift, simulatori e dispositivi fisici restano da verificare.

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
