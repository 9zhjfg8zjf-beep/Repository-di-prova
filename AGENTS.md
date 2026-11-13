# DITE — consegna per chi continua il lavoro

Gioco privato di Matteo: un motore di meccaniche 3D "a mattoncini". Il giocatore compone un personaggio con 5 mattoncini
(primario, movimento, due abilita, suprema) e lo gioca in prima persona in una citta generata. Si gioca su iPhone in
orizzontale, a schermo intero, dall'icona sulla home: la pagina servita e `arena/index.html` (GitHub Pages).

Matteo e l'architetto: decide cosa vuole, non fa i giri di prova. Chi lavora qui progetta, costruisce e **giudica da solo
la qualita** con le prove automatiche e le foto del browser. Gli si risponde in italiano, con onesta su cosa non e riuscito.

## Regole
- Niente personaggi, nomi o grafiche protette da diritto d'autore: tutto originale, nomi da Dante (pubblico dominio).
- Tutto procedurale: nessuna immagine, modello o suono esterno. Un solo file HTML alla fine.
- Niente fuoco automatico; i poteri a interruttore devono potersi rilasciare.
- Non e uno sparatutto: citta vive, abitanti, missioni, boss con colpi annunciati a terra.
- Il repository e pubblico: non scrivere dati personali di Matteo nei file o nei commit.
- Prima di lavorare: `git pull`. Prima di ogni push: le prove qui sotto devono passare. Commit piccoli e descrittivi.
- `mec99.js` e generato (`node tbal.js scrivi`): non modificarlo a mano.

## Come si lavora (cartella `motore/`)
```
cd motore
npm install                      # three 0.128 (serve a build.py) e playwright
npx playwright install chromium  # solo per le prove nel browser (oppure CHROME=percorso di Chrome)
python3 build.py                 # crea dist/index.html e site/index.html
node tprog.js                    # ogni meccanica deve fare qualcosa, zero errori di caricamento
node bot.js fuzz 300             # partite casuali, non deve lanciare errori
node bot.js missioni 12          # bot che fanno le missioni
node bot.js boss 3               # chi schiva deve vincere spesso, chi sta fermo quasi mai
node tmec.js                     # meccaniche mirate e innesti
node tpow.js   ;  X=1 node tpow.js   # poteri nel browser vero (lento: 10-15 minuti)
node tanim.js forme|colpi|linee|zone # foto delle animazioni in shots/
node tend.js ; node tquest.js ; node ttips.js ; node tour.js boss|temi|officina
```
Per pubblicare: `python3 build.py`, copia `motore/site/index.html` su `arena/index.html`, cambia l'etichetta
"VERSIONE x.y" in `index.src.html` prima del build, commit e push. Dopo circa un minuto la pagina e aggiornata.
(Esiste anche una copia come artifact su claude.ai: la aggiorna Claude, non serve toccarla.)

Nel browser di prova il gioco gira a pochi fotogrammi al secondo: le foto servono a giudicare forme e colori,
non la fluidita. `window.__dite` espone stato e comandi per le prove (vedi in fondo a `main.js`); `lockQ = true`
ferma le missioni automatiche e salta la schermata dei consigli.

## Architettura
Nucleo di pura logica, provabile in Node, separato dal disegno (three.js r128).
- `bricks.js` — elementi (8), 83 meccaniche base, 18 innesti, **linguaggio dei poteri** (parser), costi, livelli, ricette, boss.
- `mec1.js … mec9.js` — 924 meccaniche scritte a mano, una per riga:
  `SLOT|Nome|costo a/b/c|ricarica|Descrizione|programma`. Il caricatore rifiuta doppioni di nome e di struttura.
- `mec99.js` — fattori di bilanciamento generati.
- `city.js` — citta generate (temi dite, cocito, malebolge): strade, canali, arene, cavi, missioni.
- `core.js` — simulazione: giocatore, creature, abitanti, missioni, boss, esecuzione dei programmi (`run`, `OPS`). Emette eventi.
- `world.js`, `fx.js`, `anim.js` — disegno: mondo, creature ed effetti, animazioni dei poteri per elemento e per forma.
- `ui.js` — officina (composizione del personaggio). `main.js` — ciclo, comandi a tocco, suoni, interfaccia, gestione degli eventi.
- `index.src.html` — pagina e stili; `build.py` ci incolla three.js e il gioco.
- `PIANO.md` — diario tecnico con il dettaglio di formato, operatori del linguaggio e stato.

Ordine dei file nel build: bricks, mec*, city, core, world, fx, anim, ui, main. Tutto in `'use strict'`.

## Stato: versione 3.1
Fatto: 1007 meccaniche (P 172, M 131, S 502, U 202), tre citta, 6 tipi di missione, 3 boss, officina con ricerca,
bilanciamento automatico del danno, animazioni e suoni per elemento, pausa automatica, sensibilita, consigli al primo avvio.

## Cosa manca (in ordine di valore, a giudizio di chi ha lasciato il lavoro)
1. **Mai provato su un iPhone vero**: prestazioni, comodita del tocco e audio sono ipotesi. Ogni risparmio di lavoro grafico e benvenuto.
2. **Animazioni**: dipendono da elemento e forma, non dalla singola meccanica. Le supreme meritano un'animazione propria.
   Con molti effetti vicino alla camera lo schermo puo ancora sbiancare (additivo + bloom).
3. **Mani in prima persona** ancora a blocchi (`G.buildHands` in `fx.js`): hanno i gesti, non un bel modello.
4. **Bilanciamento** delle circa 294 meccaniche di controllo e utilita: `tbal.js` misura solo il danno. Il movimento resta il gruppo piu disuguale.
5. Il compositore "da descrizione" nell'officina riconosce tipi generici, non capisce richieste libere complesse.
