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
npm ci                           # three 0.128 e Playwright 1.56.1 fissati nel lockfile
npx playwright install chromium-headless-shell # browser ufficiale; oppure CHROME=percorso di Chrome
python3 build.py                 # crea dist/index.html e site/index.html
node tbaseline.js all            # collaudo obbligatorio completo: 10 prove Node + 17 browser/build
# Si possono eseguire separatamente: node tbaseline.js node ; node tbaseline.js browser
# I comandi individuali sotto servono a isolare un problema:
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
```
Il runner fallisce anche se una vecchia prova stampa errori ma restituisce codice 0.
`tend` verifica vittoria, ricompensa salvata, morte e respawn; `tquest` verifica tutti e sei i tipi di missione.
Le prove nuove usano condizioni osservabili e avanzamento della simulazione: i secondi di attesa del browser
non equivalgono ai secondi di gioco quando il rendering software e lento.
Le fotografie sono in `shots/`; i campioni `tpow` base e DSL hanno cartelle separate per non sovrascriversi.

Per calibrare solo i nuovi poteri: `node tbal.js scrivi nuovi`. Misura il contributo di danno, **non** il valore di
controllo, cura, informazione e mobilita; conserva i fattori degli altri poteri. Dopo la generazione rifare le prove.
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
- `mec10.js … mec15.js` — 336 nuove meccaniche esplicite, marcate `edition: '3.2'`.
- `mec99.js` — fattori di bilanciamento generati.
- `catalogo.js` — famiglie e tag ricavati anche dai programmi annidati, ricerca, sei ricette introduttive.
- `city.js` — citta generate (temi dite, cocito, malebolge): strade, canali, arene, cavi, missioni.
- `core.js` — simulazione: giocatore, creature, abitanti, missioni, boss, esecuzione dei programmi (`run`, `OPS`). Emette eventi.
- `world.js`, `fx.js`, `anim.js` — disegno: mondo, creature ed effetti, animazioni dei poteri per elemento e per forma.
- `poteri-fx.js` — portali, barriere, legami, stati, corpo posseduto, cattura, rilevamento e indicatori persistenti.
- `ui.js` — officina (composizione del personaggio). `main.js` — ciclo, comandi a tocco, suoni, interfaccia, gestione degli eventi.
- `index.src.html` — pagina e stili; `build.py` ci incolla three.js e il gioco.
- `PIANO.md` — diario tecnico con il dettaglio di formato, operatori del linguaggio e stato.
- `POTERI_API.md` — contratti, limiti, stato e cleanup dei nuovi operatori.
- `RICERCA_POTERI.md` — fonti primarie, matrice delle famiglie e lacune reali; non confondere un nome con una capacita implementata.

Ordine dei file nel build: bricks, mec*, catalogo, city, core, world, fx, anim, poteri-fx, ui, main. Tutto in `'use strict'`.

## Stato: versione 3.2
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
1. **Terreno e materia**: distruzione/deformazione della citta, superfici elastiche, piattaforme percorribili,
   materiali raccoglibili e trasformabili. Richiedono collisioni, percorsi e grafica coerenti, non semplici zone colorate.
2. **Copie e sensi avanzati**: corpi separati con kit completo, contromisure al rilevamento, informazioni false.
   La matrice in `RICERCA_POTERI.md` distingue quanto c'e da quanto resta aperto.
3. **Bilanciamento di controllo e utilita**: i test provano il comportamento; la stima del danno non dimostra equita
   fra difese, mobilita, evocazioni e informazione. Servono scenari di confronto dedicati.
4. **Mai provato su un iPhone fisico**: il browser touch a 844x390 verifica layout e comandi, non prestazioni/audio reali.
5. **Animazioni personali delle supreme e mani**: molti gesti dipendono ancora da elemento/forma; mani ancora a blocchi.
   Le grandi superfici sono piu leggibili, ma molti anelli e il bloom possono ancora saturare localmente.
6. Il compositore "da descrizione" riconosce tipi generici, non richieste libere complesse.
