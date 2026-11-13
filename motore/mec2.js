Bricks.load(String.raw`
# ===== PRIMARI: ultimi =====
P|Forbice|b|0.6|Due linee che si incrociano davanti a te.|line l9 w1 d10/12/14; cone r4 h.4 d8/10/12
P|Raffica che stringe|b|0.9|Quattro colpi sempre piu forti.|shot d6/7/8 v36; wait t.1; shot d8/10/12 v36; wait t.1; shot d12/15/18 v36 pierce
P|Tiro e scatto corto|c|0.9|Spari e arretri di un passo.|shot d16/20/24 v38; dash l3 back
P|Lama che avanza|c|0.8|Fai un passo avanti e tagli.|dash l3 fwd then(cone r3.6 h1.1 d18/22/26)
P|Doppio dito|b|0.6|Colpisci il bersaglio mirato e chi gli sta accanto.|tgt d10/12/14 then(near r5 d8/10/12)
P|Mazza a catena|b|0.85|Un colpo largo che tira tutti verso il centro.|circ @fwd4 r3.4 d16/20/24 pull8
P|Pungiglione|b|0.5|Un affondo che avvelena forte.|line l5 w1.2 d9/11/13 pois2
P|Mortaretto|b|0.5|Un piccolo scoppio a media distanza, sempre li.|circ @fwd8 r2.4 d14/17/20
P|Onda sismica|b|0.9|Tre scoppi in fila davanti a te.|circ @fwd4 r2.4 d12/15/18; circ @fwd8 r2.4 d12/15/18 in.15; circ @fwd12 r2.4 d12/15/18 in.3
# ===== MOVIMENTO: scatti =====
M|Scatto semplice lungo|a|3|Uno scatto lungo senza fronzoli.|dash l13
M|Scatto tagliente|a|3|Attraversi i nemici ferendoli.|dash l9 d18/24/30
M|Scatto all'indietro|a|2.5|Un balzo corto all'indietro.|dash l7 back
M|Scatto con onda|b|4.5|Alla fine dello scatto esplodi.|dash l9 then(circ r3.6 d22/28/34 push8)
M|Scatto che congela|b|5|Alla fine dello scatto rallenti tutti attorno.|dash l9 then(circ r4.5 d8/10/12 slow.6:3 chill2)
M|Scatto incendiario|b|5|Lasci una scia e una vampata all'arrivo.|dash l10 trail8/10/12 then(circ r3 d12/15/18 burn8)
M|Scatto che stordisce|b|6|All'arrivo stordisci chi hai accanto.|dash l8 then(circ r3.2 d10/13/16 stun.9)
M|Scatto con scudo|b|5|Arrivi coperto da uno scudo.|dash l9 then(buff shield25/32/40 t3)
M|Scatto e sparisci|b|7|Alla fine dello scatto sei invisibile.|dash l9 then(buff veil1.7 t3)
M|Scatto doppio|b|5|Due scatti di fila nella stessa direzione.|dash l7; wait t.25; dash l7
M|Scatto a boomerang|b|6|Scatti avanti colpendo, poi torni dove eri.|mem; dash l10 d16/20/24 fwd; wait t.6; ret
M|Scatto sul bersaglio|b|4.5|Ti lanci addosso a chi stai mirando.|dash totgt g20 d14/18/22
M|Assalto|b|6|Ti lanci sul bersaglio e lo stordisci.|dash totgt g18 then(tgt d20/26/32 stun.8)
M|Placcaggio|b|6.5|Ti lanci sul bersaglio e lo scaraventi via.|dash totgt g16 then(tgt d16/20/24 fling20/26/32)
M|Colpo di spalla|b|5|Carichi sul bersaglio e respingi tutti attorno a lui.|dash totgt g16 then(circ r3.6 d16/20/24 push14)
M|Scatto che ruba vita|b|6|Attraversi i nemici e ti curi per ognuno.|dash l10 d10/13/16 then(circ r3 d6 heal3/4/5)
M|Scatto con cloni|c|9|Dove parti resta un'esca che esplode.|sum esca n1 t3 d24/30/36 r3.5; dash l10
M|Scatto che semina mine|b|7|Lasci una mina alla partenza e una all'arrivo.|circ r3 d22/28/34 in1; dash l9 then(circ r3 d22/28/34 in1)
M|Scatto del lampo|b|5|All'arrivo una scarica salta tra i nemici vicini.|dash l10 then(chain n3/4/5 d12/15/18)
M|Scatto con spine|b|5.5|All'arrivo spari dardi tutt'attorno.|dash l9 then(shot n8 ringall d7/9/11 v24 t.5)
M|Scatto del predatore|b|6|Se hai un bersaglio ti ci lanci, senno scatti e basta.|if tgt do(dash totgt g20 d16/20/24) else(dash l9)
M|Scatto disperato|b|6|Sotto meta vita lo scatto ti cura e ti rende intoccabile.|if hpb50 do(dash l11 then(heal v14/18/22; buff invuln t1)) else(dash l9)
M|Scatto che carica|b|5|Ogni nemico attraversato carica la Risonanza.|dash l10 d8/10/12 then(circ r3.4 d4 res3/4/5)
M|Scatto ricaricante|b|7|Alla fine dello scatto le altre ricariche si accorciano.|dash l9 then(cdr v1.5/2/2.5)
M|Scatto marchiante|b|5|Chi sta dove arrivi viene marchiato.|dash l9 then(circ r4 mark1.3:5)
M|Scatto con vortice|c|8|All'arrivo lasci un vortice che risucchia.|dash l9 then(zone r4.5 t3 dps6/8/10 zpull1)
M|Scatto di paura|b|7|Chi sta dove arrivi scappa.|dash l9 then(circ r5 fear1.5/2/2.5)
M|Scatto corazzato|b|6|Durante e dopo lo scatto prendi meno danni.|buff armor.5 t3; dash l10 d10/13/16
M|Scatto rabbioso|b|7|Dopo lo scatto colpisci piu forte per un po.|dash l9 then(buff fury1.3/1.4/1.5 t4)
M|Scatto con muro|c|9|Dietro di te si alza un muro.|sum muro n3 wall t7; dash l9
M|Scatto a zig-zag|c|7|Tre scatti corti in rapida successione, guidati da te.|rep n3 ev.22 do(dash l5 d8/10/12)
M|Triplo fendente in corsa|c|8|Tre scatti corti, ognuno con un taglio.|rep n3 ev.3 do(dash l4.5 then(cone r3.2 h1.2 d12/15/18))
M|Ritirata coperta|b|6|Arretri lasciando una nube che ti nasconde.|zone r4 t3 inv dome; dash l9 back
M|Ritirata con spinta|b|5|Respingi tutti e arretri.|circ r4 d8/10/12 push16; dash l8 back
M|Ritirata che gela|b|6|Congeli il terreno davanti a te e arretri.|zone @fwd3 r3.5 t4 slow.6:1 chill.6; dash l8 back
M|Ritirata e contrattacco|c|7|Arretri e spari tre colpi verso chi ti inseguiva.|dash l8 back then(shot n3 sp.12 d10/13/16 v34)
M|Capriola con granata|b|6|Arretri e lasci cadere una bomba.|shot d6 v2 t.9 boom4 r.5; dash l8 back
M|Scivolata|a|3.5|Scatto corto che rallenta chi tocchi.|dash l6 d6/8/10 then(circ r2.5 slow.5:2)
M|Sfondamento|c|8|Carica lunghissima: chi e sulla strada viene travolto e stordito.|dash l18 d26/34/42 fwd then(circ r3 stun1 d10)
M|Scatto fantasma|b|6|Durante lo scatto sei intoccabile piu a lungo.|buff invuln t.8; dash l11
M|Passo laterale con eco|c|7|Scatti e una tua ombra ripete un colpo dal punto di partenza.|shot n3 sp.15 d8/10/12 v30; dash l8
# ===== MOVIMENTO: teletrasporti =====
M|Varco corto|a|3.5|Un teletrasporto corto e veloce da ricaricare.|blink g8
M|Varco esplosivo|b|6|Dove arrivi esplodi.|blink g16 then(circ r4 d22/28/34 push8)
M|Varco con ricordo|b|6|Dove eri resta un'esplosione ritardata.|blink g16 left(circ r4 d26/33/40 in.7)
M|Varco gelido|b|6.5|Dove arrivi congeli tutti.|blink g15 then(circ r4.5 d8/10/12 chill3 slow.5:3)
M|Varco che acceca|b|7|Dove arrivi stordisci.|blink g14 then(circ r3.6 d8/10/12 stun.9)
M|Varco d'ombra|b|8|Arrivi invisibile.|blink g16 then(buff veil1.9 t3.5)
M|Varco con esca|c|9|Dove eri resta una tua copia.|blink g16 left(sum esca n1 t4 d24/30/36 r3.5)
M|Varco curativo|b|8|Arrivando ti curi.|blink g14 then(heal v12/16/20)
M|Varco protetto|b|7|Arrivi con uno scudo.|blink g16 then(buff shield25/32/40 t3.5)
M|Alle spalle|b|6|Compari dietro al bersaglio mirato.|blink behind g20
M|Pugnalata alle spalle|b|7|Compari dietro al bersaglio e lo colpisci forte.|blink behind g18 then(tgt d26/33/40)
M|Agguato paralizzante|b|8|Compari dietro al bersaglio e lo blocchi.|blink behind g18 then(tgt d10/13/16 root1.5/2/2.5)
M|Agguato e marchio|b|7|Compari dietro al bersaglio e lo marchi.|blink behind g20 then(tgt d8/10/12 mark1.4:6)
M|Scambio rapido|b|6|Ti scambi di posto col bersaglio mirato.|tgt swap
M|Scambio e gabbia|c|8|Scambi posto e il nemico resta bloccato dove eri tu.|tgt swap root1.5/2/2.5
M|Scambio esplosivo|c|8|Scambi posto: il nemico arriva in un'esplosione.|tgt swap then(circ @tgt r3.6 d24/30/36)
M|Varco a catena|c|9|Due teletrasporti di fila.|blink g12; wait t.35; blink g12
M|Varco e raffica|b|7|Appena arrivi spari dardi tutt'attorno.|blink g15 then(shot n8 ringall d8/10/12 v26 t.5)
M|Varco del fulmine|b|6.5|Dove arrivi una scarica salta tra i nemici.|blink g16 then(chain n3/4/5 d14/18/22)
M|Varco con vortice|c|9|Dove arrivi tiri tutti a te.|blink g16 then(circ r7 pull16 d8/10/12)
M|Varco e respingi|b|6|Dove arrivi spingi via tutti.|blink g15 then(circ r5 push18 d8/10/12)
M|Doppio varco|c|8|Vai e, dopo due secondi, torni dove eri.|mem; blink g18; wait t2; ret
M|Varco tossico|b|7|Dove eri resta una nube velenosa.|blink g15 left(zone r3.5 t4 dps6/8/10 pois1)
M|Varco infuocato|b|7|Partenza e arrivo prendono fuoco.|blink g15 left(zone r3 t3 dps10/13/16) then(zone r3 t3 dps10/13/16)
M|Varco che ricarica|c|10|Arrivando azzeri le altre ricariche.|blink g14 then(cdr all)
M|Varco risonante|b|8|Arrivando guadagni Risonanza.|blink g15 then(res v10/13/16)
M|Varco di paura|b|8|Dove arrivi tutti scappano.|blink g15 then(circ r6 fear1.5/2/2.5)
M|Varco del giudice|c|9|Dove arrivi, un colpo cade su ogni nemico vicino.|blink g16 then(circ r7 each(circ r2 d18/23/28 in.5))
M|Passo nel vuoto|b|7|Ti sposti e il tempo si ferma un istante.|blink g14; freeze t1/1.3/1.6
# ===== MOVIMENTO: salti =====
M|Salto semplice|a|4|Un salto ad arco senza danni.|leap g16
M|Salto con schianto forte|b|6.5|Atterri con un'onda d'urto.|leap g16 then(circ r4.5 d30/38/46 push8)
M|Salto del gelo|b|7|Atterri congelando il suolo.|leap g16 then(circ r5 d12/15/18 chill3; zone r4 t3 slow.5:1)
M|Salto del cratere|b|7|Atterri lasciando un cratere che brucia.|leap g16 then(circ r4 d20/25/30; zone r4 t4 dps9/11/13)
M|Salto stordente|b|8|Chi sta dove atterri resta stordito.|leap g15 then(circ r4 d14/18/22 stun1.2)
M|Salto che solleva|c|8|Atterrando sollevi tutti in aria.|leap g15 then(circ r4.5 lift1.6:20)
M|Salto del meteorite|c|9|Atterri, e subito dopo cade un secondo colpo piu grande.|leap g16 then(circ r3.5 d18/23/28; circ r6 d30/38/46 in.7)
M|Salto con eco|c|8|Atterri con tre onde che si allargano.|leap g16 then(circ r3 d16/20/24; ring r6 i3 d12/15/18 in.2; ring r9 i6 d8/10/12 in.4)
M|Salto protetto|b|7|In volo e all'arrivo hai uno scudo.|buff shield30/38/46 t3; leap g16
M|Salto del cacciatore|b|7|Atterri marchiando tutti.|leap g18 then(circ r5 d8/10/12 mark1.3:6)
M|Balzo rapido|a|4|Un balzo teso e veloce.|leap g14 fast
M|Balzo rapido con taglio|b|5|Balzo teso: all'arrivo tagli davanti a te.|leap g14 fast then(cone r4 h1.2 d20/25/30)
M|Balzo dell'arpione|b|5.5|Balzo teso: all'arrivo tiri tutti a te.|leap g16 fast then(circ r6 pull14 d8/10/12)
M|Balzo e dardi|b|6|Balzo teso con una rosa di dardi all'arrivo.|leap g15 fast then(shot n6 ringall d8/10/12 v24 t.5)
M|Salto con paracadute|c|9|Mentre sei in aria piovono colpi sotto di te.|leap g18; rep n4 ev.15 do(circ r2.6 d12/15/18 in.3)
M|Salto del re|c|10|Atterri e tutti attorno si inchinano: bloccati e indeboliti.|leap g15 then(circ r6 root1.2/1.5/1.8 weak4)
M|Salto vampiro|b|8|Atterrando ti curi per ogni nemico colpito.|leap g15 then(circ r4.5 d16/20/24 heal4/5/6)
M|Salto con seguito|c|10|Atterri e due spiriti arrivano con te.|leap g16 then(sum spirito n2 t10 hp40 d9/11/13)
M|Salto del vulcano|c|9|Atterrando lanci lapilli tutt'attorno.|leap g16 then(shot n10 ringall d6/8/10 v18 t.6 boom2)
# ===== MOVIMENTO: corse, stati, trucchi =====
M|Corsa leggera|a|6|Corri piu forte per qualche secondo.|buff haste1.5 t4
M|Corsa bruciante|b|8|Corri e lasci fuoco dove passi.|buff haste1.5 t5; trig step t5 ev.4 do(zone r1.8 t2.5 dps8/10/12)
M|Corsa elettrica|b|8|Mentre corri, scariche colpiscono chi ti sta vicino.|buff haste1.5 t5; trig step t5 ev.5 do(near r5 d8/10/12)
M|Corsa travolgente|b|8|Mentre corri spingi via chi tocchi.|buff haste1.6 t4; trig step t4 ev.25 do(circ r2.2 d5/6/7 push10)
M|Corsa invisibile|b|10|Corri e sparisci.|buff haste1.4 veil1.6 t4
M|Corsa corazzata|b|9|Corri e prendi meno danni.|buff haste1.4 armor.6 t5
M|Corsa che rigenera|b|10|Corri e intanto ti curi.|buff haste1.4 hot20/26/32 t5
M|Corsa frenetica|b|11|Corri e le ricariche vanno al doppio.|buff haste1.4 cdr2 t4
M|Passo spettrale|b|9|Per un attimo niente puo toccarti.|buff invuln t1.2/1.5/1.8
M|Fumogeno|b|9|Una nube: finche ci stai dentro nessuno ti vede.|zone r5 t5/6/7 inv dome
M|Terreno scivoloso|b|8|Geli il suolo attorno: i nemici arrancano, tu corri.|zone r7 t5 slow.6:1; buff haste1.4 t5
M|Spinta e fuga|b|6|Respingi tutti e corri via.|circ r5 d6/8/10 push18; buff haste1.5 t3
M|Segno e ritorno|b|8|La prima volta lasci un segno, la seconda ci torni.|if still do(mem) else(ret)
M|Ancora esplosiva|c|9|Lasci un segno; tra tre secondi ci torni esplodendo.|mem; wait t3; ret then(circ r5 d30/38/46)
M|Elastico|b|7|Scatti avanti e l'elastico ti riporta indietro.|mem; dash l12 fwd d10/13/16; wait t.9; ret
M|Gancio al nemico|b|5|Ti tiri fino al bersaglio mirato.|dash totgt g24
M|Gancio e calcio|b|6|Ti tiri sul bersaglio e rimbalzi indietro.|dash totgt g22 then(tgt d18/23/28; dash l6 back)
M|Tira e molla|c|7|Tiri a te il bersaglio, poi arretri.|tgt yank d8/10/12; dash l6 back
M|Ombra in avanti|c|9|Mandi avanti un'esca; dopo un attimo ti scambi con lei.|mem; sum esca n1 @fwd9 t1.5 d20/26/32 r3.5; wait t1; blink g1 @fwd9
M|Fuga col botto|b|7|Dopo un secondo esplodi dove sei: nel frattempo corri.|circ r4.5 d30/38/46 in1; buff haste1.6 t1.5
M|Slancio del sangue|b|4|Paghi vita per uno scatto che ricarica in fretta.|cost v6; dash l11 d14/18/22
M|Ultima risorsa|c|14|Intoccabile, velocissimo e curato: per le emergenze.|buff invuln t1.5 haste1.6 hot24/30/36
M|Scatto a comando|b|5|Fermo fai un salto, in corsa fai uno scatto.|if still do(leap g14 fast) else(dash l10)
M|Via d'uscita|b|8|Se sei accerchiato ti teletrasporti e li blocchi, senno scatti.|if count3 do(circ r5 root1.5; blink g14) else(dash l9)
M|Scatto dell'opportunista|b|6|Se il bersaglio e stordito o bloccato gli arrivi alle spalle con un colpo doppio.|if hasroot do(blink behind g18 then(tgt d34/42/50)) else(dash l9)
M|Onda cavalcata|c|8|Lanci un'onda e ci scatti dietro.|shot d14/18/22 v26 wide r2 t.6; dash l10 fwd
M|Corsa sui cadaveri|c|12|Per un po ogni uccisione ti fa scattare in avanti e ti cura.|trig kill t10 do(heal v5/6/7; buff haste1.5 t2.5)
M|Riflesso|c|12|Per un po, quando ti colpiscono ti teletrasporti via da solo.|trig hurt t8 n2 do(blink g9 @back9)
M|Passo che rimbomba|b|9|Per un po ogni tuo scatto o varco finisce con un'esplosione.|trig cast t10 do(circ r3.6 d14/18/22)
`);
