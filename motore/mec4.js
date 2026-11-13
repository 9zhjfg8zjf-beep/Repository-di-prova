Bricks.load(String.raw`
# ===== ABILITA: evocazioni =====
S|Branco|b|14|Tre spiriti combattono per te.|sum spirito n3 t12 hp40 d9/11/13
S|Guardia del corpo|c|16|Un colosso piccolo ti difende.|sum colosso n1 t12 hp160/200/240 d18/22/26
S|Batteria|b|14|Una torretta che spara da sola.|sum torretta n1 t14 d8/10/12 @fwd2
S|Due nidi di mitragliatrice|c|16|Due torrette ai tuoi lati.|sum torretta n2 t10 d6/8/10 far3
S|Manichino|a|10|Un'esca che attira i nemici e poi esplode.|sum esca n1 t5 d30/38/46 r4 @fwd3
S|Kamikaze|b|9|Tre spiriti corrono a esplodere sui nemici.|sum bomba n3 t7 d22/28/34
S|Sciame di kamikaze|c|12|Sei spiriti esplosivi tutt'attorno.|sum bomba n6 t6 d16/20/24 far3.5
S|Arcieri|b|14|Due tiratori ti coprono da lontano.|sum arciere n2 t12 hp45 d10/13/16
S|Linea di tiro|c|16|Quattro tiratori in fila accanto a te.|sum arciere n4 t9 hp40 d8/10/12 wall
S|Infermiere|b|15|Uno spirito ti segue e ti cura.|sum guaritore n1 t12 hp60 d5/6.5/8
S|Muro|a|9|Un muro davanti a te.|sum muro n4 wall @fwd4 t8 hp140/180/220
S|Barricata lontana|b|10|Un muro largo dove guardi.|sum muro n6 wall @aim g14 t8 hp120/150/180
S|Recinto|c|12|Un cerchio di muri attorno al punto che guardi.|sum muro n7 @aim g14 far4.5 t6 hp140
S|Bunker|c|13|Un cerchio di muri attorno a te.|sum muro n6 far3.2 t7 hp160/200/240
S|Muro che esplode|c|11|Un muro che quando cade esplode.|sum muro n4 wall @fwd4 t5 hp100 die(circ r3.2 d22/28/34)
S|Spiriti vendicativi|c|14|Spiriti che esplodono quando muoiono.|sum spirito n3 t10 hp30 d8/10/12 die(circ r3.2 d20/25/30)
S|Torretta autodistruttiva|c|13|Spara, e alla fine salta in aria.|sum torretta n1 t8 d9/11/13 @fwd2 die(circ r5 d40/50/60)
S|Esca gelida|b|11|Un'esca che esplodendo congela.|sum esca n1 t4 d10 r4 @fwd3 die(circ r5 chill4 d10/13/16)
S|Esca velenosa|b|11|Un'esca che lascia una nube di veleno.|sum esca n1 t4 d10 r3 @fwd3 die(zone r4.5 t5 dps8/10/12 pois1)
S|Esca che chiama rinforzi|c|13|Quando l'esca cade, nascono due spiriti.|sum esca n1 t4 d16 r3 @fwd3 die(sum spirito n2 t8 hp40 d9/11/13)
S|Colosso instabile|c|15|Un colosso che cadendo libera un'onda d'urto.|sum colosso n1 t9 hp140 d20/25/30 die(circ r6 d30/38/46 push14)
S|Guaritore martire|c|15|Ti cura; se muore, ti lascia uno scudo.|sum guaritore n1 t10 hp40 d5/6/7 die(buff shield30/38/46 t5)
S|Squadra mista|c|16|Un tiratore, un guaritore e uno spirito.|sum arciere n1 t11 d10/13/16; sum guaritore n1 t11 d4; sum spirito n1 t11 d10/13/16
S|Avanguardia|c|14|Due spiriti davanti e un muro dietro di loro.|sum spirito n2 @fwd6 t10 hp50 d10/13/16; sum muro n3 wall @fwd3 t8
S|Postazione fortificata|c|15|Una torretta protetta da due muri.|sum torretta n1 @fwd3 t12 d9/11/13; sum muro n2 wall @fwd5 t10
S|Evocazione sul bersaglio|c|12|Tre spiriti compaiono attorno a chi stai mirando.|aim; sum spirito n3 @tgt far2.5 t8 hp35 d9/11/13
S|Bomba sul bersaglio|b|9|Un kamikaze compare addosso al bersaglio.|aim; sum bomba n2 @tgt far1.5 t4 d26/33/40
S|Gabbia di muri|c|12|Chiudi il bersaglio in un recinto.|aim; sum muro n6 @tgt far3 t5 hp120
S|Chiamata del sangue|c|12|Paghi vita, ottieni un colosso.|cost v20; sum colosso n1 t14 hp260/320/380 d26/32/38
S|Un soldato per nemico|c|14|Evochi uno spirito per ogni nemico vicino.|circ r10 max6 each(sum spirito n1 t9 hp35 d9/11/13)
S|Spiriti a ondate|c|14|Uno spirito al secondo, per cinque secondi.|rep n5 ev1 do(sum spirito n1 t7 hp35 d9/11/13)
S|Pioggia di kamikaze|c|12|Quattro spiriti esplosivi cadono vicino a dove guardi.|rep n4 ev.3 do(sum bomba n1 @aim g16 t5 d20/25/30)
# ===== ABILITA: potenziamenti =====
S|Scudo breve e forte|a|8|Uno scudo robusto per pochi secondi.|buff shield55/70/85 t3
S|Pelle di pietra|b|12|Per un po subisci la meta dei danni.|buff armor.5 t5/6/7
S|Rigenerazione|a|11|Recuperi vita lentamente ma a lungo.|buff hot36/46/56 t8
S|Furia|b|12|Colpisci piu forte per qualche secondo.|buff fury1.35/1.45/1.55 t6
S|Sete di sangue|b|12|Per un po ogni tuo colpo ti cura.|buff ls.12/.15/.18 t7
S|Fretta|b|12|Per un po tutte le ricariche vanno piu veloci.|buff cdr2/2.3/2.6 t5
S|Ispirazione|b|12|Per un po la Risonanza si carica molto piu in fretta.|buff resrate2.2/2.6/3 t8
S|Spine|b|11|Chi ti colpisce si fa male, e i proiettili tornano indietro.|buff reflect.7/.9/1.1 t4
S|Lame in orbita|b|11|Tre lame ti girano attorno.|buff orbit20/25/30 r3 t8
S|Mantello|b|11|Sparisci: il primo colpo da nascosto e doppio.|buff veil2/2.3/2.6 t5
S|Berserk|c|13|Colpisci molto piu forte, ma subisci di piu.|buff fury1.6/1.75/1.9 armor1.4 t6
S|Guardia alta|c|12|Subisci pochissimo, ma colpisci piano.|buff armor.3 fury.6 t5/6/7
S|Trance|c|14|Ricariche rapidissime e Risonanza che vola, per poco.|buff cdr2.5 resrate2.5 t4/5/6
S|Vampiro|c|14|Ti curi coi colpi e colpisci piu forte.|buff ls.1/.12/.14 fury1.25 t7
S|Fortezza|c|14|Scudo, pelle dura e spine insieme.|buff shield30/38/46 armor.7 reflect.5 t5
S|Secondo fiato|b|13|Ti curi subito e continui a curarti.|heal v15/19/23; buff hot20/26/32 t5
S|Scambio equo|b|10|Perdi vita, guadagni molta Risonanza.|cost v15; res v25/32/40
S|Sangue in potere|b|11|Perdi vita, colpisci molto piu forte.|cost v14; buff fury1.6/1.75/1.9 t6
S|Sangue in tempo|b|12|Perdi vita, azzeri le altre ricariche.|cost v16; cdr all
S|Meditazione|b|14|Se stai fermo ti curi molto, se ti muovi poco.|if still do(heal v30/38/46) else(heal v10/13/16)
S|Colpo di reni|b|12|Sotto meta vita ti cura tanto e ti copre; sopra, poco.|if hpb50 do(heal v28/35/42; buff shield25 t4) else(heal v8/10/12)
S|Concentrazione|b|12|A vita piena: grande furia. Ferito: ti curi.|if hpa80 do(buff fury1.5/1.6/1.7 t6) else(buff hot24/30/36 t5)
S|Circondato|b|11|Con tre nemici addosso esplodi e ti copri; senno ti copri soltanto.|if count3 do(circ r5.5 d24/30/36 push12; buff shield30 t4) else(buff shield30/38/46 t4)
S|Opportunista|b|10|Se hai Risonanza oltre meta la trasformi in cure e fretta.|if resa50 do(heal v22/28/34; buff cdr2 t4) else(res v14/18/22)
# ===== ABILITA: inneschi =====
S|Colpi esplosivi|b|12|Per un po ogni tuo colpo scatena una piccola esplosione.|trig hit t8 icd.5 do(circ r3 d12/15/18)
S|Colpi a catena|b|12|Per un po ogni tuo colpo fa partire una scarica sui vicini.|trig hit t8 icd.5 do(chain n3 d9/11/13)
S|Colpi di gelo|b|12|Per un po ogni tuo colpo raffredda forte il bersaglio.|trig hit t8 icd.3 do(tgt chill2 slow.4:2)
S|Colpi venefici|b|12|Per un po ogni tuo colpo avvelena.|trig hit t9 icd.3 do(tgt pois2)
S|Colpi incendiari|b|12|Per un po ogni tuo colpo da fuoco e lascia una brace.|trig hit t8 icd.6 do(tgt burn8; zone r1.8 t2.5 dps7/9/11)
S|Colpi che marchiano|b|12|Per un po ogni tuo colpo marchia.|trig hit t9 icd.4 do(tgt mark1.25:4)
S|Colpi che respingono|b|11|Per un po ogni tuo colpo spinge via chi sta attorno al bersaglio.|trig hit t7 icd.5 do(circ r3 push12 d4/5/6)
S|Colpi che attirano|b|11|Per un po ogni tuo colpo tira tutti verso il bersaglio.|trig hit t7 icd.6 do(circ r5 pull10 d4/5/6)
S|Colpi che evocano|c|14|Ogni tuo colpo ha la sua ombra: tre spiriti, uno per colpo.|trig hit t10 n3 icd.8 do(sum spirito n1 t7 hp35 d9/11/13)
S|Colpi doppi|b|12|I prossimi cinque colpi sono seguiti da un dardo.|trig hit t10 n5 do(shot d10/13/16 v32)
S|Colpi dal cielo|b|12|I prossimi quattro colpi chiamano un fulmine sul bersaglio.|trig hit t10 n4 icd.3 do(circ r2.4 d24/30/36 in.4)
S|Colpo carico|b|9|Il tuo prossimo colpo esplode enorme.|trig hit t8 n1 do(circ r5.5 d45/56/68 stun.6)
S|Prossimo colpo paralizzante|b|10|Il tuo prossimo colpo blocca il bersaglio e chi gli sta attorno.|trig hit t8 n1 do(circ r4 root2/2.5/3)
S|Prossimo colpo ladro|b|10|Il tuo prossimo colpo ti cura molto.|trig hit t8 n1 do(heal v22/28/34; tgt d14/18/22)
S|Prossimo colpo a frammenti|b|10|Il tuo prossimo colpo si apre in dodici schegge.|trig hit t8 n1 do(shot n12 ringall d9/11/13 v24 t.5)
S|Mietitore|b|13|Per un po ogni uccisione ti cura.|trig kill t12 do(heal v8/10/12)
S|Uccisioni esplosive|b|13|Per un po chi uccidi esplode.|trig kill t12 do(circ r4.5 d26/33/40)
S|Uccisioni contagiose|c|14|Per un po chi uccidi lascia una nube velenosa.|trig kill t12 do(zone r3.5 t4 dps8/10/12 pois1)
S|Anime al servizio|c|15|Per un po chi uccidi si rialza come spirito tuo.|trig kill t12 n4 do(sum spirito n1 t10 hp40 d10/13/16)
S|Slancio dell'uccisore|b|13|Per un po ogni uccisione accorcia le ricariche e ti fa correre.|trig kill t12 do(cdr v1.5/2/2.5; buff haste1.4 t2.5)
S|Raccolto|b|13|Per un po ogni uccisione carica la Risonanza e ti da scudo.|trig kill t12 do(res v6/8/10; buff shield10/13/16 t4)
S|Uccisioni a catena|c|14|Per un po da chi uccidi parte una scarica.|trig kill t12 do(chain n4 d20/25/30)
S|Terrore contagioso|b|13|Per un po, quando uccidi, chi sta vicino scappa.|trig kill t12 do(circ r6 fear2)
S|Vendetta|b|11|Per un po, quando ti colpiscono esplodi.|trig hurt t8 icd.8 do(circ r4.5 d20/25/30 push8)
S|Pelle elettrica|b|11|Per un po chi ti colpisce prende una scarica che salta.|trig hurt t8 icd.5 do(chain n3 d14/18/22)
S|Corazza reattiva|b|12|I prossimi tre colpi che subisci ti danno scudo.|trig hurt t10 n3 do(buff shield18/23/28 t4)
S|Pelle di ghiaccio|b|12|Per un po chi ti colpisce viene congelato.|trig hurt t8 icd.6 do(circ r4 chill4)
S|Sangue acido|b|12|Per un po, quando ti colpiscono lasci una pozza che avvelena.|trig hurt t8 icd1 do(zone r3 t4 dps7/9/11 pois1)
S|Contraccolpo|b|10|Il prossimo colpo che subisci viene restituito triplo a chi ti sta vicino.|trig hurt t8 n1 do(circ r5 d40/50/60 stun.8)
S|Fuga istintiva|b|12|Il prossimo colpo che subisci ti rende invisibile e veloce.|trig hurt t10 n1 do(buff veil1.8 haste1.5 t3)
S|Dolore che carica|b|12|Per un po ogni colpo subito carica la Risonanza.|trig hurt t10 do(res v5/6/7)
S|Rabbia crescente|c|13|Per un po ogni colpo subito ti fa picchiare piu forte per qualche secondo.|trig hurt t10 do(buff fury1.4/1.5/1.6 t3)
S|Guardiani feriti|c|14|I prossimi due colpi che subisci evocano uno spirito ciascuno.|trig hurt t12 n2 do(sum spirito n1 t9 hp45 d10/13/16)
S|Eco dei poteri|c|14|Per un po ogni altro potere che usi scatena un'onda attorno a te.|trig cast t10 do(circ r5 d18/23/28)
S|Poteri che curano|b|13|Per un po ogni altro potere che usi ti cura.|trig cast t12 do(heal v8/10/12)
S|Poteri che proteggono|b|13|Per un po ogni altro potere che usi ti da scudo.|trig cast t12 do(buff shield14/18/22 t4)
S|Poteri a schegge|b|13|Per un po ogni altro potere che usi lancia dardi attorno.|trig cast t12 do(shot n8 ringall d8/10/12 v24 t.5)
S|Poteri caricati|c|14|Per un po ogni altro potere che usi carica la Risonanza.|trig cast t12 do(res v6/8/10)
S|Scatti taglienti|b|12|Per un po ogni tuo scatto finisce con un taglio largo.|trig dashend t12 do(cone r4.5 h1.3 d20/25/30)
S|Scatti gelidi|b|12|Per un po ogni tuo scatto lascia ghiaccio all'arrivo.|trig dashend t12 do(zone r3.5 t3 slow.6:1 chill.6)
S|Scatti con seguito|c|13|Per un po ogni tuo scatto lascia un'esca alle tue spalle.|trig dashend t12 n3 do(sum esca n1 @back3 t3 d20/25/30 r3)
S|Pulsazione|b|11|Per un po emetti un'onda ogni secondo.|trig step t6 ev1 do(circ r4.5 d10/13/16)
S|Scariche a intervalli|b|11|Per un po, ogni mezzo secondo una scarica colpisce il piu vicino.|trig step t6 ev.5 do(near r8 d10/13/16)
S|Respiro di brina|b|12|Per un po, ogni secondo rallenti e raffreddi chi ti sta attorno.|trig step t6 ev1 do(circ r5 slow.5:1.2 chill1)
S|Semina|b|12|Per un po lasci una mina ritardata ogni secondo dove passi.|trig step t5 ev1 do(circ r3 d20/25/30 in1.2)
S|Battito curativo|b|13|Per un po ti curi a ogni battito, di piu se hai nemici vicini.|trig step t6 ev1 do(heal v2; circ r5 d2 heal2/2.5/3)
S|Lanciadardi automatico|b|12|Per un po un dardo parte da solo verso il piu vicino, tre volte al secondo.|trig step t5 ev.33 do(shot d7/9/11 v32)
S|Torretta umana|c|13|Per un po, finche resti fermo, spari raffiche tutt'attorno.|trig step t6 ev.5 do(if still do(shot n8 ringall d7/9/11 v26 t.5))
S|Aura che ruba|c|13|Per un po, ogni secondo rubi vita a chi ti sta vicino.|trig step t6 ev1 do(circ r5 d8/10/12 ls.6)
S|Tamburo di guerra|c|14|Ogni due secondi un colpo che stordisce chi ti sta attorno.|trig step t6.5 ev2 do(circ r5 d12/15/18 stun.6)
S|Magnete intermittente|c|13|Ogni secondo tiri verso di te chi sta a media distanza.|trig step t5 ev1 do(ring r10 i3 pull12 d3/4/5)
`);
