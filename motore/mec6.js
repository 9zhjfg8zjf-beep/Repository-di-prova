Bricks.load(String.raw`
# ===== ABILITA: attacco e movimento insieme =====
S|Carica e fendente|b|8|Scatti avanti e tagli largo.|dash l7 fwd then(cone r4.5 h1.3 d30/38/46)
S|Entrata a gamba tesa|b|9|Scatti sul bersaglio e lo lanci via.|dash totgt g16 then(tgt d14/18/22 fling24/30/36)
S|Colpo e fuga|b|8|Colpisci chi hai davanti e arretri.|cone r5 h.9 d28/35/42; dash l8 back
S|Salto del martello|c|10|Salti sul punto che guardi e stordisci a lungo.|leap g14 then(circ r5 d30/38/46 stun1.5/1.8/2.1)
S|Tuffo nel gruppo|c|10|Ti teletrasporti tra i nemici e li tiri tutti a te.|blink g16 then(circ r8 pull20 d14/18/22 slow.5:2)
S|Mordi e fuggi|b|9|Compari dietro al bersaglio, colpisci, e torni dove eri.|mem; blink behind g18 then(tgt d34/43/52); wait t.5; ret
S|Giro della morte|c|10|Scatti in avanti lasciando lame che esplodono dietro di te.|dash l10 fwd trail10/13/16 then(shot n8 ringall d10/13/16 v24 t.5)
S|Rimbalzo sul nemico|c|10|Ti lanci sul bersaglio e rimbalzi via con un'onda.|dash totgt g18 then(circ r4.5 d24/30/36 push12; dash l7 back)
S|Passo e scudo|a|8|Un passo indietro e uno scudo.|dash l5 back; buff shield35/44/53 t4
S|Affondo che attraversa|b|8|Scatto lungo che ferisce e marchia chi attraversi.|dash l12 fwd d22/28/34 then(circ @back6 r6 mark1.3:5)
S|Uscita di scena|c|12|Esplodi, sparisci e ti sposti.|circ r5.5 d24/30/36 push10; blink g12; buff veil1.8 t3
# ===== ABILITA: colpi con effetti su di te =====
S|Colpo che protegge|b|8|Colpisci attorno e ti copri.|circ r5.5 d22/28/34; buff shield25/32/40 t4
S|Colpo che nasconde|b|9|Un'esplosione di fumo: colpisci e sparisci.|circ r5 d16/20/24 weak3; buff veil1.8 t3.5
S|Colpo che accelera|b|8|Spingi via tutti e corri.|cone r8 h.8 d16/20/24 push14; buff haste1.5 t3
S|Colpo che infuria|b|9|Colpisci chi hai davanti e per un po picchi piu forte.|cone r7 h.8 d20/25/30; buff fury1.3/1.4/1.5 t5
S|Urlo che rigenera|b|11|Spaventi tutti e ti curi nel tempo.|circ r8 fear1.5/2/2.5; buff hot24/30/36 t5
S|Onda che ricarica|b|10|Colpisci attorno e le ricariche vanno piu veloci.|circ r6 d20/25/30; buff cdr1.8/2.1/2.4 t4
S|Schianto corazzato|b|10|Colpo a terra e pelle dura.|circ r5 d24/30/36 stun.5; buff armor.55 t4
S|Lama assetata|b|9|Una mezzaluna; poi per un po ogni colpo ti cura.|shot d24/30/36 v30 wide r2.6 t.7; buff ls.12/.15/.18 t5
S|Colpo e orbite|c|11|Un'esplosione da cui nascono lame che ti girano attorno.|circ r5 d18/23/28; buff orbit18/23/28 r3.2 t6
S|Schianto riflettente|c|11|Spingi via tutti e per un attimo rimandi indietro i colpi.|circ r6 d14/18/22 push16; buff reflect.8/1/1.2 t3
# ===== ABILITA: proiettili speciali =====
S|Sfera di plasma|c|10|Una sfera lenta e enorme che brucia tutto attorno.|shot d8/10/12 v6 aura4 t4.5
S|Sfera di gelo errante|c|11|Una sfera lenta che congela chi sfiora.|shot d5/6/7 v6 aura4 t4.5 chill1 slow.5:1
S|Sfera calamita|c|11|Una sfera lenta che trascina con se i nemici, poi esplode.|shot d4/5/6 v7 aura4.5 t3.5 pull8 then(circ r5 d34/43/52)
S|Sfera di paura|c|11|Una sfera lenta: chi le sta vicino scappa.|shot d3/4/5 v7 aura4 t4 fear.6
S|Disco rimbalzante|b|8|Un disco largo che rimbalza sui muri.|shot d18/23/28 v26 wide r1.8 t2.2 bnc3
S|Giavellotto|b|7|Un colpo solo: trapassa tutti e li blocca.|shot d24/30/36 v44 pierce root1/1.3/1.6 r.6
S|Giavellotto esplosivo|c|9|Trapassa tutti, ed esplode in fondo.|shot d20/25/30 v40 pierce boom4.5 t.6
S|Colpo che torna con gli interessi|b|8|Una lama che al ritorno tira i nemici verso di te.|shot d16/20/24 v24 back t.6 wide r1.8 pull6
S|Ventaglio di giavellotti|c|9|Cinque colpi perforanti a ventaglio.|shot n5 sp.18 d16/20/24 v40 pierce
S|Ventaglio che incendia|b|8|Sette dardi di fuoco a ventaglio largo.|shot n7 sp.16 d9/11/13 v30 burn7
S|Ventaglio avvelenato|b|8|Sette spine a ventaglio largo.|shot n7 sp.16 d7/9/11 v30 pois2
S|Dardi storditori|b|9|Tre dardi che stordiscono.|shot n3 sp.2 d12/15/18 v34 stun.9
S|Colpi cercatori marchianti|b|9|Quattro colpi che inseguono e marchiano.|shot n4 sp.4 d10/13/16 v18 hom t2 mark1.3:5
S|Raffica cercatrice esplosiva|c|10|Tre missili che inseguono ed esplodono.|shot n3 sp.5 d18/23/28 v16 hom t2.5 boom3
S|Seme di spine|c|10|Dove arriva, spara spine tutt'attorno per tre volte.|shot d8 v24 then(rep n3 ev.4 do(shot n8 ringall d7/9/11 v22 t.5))
S|Proiettile evocatore di muri|c|10|Dove arriva nasce un muro.|shot d10 v26 then(sum muro n4 wall t7 hp120)
S|Colpo boomerang che cura|b|9|Va, torna, e ti cura per ogni nemico toccato.|shot d14/18/22 v24 back t.55 wide r1.6 then(heal v8/10/12)
S|Bomba a rimbalzo|c|9|Rimbalza sui muri e alla fine esplode.|shot d8 v24 bnc3 t1.6 boom4.5
S|Proiettile a frammentazione doppia|c|10|Si divide in sei, e trapassa.|shot d18/23/28 v32 pierce t.45 split6
S|Onda doppia|b|8|Due mezzelune, una dietro l'altra, la seconda piu larga.|shot d16/20/24 v30 wide r2 t.6; shot d12/15/18 v24 wide r3 t.8
S|Tre onde a ventaglio|c|9|Tre mezzelune in tre direzioni.|shot n3 sp.5 d18/23/28 v28 wide r2 t.6
S|Onda che blocca|b|9|Una mezzaluna che inchioda chi tocca.|shot d12/15/18 v26 wide r2.6 t.7 root1.2/1.5/1.8
S|Onda che terrorizza|b|9|Una mezzaluna che mette in fuga.|shot d12/15/18 v24 wide r3 t.8 fear1.5/2/2.5
S|Onda che marchia|b|8|Una mezzaluna larghissima che marchia tutti.|shot d8/10/12 v26 wide r3.6 t.9 mark1.3:6
# ===== ABILITA: evocazioni con trucco =====
S|Spiriti e furia|c|14|Evochi due spiriti e colpisci piu forte finche ci sono.|sum spirito n2 t8 hp45 d10/13/16; buff fury1.3 t8
S|Torretta e mantello|c|14|Pianti una torretta e sparisci: sparano a lei.|sum torretta n1 @fwd2 t10 d9/11/13; buff veil1.6 t4
S|Esca e trappola|b|10|Un'esca al centro di un cerchio che blocca.|sum esca n1 @fwd5 t4 d20/25/30 r3.5; zone @fwd5 r4.5 t4 root.6
S|Esca e bombardamento|c|12|Un'esca attira tutti; due secondi dopo cade un colpo enorme su di lei.|sum esca n1 @aim g14 t3 d10 r3; circ @aim g14 r5.5 d50/63/76 in2
S|Muro e mine|c|11|Un muro davanti a te e mine oltre il muro.|sum muro n4 wall @fwd4 t8; rep n3 ev.1 do(circ @fwd9 r3 d24/30/36 in1.5)
S|Guaritore e cerchio|c|15|Un guaritore e un cerchio che ti rende piu forte.|sum guaritore n1 t10 d5/6/7; zone r5 t10 fury1.2
S|Arcieri sul muro|c|15|Un muro davanti e due tiratori dietro.|sum muro n4 wall @fwd5 t9; sum arciere n2 t9 d9/11/13
S|Kamikaze a comando|c|11|Tre spiriti esplosivi compaiono dove guardi.|sum bomba n3 @aim g16 far2 t4 d24/30/36
S|Colosso e catene|c|15|Evochi un colosso e blocchi i nemici attorno a lui.|sum colosso n1 @fwd4 t9 hp160 d18/23/28; circ @fwd4 r6 root2
S|Totem di scariche|c|12|Un muro-totem che lancia scariche a chi gli sta vicino.|sum muro n1 @fwd4 t8 hp140; zone @fwd4 r1.5 t8 tick(near r8 d16/20/24) ev.8
S|Spiriti dal bersaglio|c|12|Colpisci il bersaglio; se muore entro poco, nascono tre spiriti.|tgt d28/35/42 then(trig kill t1.5 n1 do(sum spirito n3 t9 hp40 d10/13/16))
S|Esercito di carta|c|12|Sei esche tutt'attorno: confusione totale.|sum esca n6 far4.5 t3 d10/13/16 r2.5
# ===== ABILITA: inneschi particolari =====
S|Ultimo respiro|c|16|Il prossimo colpo che subisci sotto meta vita ti cura molto.|trig hurt t12 n1 do(if hpb50 do(heal v36/45/54; buff invuln t1) else(buff shield20 t3))
S|Occhio per occhio|b|11|Per un po, quando ti colpiscono marchi e rallenti l'aggressore.|trig hurt t10 icd.4 do(circ r5 mark1.3:5 slow.5:2)
S|Trappola vivente|c|12|Per un po, quando ti colpiscono blocchi chi ti sta vicino.|trig hurt t8 icd1.5 do(circ r5 root1.5/1.8/2.1)
S|Scudo a molla|c|12|Per un po, quando ti colpiscono scagli via l'aggressore.|trig hurt t8 icd.8 do(near r5 fling20/25/30)
S|Cacciatore di taglie|b|12|Per un po ogni uccisione marchia tutti i nemici vicini.|trig kill t12 do(circ r8 mark1.35:6)
S|Falò|c|13|Per un po chi uccidi lascia un cerchio di fuoco.|trig kill t12 do(zone r3.5 t4 dps12/15/18 burn3)
S|Festa del boia|c|14|Per un po ogni uccisione ti da furia per qualche secondo.|trig kill t14 do(buff fury1.4/1.5/1.6 t4)
S|Uccisioni che gelano|c|13|Per un po chi uccidi esplode in ghiaccio.|trig kill t12 do(circ r5 chill4 d12/15/18)
S|Ogni terzo colpo|b|12|Per un po, a intervalli, un tuo colpo diventa esplosivo e stordente.|trig hit t10 icd1.5 do(circ r3.5 d24/30/36 stun.5)
S|Colpi che rubano tempo|b|13|Per un po ogni tuo colpo accorcia le altre ricariche.|trig hit t8 icd.3 do(cdr v.4/.5/.6)
S|Colpi che caricano|b|12|Per un po ogni tuo colpo carica Risonanza in piu.|trig hit t8 icd.3 do(res v2/2.5/3)
S|Colpi che proteggono|b|12|Per un po ogni tuo colpo ti da un po di scudo.|trig hit t8 icd.4 do(buff shield6/8/10 t3)
S|Colpi che lanciano|c|13|I tuoi prossimi tre colpi scagliano via il bersaglio.|trig hit t10 n3 icd.5 do(tgt fling16/20/24)
S|Colpi che convertono|c|15|Il tuo prossimo colpo fa passare il bersaglio dalla tua parte.|trig hit t8 n1 do(tgt charm6/8/10)
S|Colpi che seminano|c|13|Per un po ogni tuo colpo lascia una mina ritardata sul bersaglio.|trig hit t8 icd.7 do(circ r3 d18/23/28 in1)
S|Poteri che gelano|b|13|Per un po ogni altro potere che usi raffredda chi ti sta attorno.|trig cast t12 do(circ r6 chill2 slow.5:2)
S|Poteri che evocano|c|14|Per un po ogni altro potere che usi chiama uno spirito.|trig cast t12 n4 do(sum spirito n1 t7 hp35 d9/11/13)
S|Poteri che accelerano|b|13|Per un po ogni altro potere che usi ti fa correre.|trig cast t12 do(buff haste1.5 t2.5)
S|Scatti che esplodono due volte|c|13|Per un po ogni tuo scatto esplode alla fine, e ancora un secondo dopo.|trig dashend t12 do(circ r4 d16/20/24; circ r5 d16/20/24 in1)
S|Scatti che curano|b|12|Per un po ogni tuo scatto ti cura.|trig dashend t12 do(heal v8/10/12)
S|Scatti a catena|b|12|Per un po ogni tuo scatto finisce con una scarica sui vicini.|trig dashend t12 do(chain n4 d14/18/22)
S|Passi di fuoco|b|11|Per un po, mentre ti muovi lasci fuoco.|trig step t6 ev.4 do(if moving do(zone r2 t3 dps9/11/13))
S|Radar|b|12|Per un po, ogni secondo marchi tutti i nemici vicini.|trig step t6 ev1 do(circ r9 mark1.2:1.5)
S|Campo statico|c|13|Ogni secondo una scarica a catena parte da te.|trig step t6 ev1 do(chain n3 d10/13/16)
S|Respingente automatico|b|12|Per un po, ogni secondo allontani chi ti sta addosso.|trig step t6 ev1 do(circ r4 push14)
S|Mortaio automatico|c|13|Per un po, ogni secondo un colpo cade sul nemico piu vicino.|trig step t6 ev1 do(near r14 each(circ r2.6 d18/23/28 in.5))
S|Pioggia personale|c|13|Per un po attorno a te piovono colpi a caso.|trig step t6 ev.35 do(circ @rnd7 r2.4 d14/18/22 in.4)
S|Fabbrica di esche|c|14|Ogni due secondi lasci un'esca esplosiva.|trig step t6.5 ev2 do(sum esca n1 t2.5 d18/23/28 r3)
# ===== ABILITA: varie =====
S|Colpo proporzionale|c|10|Attorno a te: toglie a ognuno una fetta della vita che gli resta.|circ r7 d6 hpc.1/.13/.16
S|Risucchio di gruppo|b|10|Rubi vita a tutti quelli davanti a te.|cone r9 h.7 d16/20/24 ls.5
S|Anello che cura|b|10|Un anello: ogni nemico preso ti cura e ti da scudo.|ring r10 i4 d14/18/22 heal3/4/5 sh4
S|Linea che carica|b|8|Una linea: ogni nemico preso carica Risonanza.|line l24 w2.2 d18/23/28 res5/6/7
S|Colpo che ricarica|b|9|Colpo sul bersaglio: accorcia tutte le altre ricariche.|tgt d22/28/34 cdr1.5/2/2.5
S|Massimo tre|b|8|Tre nemici davanti a te, i piu vicini: colpo forte e blocco.|cone r10 h.8 max3 d30/38/46 root1.2
S|Solo il piu vicino, col botto|b|7|Colpisci il piu vicino e chi gli sta attorno esplode con lui.|near r12 d20/25/30 then(circ r4.5 d20/25/30)
S|Doppio bersaglio|b|8|Colpisci il bersaglio mirato e il nemico piu vicino a lui.|tgt d28/35/42 then(near r8 d20/25/30 stun.5)
S|Colpo e maledizione dei vicini|b|9|Colpisci il bersaglio; i suoi vicini vengono indeboliti e rallentati.|tgt d26/33/40 then(circ @tgt r6 weak5 slow.5:3)
S|Miccia|b|9|Dai fuoco al bersaglio; se non era gia in fiamme, il fuoco passa ai vicini.|tgt d8/10/12 burn12 then(chain n4 d4/5/6 burn10)
S|Epidemia|b|10|Avveleni il bersaglio e il veleno salta a catena.|tgt d6/8/10 pois4 then(chain n5 d4/5/6 pois3 r9)
S|Brivido|b|10|Raffreddi il bersaglio e il gelo salta a catena.|tgt d8/10/12 chill3 then(chain n5 d4/5/6 chill3 r9)
S|Anello e centro|c|10|Un anello lontano che spinge dentro, e un colpo al centro.|ring r12 i7 d8/10/12 pull16; circ r5 d30/38/46 in.6
S|Cono e contraccono|b|9|Un ventaglio davanti e, dopo un attimo, uno dietro.|cone r8 h.7 d22/28/34; circ @back4 r5 d18/23/28 in.4
S|Tre linee a ventaglio|b|8|Tre lame istantanee a ventaglio.|shot n3 sp.3 d20/25/30 v60 pierce t.3
S|Griglia|c|10|Quattro scoppi ai quattro angoli attorno a te, poi uno al centro.|circ @fwd7 r3.5 d18/23/28; circ @back7 r3.5 d18/23/28; ring r8 i5 d10/13/16 in.3; circ r4 d22/28/34 in.6
S|Morsa|c|10|Due muri ai lati e un colpo nel mezzo.|sum muro n2 wall @fwd7 t5; line l14 w3 d30/38/46 in.5
S|Colpo cieco|a|6|Un'esplosione a caso li attorno: forte, ma chissa dove.|circ @rnd6 r4.5 d44/55/66
S|Scossa di assestamento|b|9|Un'onda debole che rallenta; chi era gia rallentato resta bloccato.|circ r8 d8/10/12 slow.5:3 then(pop slow r2 d10 root1.5)
S|Luce accecante|b|10|Tutti quelli davanti a te colpiscono piu piano e non ti vedono per un attimo.|cone r11 h.9 weak6; buff veil1.3 t2
S|Fischio|a|9|Attiri l'attenzione di tutti e ti copri.|circ r12 mark1.15:5; buff armor.6 t5
`);
