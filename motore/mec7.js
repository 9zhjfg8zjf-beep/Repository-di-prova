Bricks.load(String.raw`
# ===== SUPREME: distruzione =====
U|Supernova|c|1|Un'esplosione enorme che scaraventa via tutti.|circ r14 d130/165/200 push20 stun1
U|Collasso|c|1|Tiri tutti al centro e li schiacci.|circ r16 pull26 d40/50/60; wait t.7; circ r7 d120/150/180 stun1.2
U|Giorno del giudizio|c|1|Un colpo dal cielo su ogni nemico attorno a te.|circ r20 max12 each(circ r3 d80/100/120 in.9)
U|Tempesta perfetta|c|1|Per sei secondi cadono fulmini tutt'attorno a te.|trig step t6 ev.25 do(circ @rnd11 r3 d44/55/66 in.4)
U|Bombardamento orbitale|c|1|Dodici colpi cadono a tappeto dove guardi.|rep n12 ev.18 do(circ @aim g22 r1 in.01; circ @rnd8 r3.2 d48/60/72 in.5)
U|Raggio della fine|c|1|Una linea enorme che cancella tutto cio che attraversa.|line l40 w5 d170/215/260 in.8
U|Raggio rotante supremo|c|1|Per quattro secondi lame partono da te in ogni direzione.|rep n16 ev.25 do(shot n4 ringall d22/28/34 v36 pierce t.6 r.6)
U|Cometa|c|1|Un colpo solo, gigantesco, dopo un'attesa lunga.|circ @aim g22 r11 d260/325/390 in2.4 stun2
U|Catena del giudizio|c|1|Una scarica che salta su quattordici nemici senza perdere forza.|chain n14 d70/88/106 fall.97 r12 stun.6
U|Inferno|c|1|Un cerchio di fuoco enorme attorno a te, che ti segue.|zone r9 t8 dps40/50/60 fol burn6
U|Era glaciale|c|1|Tutti attorno a te congelati; poi il ghiaccio resta.|circ r16 d40/50/60 stun2.5/3/3.5; zone r12 t6 slow.7:1 chill.6
U|Pestilenza|c|1|Una nube velenosa enorme che si allarga e ti segue.|zone r6 t9 dps18/23/28 fol pois2 grow.9
U|Mietitura delle anime|c|1|Attorno a te: chi e sotto un terzo di vita muore sul colpo, gli altri restano feriti.|circ r14 d50/63/76 ex4
U|Sentenza di morte|c|1|Togli al bersaglio una fetta enorme della vita che gli resta.|tgt d40 hpc.35/.42/.5 stun1
U|Terremoto supremo|c|1|Sei scosse enormi, una al secondo.|rep n6 ev.8 do(circ r13 d36/45/54 slow.5:1.5 stun.3)
U|Onda anomala|c|1|Tre mezzelune gigantesche in fila che trascinano tutto.|rep n3 ev.5 do(shot d60/75/90 v26 wide r5 t1 push14)
U|Stella cadente multipla|c|1|Cinque comete, una dopo l'altra, sul bersaglio mirato.|aim; rep n5 ev.5 do(circ @tgt r4.5 d60/75/90 in.6)
U|Anelli concentrici|c|1|Cinque anelli che si allargano fino all'orizzonte.|circ r4 d50/63/76; ring r8 i4 d44/55/66 in.25; ring r12 i8 d38/48/58 in.5; ring r16 i12 d32/40/48 in.75; ring r20 i16 d26/33/40 in1
U|Vulcano supremo|c|1|Un cratere erutta lapilli esplosivi per otto secondi.|zone @aim g16 r5 t8 dps20/25/30 tick(shot n8 ringall d16/20/24 v16 t.6 boom2.6) ev.7
U|Buco nero supremo|c|1|Risucchia tutto per cinque secondi, poi esplode e rilascia schegge.|zone @aim g16 r11 t5 dps16/20/24 zpull2.2 end(circ r11 d120/150/180; shot n16 ringall d20/25/30 v24 t.7)
U|Mille tagli|c|1|Trenta fendenti velocissimi davanti a te.|rep n15 ev.1 do(cone r6 h1 d14/18/22)
U|Pioggia di lame|c|1|Per cinque secondi mezzelune partono da te verso il piu vicino.|trig step t5 ev.3 do(shot d30/38/46 v30 wide r2.4 t.7)
U|Scarica totale|c|1|Una catena dopo l'altra, otto volte.|rep n8 ev.3 do(chain n5 d30/38/46)
U|Detonazione universale|c|1|Marchi tutti; due secondi dopo ogni marchio esplode enorme.|circ r20 mark1.4:4; wait t2; pop mark r5 d90/113/136
U|Rogo|c|1|Incendi tutti; poi ogni fiamma esplode.|circ r18 d20/25/30 burn14; wait t2.5; pop burn r5 d80/100/120 burn10
U|Zero assoluto|c|1|Rallenti tutti; poi chi e rallentato va in frantumi.|circ r18 slow.8:4 chill3; wait t1.5; pop slow r5 d90/113/136 stun1.5
U|Piaga|c|1|Avveleni tutti al massimo; poi il veleno esplode e si sparge.|circ r18 pois6; wait t3; pop pois r6 d80/100/120 pois4
# ===== SUPREME: trasformazioni =====
U|Avatar|c|1|Per dodici secondi: piu forte, piu duro, piu veloce.|buff fury1.5/1.6/1.7 armor.6 haste1.3 t12
U|Forma spettrale|c|1|Per sei secondi intoccabile e velocissimo.|buff invuln t6 haste1.6
U|Dio della guerra|c|1|Colpisci il doppio, e ogni colpo ti cura.|buff fury1.9/2.05/2.2 ls.12 t9
U|Fortezza vivente|c|1|Scudo gigantesco, pelle di pietra e spine.|buff shield150/190/230 armor.5 reflect1 t9
U|Flusso|c|1|Per otto secondi le ricariche vanno quattro volte piu veloci.|buff cdr4/4.5/5 t8
U|Cuore immortale|c|1|Ti curi del tutto, e continui a curarti.|heal v100; buff hot60/75/90 t8
U|Ombra assoluta|c|1|Sparisci a lungo: il primo colpo da nascosto fa il quintuplo.|buff veil4.5/5/5.5 t9 haste1.3
U|Tempesta di lame personale|c|1|Lame larghe e fitte ti girano attorno, e ogni colpo ti cura.|buff orbit55/70/85 r5 t9 ls.08
U|Frenesia|c|1|Piu forte, piu veloce, ricariche doppie: ma subisci di piu.|buff fury1.7/1.85/2 haste1.5 cdr2 armor1.3 t10
U|Risonanza infinita|c|1|Per dieci secondi la Risonanza si ricarica cinque volte piu in fretta, e le ricariche vanno al doppio.|buff resrate5 cdr2 t10
# ===== SUPREME: inneschi =====
U|Ogni colpo un'esplosione|c|1|Per dieci secondi ogni tuo colpo esplode forte.|trig hit t10 icd.3 do(circ r4 d30/38/46)
U|Ogni colpo un fulmine|c|1|Per dieci secondi ogni tuo colpo chiama un fulmine a catena.|trig hit t10 icd.3 do(chain n4 d26/33/40)
U|Ogni colpo uno spirito|c|1|Per dodici secondi ogni tuo colpo puo evocare uno spirito.|trig hit t12 icd1 do(sum spirito n1 t9 hp50 d12/15/18)
U|Ogni morte un'esplosione|c|1|Per quindici secondi chi uccidi esplode enorme e marchia i vicini.|trig kill t15 do(circ r7 d70/88/106 mark1.3:5)
U|Ogni morte un servo|c|1|Per venti secondi chi uccidi si rialza per te.|trig kill t20 do(sum spirito n1 t14 hp60 d14/18/22)
U|Ogni morte una vita|c|1|Per quindici secondi ogni uccisione ti cura molto e accorcia le ricariche.|trig kill t15 do(heal v20/25/30; cdr v2)
U|Vendetta suprema|c|1|Per otto secondi, ogni colpo subito scatena un'esplosione enorme.|trig hurt t8 icd.5 do(circ r8 d60/75/90 push14)
U|Specchio della sofferenza|c|1|Per otto secondi, ogni colpo subito cade moltiplicato su tutti i nemici vicini.|trig hurt t8 icd.4 do(circ r12 each(circ r2 d30/38/46 in.3))
U|Onnipotenza|c|1|Per dodici secondi ogni altro potere che usi viene seguito da un'esplosione e ti cura.|trig cast t12 do(circ r8 d50/63/76; heal v10)
U|Passo del titano|c|1|Per dieci secondi, a ogni secondo un'onda d'urto attorno a te.|trig step t10 ev1 do(circ r7 d30/38/46 push8 slow.4:1)
U|Sole portatile|c|1|Per otto secondi bruci una fetta della vita di chi ti sta vicino, a ogni istante.|trig step t8 ev.5 do(circ r8 d8 hpc.05/.06/.07 burn8)
U|Faro della morte|c|1|Per otto secondi, due volte al secondo, un colpo cade sul nemico piu vicino.|trig step t8 ev.5 do(near r20 each(circ r3 d40/50/60 in.4))
U|Scatti divini|c|1|Per quindici secondi ogni scatto finisce con un'esplosione e un'altra subito dopo.|trig dashend t15 do(circ r6 d50/63/76 stun.5; circ r8 d30/38/46 in.5)
# ===== SUPREME: evocazioni =====
U|Legione|c|1|Otto spiriti combattono per te.|sum spirito n8 far4 t16 hp60 d12/15/18
U|Titano|c|1|Un colosso enorme.|sum colosso n1 @fwd4 t18 hp500/620/740 d40/50/60
U|Due titani|c|1|Due colossi, piu piccoli, ai tuoi lati.|sum colosso n2 far3.5 t14 hp260/320/380 d26/33/40
U|Batteria d'assedio|c|1|Quattro torrette attorno a te.|sum torretta n4 far4 t14 d12/15/18
U|Reggimento di tiratori|c|1|Sei tiratori in linea.|sum arciere n6 wall t14 hp60 d12/15/18
U|Ondata kamikaze|c|1|Dodici spiriti esplosivi partono in ogni direzione.|sum bomba n12 far4 t8 d34/43/52
U|Cittadella|c|1|Un cerchio di muri attorno a te, con due torrette dentro.|sum muro n8 far5 t12 hp220; sum torretta n2 far2 t12 d10/13/16
U|Corte reale|c|1|Un colosso, due tiratori, un guaritore.|sum colosso n1 @fwd4 t14 hp260 d24/30/36; sum arciere n2 t14 d10/13/16; sum guaritore n1 t14 d6
U|Esercito che non muore|c|1|Sei spiriti: quando ne cade uno, esplode e ne nasce un altro.|sum spirito n6 far3.5 t12 hp40 d12/15/18 die(circ r4 d30/38/46; sum spirito n1 t8 hp40 d12/15/18)
U|Sciame senza fine|c|1|Per otto secondi nasce un kamikaze ogni mezzo secondo.|trig step t8 ev.5 do(sum bomba n1 t5 d30/38/46)
U|Prigione|c|1|Chiudi il bersaglio tra i muri e gli fai cadere addosso il cielo.|aim; sum muro n8 @tgt far3.2 t6 hp200; circ @tgt r5 d140/175/210 in2
U|Ombre di te|c|1|Cinque esche attorno a te: quando esplodono, stordiscono.|sum esca n5 far4.5 t5 d50/63/76 r5 die(circ r5 stun1.5)
U|Guardiano sacro|c|1|Un guaritore potentissimo e uno scudo enorme.|sum guaritore n1 t16 hp200 d14/18/22; buff shield90/113/136 t8
U|Chiamata del branco|c|1|Uno spirito per ogni nemico attorno a te, e sono furiosi.|circ r16 max10 each(sum spirito n1 t12 hp50 d16/20/24)
# ===== SUPREME: controllo =====
U|Dominio assoluto|c|1|Fino a sei nemici attorno a te passano dalla tua parte, a lungo.|circ r16 max6 charm12/14/16
U|Tempo spezzato|c|1|Il tempo si ferma per cinque secondi e intanto ricarichi tutto.|freeze t5/5.5/6; cdr all
U|Tempo spezzato con sorpresa|c|1|Fermi il tempo; quando riparte, un colpo cade su ogni nemico.|freeze t3; circ r22 max12 each(circ r3 d70/88/106 in3)
U|Gravita zero|c|1|Tutti i nemici attorno a te volano in aria a lungo e ricadono male.|circ r16 lift3/3.5/4:70
U|Terrore primordiale|c|1|Tutti scappano a lungo, indeboliti e marchiati.|circ r20 fear5/6/7 weak8 mark1.4:8
U|Radici del mondo|c|1|Tutti bloccati a lungo, mentre il suolo li consuma.|circ r18 root4/4.5/5; zone r18 t5 dps22/28/34
U|Rimpicciolimento generale|c|1|Tutti i nemici attorno a te diventano minuscoli e fragili.|circ r16 poly6/7/8 mark1.6:8
U|Mano del gigante|c|1|Scagli via tutti quelli davanti a te: ognuno esplode dove atterra.|cone r14 h.9 fling70/88/106
U|Tutti a me|c|1|Tiri a te ogni nemico in vista e li blocchi attorno a te.|circ r24 max10 yank d30/38/46 root2.5
U|Scambio caotico|c|1|Ti scambi di posto col bersaglio, che esplode e resta stordito a lungo.|tgt swap stun3 then(circ @tgt r8 d110/138/166)
U|Silenzio|c|1|Tutti storditi a lungo e indeboliti quando si riprendono.|circ r18 stun3.5/4/4.5 weak8
U|Ragnatela|c|1|Un cerchio enorme che blocca chi entra, per dieci secondi.|zone r13 t10 root.7 dps10/13/16 slow.5:1
# ===== SUPREME: movimento =====
U|Meteora umana|c|1|Salti dove guardi e atterri come un meteorite.|leap g24 then(circ r11 d170/215/260 stun1.5 push14)
U|Lampo|c|1|Ti teletrasporti cinque volte sui nemici piu vicini, colpendoli.|rep n5 ev.3 do(near r20 each(blink g1 @pt then(circ r4 d50/63/76)))
U|Carica inarrestabile|c|1|Uno scatto lunghissimo che devasta tutto cio che attraversi.|buff invuln t1; dash l24 fwd d110/138/166 then(circ r8 d70/88/106 stun1.5)
U|Danza delle ombre|c|1|Sei scatti fulminei guidati da te, ognuno con un'esplosione.|buff invuln t2.2; rep n6 ev.35 do(dash l7 then(circ r4.5 d40/50/60))
U|Apparizione|c|1|Compari dietro al bersaglio e gli infliggi un colpo che ignora tutto.|blink behind g26 then(tgt d190/240/290 stun2)
U|Ritorno del re|c|1|Ti teletrasporti dove guardi: arrivi con un'esplosione, uno scudo e tre spiriti.|blink g22 then(circ r9 d90/113/136 stun1; buff shield80 t6; sum spirito n3 t12 hp60 d14/18/22)
U|Passo tra i mondi|c|1|Sparisci, il tempo rallenta, e ricompari dove guardi curato del tutto.|freeze t2; heal v100; blink g26 then(buff veil3 t4)
`);
