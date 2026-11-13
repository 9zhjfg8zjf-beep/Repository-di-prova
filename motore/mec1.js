Bricks.load(String.raw`
# ===== PRIMARI: proiettili =====
P|Spillo|a|0.22|Un ago rapidissimo che passa attraverso tutti.|shot d6/7.5/9 v46 pierce
P|Chiodo rovente|a|0.4|Un colpo che lascia il bersaglio in fiamme.|shot d9/11/13 v34 burn5
P|Dardo gelido|a|0.4|Ogni colpo raffredda: al quarto il nemico si congela.|shot d9/11/13 v34 chill1
P|Spina tossica|a|0.38|Ogni colpo aggiunge una dose di veleno.|shot d7/9/11 v34 pois1
P|Dardo fiacco|a|0.42|Chi viene colpito picchia meno forte.|shot d9/11/13 v32 weak3
P|Segnatore|a|0.5|Marchia il bersaglio: tutto gli fa piu male.|shot d8/10/12 v36 mark1.2:4
P|Bolas|b|0.7|Un colpo che inchioda al suolo per un attimo.|shot d12/15/18 v28 root.8
P|Zavorra|a|0.45|Rallenta chi colpisce.|shot d9/11/13 v30 slow.4:2
P|Colpo di maglio a distanza|b|0.8|Un proiettile pesante che spinge indietro.|shot d16/20/24 v26 r.7 push9
P|Arpione corto|b|0.9|Colpisce e tira il nemico verso di te.|shot d14/18/22 v34 yank
P|Doppietta|a|0.42|Due colpi affiancati.|shot n2 sp.06 d6/7.5/9 v36
P|Ventaglio di lame|b|0.7|Cinque lame larghe che attraversano tutti.|shot n5 sp.16 d5/6/7 v30 pierce
P|Stormo|b|0.6|Quattro colpi sparsi che cercano il bersaglio.|shot n4 sp.3 d5/6/7 v20 hom jit.1
P|Cerca-calore|b|0.55|Un colpo solo, ma ti segue il nemico dietro gli angoli.|shot d13/16/19 v18 hom t2.2
P|Grandine|b|0.16|Colpi minuscoli e imprecisi, a pioggia.|shot d3.4/4.1/4.8 v38 jit.12
P|Palla da biliardo|b|0.5|Rimbalza sui muri e buca i nemici.|shot d9/11/13 v30 bnc4 pierce t2.4
P|Granata a mano|b|0.9|Esplode dove tocca.|shot d22/27/32 v20 boom3.2
P|Granata a grappolo|c|1.1|Esplode e si divide in schegge.|shot d18/22/26 v20 boom3 split5
P|Seme esplosivo|b|0.85|Dove arriva nasce una chiazza che brucia.|shot d10/12/14 v24 then(zone r2.4 t3 dps9/11/13)
P|Lancia-mine|b|1|Il colpo si ferma e scoppia dopo un attimo.|shot d6 v22 t.6 then(circ r3.2 d24/30/36 in.5)
P|Sfera gravitazionale|c|1.2|Lenta: tira a se chi le passa vicino.|shot d4/5/6 v7 aura3 t3.5 pull6
P|Sfera di brina|c|1.3|Lenta: rallenta e raffredda tutto attorno.|shot d4/5/6 v7 aura3 t3.5 slow.4:1 chill.3
P|Disco tagliente|b|0.75|Va, taglia, torna.|shot d9/11/13 v26 back t.55 wide r1.2
P|Falce lunare|b|0.8|Una mezzaluna larga che attraversa tutto.|shot d13/16/19 v28 wide r2 t.7
P|Onda fredda|b|0.85|Una mezzaluna che rallenta chi tocca.|shot d11/14/17 v24 wide r2 t.7 slow.5:2
P|Scheggia che si divide|b|0.6|Alla fine della corsa si apre in tre.|shot d10/12/14 v32 t.5 split3
P|Colpo a catena|b|0.5|Dal punto d'impatto parte una scarica verso i vicini.|shot d8/10/12 v36 then(chain n2/3/4 d7/9/11 r7)
P|Proiettile ombra|b|0.6|Dove colpisce, un secondo colpo parte verso un altro nemico.|shot d10/12/14 v34 then(shot d8/10/12 v30 skip)
P|Colpo che fiorisce|c|0.9|All'impatto sboccia in sei spine.|shot d10/12/14 v30 then(shot n6 ringall d5/6/7 v22 t.4)
P|Dardo vampiro|b|0.45|Ogni colpo ti rende un po di vita.|shot d9/11/13 v34 then(heal v1/1.3/1.6)
P|Colpo risonante|b|0.5|Ogni colpo carica la Risonanza.|shot d8/10/12 v34 then(res v.8/1/1.2)
P|Pallottola pesante|b|0.95|Lenta da ricaricare, fa malissimo.|shot d34/42/50 v44 r.5
P|Spara-chiodi|a|0.3|Chiodi corti: poca gittata, tanto ritmo.|shot d8/10/12 v36 t.3
P|Sputo acido|b|0.6|Avvelena e indebolisce.|shot d6/8/10 v24 pois2 weak2
P|Scintilla nervosa|b|0.36|Rimbalza una volta e stordisce un istante.|shot d7/9/11 v34 bnc1 stun.15
P|Freccia tripla in fila|b|0.9|Tre colpi uno dietro l'altro.|rep n3 ev.09 do(shot d8/10/12 v38)
P|Raffica a ventaglio|c|1|Due salve di tre colpi.|rep n2 ev.15 do(shot n3 sp.16 d6/7/8 v32)
P|Colpo e contraccolpo|b|0.7|Spari avanti e una scheggia parte anche dietro.|shot d13/16/19 v34; shot d6/8/10 v30 ringall n2
P|Lanciadardi a corona|b|0.9|Otto dardi tutt'attorno a te.|shot n8 ringall d7/9/11 v26 t.5
P|Stella rotante|c|1.1|Dodici schegge in cerchio che rimbalzano.|shot n12 ringall d5/6/7 v22 t.9 bnc1
P|Colpo ad arco lento|b|1|Una bomba lenta che esplode largo.|shot d8 v12 t1.1 then(circ r4.5 d28/35/42)
P|Bengala|b|0.9|Marchia tutti quelli vicino al punto d'impatto.|shot d8/10/12 v30 then(circ r4 mark1.25:5)
P|Rete|b|1.1|All'impatto blocca tutti nel raggio.|shot d5 v24 then(circ r3.5 root1/1.3/1.6)
P|Globo instabile|c|1.2|Viaggia lento bruciando, poi esplode.|shot d4/5/6 v8 aura2.6 t2.5 then(circ r4 d26/32/38)
P|Lama boomerang doppia|c|1|Due lame che vanno e tornano allargandosi.|shot n2 sp.5 d8/10/12 v24 back t.5 wide r1
P|Colpo perforante marchiante|b|0.7|Attraversa una fila intera e la marchia.|shot d9/11/13 v40 pierce mark1.15:3
P|Proiettile che spaventa|b|0.8|Chi viene preso scappa per un attimo.|shot d10/12/14 v30 fear.8
# ===== PRIMARI: colpi istantanei e mischia =====
P|Rotaia|b|0.8|Una linea istantanea che trapassa tutto.|line l26 w1 d18/22/26
P|Taglio largo|a|0.45|Un fendente davanti a te.|cone r3.6 h1.1 d17/21/25
P|Spazzata bassa|b|0.7|Colpisce tutto attorno a te.|circ r3.8 d16/20/24
P|Pugno pesante|b|0.75|Un colpo corto che scaraventa via.|cone r3 h.8 d20/25/30 push14
P|Morso|a|0.45|Un colpo corto che ti cura.|cone r3 h.7 d14/17/20 ls.12
P|Artiglio avvelenato|a|0.4|Fendente che avvelena.|cone r3.4 h1 d12/15/18 pois1
P|Lama ardente|a|0.45|Fendente che incendia.|cone r3.4 h1 d12/15/18 burn6
P|Lama di ghiaccio|a|0.45|Fendente che raffredda.|cone r3.4 h1 d12/15/18 chill1
P|Mazzata stordente|b|0.95|Lenta: stordisce chi prende.|cone r3.4 h.9 d30/37/44 stun.5
P|Colpo esecutore|b|0.5|Fa molto piu male ai nemici quasi finiti.|cone r3.4 h.9 d13/16/19 ex2.2
P|Colpo ravvicinato|a|0.35|Piu sei vicino, piu fa male.|line l9 w1 d8/10/12 close2.2
P|Tiro lungo|b|0.7|Piu il bersaglio e lontano, piu fa male.|line l30 w.8 d12/15/18 far2.2
P|Frustata che avvicina|b|0.6|Colpo lungo che tira a te.|line l9 w1.2 d11/14/17 pull9
P|Calcio rotante|b|0.6|Colpisce attorno e allontana.|circ r3.4 d13/16/19 push9
P|Anello tagliente|b|0.7|Colpisce solo chi sta a media distanza, non chi ti sta addosso.|ring r7 i3 d18/22/26
P|Dito puntato|a|0.4|Colpisce all'istante chi stai mirando, senza proiettile.|tgt d11/13/15
P|Dito che brucia|b|0.5|Colpo istantaneo sul bersaglio mirato, che prende fuoco.|tgt d9/11/13 burn7
P|Tocco che consuma|b|0.5|Toglie una parte della vita che resta al bersaglio.|tgt d4 hpc.03/.04/.05
P|Sguardo che pesa|b|0.6|Il bersaglio mirato rallenta e si indebolisce.|tgt d8/10/12 slow.4:2 weak2
P|Auto-mira|b|0.5|Colpisce da solo il nemico piu vicino.|near r14 d9/11/13
P|Scossa di prossimita|b|0.45|Colpisce il piu vicino e lo stordisce un istante.|near r9 d8/10/12 stun.15
P|Arco voltaico|b|0.5|Una scarica che salta tra piu nemici.|chain n3/4/5 d10/12/14 fall.75
P|Arco gelido|b|0.6|Una catena che raffredda tutti quelli che tocca.|chain n3/4/5 d8/10/12 chill1
P|Arco velenoso|b|0.6|Una catena che avvelena.|chain n4/5/6 d6/8/10 pois1 fall.85
P|Contagio di fiamme|b|0.65|Una catena che incendia.|chain n3/4/5 d7/9/11 burn6 r9
P|Colpo tellurico|b|0.9|Dopo un attimo il suolo scoppia dove guardi.|circ @aim g18 r3 d24/30/36 in.45
P|Colonna di fuoco|b|1|Una colonna cade dove guardi e incendia.|circ @aim g18 r2.6 d18/23/28 in.5 burn8
P|Geyser|b|1|Solleva in aria chi sta dove guardi.|circ @aim g16 r2.6 d10/13/16 in.5 lift1.2:14
P|Schianto di punta|b|0.9|Colpo a terra davanti a te con onda d'urto.|circ @fwd4 r3.2 d20/25/30 push7
P|Fendente doppio|b|0.6|Due tagli rapidi uno dopo l'altro.|rep n2 ev.14 do(cone r3.4 h1 d9/11/13)
P|Taglio a croce|b|0.75|Una linea avanti e una spazzata attorno.|line l8 w1.4 d12/15/18; circ r3 d8/10/12
P|Colpo e scheggia|b|0.6|Fendente; se colpisce, parte una scheggia.|cone r3.4 h1 d12/15/18 then(shot d8/10/12 v30 skip)
P|Fendente che risuona|b|0.55|Ogni nemico colpito carica la Risonanza.|cone r3.6 h1.1 d12/15/18 res.6
P|Lama che protegge|b|0.6|Ogni nemico colpito ti da un po di scudo.|cone r3.6 h1.1 d12/15/18 sh2/2.5/3
P|Lama frenetica|b|0.55|Ogni nemico colpito accorcia le tue ricariche.|cone r3.6 h1.1 d12/15/18 cdr.12
P|Colpo di scudo|b|0.8|Spinge via e ti copre un poco.|cone r3 h1 d12/15/18 push12 sh3
# ===== PRIMARI: ritmo e condizioni =====
P|Tre tempi|b|0.4|Due colpi normali, il terzo esplode.|nth3 do(shot d14/17/20 v30 boom3) else(shot d9/11/13 v34)
P|Quarto colpo perforante|b|0.36|Ogni quarto colpo trapassa tutto.|nth4 do(line l24 w1 d20/25/30) else(shot d8/10/12 v36)
P|Combo di lama|b|0.42|Taglio, taglio, poi una spazzata tutt'attorno.|nth3 do(circ r4.2 d20/25/30) else(cone r3.4 h1 d12/15/18)
P|Uno-due|a|0.38|Alterna un colpo lungo e uno largo.|nth2 do(cone r3.2 h1.2 d13/16/19) else(line l7 w1 d13/16/19)
P|Sinistro destro montante|c|0.4|Il terzo pugno solleva in aria.|nth3 do(cone r3 h.8 d16/20/24 lift1:12) else(cone r3 h.8 d11/14/17)
P|Lama e pistola|b|0.45|Da vicino tagli, da lontano spari.|if near4 do(cone r3.4 h1 d16/20/24) else(shot d10/12/14 v34)
P|Fucile a baionetta|b|0.5|Da vicino affondi e spingi, da lontano spari un colpo perforante.|if near3.5 do(line l5 w1.4 d18/22/26 push8) else(shot d10/12/14 v38 pierce)
P|Mano tesa|b|0.5|Col bersaglio agganciato colpisci all'istante, senno spari.|if tgt do(tgt d12/15/18) else(shot d9/11/13 v32)
P|Furia del ferito|b|0.4|Sotto meta vita spari due colpi invece di uno.|if hpb50 do(shot n2 sp.08 d9/11/13 v36) else(shot d10/12/14 v36)
P|Colpo sereno|b|0.45|A vita alta fa piu male e trapassa.|if hpa80 do(shot d13/16/19 v38 pierce) else(shot d9/11/13 v34)
P|Passo e tiro|b|0.4|Fermo spari preciso e forte, in corsa spari a raffica larga.|if still do(shot d14/17/20 v44) else(shot n2 sp.2 d6/7.5/9 v32)
P|Colpo in corsa|b|0.42|In movimento i colpi cercano il bersaglio.|if moving do(shot d9/11/13 v24 hom) else(shot d10/12/14 v36)
P|Accerchiato|b|0.6|Con tre nemici addosso colpisci tutt'attorno.|if count3 do(circ r4.5 d18/22/26 push6) else(cone r3.4 h1 d15/18/21)
P|Risonanza alta|b|0.45|Con la Risonanza oltre meta ogni colpo esplode.|if resa50 do(shot d11/13/15 v32 boom2.6) else(shot d10/12/14 v34)
P|Colpo sul bruciato|b|0.45|Ai nemici in fiamme fa molto piu male.|tgt d10/12/14 vsburn1.9
P|Colpo sul congelato|b|0.5|Ai nemici rallentati fa molto piu male.|line l22 w.9 d10/12/14 vsslow1.9
P|Colpo sul marchiato|b|0.45|Ai nemici marchiati fa molto piu male.|shot d9/11/13 v36 pierce then(pop mark r2.5 d14/18/22)
P|Giustiziere dei fermi|b|0.5|Ai nemici storditi o bloccati fa il doppio.|cone r3.6 h1 d12/15/18 vsstun2 vsroot2
P|Colpo che approfitta|b|0.5|Ai nemici avvelenati o indeboliti fa molto piu male.|shot d10/12/14 v34 then(near r2 d6/8/10 vspois2.5 vsweak2.5)
P|Sangue per sangue|b|0.35|Ogni colpo ti costa un po di vita ma picchia duro.|cost v1.5; shot d17/21/25 v38
P|Patto di lama|b|0.45|Paghi vita, il fendente e enorme.|cost v2; cone r4.6 h1.2 d26/32/38
P|Scudo che spara|b|0.5|Se hai scudo i colpi trapassano e bruciano.|if shielded do(shot d11/13/15 v36 pierce burn5) else(shot d9/11/13 v34)
P|Colpo dall'ombra|b|0.5|Da nascosto colpisci all'istante e marchi.|if veiled do(tgt d16/20/24 mark1.3:5) else(shot d10/12/14 v34)
# ===== PRIMARI: zone, evocazioni, stranezze =====
P|Semina-braci|c|1.1|Ogni colpo lascia una chiazza dove guardi.|zone @aim g14 r2.2 t3 dps12/15/18
P|Pozza di melma|c|1.3|Una pozza che rallenta e avvelena dove guardi.|zone @aim g14 r2.8 t4 dps5/6/7 slow.5:1 pois.5
P|Tornado tascabile|c|1.6|Un vortice che avanza da solo.|zone @fwd2 r2 t3 dps14/17/20 mv7
P|Nube che insegue|c|2|Una nuvoletta che cerca i nemici da sola.|zone @fwd3 r1.8 t5 dps11/14/17 seek4
P|Lancia-spiriti|c|1.8|Ogni colpo e uno spirito che corre a esplodere.|sum bomba n1 t6 d20/26/32
P|Trottola|c|1.5|Una lama rotante resta dove la lanci.|shot d3 v20 t.4 then(zone r2 t3 dps15/19/23)
P|Chiodo e martello|b|0.6|Blocchi il bersaglio mirato; se e gia bloccato lo colpisci forte.|if hasroot do(tgt d24/30/36) else(tgt d6/8/10 root1.2)
P|Marchia ed esplodi|b|0.5|Alterna: un colpo marchia, il successivo fa scoppiare i marchi.|nth2 do(pop mark r3 d16/20/24) else(shot d7/9/11 v36 mark1.2:4)
P|Brucia e spegni|b|0.55|Un colpo incendia, il successivo fa esplodere chi brucia.|nth2 do(pop burn r3 d18/22/26) else(shot d6/8/10 v34 burn8)
P|Soffio corto|a|0.14|Un getto continuo a ventaglio.|cone r6.5 h.5 d3.4/4.2/5 tk
P|Lanciafiamme|b|0.14|Getto continuo che incendia.|cone r7.5 h.42 d2.8/3.4/4 tk burn6
P|Getto criogenico|b|0.14|Getto continuo che raffredda fino a congelare.|cone r7 h.42 d2.6/3.2/3.8 tk chill.15
P|Nube tossica a spruzzo|b|0.14|Getto continuo che avvelena.|cone r7 h.5 d2.4/3/3.6 tk pois.15
P|Raggio trattore|b|0.14|Un raggio che trascina verso di te.|line l16 w1 d2.4/3/3.6 tk pull2.2
P|Raggio repulsore|b|0.14|Un raggio che spinge via.|line l14 w1.2 d2.6/3.2/3.8 tk push2.4
P|Raggio sottile|a|0.12|Un raggio continuo e preciso.|line l22 w.5 d3.6/4.4/5.2 tk
P|Raggio che cura|b|0.14|Il raggio ti restituisce parte del danno.|line l18 w.7 d3/3.7/4.4 tk ls.15
P|Sega circolare|b|0.14|Lame continue tutt'attorno a te.|circ r3 d3.4/4.2/5 tk
P|Aura che consuma|b|0.2|Brucia una parte della vita di chi ti sta vicino.|circ r4 d1 hpc.004/.005/.006 tk
P|Sguardo fisso|b|0.14|Un raggio sul bersaglio mirato che lo indebolisce.|tgt d3/3.7/4.4 tk weak1
P|Trapano|b|0.14|Raggio corto: piu sei vicino, piu macina.|line l8 w1 d2.6/3.2/3.8 tk close2.4
P|Laser da cecchino|b|0.14|Raggio lunghissimo: da lontano fa piu male.|line l34 w.5 d2.2/2.7/3.2 tk far2.4
P|Fiamma ossidrica|b|0.14|Cortissimo, ma chi brucia gia brucia il doppio.|cone r4 h.35 d3/3.7/4.4 tk burn5 vsburn1.6
P|Scarica continua a catena|c|0.3|Una scarica costante che salta tra i nemici.|chain n3/4/5 d4/5/6 fall.85 r8
P|Mietitrebbia|c|0.2|Un anello continuo a media distanza.|ring r6.5 i2.5 d3/3.7/4.4 tk
P|Colpo di tosse velenosa|b|0.9|Una nube davanti a te che resta un poco.|cone r5 h.8 d8/10/12 pois2 then(zone @fwd3 r2.6 t2.5 dps6/8/10)
P|Tuono a mani giunte|b|1|Un'onda davanti a te che stordisce.|cone r6 h.9 d16/20/24 stun.4 push5
P|Urlo|b|1.1|Spaventa chi hai davanti.|cone r8 h.8 d10/13/16 fear1
P|Colpo che scambia|c|1.4|Colpisci il bersaglio mirato e vi scambiate di posto.|tgt d14/18/22 swap
P|Lancio del nemico|c|1.5|Scagli via il bersaglio mirato: fa male dove atterra.|tgt d6 fling24/30/36
P|Pioggerella|c|0.5|Piccoli colpi cadono a caso attorno al punto che guardi.|circ @aim g16 r1.6 d9/11/13 in.35; circ @rnd4 r1.6 d9/11/13 in.5
P|Martello che rimbomba|c|1.1|Un colpo a terra e due onde che si allargano.|circ r3 d18/22/26; ring r6 i3 d10/13/16 in.25; ring r9 i6 d7/9/11 in.5
P|Tiro al piattello|b|0.8|Un colpo in aria che ricade sul piu vicino al punto mirato.|near @aim g18 r6 d24/30/36
P|Spari dal cielo|b|0.7|Il colpo cade dall'alto sul bersaglio mirato dopo un attimo.|circ @tgt r2 d20/25/30 in.4
P|Mina vagante|c|1.4|Lanci una mina che cerca i nemici e scoppia.|zone @fwd2 r1.4 t4 seek6 end(circ r3.6 d30/38/46)
P|Sciabolata che lascia il segno|b|0.7|Il fendente lascia a terra una striscia che brucia.|cone r3.6 h1 d12/15/18 then(zone @fwd3 r2 t2.5 dps8/10/12)
P|Colpo a ricaduta|b|0.8|Colpo secco; poco dopo, un secondo scoppio nello stesso punto.|shot d10/12/14 v32 then(circ r2.6 d12/15/18 in.6)
P|Lama che allunga|b|0.5|Se manchi, niente; se colpisci, il prossimo raggio e piu lungo.|cone r3.4 h1 d13/16/19 then(line l12 w1 d7/9/11)
P|Pugno e onda|b|0.7|Se il pugno va a vuoto parte comunque un'onda corta.|cone r3 h.8 d19/24/29 miss(shot d8/10/12 v26 wide r1.6 t.4)
P|Rimbalzo tra nemici|b|0.6|Il colpo passa dal primo al piu vicino, e poi a un terzo.|shot d10/12/14 v34 then(shot d8/10/12 v30 skip then(shot d6/8/10 v30 skip))
`);
