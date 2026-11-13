# Stato del lavoro (per riprendere dopo una pausa di contesto)
Obiettivo attuale: ampliare le famiglie di poteri con centinaia di programmi espliciti e comportamenti reali, conservando gli archetipi e gli innesti esistenti.
Metodo: linguaggio dei poteri (kind 'x', programma in testo) in bricks.js (parser, Bricks.load) + core.js (run/OPS).
Dati: file mecN.js, ognuno `Bricks.load(String.raw\`...\`)`, una riga per meccanica: SLOT|Nome|costo a/b/c|ricarica|Descrizione|programma
Collaudi: node bot.js fuzz ; node tmec.js ; node tprog.js (ogni meccanica deve fare qualcosa; firme uniche per slot).
Pubblicazione: aggiorna versione e AGENTS.md, `python3 build.py`, copia `site/index.html` su `../arena/index.html`, prove verdi e push.
Stato e comandi obbligatori: leggere `../AGENTS.md`. Il diario sotto conserva anche le tappe precedenti.

## Stato al 12 nov 2026, sera
Fatto: linguaggio dei poteri, 1007 meccaniche (83 vecchie + 924 scritte in mec1..mec9.js), firme uniche per slot, tprog.js tutte ok ai gradi 1 e 3,
fuzz 1.47M passi in modalita' strict, campione di 170 nel browser senza errori. Officina con ricerca. Versione 3.0 pubblicata.
Da fare: bilanciamento (nessuna delle 924 e' bilanciata), effetti visivi dedicati (ora generici per forma), mani meno squadrate, prova su iPhone vero.

## Stato 3.1 (rifinitura)
- mec99.js: fattori di bilanciamento scritti da `node tbal.js scrivi` (non toccare a mano).
- anim.js (dopo fx.js): `G.elemFx` (un effetto per elemento), `G.shapeFx` (gesto per forma, `late` = colpo ritardato dal cielo), `G.shotView` (corpo dei proiettili), `G.animZones`, `G.animMobs`, `G.gesture`/`G.animHands`.
- main.js: `elSound` (voce per elemento), segno di colpo sul mirino, veli furia/fretta/riflesso, pausa automatica, sensibilita (st.sens), schermata "come si gioca" (st.tips).
- Prove nuove: tanim.js (forme|colpi|linee|zone), ttips.js.
- Non fatto: mani ancora a blocchi; mai provato su iPhone vero.

## Stato 3.2 (13 novembre 2026)
- 1343 poteri: P206, M197, S680, U260. I 336 nuovi programmi espliciti sono in mec10..mec15, marcati edition3.2.
- Ricerca su fonti primarie di Brawl Stars, Marvel, DC, My Hero Academia e altre opere; Hazbin usato come fonte tematica. Matrice e limiti in RICERCA_POTERI.md.
- 25 nuovi operatori: absorb/release, magnet, transmute, link, debt, disarm, silence, cleanse, infect, portal, tether, barrier, mimic, rewindfoe, revive, command, form, phase, flight, possess, pact, stasis, clone, scan. Contratti in POTERI_API.md.
- Corpo: taglia fisica e portata, fase con ritorno sicuro, volo guidato con quota dei colpi, ospite controllabile e corpo vulnerabile, condizioni di patto, cattura/rilascio. Ripremere termina lo stato senza un secondo costo.
- Copie vulnerabili: emissioni dirette compatibili del primario, da origini distinte, senza duplicare buff, costi, callback e reazioni. Scansione con contatti reali anche oltre muri, senza concedere mira o danni attraverso gli ostacoli.
- Persistenza e limiti: cleanup su morte/cambio ricetta, cap per entita, resistenza dei boss, fallimento senza costo quando manca una condizione necessaria. Prove causali in tnuove, tcorpo e tcloni.
- Officina: catalogo completo paginato, ricerca senza sensibilita agli accenti, 25 famiglie, filtro Novita, istruzioni e sei ricette introduttive valide al livello iniziale.
- Grafica: poteri-fx.js, risorse/durate nel HUD, portali/barriere/legami/stati, corpo originale nel possesso, sfera di stasi e rilevamento attraverso ostacoli. Superfici ampie in composizione normale e lampi limitati per ridurre l'abbagliamento.
- Prove browser riproducibili con Playwright1.56.1 e Chromium Headless Shell ufficiale. Nessun font o asset remoto richiesto dal gioco compilato.
- Baseline originale eseguita: tprog, fuzz300, missioni12, boss3, tmec e 13 comandi browser/build. Trovati un'asserzione rewind errata e test browser che non controllavano gli esiti: corretti, non nascosti.
- tbaseline.js raccoglie ora 10 comandi Node e 17 browser/build e fallisce anche su errori stampati dalle prove legacy. tend/tquest controllano realmente esiti e persistenza; tespansione confronta ogni potere nuovo ai tre gradi con un mondo senza lancio.
- Collaudo finale 3.2: tutti i 27 comandi verdi, 1008 casi differenziali e 720000 passi casuali; tutte le sei missioni completate nel browser. Calibrazione del danno applicata solo ai nuovi poteri; fattori dei 1007 precedenti conservati.
- Restano sistemi di terreno/materiali/piattaforme, copie del kit completo, contromisure sensoriali, bilanciamento dell'utilita e verifica su iPhone fisico. Non dichiarare che una semplice zona o un nome copra queste capacita.
