Bricks.load(String.raw`
# ===== ABILITA: aree e colpi =====
S|Onda d'urto|a|6|Un'esplosione attorno a te che allontana tutti.|circ r5.5 d24/30/36 push14
S|Implosione|b|7|Tiri a te tutti quelli attorno e li colpisci.|circ r7.5 d18/23/28 pull18
S|Colpo di tuono|b|8|Stordisci tutti quelli attorno.|circ r5 d14/18/22 stun1/1.3/1.6
S|Vampata|a|6|Un ventaglio di fuoco.|cone r9 h.6 d26/33/40 burn8
S|Soffio polare|b|8|Un ventaglio che congela.|cone r9 h.6 d14/18/22 chill4
S|Sputo corrosivo|b|7|Un ventaglio che avvelena e indebolisce.|cone r8 h.6 d12/15/18 pois3 weak4
S|Ruggito|b|9|Chi hai davanti scappa terrorizzato.|cone r10 h.8 fear2/2.5/3
S|Lama di luce|b|6|Una linea lunghissima che trapassa tutto.|line l28 w1.6 d32/40/48
S|Fenditura|b|7|Una linea che blocca al suolo chi prende.|line l18 w2 d18/23/28 root1.5/1.8/2.1
S|Corridoio di vento|b|7|Una linea larga che spinge tutti in fondo.|line l16 w3.5 d12/15/18 push20
S|Linea di sutura|b|8|Una linea che tira tutti verso il suo inizio.|line l20 w2.5 d14/18/22 pull16
S|Anello di fuoco|b|7|Un anello a media distanza: chi ti sta addosso e salvo.|ring r10 i4.5 d30/38/46 burn8
S|Anello di ghiaccio|b|8|Un anello che congela chi sta a media distanza.|ring r10 i4 d14/18/22 chill4 slow.6:3
S|Castigo|b|7|Un colpo istantaneo sul bersaglio mirato.|tgt d42/53/64
S|Sentenza|b|9|Colpo sul bersaglio: enorme se e quasi finito.|tgt d26/33/40 ex2.5
S|Colpo al cuore|c|10|Toglie una grossa fetta della vita rimasta al bersaglio.|tgt d10 hpc.14/.18/.22
S|Maledizione|b|8|Il bersaglio subisce piu danni, colpisce meno e rallenta.|tgt mark1.35:7 weak7 slow.4:7
S|Paralisi|b|9|Blocca a lungo il bersaglio mirato.|tgt d8/10/12 root3/3.6/4.2
S|Sguardo di pietra|b|10|Stordisce a lungo il bersaglio mirato.|tgt stun2/2.5/3
S|Spavento mirato|a|7|Il bersaglio scappa e chi lo vede resta scosso.|tgt fear3/3.5/4 then(circ @tgt r5 weak4)
S|Fulmine a ciel sereno|b|7|Un colpo cade dopo un attimo dove guardi.|circ @aim g20 r3.6 d50/63/76 in.7
S|Tre fulmini|b|8|Tre colpi cadono a caso vicino a dove guardi.|rep n3 ev.25 do(circ @aim g20 r2 d1 in.01; circ @rnd5 r2.8 d26/33/40 in.5)
S|Pilastro di ghiaccio|b|8|Un colpo dal basso che congela.|circ @aim g18 r3.2 d22/28/34 in.6 chill4
S|Eruzione|b|9|Un colpo dal basso che lancia in aria.|circ @aim g18 r3.6 d18/23/28 in.6 lift1.6:22
S|Colpo e risacca|b|8|Un'esplosione che spinge, poi una che tira.|circ r6 d16/20/24 push14; wait t.6; circ r9 d12/15/18 pull16
S|Tre onde|b|9|Tre onde che si allargano attorno a te.|circ r4 d18/23/28; ring r8 i4 d14/18/22 in.25; ring r12 i8 d10/13/16 in.5
S|Onde che si stringono|c|10|Tre anelli che si chiudono verso di te.|ring r12 i8 d12/15/18 pull8; ring r8 i4 d14/18/22 in.3 pull8; circ r4 d22/28/34 in.6
S|Croce|b|8|Quattro linee a croce attorno a te.|line l14 w2 d20/25/30; cone r1 h.1; rep n1 do(circ r3 d10/13/16)
S|Pugno del gigante|b|8|Un colpo enorme davanti a te.|circ @fwd5 r4.5 d40/50/60 stun.5
S|Schiaffo del vento|a|6|Spazzi via chi hai davanti senza fargli molto male.|cone r8 h.9 d6/8/10 push24
S|Presa di terra|b|9|Radici bloccano tutti attorno a te.|circ r7 d8/10/12 root2/2.5/3
S|Grido di guerra che ferisce|b|9|Indebolisci tutti attorno e li marchi.|circ r9 weak6 mark1.25:6
S|Morso del branco|b|8|Ogni nemico colpito attorno a te ti cura.|circ r5.5 d20/25/30 heal4/5/6
S|Mietitura|b|9|Ogni nemico colpito ti da scudo.|circ r6 d18/23/28 sh7/9/11
S|Colpo che ispira|b|8|Ogni nemico colpito carica la Risonanza.|cone r9 h.7 d18/23/28 res4/5/6
S|Rasoiata frenetica|b|8|Ogni nemico colpito accorcia le altre ricariche.|cone r7 h.9 d20/25/30 cdr.5/.6/.7
S|Giudizio dei fermi|b|8|Enorme contro chi e stordito o bloccato.|circ r7 d18/23/28 vsstun2.5 vsroot2.5
S|Frantuma|b|7|Enorme contro chi e rallentato o raffreddato.|cone r9 h.7 d20/25/30 vsslow2.2 vschill2.2
S|Deflagrazione|b|7|Enorme contro chi sta bruciando.|circ r7 d18/23/28 vsburn2.4
S|Colpo dell'untore|b|7|Enorme contro chi e avvelenato.|line l20 w2.4 d18/23/28 vspois2.4
S|Esecuzione di massa|c|10|Attorno a te, chi e quasi finito viene finito.|circ r8 d14/18/22 ex3
S|Tocco lontano|b|8|Colpo a lungo raggio: piu lontano, piu forte.|line l34 w1.2 d24/30/36 far2.5
S|Pugno a bruciapelo|b|6|Colpo corto: da vicinissimo e devastante.|cone r5 h.6 d22/28/34 close2.6
S|Scossa selettiva|b|7|Colpisce solo i tre nemici piu vicini, ma forte.|circ r9 d34/43/52 max3
S|Colpo di rimbalzo|b|7|Colpisce il bersaglio, poi salta sui vicini.|tgt d24/30/36 then(chain n3/4/5 d14/18/22)
S|Fulmine ramificato|b|8|Una scarica lunga che salta molte volte.|chain n6/7/8 d22/28/34 fall.85 r9
S|Catena di ghiaccio|b|9|Una scarica che congela ogni nemico che tocca.|chain n4/5/6 d12/15/18 chill4 r8
S|Catena che lega|c|10|Una scarica che blocca tutti quelli che tocca.|chain n4/5/6 d8/10/12 root1.5/1.8/2.1
S|Catena del terrore|b|9|Una scarica che mette in fuga.|chain n4/5/6 d8/10/12 fear2 fall.9
S|Stella di schegge|b|7|Sedici schegge tutt'attorno a te.|shot n16 ringall d10/13/16 v26 t.6
S|Stella rimbalzante|c|9|Dieci sfere che rimbalzano sui muri.|shot n10 ringall d10/13/16 v24 t1.8 bnc3
S|Corona di lame|c|9|Otto lame partono e tornano.|shot n8 ringall d10/13/16 v22 t.5 back
S|Tre razzi|b|8|Tre razzi a ventaglio.|shot n3 sp.25 d22/28/34 v20 boom3.2
S|Sciame cercatore|b|8|Sei colpi che inseguono i bersagli.|shot n6 sp.35 d10/13/16 v18 hom t2
S|Missile pesante|c|9|Un solo missile che insegue ed esplode enorme.|shot d40/50/60 v14 hom t3 boom5 r.8
S|Lama d'aria|a|5|Una mezzaluna enorme che taglia tutto.|shot d30/38/46 v30 wide r3 t.7
S|Onda di marea|b|8|Una mezzaluna che trascina via.|shot d16/20/24 v20 wide r3.2 t.9 push10
S|Onda che gela|b|8|Una mezzaluna che congela.|shot d14/18/22 v22 wide r3 t.8 chill4
S|Palla di cannone|b|7|Un colpo solo, pesante: spinge e stordisce.|shot d36/45/54 v28 r.8 push12 stun.5
S|Seme di vortice|c|10|Dove arriva nasce un vortice che risucchia.|shot d8 v22 then(zone r5 t3.5 dps8/10/12 zpull1)
S|Seme di gelo|b|9|Dove arriva nasce una lastra di ghiaccio.|shot d8 v22 then(zone r4.5 t5 slow.6:1 chill.6)
S|Spora|b|9|Dove arriva nasce una nube velenosa che si allarga.|shot d6 v20 then(zone r2.5 t5 dps6/8/10 pois1 grow.8)
S|Colpo colonizzatore|c|10|Dove colpisce nascono due spiriti.|shot d14/18/22 v26 then(sum spirito n2 t8 hp40 d9/11/13)
S|Proiettile cluster|c|9|Esplode, poi le schegge esplodono a loro volta.|shot d14/18/22 v20 boom3 then(shot n5 ringall d8/10/12 v16 t.4 boom2)
S|Arpione|b|7|Colpisce e trascina il nemico fino a te.|shot d18/23/28 v36 yank stun.6
S|Colpo telecinetico|b|8|Colpisce il primo nemico e lo scaglia via.|shot d10 v34 fling26/33/40
S|Bolas grande|b|9|All'impatto blocca tutti e li marchia.|shot d8 v26 then(circ r4.5 root2 mark1.25:5)
S|Bomba a orologeria|b|8|La lanci: scoppia dopo due secondi, enorme.|shot d4 v14 t.7 then(circ r6 d60/75/90 in1.4)
S|Granata stordente|b|9|Scoppia stordendo tutti.|shot d6 v20 t.6 then(circ r5.5 d10/13/16 stun1.4/1.7/2)
S|Granata fumogena|b|10|Scoppia in una nube che ti nasconde.|shot d4 v18 t.6 then(zone r5.5 t5 inv dome weak1)
S|Molotov|b|8|Scoppia in una pozza di fuoco.|shot d10/13/16 v18 t.7 then(zone r4.5 t5 dps12/15/18 burn4)
S|Fiala di gelo|b|9|Scoppia e congela, poi il ghiaccio resta.|shot d6 v18 t.7 then(circ r4.5 d10/13/16 chill4; zone r4.5 t4 slow.5:1)
S|Boccetta d'acido|b|9|Scoppia: veleno e armatura sciolta.|shot d6 v18 t.7 then(circ r4.5 d10/13/16 pois4 mark1.3:6)
# ===== ABILITA: zone =====
S|Cerchio di fiamme|b|8|Un cerchio di fuoco dove guardi.|zone @aim g14 r4 t5 dps15/19/23 burn3
S|Lastra di ghiaccio|b|9|Un tratto di suolo gelato dove guardi.|zone @aim g14 r5.5 t6 slow.65:1 chill.5
S|Palude|b|9|Fango che blocca chi ci entra.|zone @aim g14 r4.5 t5 dps4/5/6 root.6
S|Nube di spore|b|9|Una nube velenosa che si allarga.|zone @aim g14 r3 t6 dps7/9/11 pois1 grow.6
S|Campo di paura|b|10|Chi entra nel cerchio scappa.|zone @aim g14 r4.5 t4 fear1
S|Campo di debolezza|b|9|Chi sta nel cerchio colpisce meno e subisce di piu.|zone @aim g14 r5.5 t6 weak1 mark1.25:1
S|Vortice mobile|c|10|Un vortice che avanza risucchiando.|zone @fwd3 r3.5 t4 dps12/15/18 mv6 zpull1
S|Muro di fuoco che avanza|b|9|Una fiamma che corre in avanti.|zone @fwd2 r3 t3 dps22/28/34 mv10 burn4
S|Fronte freddo|b|9|Un fronte gelido che avanza lento.|zone @fwd2 r4 t5 dps6/8/10 mv4 slow.6:1 chill.5
S|Segugio di fiamma|c|10|Una fiamma che insegue i nemici da sola.|zone @fwd3 r2.4 t6 dps18/23/28 seek5.5
S|Nube temporalesca|c|11|Una nube che insegue e lancia scariche.|zone @fwd3 r3 t7 seek3.5 tick(near r6 d16/20/24) ev.8
S|Aura rovente|b|10|Un cerchio di fuoco che ti segue.|zone r4 t6 dps14/18/22 fol
S|Aura gelida|b|10|Un cerchio che rallenta e raffredda, e ti segue.|zone r5 t6 fol slow.5:1 chill.4
S|Aura velenosa|b|10|Una nube che ti segue e avvelena.|zone r4.5 t6 dps4/5/6 fol pois.8
S|Aura di terrore|c|12|Chi ti si avvicina scappa.|zone r4.5 t5 fol fear.8
S|Aura magnetica|c|11|Un campo che ti segue e tira i nemici verso di te.|zone r7 t5 dps5/6/7 fol zpull.6
S|Santuario|b|12|Un cerchio che ti cura e ti copre: prendi meno danni dentro.|zone r4.5 t6 zheal7/9/11 armor.6
S|Cerchio di potere|b|12|Dentro il cerchio colpisci piu forte e ricevi cure.|zone r5 t7 fury1.25/1.3/1.35 zheal3
S|Cupola antiproiettile mobile|c|12|Una cupola che ti segue e ferma i proiettili.|zone r3.5 t5 ward fol dome
S|Buco nero minore|c|11|Risucchia, poi esplode.|zone @aim g14 r5.5 t3 dps6/8/10 zpull1.4 boom40/50/60
S|Zona che cresce|b|10|Un cerchio di fuoco che si allarga sempre di piu.|zone @aim g12 r2 t6 dps11/14/17 grow1
S|Mina di prossimita gigante|b|9|Una zona che dopo tre secondi esplode enorme.|zone @aim g12 r5 t3 slow.3:1 end(circ r6 d60/75/90)
S|Fontana di schegge|c|10|Una zona che spara dardi attorno a se ogni secondo.|zone @aim g14 r2 t6 tick(shot n8 ringall d7/9/11 v22 t.5) ev1
S|Faro|c|11|Una zona che colpisce a intervalli il nemico piu vicino.|zone @aim g14 r2 t7 tick(near r9 d18/23/28) ev.7
S|Geyser a tempo|b|9|Una zona che ogni secondo lancia in aria chi c'e sopra.|zone @aim g14 r3.5 t5 tick(circ r3.5 d8/10/12 lift.8:10) ev1.2
S|Cuore pulsante|c|11|Una zona che pulsa: ogni battito un'onda che spinge.|zone @aim g12 r2 t5 tick(circ r6 d10/13/16 push10) ev1
S|Trappola a strappo|b|9|Una zona che ogni secondo tira tutti al centro.|zone @aim g14 r6 t4 tick(circ r6 pull14 d5/6/7) ev1
S|Nido|c|12|Una zona da cui escono spiriti-bomba uno alla volta.|zone @aim g10 r2 t6 tick(sum bomba n1 t5 d18/23/28) ev1.5
S|Pioggia acida|b|10|Sull'area piovono gocce a caso.|zone @aim g16 r6 t5 tick(circ @rnd6 r2.2 d14/18/22 in.3 pois1) ev.35
S|Tempesta di fulmini locale|c|11|Sull'area cadono fulmini a caso.|zone @aim g16 r7 t5 tick(circ @rnd7 r2.6 d24/30/36 in.4) ev.5
S|Grandinata|b|10|Sull'area cade grandine che rallenta.|zone @aim g16 r6 t5 slow.4:1 tick(circ @rnd6 r2 d10/13/16 in.25) ev.3
S|Scia di lava|b|9|Tre pozze in fila davanti a te.|zone @fwd4 r2.6 t4 dps12/15/18; zone @fwd8 r2.6 t4 dps12/15/18; zone @fwd12 r2.6 t4 dps12/15/18
S|Tenaglia di ghiaccio|c|10|Una lastra davanti e una dietro: chi ti insegue rallenta.|zone @fwd6 r4 t5 slow.6:1; zone @back6 r4 t5 slow.6:1 chill.5
S|Cerchio e centro|c|11|Un anello di fuoco con al centro un rifugio che ti cura.|ring r9 i4 d16/20/24 burn8; zone r3.5 t5 zheal6/8/10
S|Fossato|c|11|Un cerchio largo di fango attorno a te: chi entra arranca.|zone r9 t6 slow.7:1 dps3/4/5
S|Zona che esplode a catena|c|11|Una pozza che alla fine scoppia e lascia tre pozze piu piccole.|zone @aim g14 r3.5 t3 dps10/13/16 end(circ r4.5 d24/30/36; zone @rnd4 r2 t3 dps8/10/12; zone @rnd4 r2 t3 dps8/10/12)
S|Occhio del ciclone|c|12|Attorno a te un vortice che spinge fuori tutti.|zone r6 t5 fol tick(circ r6 push12 d4/5/6) ev.5
S|Sabbie mobili|b|10|Rallenta sempre di piu: alla fine blocca.|zone @aim g14 r5 t5 slow.5:1 end(circ r5 root2/2.5/3)
S|Brace che cova|b|9|Una zona debole che alla fine divampa.|zone @aim g14 r4 t4 dps5/6/7 end(circ r5.5 d40/50/60 burn8)
S|Gelo che stringe|b|10|Una zona che raffredda e alla fine congela tutti.|zone @aim g14 r5 t3.5 slow.4:1 end(circ r5 d14/18/22 stun1.5/1.8/2.1)
S|Rovi|b|9|Un cespuglio di spine: ferisce e blocca a tratti.|zone @aim g14 r4 t6 dps9/11/13 tick(circ r4 root.5) ev2
S|Fumo soporifero|c|12|Una nube: chi resta dentro alla fine si addormenta.|zone @aim g14 r5 t3 weak1 end(circ r5 stun2.2/2.6/3)
S|Altare del sangue|c|12|Una zona che ferisce i nemici dentro e ti cura a ogni battito.|zone @aim g12 r5 t5 tick(circ r5 d8/10/12 heal2/2.5/3) ev.8
S|Specchio d'acqua|c|11|Una zona che carica la Risonanza per ogni nemico dentro.|zone @aim g14 r5.5 t5 tick(circ r5.5 d5/6/7 res2/2.5/3) ev1
S|Zona di caccia|b|10|Chi entra nel cerchio viene marchiato a lungo.|zone @aim g14 r6 t6 mark1.3:3
S|Fornace|c|11|Un cerchio piccolo e rovente: brucia una parte della vita di chi ci sta.|zone @aim g14 r3.2 t5 tick(circ r3.2 d4 hpc.04/.05/.06) ev.6
`);
