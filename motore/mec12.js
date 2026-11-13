// Spazio, legami, imitazione, memoria e legioni: scelte esplicite, non varianti generate.
(() => {
const first = Bricks.LIST.length;
Bricks.load(String.raw`
# ===== PRIMARI: otto modi di scegliere e preparare il bersaglio =====
P|Chiodo del Lete|a|1.3|Vincoli il nemico mirato al suo punto, poi lo ferisci. Se si allontana troppo il legame si spezza.|tether g24 t2.5 l3 break10 pull10; tgt g24 d12/15/18
P|Rintocco retrogrado|b|1.8|Segni il nemico e gli spari: dopo due secondi torna al segno e riceve un altro colpo, senza recuperare la vita persa.|rewindfoe g24 t2 d8/10/12; shot d12/15/18 v38
P|Voce rubata al fango|b|6|Imiti per quattro secondi l'archetipo del primario nemico, poi riottieni questo potere. Non copi tutto il suo kit.|mimic g24 t4 mul.75
P|Bacchetta del caporale|a|1.1|Ordini agli alleati mobili vicini di attaccare il nemico mirato, poi lo marchi con un colpo leggero. Richiede alleati.|command r24 n4 t3; tgt g24 d8/10/12 mark1.15:3
P|Dente del becchino|b|2|Consumi un cadavere recente per rialzare un alleato e scateni un fendente davanti a te. Senza cadaveri non parte.|revive r10 n1 t8 hp40/50/60 d8/10/12; cone r5 h.65 d14/18/22
P|Filo che attecchisce|a|.9|Un proiettile lascia sul punto d'impatto un vincolo elastico per un nemico vicino.|shot d10/13/16 v32 then(tether @pt r2.5 n1 t3 l2 break9 pull11)
P|Ordine di prossimita|a|1.2|Richiami gli alleati mobili verso di te e respingi con una breve onda chi ti sta davanti. Richiede alleati.|command rally r22 n4 t2; cone r5 h.7 d9/12/15 push7
P|Gancio dell'archivista|b|1.7|Il colpo mirato tira a te un nemico leggero e segna i nemici vicini all'impatto: dopo due secondi tornano a quel punto.|tgt g20 d12/15/18 yank then(rewindfoe @pt r2 n2 t2 d5/7/9)

# ===== MOBILITA: ventidue decisioni di percorso e riposizionamento =====
M|Cerniera del Lete|a|10|Apri per dieci secondi una coppia di portali tra lo spazio davanti a te e il punto mirato. Tu e gli alleati potete riusarli.|portal g18 r1.2 t10
M|Varco delle saette|b|12|La coppia di portali trasporta anche i proiettili, oltre a te e agli alleati. I colpi conservano la propria squadra.|portal g20 r1.2 t9 shots
M|Porta senza custode|b|11|Apri una coppia di portali attraversabile anche dai nemici non boss: permette inseguimenti e trappole.|portal g18 r1.4 t10 foes
M|Soglia indiscreta|c|14|La coppia di portali lascia passare giocatore, alleati, nemici non boss e proiettili. Resta utilizzabile per otto secondi.|portal g22 r1.5 t8 foes shots
M|Tuffo nella fenditura|b|11|Apri un varco davanti a te e scatti in avanti verso il suo ingresso; la coppia resta aperta per gli alleati.|portal g20 r1.3 t8; dash fwd l7
M|Passo del portinaio|a|10|Apri un portale davanti a te e arretri di scatto, lasciando l'ingresso accessibile agli alleati.|portal g18 r1.2 t10; dash back l6
M|Soglia sotto il velo|b|13|Apri una coppia di portali e diventi invisibile per tre secondi, per cambiare percorso senza mostrarti subito.|portal g20 r1.2 t8; buff veil t3
M|Varco del soccorso|b|14|Apri una coppia di portali e lasci una zona curativa presso la partenza. Puoi tornare a usarla finche il varco resta aperto.|portal g18 r1.3 t9; zone r3 t6 zheal8/10/12
M|Porta con fantoccio|b|12|Apri un passaggio e lasci un'esca vicino all'ingresso. L'esca distrae mentre scegli quando attraversare.|portal g20 r1.2 t8; sum esca @fwd2 t5 hp80/100/120
M|Congedo a termine|b|12|Memorizzi la tua posizione e apri un portale; dopo due secondi torni al punto memorizzato. Il portale resta aperto.|mem; portal g22 r1.3 t7; wait t2; ret
M|Guinzaglio in ritirata|a|8|Vincoli il nemico mirato al suo punto e scatti all'indietro. Il legame lo tira solo quando supera la propria lunghezza.|aim g22; tether g22 t4 l3 break11 pull12; dash back l7
M|Giro del carceriere|b|10|Fissi al terreno il punto di richiamo del nemico e ti teletrasporti alle sue spalle. I boss resistono alla trazione.|aim g20; tether g20 t4 l2.5 break10 pull14; blink behind g20
M|Salto fra i pegni|b|11|Vincoli fino a tre nemici nell'area mirata, poi salti verso quell'area. Chi esce dal raggio del proprio vincolo viene richiamato.|tether @aim g18 r5 n3 t4 l3 break11 pull11; leap @aim g18
M|Strappo congedante|b|10|Vincoli un nemico, scatti all'indietro e all'arrivo respingi chi ti e rimasto vicino.|tether g20 t4 l3 break11 pull12; dash back l7 then(circ r4 d10/14/18 push12)
M|Agguato fuori tempo|b|11|Segni il nemico e compari alle sue spalle. Tre secondi dopo torna al segno e subisce un colpo; i boss restano al loro posto.|aim g20; rewindfoe g20 t3 d12/16/20; blink behind g20
M|Fuga con appuntamento|b|10|Segni tre nemici nell'area mirata e arretri di scatto. Tre secondi dopo vengono riportati ai loro segni senza recuperare vita.|rewindfoe @aim g18 r5 n3 t3 d8/12/16; dash back l8
M|Eco in ritirata|b|10|Imiti per sei secondi l'archetipo d'attacco del nemico e arretri, preparando una risposta dalla nuova distanza.|mimic g24 t6 mul.9; dash back l7
M|Salto della maschera|b|12|Imiti il primario del nemico e salti verso il punto mirato. Alla scadenza dell'imitazione ritorna il tuo primario.|mimic g22 t7 mul1; leap @aim g16
M|Raccolta delle retrovie|b|12|Rialzi fino a due cadaveri recenti, arretri di scatto e richiami gli alleati mobili verso il punto di arrivo.|revive r14 n2 t10 hp50/65/80 d8/10/12; dash back l7 then(command rally r26 n5 t5)
M|Avanguardia del guado|a|9|Ordini agli alleati mobili di raggiungere il punto mirato, poi scatti in avanti. Richiede almeno un alleato mobile vicino.|command rally @aim g18 r26 n5 t5; dash fwd l9
M|Raduno alla soglia|b|12|Richiami gli alleati mobili verso di te e apri una coppia di portali davanti a te: puoi condurli all'altro capo.|command rally r26 n6 t6; portal g20 r1.6 t9
M|Esodo dei sepolti|c|14|Consumi fino a due cadaveri per rialzare alleati, ti teletrasporti al punto mirato e richiami la squadra verso di te.|revive r16 n2 t12 hp60/75/90 d10/12/14; blink @aim g18; command rally r32 n6 t6

# ===== ABILITA: ventotto strumenti con costi e condizioni differenti =====
S|Ospizio oltre il varco|b|15|Apri una coppia di portali e una zona curativa all'uscita. La zona resta ferma mentre il passaggio e riutilizzabile.|portal g20 r1.4 t10; zone @aim g20 r4 t7 zheal8/10/12
S|Serratura a specchio|c|16|Apri un portale che trasporta anche i proiettili e una barriera riflettente poco davanti a te.|portal g20 r1.2 t10 shots; barrier @fwd4 l6 t6 hp70/90/110 reflect
S|Passaggio del pantano|b|14|Apri un portale percorribile anche dai nemici non boss e una zona rallentante all'uscita, utile per governare l'inseguimento.|portal g18 r1.5 t9 foes; zone @aim g18 r4 t6 slow.45:1
S|Scolo delle traiettorie|b|14|Apri un portale per corpi alleati e proiettili; un campo all'uscita curva verso il centro i colpi nemici vicini senza convertirli.|portal g20 r1.5 t8 shots; magnet @aim g20 r5 t6 force12
S|Infermiere della soglia|b|16|Apri una coppia di portali e evochi un guaritore vicino all'uscita, per sostenere chi raggiunge quel lato.|portal g18 r1.4 t10; sum guaritore @aim g18 t10 hp60/80/100
S|Picchetto di Stige|a|8|Vincoli il nemico al punto in cui si trova: oltre tre metri lo tira indietro, oltre dodici il legame si spezza.|tether g24 t5 l3 break12 pull13
S|Piazzola dei vincoli|b|12|Fino a quattro nemici nell'area mirata ricevono ciascuno un vincolo elastico al proprio punto iniziale.|tether @aim g20 r6 n4 t5 l3 break12 pull12
S|Laccio di rimbalzo|b|11|Vincoli il bersaglio e lo respingi. Se supera la lunghezza del legame viene tirato al suo punto, salvo spezzarlo.|aim g22; tether g22 t5 l2 break12 pull16; tgt g22 d16/20/24 push18
S|Panico al palo|b|12|Vincoli il bersaglio e gli incuti paura: i nemici leggeri tentano di fuggire mentre il legame li richiama.|aim g24; tether g24 t5 l2.5 break13 pull14; tgt g24 fear4
S|Fossa elastica|b|13|Vincoli i nemici nell'area mirata e vi lasci una chiazza nociva; uscire dalla chiazza richiede anche vincere il richiamo.|tether @aim g18 r5 n3 t5 l2.5 break11 pull12; zone @aim g18 r5 t5 dps8/11/14
S|Pegno del carceriere|c|15|Vincoli il bersaglio e registri una quota dei danni che subisce: il debito viene inflitto dopo quattro secondi.|aim g24; tether g24 t5 l3 break12 pull12; debt g24 t4 mul.4 cap70/90/110
S|Maschera del dannato|a|12|Per otto secondi imiti l'archetipo di primario del nemico mirato: tiro, artiglio, pugno pesante o onda del boss.|mimic g26 t8 mul1
S|Maschera ferrata|b|16|Imiti il primario nemico e riduci i danni ricevuti per sei secondi. L'imitazione termina insieme alla protezione.|mimic g24 t6 mul.9; buff armor.7 t6
S|Bocca del predatore|b|15|Imiti il primario del bersaglio; per otto secondi i tuoi colpi ti curano, al massimo una volta al secondo.|mimic g24 t8 mul.85; trig hit t8 icd1 do(heal v4/6/8)
S|Maschera del capitano|b|16|Imiti il primario nemico. Per otto secondi ogni uccisione richiama gli alleati mobili verso di te.|mimic g24 t8 mul1; trig kill t8 icd.3 do(command rally r26 n6 t4)
S|Appello del Lete|a|10|Segni il nemico: dopo tre secondi ritorna alla posizione segnata e subisce un colpo. La vita persa resta persa.|rewindfoe g24 t3 d20/26/32
S|Ritorno del drappello|b|14|Segni fino a quattro nemici nell'area mirata: dopo tre secondi ritornano ai rispettivi punti e vengono feriti.|rewindfoe @aim g18 r6 n4 t3 d14/18/22
S|Esilio con richiamo|b|13|Segni il nemico, lo colpisci e lo respingi. Dopo tre secondi lo richiami al segno e lo ferisci di nuovo.|aim g24; rewindfoe g24 t3 d14/18/22; tgt g24 d12/16/20 push20
S|Conto alla rovescia del pegno|c|16|Segni il nemico per un ritorno dopo tre secondi e registri un debito sui danni subiti, da pagare un secondo dopo il ritorno.|aim g24; rewindfoe g24 t3 d12/16/20; debt g24 t4 mul.35 cap70/90/110
S|Appuntamento con la fossa|b|14|Segni il nemico; poco dopo il suo ritorno, una piccola esplosione colpisce la sua posizione e i vicini.|aim g24; rewindfoe g24 t3 d10/14/18; wait t3.1; circ @tgt r3.5 d24/30/36
S|Custode delle spoglie|b|14|Consumi fino a due cadaveri nemici recenti e li rialzi come alleati temporanei. Boss e cadaveri gia usati sono esclusi.|revive r16 n2 t12 hp60/80/100 d10/13/16
S|Cappella dei risorti|c|18|Rialzi due cadaveri recenti, raduni gli alleati mobili attorno a te e prepari una zona curativa locale.|revive r16 n2 t12 hp55/70/85 d10/12/14; command rally r24 n6 t5; zone r5 t6 zheal7/9/11
S|Ossario protettivo|b|16|Consumi un cadavere recente per rialzare un alleato e ottenere uno scudo personale. Senza cadaveri non si attiva.|revive r14 n1 t12 hp70/90/110 d12/15/18; buff shield35/45/55 t6
S|Staffetta delle tombe|c|18|Rialzi un cadavere recente; la prossima uccisione entro otto secondi prova a rialzare un altro cadavere vicino.|revive r16 n1 t12 hp65/80/95 d12/15/18; trig kill t8 n1 do(revive r16 n1 t10 hp55/70/85 d10/13/16)
S|Editto del bersaglio|a|10|Ordini agli alleati mobili di attaccare il nemico mirato e lo marchi affinche subisca piu danni.|command r28 n6 t6; tgt g24 mark1.25:6
S|Piazza di raccolta|b|13|Raduni gli alleati mobili nel punto mirato e crei li una zona curativa. Richiede alleati mobili nel raggio.|command rally @aim g20 r28 n6 t6; zone @aim g20 r5 t6 zheal8/10/12
S|Mandato contro l'armato|b|13|Ordini un attacco concentrato sul nemico mirato e gli impedisci per poco nuovi attacchi base, senza bloccarne il movimento.|command r28 n6 t6; disarm g24 t2.5
S|Cerchio del caporale|b|12|Raduni gli alleati mobili verso di te e respingi i nemici in una corona, lasciando libero il centro del raduno.|command rally r28 n6 t5; ring r8 i3 d18/24/30 push14

# ===== SUPREME: quattordici modi di cambiare il combattimento =====
U|Adunata dell'ossario|c|1|Consumi fino a sei cadaveri recenti per rialzare una squadra e ordini agli alleati mobili di attaccare il nemico mirato.|revive r24 n6 t16 hp90/115/140 d16/20/24; command r32 n10 t10
U|Dogana dell'abisso|c|1|Apri una coppia di portali per corpi e proiettili, compresi i nemici non boss; due barriere davanti a te respingono i colpi ostili.|portal g28 r2 t14 foes shots; barrier @fwd4 l10 t10 hp130/170/210 reflect; barrier @fwd8 l8 t10 hp100/130/160
U|Coro dei legati|c|1|Vincoli fino a sei nemici nell'area mirata e li colleghi: una parte del danno subito da uno passa agli altri, con effetto ridotto sui boss.|tether @aim g22 r8 n6 t8 l3 break14 pull15; link @aim g22 r8 n6 t8 share.3
U|Maschera del ricettacolo|c|1|Imiti per dodici secondi il primario nemico e per otto assorbi i proiettili ostili vicini in una banca di energia. Serve un potere di rilascio per spenderla.|mimic g28 t12 mul1.2; absorb t8 r5 cap150/180/210
U|Ora del ritorno|c|1|Segni i nemici nell'area e li richiami dopo quattro secondi; subito dopo una vasta esplosione colpisce intorno al bersaglio mirato.|aim g24; rewindfoe @aim g24 r8 n6 t4 d24/32/40; wait t4.1; circ @tgt r8 d70/90/110
U|Catena delle esequie|c|1|Rialzi tre cadaveri recenti. Per dodici secondi le successive quattro uccisioni provano ciascuna a rialzare un altro cadavere vicino.|revive r22 n3 t16 hp75/95/115 d14/18/22; trig kill t12 n4 icd.3 do(revive r18 n1 t12 hp65/85/105 d12/16/20)
U|Bando della caccia|c|1|Ordini agli alleati mobili di concentrarsi sul bersaglio e lo marchi. Per dieci secondi le tue uccisioni ti curano e ricaricano un poco la Risonanza.|command r34 n10 t10; tgt g24 mark1.35:10; trig kill t10 icd.3 do(heal v12/16/20; res v4)
U|Ponte della legione|c|1|Apri una coppia di portali per te e gli alleati. Richiami poi quattro volte gli alleati mobili verso il punto mirato, a due secondi di distanza.|portal g28 r2 t14; rep n4 ev2 do(command rally @aim g28 r36 n10 t5)
U|Strappo dei debitori|c|1|Vincoli un gruppo, lo respingi dal centro dell'area e registri una quota dei danni che subisce, da infliggere cinque secondi dopo.|tether @aim g22 r8 n6 t7 l3 break16 pull18; circ @aim g22 r8 d30/40/50 push16; debt @aim g22 r8 n6 t5 mul.45 cap100/130/160
U|Sentenza fuori dal tempo|c|1|Segni i nemici nell'area, fermi il tempo per due secondi e li richiami ai segni dopo quattro, infliggendo danno senza restituire vita.|rewindfoe @aim g24 r9 n6 t4 d50/65/80; freeze t2
U|Volto del condottiero|c|1|Imiti il primario nemico e ordini agli alleati mobili di attaccarlo. Per dieci secondi i tuoi colpi ordinano nuovamente l'attacco, al massimo ogni secondo.|mimic g28 t10 mul1.15; command g28 r32 n8 t7; trig hit t10 icd1 do(command g28 r32 n8 t4)
U|Traghetto dei risorti|c|1|Rialzi quattro cadaveri recenti, apri un portale per te e gli alleati e li raduni verso il punto mirato. La coppia resta riutilizzabile.|revive r24 n4 t16 hp85/110/135 d15/19/23; portal g26 r2 t14; command rally @aim g26 r36 n10 t8
U|Ridotto del vessillo|c|1|Raduni gli alleati mobili nel punto mirato, crei una barriera davanti a te e una zona protetta presso il raduno che cura e riduce i tuoi danni ricevuti.|command rally @aim g22 r34 n10 t10; barrier @fwd5 l12 t10 hp160/200/240; zone @aim g22 r6 t10 zheal10/13/16 armor.6
U|Maschera dell'appuntamento|c|1|Segni il nemico per un ritorno dopo cinque secondi, ne imiti il primario e diventi invisibile per preparare l'agguato. Il ritorno non cura il nemico.|aim g28; rewindfoe g28 t5 d40/55/70; mimic g28 t10 mul1.1; buff veil t4
`);
for (let i = first; i < Bricks.LIST.length; i++) Bricks.LIST[i].edition = '3.2';
})();
