Bricks.load(String.raw`
# ===== SUPREME: seconda parte =====
U|Fine del mondo locale|c|1|Dove guardi: prima tutto viene risucchiato, poi esplode, poi brucia.|circ @aim g18 r12 pull24; circ @aim g18 r9 d130/165/200 in.8; zone @aim g18 r8 t6 dps24/30/36
U|Martello degli dei|c|1|Tre colpi enormi davanti a te, sempre piu lontani.|circ @fwd5 r5 d80/100/120 stun.8; circ @fwd11 r6 d80/100/120 in.35 stun.8; circ @fwd18 r7 d80/100/120 in.7 stun.8
U|Croce di luce|c|1|Otto raggi partono da te e trapassano tutto.|shot n8 ringall d90/113/136 v50 pierce t.6 r1
U|Pioggia di giavellotti|c|1|Venti giavellotti a ventaglio largo.|shot n20 sp.09 d30/38/46 v44 pierce
U|Nugolo di missili|c|1|Dodici missili che inseguono ed esplodono.|shot n12 sp.3 d26/33/40 v16 hom t3 boom3.5
U|Sole nero|c|1|Una sfera lenta e immensa: brucia, trascina, e alla fine implode.|shot d16/20/24 v5 aura7 t6 pull8 then(circ r10 d140/175/210)
U|Sfera del giudizio|c|1|Una sfera lenta che stordisce chi sfiora e alla fine chiama un fulmine su ognuno.|shot d10/13/16 v6 aura6 t5 stun.4 then(circ r12 each(circ r3 d70/88/106 in.5))
U|Lama dell'orizzonte|c|1|Una mezzaluna larga quanto la strada.|shot d150/190/230 v30 wide r7 t1.2
U|Lama che torna|c|1|Una mezzaluna enorme che va e torna, tirando tutti verso di te.|shot d80/100/120 v24 wide r5 back t1 pull10
U|Bomba madre|c|1|Un ordigno che esplode in otto, che esplodono in altre schegge.|shot d40 v18 t.8 boom6 then(shot n8 ringall d20 v14 t.6 boom4 then(shot n4 ringall d14/18/22 v14 t.4 boom2.5))
U|Disco della fine|c|1|Un disco enorme che rimbalza per tutta la via.|shot d70/88/106 v28 wide r3.5 t4 bnc6
U|Granata del vuoto|c|1|Dove scoppia, tutto viene tirato dentro e poi sparato fuori.|shot d10 v20 t.7 then(circ r12 pull26 d30/38/46; circ r8 d100/125/150 in.8 push22)
U|Colpo unico|c|1|Un proiettile solo. Fa un danno assurdo.|shot d300/375/450 v60 r.6
U|Colpo unico perforante|c|1|Un proiettile solo che trapassa una fila intera e la stordisce.|shot d170/215/260 v60 pierce r.8 stun1.5
U|Frusta di fuoco|c|1|Cinque vampate a ventaglio, una dopo l'altra, che incendiano tutto.|rep n5 ev.25 do(cone r13 h.6 d40/50/60 burn12)
U|Respiro del drago|c|1|Per cinque secondi un getto continuo enorme.|trig step t5 ev.15 do(cone r13 h.5 d14/18/22 burn8)
U|Raggio continuo supremo|c|1|Per cinque secondi un raggio trapassa tutto davanti a te.|trig step t5 ev.12 do(line l34 w2.4 d14/18/22)
U|Disintegratore|c|1|Per quattro secondi un raggio consuma una fetta della vita di chi tocca.|trig step t4 ev.2 do(line l30 w2 d10 hpc.05/.06/.07)
U|Tornado|c|1|Un vortice enorme avanza risucchiando e lanciando in aria.|zone @fwd3 r6 t7 dps26/33/40 mv5 zpull1.6 tick(circ r6 lift.8:10) ev1.5
U|Tre tornado|c|1|Tre vortici che inseguono i nemici.|zone @fwd3 r3.5 t8 dps30/38/46 seek5; zone @back3 r3.5 t8 dps30/38/46 seek4; zone r3.5 t8 dps30/38/46 seek6 zpull.8
U|Nube del giudizio|c|1|Una nube che insegue i nemici e li bombarda.|zone @fwd4 r4 t10 seek4.5 tick(circ r9 max4 each(circ r2.6 d50/63/76 in.4)) ev.8
U|Santuario supremo|c|1|Un cerchio enorme: dentro ti curi tanto, colpisci forte e subisci poco.|zone r9 t10 zheal14/18/22 fury1.5 armor.5
U|Cupola del tempo|c|1|Una cupola enorme: i nemici dentro sono quasi fermi e bruciano.|zone @aim g16 r10 t7 dome slow.9:1 dps18/23/28
U|Campo di sterminio|c|1|Un cerchio enorme che cresce e consuma la vita di chi c'e dentro.|zone r5 t8 fol grow1.2 tick(circ r12 max14 d6 hpc.03/.04/.05) ev.5
U|Mare di lava|c|1|Cinque pozze enormi attorno a te.|zone @fwd8 r6 t8 dps30/38/46; zone @back8 r6 t8 dps30/38/46; zone @rnd9 r6 t8 dps30/38/46; zone @rnd9 r6 t8 dps30/38/46; zone r4 t8 zheal6
U|Inverno eterno|c|1|Un cerchio immenso di gelo che ti segue; alla fine tutti congelati.|zone r12 t7 fol slow.7:1 chill.5 end(circ r12 stun3 d40/50/60)
U|Epicentro|c|1|Dove guardi nasce un punto che pulsa: ogni battito un'onda enorme.|zone @aim g18 r3 t6 tick(circ r11 d44/55/66 push10 slow.4:1) ev1
U|Occhio della tempesta|c|1|Attorno a te calma; fuori, una tempesta ad anello che ti segue.|zone r4 t8 fol zheal8; trig step t8 ev.4 do(ring r13 i5 d24/30/36)
U|Faglia|c|1|Il terreno si spacca in linea: chi e sopra viene lanciato in aria e brucia.|line l34 w5 d70/88/106 lift1.6:40; zone @fwd8 r5 t6 dps20/25/30; zone @fwd18 r5 t6 dps20/25/30
U|Prigione di ghiaccio|c|1|Il bersaglio e tutti attorno a lui congelati a lungo, e fragili.|tgt stun4 mark1.6:6 then(circ @tgt r9 stun3/3.5/4 mark1.4:6)
U|Marionette|c|1|Il bersaglio e quattro suoi vicini passano dalla tua parte.|tgt charm14 then(circ @tgt r10 max4 charm10/12/14)
U|Capro del mondo|c|1|Il bersaglio prende il triplo dei danni per dieci secondi.|tgt mark3:10 weak10 slow.5:10
U|Catena dei dannati|c|1|Una scarica che blocca, marchia e indebolisce dodici nemici.|chain n12 d30/38/46 fall.95 r12 root3 mark1.4:8 weak8
U|Catena che converte|c|1|Una scarica che fa passare dalla tua parte chi tocca.|chain n6 d10 fall1 r10 charm8/10/12
U|Catena di fuoco e veleno|c|1|Una scarica che incendia e avvelena quindici nemici.|chain n15 d24/30/36 fall.97 r12 burn14 pois5
U|Furia e fulmini|c|1|Furia per dieci secondi, e ogni uccisione chiama una catena.|buff fury1.6/1.7/1.8 t10; trig kill t10 do(chain n6 d40/50/60)
U|Mantello e pugnale|c|1|Sparisci; il primo colpo dopo esplode enorme e stordisce.|buff veil3 t8; trig hit t8 n1 do(circ r7 d130/165/200 stun2)
U|Scudo e vendetta|c|1|Scudo enorme; ogni colpo che ricevi finche dura esplode.|buff shield140/175/210 t8; trig hurt t8 icd.4 do(circ r6 d40/50/60)
U|Sangue reale|c|1|Per dodici secondi ogni colpo ti cura, e ogni uccisione ti da uno scudo.|buff ls.2/.24/.28 t12; trig kill t12 do(buff shield25 t5)
U|Motore perpetuo|c|1|Per dieci secondi ogni tuo colpo accorcia le ricariche e carica Risonanza.|trig hit t10 icd.2 do(cdr v.5/.6/.7; res v1.5)
U|Mano veloce|c|1|Per otto secondi ogni tuo colpo e seguito da tre dardi cercatori.|trig hit t8 icd.25 do(shot n3 sp.4 d14/18/22 v20 hom t1.5)
U|Pelle del drago|c|1|Subisci un quarto dei danni e ogni colpo subito incendia chi ti sta vicino.|buff armor.25 t9; trig hurt t9 icd.4 do(circ r6 d16/20/24 burn12)
U|Signore del gelo|c|1|Per dieci secondi ogni tuo colpo congela il bersaglio e i suoi vicini.|trig hit t10 icd.6 do(circ r4.5 chill4 d14/18/22)
U|Signore della peste|c|1|Per dodici secondi ogni tuo colpo avvelena al massimo, e chi muore contagia.|trig hit t12 icd.3 do(tgt pois4); trig kill t12 do(zone r4.5 t5 dps12/15/18 pois2)
U|Signore del fuoco|c|1|Per dodici secondi ogni tuo colpo incendia, e chi muore esplode.|trig hit t12 icd.3 do(tgt burn14); trig kill t12 do(circ r6 d60/75/90 burn10)
U|Collezionista di anime|c|1|Per venti secondi ogni uccisione ti cura, ti carica e ti rende piu forte.|trig kill t20 do(heal v12; res v8; buff fury1.5 t5)
U|Passo del dio|c|1|Per dodici secondi ogni tuo scatto e un'esplosione enorme e ti rende intoccabile.|trig dashend t12 do(circ r7 d70/88/106 push12; buff invuln t.8)
U|Tempesta interiore|c|1|Per dieci secondi ogni altro potere che usi scatena una catena e ti carica.|trig cast t10 do(chain n6 d50/63/76; res v10)
U|Eco triplo|c|1|Per dieci secondi ogni altro potere che usi e seguito da tre esplosioni attorno a te.|trig cast t10 do(rep n3 ev.3 do(circ r7 d36/45/54))
U|Aura del re|c|1|Per dieci secondi chi ti sta attorno e rallentato, indebolito e marchiato.|trig step t10 ev1 do(circ r10 slow.6:1.2 weak1.5 mark1.3:1.5)
U|Cuore di stella|c|1|Per sei secondi, ogni mezzo secondo spari dardi in ogni direzione.|trig step t6 ev.5 do(shot n12 ringall d18/23/28 v28 t.7)
U|Ira del cielo|c|1|Per dieci secondi un fulmine a catena al secondo parte da te.|trig step t10 ev1 do(chain n6 d36/45/54 r10 stun.3)
U|Vortice di lame e fuoco|c|1|Lame in orbita, e sotto di te il terreno brucia.|buff orbit50/63/76 r4.5 t9; zone r6 t9 dps20/25/30 fol
U|Ultimo baluardo|c|1|Sotto meta vita: torni pieno, intoccabile, e respingi tutti. Sopra: scudo enorme.|if hpb50 do(heal v100; buff invuln t2.5; circ r9 d60/75/90 push22) else(buff shield160/200/240 t8)
U|Colpo di grazia|c|1|Se il bersaglio ha meno di un terzo di vita lo finisci; altrimenti lo ferisci e lo marchi.|tgt d120/150/180 ex5 mark1.4:6
U|Giocata d'azzardo|c|1|Con vita piena: danno devastante attorno. Ferito: ti curi del tutto e fuggi.|if hpa80 do(circ r13 d190/240/290) else(heal v100; buff haste1.6 veil2 t4)
U|Assedio o ritirata|c|1|Con tanti nemici vicini li congeli tutti; con pochi, colpo singolo enorme.|if count3 do(circ r14 stun3.5 d40/50/60) else(near r22 d260/325/390)
U|Fermo o in corsa|c|1|Da fermo: una batteria di torrette. In corsa: una scia di esplosioni.|if still do(sum torretta n3 far3 t14 d12/15/18) else(trig step t6 ev.4 do(circ r4.5 d50/63/76 in.6))
U|Furia del martire|c|1|Paghi quasi tutta la vita: il danno e proporzionale al sacrificio.|cost v40; circ r15 d260/325/390 stun2
U|Patto finale|c|1|Paghi vita: per dodici secondi colpisci il triplo.|cost v30; buff fury2.6/2.8/3 t12
U|Scambio di anime|c|1|Paghi vita e ogni nemico attorno a te perde una fetta enorme della sua.|cost v25; circ r14 d10 hpc.3/.36/.42
U|Rinascita|c|1|Ti curi del tutto, azzeri le ricariche e respingi tutti.|heal v100; cdr all; circ r8 d30/38/46 push20
U|Seconda occasione|c|1|Lasci un segno; tra sei secondi ci torni con tutta la vita e un'esplosione.|mem; buff fury1.4 t6; wait t6; ret then(heal v100; circ r9 d100/125/150)
U|Colpo doppio temporale|c|1|Colpisci attorno; fermi il tempo; quando riparte colpisci di nuovo, piu forte.|circ r10 d70/88/106; freeze t2.5; circ r12 d110/138/166 in2.6 stun1.5
U|Istante eterno|c|1|Fermi il tempo e in quell'istante sei velocissimo e colpisci il doppio.|freeze t4/4.5/5; buff haste1.6 fury2 t5
U|Sciame di spiriti cercatori|c|1|Dieci spiriti-bomba compaiono addosso ai nemici vicini.|circ r18 max10 each(sum bomba n1 t4 d50/63/76)
U|Muraglia|c|1|Un muro lunghissimo davanti a te, che esplodendo stordisce.|sum muro n12 wall @fwd6 t10 hp220 die(circ r4 d40/50/60 stun1)
U|Assedio|c|1|Due torrette, un muro e un bombardamento sul punto che guardi.|sum torretta n2 far3 t12 d12/15/18; sum muro n5 wall @fwd5 t12; rep n6 ev.5 do(circ @aim g22 r4 d50/63/76 in.6)
U|Parata|c|1|Colosso davanti, guaritore dietro, e tu con lo scudo.|sum colosso n1 @fwd5 t14 hp320 d30/38/46; sum guaritore n1 @back3 t14 d8; buff shield70/88/106 t8
U|Orda esplosiva a ondate|c|1|Tre ondate di quattro kamikaze.|rep n3 ev1.2 do(sum bomba n4 far3 t5 d36/45/54)
U|Guardia d'onore|c|1|Quattro spiriti robusti che esplodono cadendo e ti curano.|sum spirito n4 far3 t14 hp90 d14/18/22 die(circ r5 d40/50/60; heal v10)
U|Trappola suprema|c|1|Un'esca attira tutti; poi muri la chiudono dentro e cade un colpo enorme.|sum esca n1 @aim g16 t3.2 d20 r3; wait t1.5; sum muro n8 @aim g16 far4.5 t4; circ @aim g16 r6 d170/215/260 in1.6
U|Battaglione|c|1|Tre spiriti, tre tiratori, tre kamikaze.|sum spirito n3 far3 t12 hp50 d12/15/18; sum arciere n3 far5 t12 d10/13/16; sum bomba n3 far2 t8 d30/38/46
U|Il gigante e i nani|c|1|Un colosso; quando cade, al suo posto sei spiriti.|sum colosso n1 @fwd4 t10 hp300 d30/38/46 die(sum spirito n6 far3 t10 hp45 d12/15/18)
U|Assalto coordinato|c|1|Ti lanci sul bersaglio; tre spiriti arrivano con te e lui resta stordito.|dash totgt g24 then(tgt d90/113/136 stun2.5; sum spirito n3 far2.5 t10 hp55 d14/18/22)
U|Cometa cavalcata|c|1|Salti; mentre sei in aria piovono colpi; atterri con un cratere di fuoco.|rep n6 ev.12 do(circ @aim g22 r3 d1 in.01; circ @rnd7 r3 d40/50/60 in.5); leap g22 then(circ r8 d110/138/166; zone r7 t6 dps22/28/34)
U|Sette passi|c|1|Sette teletrasporti rapidissimi guidati da te, ognuno lascia un'esplosione ritardata.|rep n7 ev.3 do(blink g9 left(circ r5 d60/75/90 in.8))
U|Tuono e lampo|c|1|Compari tra i nemici stordendoli; un attimo dopo, una catena enorme.|blink g22 then(circ r8 stun2 d30/38/46); wait t.6; chain n10 d70/88/106 fall.95 r12
U|Sfondamento e crollo|c|1|Carichi in avanti; dietro di te tutto esplode a catena.|dash l22 fwd d70/88/106 trail30/38/46 then(circ @back6 r7 d70/88/106 in.3; circ @back14 r7 d70/88/106 in.6)
U|Ritirata strategica|c|1|Esplodi, ti teletrasporti lontano, e dove eri resta un buco nero.|circ r9 d70/88/106 push14; blink g24 left(zone r9 t5 dps18/23/28 zpull2 boom100/125/150)
U|Doppio di te|c|1|Per dodici secondi un tuo gemello potente combatte con te, e tu colpisci piu forte.|sum spirito n1 t12 hp300/380/460 d30/38/46; buff fury1.4 t12
U|Tutto in uno|c|1|Scudo, furia, fretta e cure insieme, per poco.|buff shield80 fury1.5 cdr2 hot50 t7
U|Colpo, cura, scudo|c|1|Un'esplosione enorme attorno a te: ogni nemico colpito ti cura e ti da scudo.|circ r12 d100/125/150 heal6/8/10 sh10
U|Raccolta suprema|c|1|Un'esplosione: ogni nemico colpito accorcia le ricariche e carica Risonanza.|circ r13 d90/113/136 cdr1 res4/5/6
U|Divoratore|c|1|Rubi vita a tutti quelli attorno, moltissima.|circ r13 d90/113/136 ls.5
U|Anello della fine|c|1|Un anello immenso: chi ti sta vicino e salvo, tutti gli altri no.|ring r24 i6 d170/215/260 stun1.5
U|Tre giudizi|c|1|Colpo dal cielo sul bersaglio, tre volte, sempre piu forte.|aim; circ @tgt r4 d60/75/90 in.5; circ @tgt r5 d90/113/136 in1.2; circ @tgt r6 d130/165/200 in2 stun2
U|Vendetta del branco|c|1|Marchi a fondo il bersaglio e otto spiriti lo assalgono.|tgt mark2:10 root3 then(sum spirito n8 @tgt far3.5 t10 hp45 d14/18/22)
U|Mietitore supremo|c|1|Attorno a te: enorme contro chi ha uno stato addosso.|circ r14 d70/88/106 vsburn2 vspois2 vsslow2 vsmark2 vsweak2
U|Boia dei fermi|c|1|Attorno a te: blocchi tutti, poi chi e bloccato prende un colpo terribile.|circ r14 root3; wait t.8; pop root r3 d150/190/230
U|Paura e morte|c|1|Terrorizzi tutti; chi sta scappando viene falciato.|circ r16 fear4; wait t1.2; pop fear r4 d130/165/200
U|Risveglio|c|1|Stordisci tutti a lungo; al risveglio li aspetta un'esplosione ciascuno.|circ r15 stun3; wait t2.6; pop stun r5 d120/150/180
# ===== ABILITA: ultime =====
S|Zappa e semina|b|9|Sollevi chi hai davanti e sotto di loro lasci il fuoco.|cone r8 h.7 lift1.2:10; zone @fwd5 r4 t4 dps12/15/18
S|Colpo di frusta lungo|a|6|Una linea lunga che tira a te il primo che prende.|line l16 w1.4 max1 yank d18/23/28
S|Abbraccio|b|9|Tiri a te tutti e ti copri in proporzione.|circ r8 pull18 d8/10/12 sh8/10/12
S|Ruggito del capo|b|10|Spaventi i nemici e rafforzi i tuoi spiriti chiamandone uno in piu.|circ r9 fear2; sum spirito n1 t10 hp60 d12/15/18
S|Scintilla|a|5|Un colpetto istantaneo che stordisce un attimo e carica Risonanza.|tgt d14/18/22 stun.4 res6
S|Barricata che cura|c|12|Un muro davanti e un cerchio che ti cura dietro.|sum muro n4 wall @fwd4 t8; zone r3.5 t8 zheal6/8/10
S|Ghigliottina|b|9|Una linea ritardata davanti a te: micidiale contro chi e quasi finito.|line l20 w3 d30/38/46 in.6 ex3
S|Risacca|b|9|Una mezzaluna spinge via; al ritorno li riporta tutti.|shot d14/18/22 v22 wide r3 back t.7 push8
S|Colpo che divide|b|8|Colpisci il bersaglio: tre schegge partono da lui verso i vicini.|tgt d24/30/36 then(shot n3 ringall d12/15/18 v26 hom t.8)
S|Salva di mortai|b|9|Quattro colpi cadono in fila davanti a te, tutti insieme.|circ @fwd6 r3 d22/28/34 in.7; circ @fwd10 r3 d22/28/34 in.7; circ @fwd14 r3 d22/28/34 in.7; circ @fwd18 r3 d22/28/34 in.7
S|Zolla|a|7|Un pezzo di terra si solleva sotto il nemico piu vicino.|near r12 lift1.5/1.8/2.1:26
S|Ancora di gravita|c|11|Un punto dove guardi tira tutti verso di se per quattro secondi, poi li blocca.|zone @aim g16 r7 t4 zpull1.5 end(circ r7 root2/2.5/3)
S|Colpo elastico|b|8|Spingi via il bersaglio; un secondo dopo torna da te stordito.|tgt d16/20/24 push20; wait t1; tgt yank stun1
S|Punizione dei vicini|b|9|Il bersaglio non si fa nulla: tutti quelli attorno a lui si.|tgt then(ring @tgt r7 i1.5 d36/45/54)
S|Vetro|b|9|Il bersaglio diventa fragile: marchio enorme ma breve.|tgt mark2/2.2/2.4:2.5
S|Macigno|b|8|Un proiettile lento e largo che stordisce e spinge.|shot d30/38/46 v14 r1.4 t1.6 stun1 push10
S|Fiotto|b|8|Una linea che cura te per ogni nemico e li avvelena.|line l18 w2.4 d14/18/22 heal4/5/6 pois2
S|Scudo condiviso|c|12|Scudo a te e uno spirito guaritore che resta poco.|buff shield40/50/60 t5; sum guaritore n1 t5 d8/10/12
S|Giro di boa|b|9|Tre anelli stretti, uno dopo l'altro, sempre nello stesso punto: a media distanza.|rep n3 ev.5 do(ring r8 i5 d18/23/28)
S|Colpo basso|a|6|Colpo corto che rallenta molto e indebolisce.|cone r4 h.9 d16/20/24 slow.7:3 weak4
S|Squarcio|b|8|Un colpo corto: sanguina a lungo.|cone r4.5 h1 d14/18/22 burn14 pois3
S|Onda sonica|b|9|Un cono lunghissimo e stretto che stordisce.|cone r16 h.25 d18/23/28 stun1/1.3/1.6
S|Nebbia fitta|b|11|Una nube enorme attorno a te: ti nasconde e rallenta chi entra.|zone r8 t5 inv dome slow.4:1
S|Stretta finale|c|11|Blocchi tutti attorno; se sono tre o piu, esplodi anche.|circ r7 root2; if count3 do(circ r7 d36/45/54)
S|Semaforo|b|10|Fermi il tempo un istante, giusto per riposizionarti, e corri.|freeze t1; buff haste1.6 t2.5
S|Ago e filo|c|10|Colpisci il bersaglio e lo leghi al nemico piu vicino: si tirano l'uno verso l'altro.|tgt d18/23/28 then(circ @tgt r9 pull20 max3 d10/13/16)
S|Doppia mandata|b|10|Blocchi il bersaglio; quando si libera resta rallentato e marchiato.|tgt root2.5 slow.6:6 mark1.3:6
`);
