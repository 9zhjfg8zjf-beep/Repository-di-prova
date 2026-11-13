# Stato del lavoro (per riprendere dopo una pausa di contesto)
Obiettivo dell'utente: 1000 meccaniche scritte a mano (non combinazioni), tenendo le 83 esistenti e i 18 innesti.
Metodo: linguaggio dei poteri (kind 'x', programma in testo) in bricks.js (parser, Bricks.load) + core.js (run/OPS).
Dati: file mecN.js, ognuno `Bricks.load(String.raw\`...\`)`, una riga per meccanica: SLOT|Nome|costo a/b/c|ricarica|Descrizione|programma
Collaudi: node bot.js fuzz ; node tmec.js ; node tprog.js (ogni meccanica deve fare qualcosa; firme uniche per slot).
Pubblicazione: python3 build.py ; copia site/index.html in /home/claude/repository-di-prova/arena/ ; push ; artifact slug d5f413cc-d541-4431-ba5a-81719e78d74f (publish_files con base_version dell'ultima pubblicazione).
Traguardi per slot: P 170, M 130, S 500, U 200.

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
