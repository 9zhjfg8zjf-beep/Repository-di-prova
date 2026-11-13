Bricks.load(String.raw`
# ===== ABILITA: controllo del bersaglio =====
S|Strattone|a|6|Tiri a te il bersaglio mirato.|tgt yank d10/13/16
S|Strattone e pugno|b|7|Lo tiri a te e lo stordisci.|tgt yank d14/18/22 stun1
S|Lancio|b|8|Scagli via il bersaglio: esplode dove atterra.|tgt fling34/43/52
S|Sollevamento|b|8|Sollevi il bersaglio e lo lasci cadere.|tgt lift2/2.4/2.8:30
S|Rimpicciolimento|b|10|Il bersaglio diventa piccolo e innocuo, e subisce di piu.|tgt poly4/5/6 mark1.4:6
S|Tradimento|b|11|Il bersaglio passa dalla tua parte.|tgt charm7/9/11
S|Tradimento esplosivo|c|12|Il bersaglio combatte per te; attorno a lui tutti restano scossi.|tgt charm6/7/8 then(circ @tgt r5 weak5 d8/10/12)
S|Presa del burattinaio|c|12|Due nemici vicini al punto che guardi passano con te.|circ @aim g16 r5 max2 charm6/7/8
S|Panico di massa|c|12|Attorno al bersaglio tutti scappano.|tgt fear2 then(circ @tgt r7 fear3/3.5/4)
S|Capro espiatorio|b|9|Marchi il bersaglio: ogni colpo che riceve ti cura un poco.|tgt mark1.35:6 then(trig hit t6 icd.3 do(heal v2/2.5/3))
S|Bersaglio prioritario|b|9|Marchi forte un solo nemico e gli mandi contro i tuoi spiriti.|tgt mark1.5:8 then(sum spirito n2 @tgt far2 t8 hp35 d9/11/13)
S|Scambio di posto crudele|b|8|Vi scambiate di posto e lui resta stordito.|tgt swap stun1.2/1.5/1.8
S|Scambio e inferno|c|9|Vi scambiate di posto; dove eri tu c'e un cerchio di fuoco.|zone r4 t4 dps14/18/22; tgt swap
S|Calamita umana|b|8|Tiri verso il bersaglio tutti i suoi vicini.|tgt d8/10/12 then(circ @tgt r8 pull18)
S|Palla da bowling|c|9|Scagli il bersaglio; dove atterra, tutti vengono spinti via.|tgt fling26/33/40 then(circ @fwd8 r5 push14 d10/13/16 in.6)
S|Chiodo|b|8|Blocchi il bersaglio e lo marchi.|tgt d8/10/12 root2.5 mark1.3:5
S|Tortura|b|9|Fuoco, veleno e debolezza sullo stesso bersaglio.|tgt d6/8/10 burn10 pois4 weak6
S|Ibernazione|b|10|Congeli all'istante il bersaglio mirato.|tgt d8/10/12 chill5 slow.6:5
S|Giudizio lento|b|9|Marchi il bersaglio; tra due secondi gli cade addosso un colpo enorme.|tgt mark1.2:3; circ @tgt r3.5 d55/70/85 in2
S|Legame di sangue|c|11|Colpisci il bersaglio e ti curi di tutto il danno fatto.|tgt d30/38/46 ls1
S|Furto|b|9|Togli vita al bersaglio e la prendi tu, con uno scudo.|tgt d20/25/30 ls.6 sh12/15/18
S|Prosciugare|b|10|Colpo sul bersaglio che carica molta Risonanza.|tgt d18/23/28 res14/18/22
S|Colpo che resetta|c|12|Se il colpo uccide, i poteri tornano subito pronti.|tgt d34/43/52 ex1.5 then(trig kill t.4 n1 do(cdr all))
S|Presa e schianto|c|10|Sollevi il bersaglio; quando cade, esplode.|tgt lift1.6:20 then(circ @tgt r4.5 d26/33/40 in1.6)
S|Trascinamento|c|10|Tiri a te tre nemici davanti.|cone r12 h.5 max3 yank d10/13/16
S|Spazzata telecinetica|c|11|Scagli via tutti quelli davanti a te.|cone r7 h.7 fling20/25/30
S|Sollevamento di massa|c|11|Sollevi tutti attorno a te.|circ r6 lift1.8/2.2/2.6:22
S|Rimpicciolimento di massa|c|13|Rimpicciolisci tutti quelli nel cerchio che guardi.|circ @aim g16 r5 poly3/4/5
S|Conversione|c|14|Attorno a te, fino a tre nemici passano dalla tua parte.|circ r7 max3 charm6/8/10
S|Presa a distanza sul gruppo|c|11|Attiri verso il punto che guardi tutti quelli attorno.|circ @aim g18 r9 pull22 d8/10/12
S|Dispersione|b|8|Dal punto che guardi tutti vengono scagliati lontano.|circ @aim g18 r6 push22 d8/10/12
S|Presa al collo|b|9|Blocchi il bersaglio piu vicino e gli togli una fetta di vita.|near r10 root2 d6 hpc.08/.1/.12
S|Colpo al piu vicino|a|5|Colpisce da solo il nemico piu vicino, forte.|near r14 d36/45/54
S|Stordisci il piu vicino|a|7|Stordisce da solo chi ti sta piu addosso.|near r8 d10/13/16 stun1.5/1.8/2.1
S|Scaccia|a|6|Scagli via chi ti sta piu addosso.|near r6 fling24/30/36
# ===== ABILITA: combinazioni =====
S|Detonazione dei marchi|b|7|Tutti i nemici marchiati esplodono.|pop mark r4 d40/50/60
S|Combustione|b|7|Tutti i nemici in fiamme esplodono.|pop burn r4 d36/45/54 burn8
S|Frantumazione|b|7|Tutti i nemici rallentati vanno in pezzi e restano storditi.|pop slow r3.5 d36/45/54 stun1
S|Maturazione del veleno|b|8|Il veleno esplode tutto insieme e contagia i vicini.|pop pois r4.5 d34/43/52 pois3
S|Paura che uccide|b|8|Chi sta scappando viene colpito e bloccato.|pop fear r3 d40/50/60 root2
S|Colpo sui deboli|b|8|Chi e indebolito esplode e ti cura.|pop weak r3.5 d30/38/46 then(heal v6/8/10)
S|Strappo delle radici|b|8|Chi e bloccato viene strappato via e lanciato in aria.|pop root r3 d30/38/46 lift1.5:16
S|Risveglio brusco|b|8|Chi e stordito prende un colpo enorme.|pop stun r3 d50/63/76
S|Marchia e detona|b|9|Marchi tutti attorno; dopo un secondo e mezzo i marchi esplodono.|circ r8 mark1.3:4; wait t1.5; pop mark r3.5 d30/38/46
S|Accendi e detona|b|9|Incendi chi hai davanti e subito fai esplodere le fiamme.|cone r9 h.7 d6/8/10 burn10; wait t.8; pop burn r3.5 d28/35/42
S|Gela e frantuma|b|10|Rallenti tutti attorno e poi li frantumi.|circ r7 slow.6:3 chill2; wait t1; pop slow r3 d30/38/46
S|Se brucia, esplode|b|7|Sul bersaglio in fiamme: esplosione. Altrimenti lo incendi.|if hasburn do(circ @tgt r5 d44/55/66) else(tgt d10/13/16 burn12)
S|Se e fermo, finiscilo|b|8|Sul bersaglio bloccato: colpo triplo. Altrimenti lo blocchi.|if hasroot do(tgt d60/75/90) else(tgt d8/10/12 root2.5)
S|Se e marchiato, giustizia|b|8|Sul marchiato: una catena enorme. Altrimenti lo marchi.|if hasmark do(chain n5 d30/38/46) else(tgt mark1.4:8 d6/8/10)
S|Se e avvelenato, contagia|b|8|Sull'avvelenato: nube tossica attorno. Altrimenti lo avveleni forte.|if haspois do(zone @tgt r5 t5 dps10/13/16 pois1) else(tgt d8/10/12 pois5)
S|Se e rallentato, congela|b|8|Sul rallentato: lo congeli insieme ai vicini. Altrimenti lo rallenti.|if hasslow do(circ @tgt r5 chill5 d14/18/22) else(tgt d10/13/16 slow.6:4)
S|Se ha paura, convincilo|c|11|Chi sta scappando passa con te. Altrimenti lo spaventi.|if hasfear do(tgt charm8/10/12) else(tgt fear3)
S|Vicino o lontano|b|7|Se hai nemici addosso li respingi, senno spari una lama.|if near5 do(circ r6 d20/25/30 push16) else(shot d30/38/46 v30 wide r2.6 t.7)
S|Attacco o difesa|b|9|Se hai un bersaglio lo colpisci, senno ti copri.|if tgt do(tgt d38/48/58) else(buff shield40/50/60 t4)
S|Solo o in compagnia|b|9|Con tanti nemici vicini li blocchi tutti; con pochi, colpo singolo forte.|if count3 do(circ r8 root2/2.5/3 d8/10/12) else(near r12 d40/50/60)
S|Tutto o niente|c|10|A vita piena: colpo devastante. Ferito: ti curi.|if hpa80 do(cone r10 h.7 d50/63/76) else(heal v24/30/36)
S|Bestia ferita|b|9|Sotto meta vita il colpo ruba vita; sopra, spinge.|if hpb50 do(circ r6 d24/30/36 ls.5) else(circ r6 d24/30/36 push14)
S|Risonanza spesa bene|c|10|Con Risonanza alta: pioggia di colpi. Bassa: la ricarichi.|if resa50 do(rep n6 ev.2 do(circ @rnd7 r3 d22/28/34 in.4)) else(res v20/25/30)
S|In corsa o da fermo|b|8|In corsa lasci una scia di mine, da fermo un cerchio di fuoco.|if moving do(rep n4 ev.3 do(circ r2.6 d18/23/28 in.9)) else(zone r5 t5 dps14/18/22)
S|Scudo che esplode|b|9|Se hai scudo lo fai detonare; senno te ne da uno.|if shielded do(circ r7 d40/50/60 push12) else(buff shield40/50/60 t5)
S|Colpo dal buio|b|9|Da nascosto: colpo enorme e marchio. Altrimenti sparisci.|if veiled do(tgt d55/70/85 mark1.3:5) else(buff veil2 t4)
# ===== ABILITA: sequenze =====
S|Bombardamento a tappeto|c|11|Cinque scoppi in fila davanti a te.|circ @fwd4 r3 d18/23/28; circ @fwd8 r3 d18/23/28 in.2; circ @fwd12 r3 d18/23/28 in.4; circ @fwd16 r3 d18/23/28 in.6
S|Raffica di lame|b|8|Tre mezzelune una dopo l'altra.|rep n3 ev.2 do(shot d16/20/24 v30 wide r2.4 t.6)
S|Mitragliata|b|8|Dieci colpi rapidissimi.|rep n10 ev.07 do(shot d6/7.5/9 v40 jit.05)
S|Tre respiri di fuoco|b|9|Tre vampate in fila.|rep n3 ev.35 do(cone r8 h.55 d12/15/18 burn6)
S|Pugni a raffica|b|8|Sei colpi corti velocissimi; l'ultimo stordisce.|rep n5 ev.1 do(cone r3.4 h.9 d7/9/11); wait t.55; cone r3.6 h1 d16/20/24 stun.8
S|Terremoto|c|11|Quattro scosse attorno a te, sempre piu larghe.|rep n4 ev.4 do(circ r7 d12/15/18 slow.4:1.5)
S|Pioggia mirata|b|9|Cinque colpi cadono attorno al punto che guardi.|rep n5 ev.2 do(circ @aim g18 r1 in.01; circ @rnd5 r2.6 d18/23/28 in.45)
S|Bersaglio inseguito|c|10|Quattro colpi dal cielo inseguono il bersaglio mirato.|aim; rep n4 ev.4 do(circ @tgt r2.6 d18/23/28 in.35)
S|Fuochi d'artificio|c|10|Un colpo che esplode, poi esplode ancora, poi ancora.|shot d6 v20 t.5 then(circ r3 d14/18/22; shot n4 ringall d4 v14 t.35 then(circ r2.6 d12/15/18))
S|Colpo, pausa, colpo|b|8|Un'onda attorno a te, e un'altra piu forte un secondo dopo.|circ r5.5 d16/20/24; wait t1; circ r6.5 d26/33/40 stun.5
S|Conto alla rovescia|c|10|Tra tre secondi esplodi enorme; nel frattempo sei piu veloce.|buff haste1.4 t3; wait t3; circ r8 d70/88/106 push14
S|Prima il gelo poi il martello|c|10|Blocchi chi hai davanti e, un attimo dopo, lo schiacci.|cone r9 h.7 root1.5; wait t.7; cone r9 h.7 d40/50/60
S|Tira, colpisci, respingi|c|10|Li tiri a te, li colpisci, li scaraventi via.|circ r9 pull18; wait t.5; circ r5 d28/35/42; wait t.3; circ r6 push20
S|Solleva e schiaccia|c|10|Sollevi tutti attorno, poi un colpo dall'alto.|circ r6 lift1.4:8; wait t1.2; circ r6.5 d36/45/54
S|Marchia, attira, esplodi|c|11|Marchi tutti, li raduni, e scateni un'esplosione.|circ r9 mark1.3:5; wait t.4; circ r9 pull18; wait t.6; circ r5 d36/45/54
S|Avvelena e aspetta|b|9|Una dose forte di veleno a tutti; tra tre secondi il veleno esplode.|circ r8 pois4; wait t3; pop pois r3 d24/30/36
S|Onda avanti e indietro|b|8|Una lama parte in avanti; un secondo dopo ne parte una alle tue spalle.|shot d22/28/34 v28 wide r2.6 t.7; wait t.8; circ @back4 r4 d18/23/28 push10
S|Raggio rotante|c|10|Otto linee una dopo l'altra tutt'attorno a te.|rep n8 ev.12 do(shot n3 ringall d8/10/12 v34 pierce t.5)
S|Scariche in sequenza|b|9|Quattro scariche, ognuna sul nemico piu vicino in quel momento.|rep n4 ev.3 do(near r12 d20/25/30 stun.2)
S|Tre catene|c|10|Tre scariche a catena di fila.|rep n3 ev.4 do(chain n3 d14/18/22)
S|Cerchio che si chiude|c|11|Un anello lontano, poi uno medio, poi il centro: tutto tira verso di te.|ring r13 i9 d10/13/16 pull12; wait t.4; ring r9 i5 d14/18/22 pull12; wait t.4; circ r5 d24/30/36 stun.6
S|Spirale di dardi|c|10|Dardi tutt'attorno a te, in quattro giri.|rep n4 ev.18 do(shot n6 ringall d7/9/11 v24 t.6)
S|Colpo con replica|b|9|Colpisci il bersaglio; due repliche piu deboli seguono.|tgt d24/30/36; wait t.4; tgt d14/18/22; wait t.4; tgt d14/18/22 stun.4
S|Schianto e crepe|c|10|Un colpo a terra da cui partono quattro linee.|circ r4 d20/25/30; shot n4 ringall d14/18/22 v26 pierce t.5 r.6
S|Vulcano|c|12|Un cratere dove guardi lancia lapilli per quattro secondi.|zone @aim g14 r3 t4 dps10/13/16 tick(shot n5 ringall d8/10/12 v16 t.5 boom2) ev.8
S|Sequenza del domatore|c|11|Spaventi tutti, poi li blocchi mentre scappano.|circ r8 fear1.2; wait t1; circ r13 root2/2.5/3
S|Prima lo scudo poi lo schianto|c|11|Ti copri; tra due secondi lo scudo esplode.|buff shield45/56/68 t2.2; wait t2; circ r6.5 d36/45/54 push12
# ===== ABILITA: utilita =====
S|Pronto soccorso|a|10|Ti curi subito.|heal v26/33/40
S|Cura e pulizia|b|12|Ti curi e respingi chi ti sta addosso.|heal v20/25/30; circ r4.5 push16
S|Cura col prezzo|b|8|Ti curi molto, ma le altre ricariche si allungano.|heal v36/45/54; buff cdr.5 t5
S|Sorso di Risonanza|a|12|Guadagni Risonanza.|res v22/28/34
S|Riarmo|b|16|Accorci tutte le altre ricariche.|cdr v3/4/5
S|Riarmo totale|c|22|Azzeri tutte le altre ricariche.|cdr all
S|Fermo immagine|c|16|Il tempo si ferma per un istante.|freeze t1.5/2/2.5
S|Fermo immagine e colpo|c|16|Fermi il tempo e prepari un colpo che cade quando riparte.|freeze t1.5; circ @aim g18 r5 d50/63/76 in1.4
S|Segnaposto|a|6|Lasci un segno a terra per tornarci dopo con un altro potere.|mem; buff shield12/15/18 t3
S|Richiamo|b|8|Torni al segno lasciato, curandoti.|ret then(heal v14/18/22)
S|Richiamo esplosivo|b|9|Torni al segno lasciato con un'esplosione.|ret then(circ r5.5 d36/45/54 stun.6)
S|Cambio di ritmo|b|12|Corri, ricarichi in fretta e carichi Risonanza: tutto insieme, per poco.|buff haste1.3 cdr1.6 resrate1.6 t5
S|Adrenalina del ferito|b|12|Piu sei messo male, piu ti rimette in piedi.|if hpb50 do(heal v30/38/46; buff haste1.4 t3) else(buff haste1.4 t3)
S|Offerta|b|10|Paghi vita per uno scudo molto grande.|cost v15; buff shield70/88/106 t6
S|Patto di velocita|b|11|Paghi vita per ricariche rapidissime.|cost v12; buff cdr2.6/3/3.4 t5
S|Dono del sangue|c|12|Paghi vita e curi... te stesso, piu tardi e di piu.|cost v18; buff hot45/56/68 t7
S|Sacrificio dell'esca|c|12|Paghi vita, lasci tre esche esplosive.|cost v10; sum esca n3 far3.5 t4 d24/30/36 r3.5
`);
