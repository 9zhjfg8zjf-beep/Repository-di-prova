// Controllo, contagio e legami: programmi originali con conseguenze distinte.
(() => {
  const first = Bricks.LIST.length;
  Bricks.load(String.raw`
# ===== PRIMARI: interdizioni e conseguenze =====
P|Chiodo dell'abiura|b|0.7|Un chiodo ferisce; alla fine del volo impedisce per un istante nuovi attacchi base al nemico piu vicino all'impatto.|shot d11/13/15 v31 then(near r2 each(disarm t.55))
P|Falce del disarmo|b|0.85|Un taglio largo ferisce e interrompe la possibilita di iniziare attacchi base.|cone r3.5 h1 d14/17/20 each(disarm t.6)
P|Terza sillaba|b|0.55|Due dardi normali; il terzo ostacola nuovi tiri e abilita dei nemici adatti vicini al punto in cui termina il volo.|nth n3 do(shot d12/15/18 v32 then(silence @pt r2.5 n2 t1.2)) else(shot d9/11/13 v34)
P|Dazio di piombo|b|0.95|Un colpo in linea apre su ogni nemico ferito un piccolo debito sui danni successivi.|line l18 w.8 d14/17/20 each(debt t2 mul.2 cap12/15/18)
P|Spina della febbre|b|1.1|Una spina attraversa i nemici e alla fine del volo diffonde un contagio breve attorno al punto d'arresto.|shot d8/10/12 v25 pierce t.7 then(circ r2.5 each(infect t3 dps3/4/5 spread2.5 n1))
P|Nodo del creditore|c|1.2|Ferisce il bersaglio e tenta di legarlo a un vicino: parte dei danni passa fra loro.|tgt g18 d12/15/18 then(link @pt r4 n2 t3 share.2)
P|Morso della peste|b|0.9|Il nemico piu vicino viene ferito, infettato e indebolito.|near r4 d12/15/18 each(infect t3 dps3/4/5 spread2 n1; tgt weak2)
P|Obolo incrinato|c|1.25|Una piccola esplosione apre debiti sui danni successivi dei nemici attorno all'impatto.|shot d14/17/20 v21 boom2.5 then(debt @pt r3 n3 t2.5 mul.18 cap14/17/20)
P|Labbro reciso|b|0.9|Il fendente ferisce e impedisce per poco nuovi tiri e abilita ai nemici adatti.|cone r4 h.65 d15/18/21 each(silence t.8)
P|Quarta ferita|c|0.65|Tre fendenti; il quarto lancio cerca il bersaglio e, a fine volo, infetta e rallenta il nemico piu vicino all'impatto.|nth n4 do(shot d14/17/20 v23 hom then(near r2 each(infect t4 dps3/4/5 spread3 n1; tgt slow.25:2))) else(cone r3.3 h.8 d13/16/19)
P|Filo dell'inerzia|b|1|Una linea stretta ferisce, trattiene e blocca brevemente nuovi attacchi base.|line l12 w.7 d12/15/18 root.35 each(disarm t.65)
P|Cerchio dell'insolvente|c|1.3|Colpisce a media distanza: i feriti vengono infettati e accumulano un piccolo debito di danno.|ring r6 i3 d10/12/14 each(debt t2.5 mul.15 cap12; infect t3 dps2/3/4 spread2 n1)
P|Navetta del vincolo|c|1.15|Una lama torna indietro dopo il lancio e tenta di collegare i nemici vicini al punto in cui termina il ritorno.|shot d11/14/17 v23 back t.65 then(link @pt r4.5 n2 t2.5 share.18)
P|Tocco della rinuncia|b|1|Ferisce il bersaglio e ostacola brevemente nuovi attacchi base, tiri e abilita.|tgt g8 d14/17/20 then(disarm t.55; silence t.55)
# ===== MOVIMENTO: ingressi e ritirate =====
M|Passo del mendicante|b|7/6.5/6|Scatti indietro; all'arrivo impedisci per poco nuovi attacchi base ai nemici vicini.|dash back l9 then(disarm @pt r4 n3 t1.4)
M|Varco della censura|c|9/8/7|Compari dietro il bersaglio e provi a impedirgli nuovi tiri e nuove abilita.|blink behind g17 then(silence t2/2.5/3)
M|Atterraggio infetto|c|9/8/7|Salti sul punto mirato; l'impatto ferisce e inocula il contagio ai nemici vicini.|leap g14 then(circ r3.5 d12/16/20 each(infect t4 dps4/5/6 spread2.5 n1))
M|Fuga dalle scorie|b|8/7/6|Scatti e ripulisci gli alleati e le zone dannose nemiche vicino all'arrivo; ogni effetto rimosso ti cura.|dash l10 then(cleanse r5 heal3)
M|Ultimo filo|c|10/9/8|Ti sposti al punto mirato e lasci un legame di danno fra i nemici vicini al punto di partenza.|blink g13 left(link @pt r6 n3 t4 share.25)
M|Andata del debitore|c|11/10/9|Scatti indietro, marchi di debito i nemici all'arrivo e dopo due secondi torni al punto iniziale.|mem; dash back l9 then(circ r4.5 d6/8/10 each(debt t3 mul.3 cap30)); wait t2; ret
# ===== ABILITA: disarmo =====
S|Abdicazione del braccio|b|8/7/6|Il bersaglio puo muoversi ma non iniziare nuovi attacchi base per alcuni secondi.|disarm g20 t2.4/2.8/3.2
S|Piazza senza lame|c|12/11/10|Impedisce nuovi attacchi base a quattro nemici nella zona mirata.|disarm @aim g15 r5 n4 t2.2/2.6/3
S|Rastrello del custode|b|10/9/8|Una linea trattiene chi colpisce e gli impedisce nuovi attacchi base.|line l13 w2 d10/14/18 root1 each(disarm t2)
S|Mandato respinto|b|10/9/8|Un proiettile ferisce; a fine volo disarma i nemici vicini all'impatto e li spinge lontano da quel punto.|shot d18/23/28 v25 then(circ r3 push15 each(disarm t2))
S|Diritto di difesa|c|15/14/13|Per sei secondi, quando subisci un colpo disarmi brevemente i nemici attorno a te.|trig hurt t6 icd1.2 do(disarm @self r5 n3 t1.2)
S|Soglia disarmante|c|14/13/12|Un campo nel punto mirato impedisce a intervalli nuovi attacchi base ai nemici che vi restano.|zone @aim g15 r3.5 t4.5 tick(disarm @pt r3.5 n3 t1.1) ev1
S|Guardia del rinnegato|b|12/11/10|Disarmi il bersaglio e ricevi uno scudo temporaneo per avvicinarti.|disarm g18 t2; buff shield25/32/39 t4
S|Braccio fiacco|b|10/9/8|Indebolisce il bersaglio e gli impedisce di iniziare attacchi base per un breve intervallo.|tgt g18 weak4 then(disarm t2.2/2.6/3)
# ===== ABILITA: silenzio =====
S|Sillaba proibita|b|10/9/8|Impedisce al tiratore mirato nuovi tiri, o al boss nuove abilita; gli attacchi gia annunciati proseguono.|silence g22 t2.5/3/3.5
S|Corte taciturna|c|14/13/12|Nella zona mirata ostacola nuovi tiri e abilita di quattro bersagli adatti, senza cancellare annunci gia iniziati.|silence @aim g16 r5 n4 t2.5/3/3.5
S|Cera sulle labbra|b|11/10/9|Un dardo ferisce; alla fine del volo impedisce nuovi tiri e abilita a un nemico adatto vicino all'impatto.|shot d22/28/34 v23 then(silence @pt r3 n1 t3)
S|Riga del censore|c|13/12/11|Una linea ferisce e ostacola nuovi tiri e abilita dei nemici che attraversa.|line l20 w1.6 d18/24/30 each(silence t2.5)
S|Campana senza voce|c|14/13/12|Colpisce un anello attorno a te e impedisce nuovi tiri e abilita ai bersagli adatti che raggiunge.|ring r9 i4 d18/24/30 each(silence t3)
S|Tre ammonimenti|c|16/15/14|I prossimi tre colpi a segno, distanziati nel tempo, possono impedire nuovi tiri e abilita al nemico colpito.|trig hit t7 n3 icd1 do(silence t1.6/1.9/2.2)
S|Chiostro muto|c|16/15/14|Un campo interrompe a intervalli la possibilita di iniziare nuovi tiri e abilita; non cancella i colpi annunciati.|zone @aim g16 r4 t5 tick(silence @pt r4 n3 t1.2) ev1.1
S|Testimone silenziato|b|12/11/10|Ostacola nuovi tiri e abilita del bersaglio adatto, poi lo marchia per aumentare il danno che subisce.|silence g20 t2.5; tgt mark1.2:4
# ===== ABILITA: contagio =====
S|Febbre del vestibolo|b|12/11/10|Infetta il bersaglio con un danno graduale che puo contagiare nemici vicini per un numero limitato di passaggi.|infect g20 t6 dps6/8/10 spread3 n2
S|Radice malsana|b|13/12/11|Trattiene il bersaglio, poi lo infetta: deve allontanarsi dagli altri appena puo.|tgt g18 root1.4 then(infect t5 dps6/8/10 spread3.5 n2)
S|Ampolla del lazzaretto|b|13/12/11|Lanci un'ampolla che ferisce; alla fine del volo avvia un contagio sul nemico piu vicino all'impatto.|shot d16/21/26 v20 then(near r3 each(infect t5 dps7/9/11 spread3 n2))
S|Fiato delle cripte|c|15/14/13|Un soffio ravvicinato infetta i nemici davanti a te, da cui il contagio puo propagarsi.|cone r6 h.7 d8/12/16 each(infect t5 dps5/7/9 spread2.5 n1)
S|Febbre esposta|c|14/13/12|Infetta e marchia il bersaglio: il marchio amplifica il danno mentre il contagio si diffonde.|infect g18 t5 dps5/7/9 spread3 n2; tgt mark1.2:5
S|Eredita del morbo|c|17/16/15|Per otto secondi, le tue uccisioni inoculano un contagio ai nemici vicini al caduto.|trig kill t8 icd.8 do(circ r4.5 each(infect t4 dps4/6/8 spread2 n1))
S|Pozzo delle spore|c|16/15/14|Un campo infetta a intervalli il nemico piu vicino al suo centro; ogni contagio resta limitato.|zone @aim g14 r3.5 t5 tick(near r3.5 each(infect t4 dps4/6/8 spread2.5 n1)) ev1.5
S|Patto febbrile|c|15/14/13|Infetta il bersaglio e ti concede per pochi secondi furto di vita sui danni che infliggi.|infect g18 t5 dps6/8/10 spread3 n2; buff ls.15/.2/.25 t5
# ===== ABILITA: debiti di danno =====
S|Conto della pena|b|10/9/8|Il bersaglio accumula una quota dei danni che subisce; alla scadenza riceve quel danno aggiuntivo, entro un limite.|debt g22 t4 mul.35 cap45/60/75
S|Registro dei dolenti|c|15/14/13|Tre nemici nella zona accumulano debiti sui danni realmente subiti, riscossi dopo quattro secondi.|debt @aim g16 r5 n3 t4 mul.3 cap40/55/70
S|Mandato del riscossore|b|12/11/10|Apre un debito sul bersaglio e gli invia un dardo guidato; il danno del dardo alimenta il debito.|debt g20 t3.5 mul.3 cap40/50/60; shot d24/30/36 v20 hom
S|Cifra marchiata|c|14/13/12|Apre un debito e marchia il bersaglio: il conto cresce in base ai danni effettivamente subiti.|debt g20 t4 mul.3 cap45/60/75; tgt mark1.25:4
S|Quattro rate|c|14/13/12|Apre un debito e scandisce quattro colpi sul bersaglio prima della riscossione.|tgt g20 then(debt t3 mul.35 cap40/50/60; rep n4 ev.5 do(tgt d10/13/16))
S|Congedo del creditore|c|13/12/11|Un fendente apre debiti sui nemici colpiti; una spinta successiva li allontana.|cone r5 h.9 d12/16/20 each(debt t3 mul.3 cap35/45/55); circ r5 push12
S|Libro delle ferite|c|18/17/16|Per sei secondi i colpi a segno aprono piccoli debiti sul bersaglio; applicazioni ravvicinate non si sommano senza limite.|trig hit t6 icd1.5 do(debt t2.5 mul.25 cap25/35/45)
S|Rata alla scadenza|b|12/11/10|Trattiene brevemente il bersaglio e apre un debito; poco prima della scadenza gli infligge un colpo aggiuntivo.|tgt g18 root.5 then(debt t2 mul.4 cap35/45/55; wait t1.5; tgt d22/28/34)
# ===== ABILITA: purificazione e legami =====
S|Lavacro delle scorie|b|11/10/9|Rimuove stati nocivi dagli alleati e zone dannose nemiche vicine; ogni effetto rimosso ti cura. Gli annunci dei boss restano.|cleanse r7 heal5/6/7
S|Mantello del penitente|c|16/15/14|Ricevi uno scudo e ripulisci gli alleati e le zone dannose nemiche vicino a te, curandoti per gli effetti rimossi.|buff shield28/36/44 t5; cleanse r6 heal3
S|Assoluzione reattiva|c|18/17/16|Per sei secondi i colpi subiti attivano una purificazione vicina, con una pausa fra le attivazioni.|trig hurt t6 icd1.5 do(cleanse r5 heal3/4/5)
S|Cortile risanato|c|16/15/14|Crea ai tuoi piedi un campo che ti cura mentre ci resti e purifica gli alleati e le zone dannose nemiche vicine.|zone r4 t5 zheal5/7/9; cleanse r8 heal3
S|Complici della pena|c|14/13/12|Collega i nemici nella zona e avvia una catena di colpi: una quota dei danni passa agli altri legati.|link @aim g16 r6 n3 t5 share.25; chain g22 n3 d14/18/22 fall.7
S|Rocchetto del carcere|c|14/13/12|Un proiettile ferisce; alla fine del volo collega i nemici vicini, che condividono una quota del danno subito.|shot d18/24/30 v24 then(link @pt r5 n3 t5 share.3)
S|Malanno condiviso|c|17/16/15|Marchia il bersaglio, lo collega ai vicini e lo infetta: parte del danno ricevuto passa ai compagni del legame.|tgt g18 mark1.15:5 then(link @pt r5 n3 t5 share.25; infect t5 dps5/7/9 spread2 n1)
S|Crocevia del dolore|c|18/17/16|Collega i nemici nella zona mirata e vi posa un campo dannoso; chi resta dentro alimenta il dolore condiviso.|link @aim g16 r6 n3 t5 share.25; zone @aim g16 r3.5 t4 dps10/13/16
# ===== SUPREME: sentenze =====
U|Armistizio del cerchio|c|1|Impedisci nuovi attacchi base ai nemici vicini e per alcuni secondi una corona danneggia chi ti si avvicina.|disarm r12 n6 t5; buff orbit18/23/28 r4 t6
U|Tribunale senza voce|c|1|Ostacoli nuovi tiri e abilita nella zona mirata, poi scandisci tre esplosioni seguendo la mira. Gli annunci gia iniziati restano attivi.|silence @aim g18 r9 n6 t5; rep n3 ev1 do(circ @aim g18 r6 d24/32/40 in.6)
U|Processione del morbo|c|1|Infetti i nemici attorno a te e riduci per alcuni secondi il danno che ricevi; il contagio ha propagazione limitata.|circ r11 d12/18/24 each(infect t7 dps7/9/11 spread3.5 n2); buff armor.65 t5
U|Campane della riscossione|c|1|I nemici vicini accumulano debiti sui danni subiti mentre cinque onde li colpiscono; alla scadenza il conto viene riscosso.|debt r11 n6 t5 mul.35 cap60/80/100; rep n5 ev.8 do(circ r8 d15/20/25)
U|Congrega dei vincolati|c|1|Colleghi fino a sei nemici nella zona e vi lasci un campo dannoso: una quota dei danni passa fra i legati.|link @aim g18 r10 n6 t7 share.3; zone @aim g18 r6 t6 dps16/21/26
U|Assoluzione delle fosse|c|1|Ricevi uno scudo, rimuovi stati nocivi alleati e zone dannose nemiche in un ampio raggio e crei un campo curativo ai tuoi piedi.|buff shield70/90/110 t7; cleanse r14 heal4; zone r6 t6 zheal7/9/11
U|Sette lavacri|c|1|Per sette secondi purifichi a intervalli gli alleati e le zone dannose nemiche vicine; un'armatura temporanea ti protegge.|buff armor.7 t7; trig step t7 ev1 do(cleanse r7 heal3/4/5)
U|Doppia condanna|c|1|Infetti i nemici vicini e apri su ciascuno un debito: il danno del contagio e degli altri colpi alimenta la riscossione finale.|circ r10 d10/15/20 each(debt t5 mul.3 cap60/80/100; infect t6 dps6/8/10 spread3 n2)
U|Editto dell'inerme|c|1|Impedisci nuovi attacchi base ai nemici vicini e nuovi tiri o abilita ai bersagli adatti; ricevi uno scudo. Gli annunci restano.|buff shield50/65/80 t6; disarm r11 n6 t4; silence r11 n6 t4
U|Catena dei debitori|c|1|Colleghi un gruppo nella zona mirata e apri un debito sui suoi danni effettivi; una prima scarica avvia il conto.|link @aim g18 r9 n5 t6 share.25; debt @aim g18 r9 n5 t5 mul.3 cap55/75/95; circ @aim g18 r6 d30/40/50
U|Lascito delle catacombe|c|1|Per nove secondi le tue uccisioni diffondono un contagio vicino al caduto; quattro spiriti ti aiutano a iniziare la catena.|trig kill t9 icd1 do(circ r5 each(infect t4 dps5/7/9 spread2.5 n1)); sum spirito n4 t9 hp45 d10/13/16
U|Sentenza di misericordia|c|1|Crei un campo curativo, rimuovi stati nocivi alleati e zone dannose nemiche vicine e impedisci nuovi attacchi base nella stessa area.|zone r7 t6 zheal6/8/10; cleanse r10 heal4; disarm r10 n6 t4
`);
  for (let i = first; i < Bricks.LIST.length; i++) Bricks.LIST[i].edition = '3.2';
})();
