// Copie fisiche e ricognizione: programmi espliciti, con limiti definiti in POTERI_API.md.
(() => {
  const first = Bricks.LIST.length;
  Bricks.load(String.raw`
# ===== CLONI: ventiquattro scelte di posizione, sostegno e attacco =====
M|Strappo dei gemelli|b|11/10/9|Crei due copie vulnerabili che ti seguono e ripetono il primario, poi scatti indietro.|clone n2 t7 hp32/40/48 mul.35; dash back l8
M|Staffetta del riflesso|b|11/10/9|Scatti in avanti e all'arrivo crei due copie che ti seguono e ripetono il primario.|dash fwd l10 then(clone n2 t7 hp32/40/48 mul.35)
M|Specchio in transito|c|14/13/12|Crei due copie e ti teletrasporti al punto mirato; le copie cercano di seguirti con i propri corpi vulnerabili.|clone n2 t8 hp35/45/55 mul.4; blink g14
M|Discesa delle copie|c|14/13/12|Salti al punto mirato; all'arrivo respingi i nemici vicini e crei due copie del primario.|leap g15 then(circ r4 push12; clone n2 t8 hp35/45/55 mul.4)
M|Corsa del coro|b|12/11/10|Crei due copie del primario e corri piu veloce per cinque secondi, cambiando posizione mentre ti seguono.|clone n2 t8 hp32/40/48 mul.35; buff haste1.4 t5
M|Ritorno del doppio|c|14/13/12|Crei due copie e segni la tua posizione. Dopo tre secondi torni al segno; le copie continuano a seguirti finche restano vive.|clone n2 t8 hp35/45/55 mul.4; mem; wait t3; ret
S|Due ombre operose|b|14/13/12|Crei due copie vulnerabili per otto secondi: ti seguono e ripetono i tuoi attacchi primari diretti.|clone n2 t8 hp35/45/55 mul.4
S|Scorta del riflesso|c|17/16/15|Crei due copie del primario e ricevi uno scudo personale per proteggerti durante l'attacco.|clone n2 t8 hp35/45/55 mul.4; buff shield25/33/41 t6
S|Fontana delle copie|c|18/17/16|Crei due copie e un piccolo campo curativo che ti segue: cura te e gli alleati che restano vicini, comprese le copie.|clone n2 t9 hp32/40/48 mul.4; zone fol r4 t7 zheal4/5/6
S|Tramezza dei riflessi|c|17/16/15|Crei due copie e alzi un riparo davanti a te, per cambiare l'angolo da cui il gruppo affronta i nemici.|clone n2 t8 hp35/45/55 mul.4; barrier @fwd4 l7 t6 hp85/110/135
S|Coro controcorrente|c|18/17/16|Crei due copie; un campo che ti segue curva verso l'esterno i proiettili nemici vicini, senza renderli alleati.|clone n2 t8 hp32/40/48 mul.4; magnet fol r5 t6 force18 repel
S|Giuramento dello specchio|c|19/18/17|Crei due copie; le prossime tre altre abilita usate entro sette secondi ti concedono un piccolo scudo, con una pausa fra le concessioni.|clone n2 t9 hp35/45/55 mul.4; trig cast t7 n3 icd1 do(buff shield10/13/16 t3)
S|Turno del coro|c|18/17/16|Crei due copie; per otto secondi le uccisioni accorciano un poco le altre ricariche, al massimo una volta al secondo.|clone n2 t8 hp35/45/55 mul.4; trig kill t8 icd1 do(cdr v.5/.7/.9)
S|Credito dei riflessi|c|17/16/15|Crei due copie e apri un debito sul nemico mirato: una quota dei danni realmente subiti torna come colpo aggiuntivo alla scadenza.|clone n2 t8 hp35/45/55 mul.4; debt g22 t4 mul.25 cap35/45/55
S|Compagnia del nodo|c|19/18/17|Crei due copie e provi a collegare i nemici nella zona mirata: i legati condividono una quota del danno subito.|clone n2 t8 hp35/45/55 mul.4; link @aim g18 r6 n3 t5 share.2
S|Indice dello specchio|c|17/16/15|Crei due copie; per sei secondi i tuoi colpi diretti marchiano il bersaglio, aumentando per poco i danni che riceve.|clone n2 t8 hp35/45/55 mul.4; trig hit t6 icd1 do(tgt mark1.15:3)
S|Lavacro dei riflessi|c|17/16/15|Crei due copie e purifichi gli alleati e le zone dannose nemiche vicine, curandoti solo per gli effetti rimossi.|clone n2 t8 hp35/45/55 mul.4; cleanse r8 heal4/5/6
S|Medico del coro|c|20/19/18|Crei due copie del primario e un guaritore temporaneo che ti cura finche gli resti vicino.|clone n2 t9 hp32/40/48 mul.4; sum guaritore n1 t8 hp40/55/70
S|Assalto degli inermi|c|18/17/16|Crei due copie e impedisci brevemente nuovi attacchi base ai nemici vicini, lasciandoli liberi di muoversi.|clone n2 t8 hp35/45/55 mul.4; disarm r6 n3 t1.5/1.8/2.1
S|Coro a bocche chiuse|c|19/18/17|Crei due copie e ostacoli per poco nuovi tiri e abilita dei nemici adatti vicini. I colpi gia annunciati restano attivi.|clone n2 t8 hp35/45/55 mul.4; silence r7 n3 t1.6/1.9/2.2
U|Tre testimoni d'ira|c|1|Crei tre copie vulnerabili del primario per dodici secondi e aumenti il danno dei tuoi colpi per i primi otto.|clone n3 t12 hp45/60/75 mul.4; buff fury1.2/1.25/1.3 t8
U|Convento dei riflessi|c|1|Crei tre copie e un ampio campo mobile: cura gli alleati al suo interno e riduce il danno che ricevi mentre ci resti.|clone n3 t12 hp45/60/75 mul.4; zone fol r7 t9 zheal6/8/10 armor.75
U|Processione degli specchi|c|1|Crei tre copie del primario e due esche; per dieci secondi le uccisioni ti restituiscono vita e poca Risonanza.|clone n3 t12 hp45/60/75 mul.4; sum esca n2 far3 t6 hp70/90/110; trig kill t10 icd1 do(heal v6/8/10; res v2)
U|Appuntamento dei riflessi|c|1|Crei tre copie e segni i nemici nella zona mirata. Dopo quattro secondi i segnati tornano ai propri punti e ricevono un colpo, senza recuperare vita; i boss resistono al ritorno.|clone n3 t12 hp45/60/75 mul.4; rewindfoe @aim g20 r7 n4 t4 d24/32/40
# ===== SCANSIONE: ventiquattro modi di usare informazione senza ignorare i muri =====
M|Passo dell'osservatore|b|8/7/6|Riveli per alcuni secondi i nemici nel raggio, anche oltre i muri, e scatti in avanti.|scan r24 t6; dash fwd l10/11/12
M|Ritirata del veggente|b|10/9/8|Scatti indietro; all'arrivo riveli i nemici nel raggio e respingi chi ti e rimasto vicino.|dash back l9 then(scan r24 t6; circ r4 push12)
M|Soglia del vedente|c|12/11/10|Riveli i nemici nel raggio e ti teletrasporti al normale punto mirato. La scansione non permette di attraversare gli ostacoli con gli attacchi.|scan r26 t6; blink g14
M|Balcone del censore|b|11/10/9|Salti al punto mirato e all'arrivo riveli per alcuni secondi i nemici intorno alla tua nuova posizione.|leap g15 then(scan r26 t7)
M|Corsa dell'augure|b|11/10/9|Per alcuni secondi riveli i nemici nel raggio mentre corri piu velocemente; il rilevamento segue il tuo percorso.|scan r24 t7; buff haste1.4/1.5/1.6 t5
M|Ricognizione a ritorno|c|12/11/10|Riveli i nemici e segni la tua posizione. Dopo tre secondi torni al segno, conservando il rilevamento per il tempo restante.|scan r26 t7; mem; wait t3; ret
M|Varco del cartografo|c|14/13/12|Riveli i nemici nel raggio e apri una coppia di portali riutilizzabili per te e gli alleati.|scan r28 t8; portal g20 r1.3 t8
M|Passo dello scrutatore|c|13/12/11|Riveli i nemici nel raggio e diventi invisibile per pochi secondi. Il primo colpo riuscito consuma il velo.|scan r26 t7; buff veil1.4 t4
S|Occhio del vestibolo|b|9/8/7|Riveli per sei secondi i nemici entro ventiquattro metri, anche attraverso i muri. Non ottieni mira automatica o attacchi attraverso gli ostacoli.|scan r24 t6
S|Palpebra di ferro|b|12/11/10|Riveli i nemici nel raggio e ricevi uno scudo per preparare l'incontro.|scan r26 t7; buff shield25/33/41 t5
S|Specola riflettente|c|14/13/12|Riveli i nemici nel raggio e alzi davanti a te un riparo che restituisce i proiettili nemici, consumando la propria resistenza.|scan r28 t7; barrier @fwd4 l7 t6 hp85/110/135 reflect
S|Cerchio della vedetta|c|14/13/12|Riveli i nemici nel raggio e crei ai tuoi piedi una zona che ferma i proiettili nemici finche dura.|scan r26 t7; zone r4 t4 ward
S|Sussulto dell'augure|c|15/14/13|Riveli i nemici; per sei secondi i colpi subiti provocano una piccola onda che ferisce e indebolisce i nemici vicini a te.|scan r26 t7; trig hurt t6 icd1.2 do(circ @self r4 d8/11/14 weak2)
S|Indice della vedetta|c|13/12/11|Riveli i nemici; per sei secondi i tuoi colpi diretti marchiano chi colpiscono. Rilevare un nemico non rende valido un tiro bloccato.|scan r26 t7; trig hit t6 icd1 do(tgt mark1.2:3)
S|Registro dell'osservatore|c|13/12/11|Riveli i nemici e apri un debito sul normale bersaglio mirato: una quota dei danni subiti viene riscossa dopo quattro secondi.|scan r26 t7; debt g22 t4 mul.25 cap35/45/55
S|Palo della vedetta|c|13/12/11|Riveli i nemici e vincoli il normale bersaglio mirato al suo punto. Il vincolo tira oltre la propria lunghezza e si spezza se viene superato troppo.|scan r26 t7; tether g22 t5 l3 break11 pull12
S|Richiamo del ricognitore|b|12/11/10|Riveli i nemici nel raggio e richiami verso di te gli alleati che possono ricevere ordini, per riunire il gruppo prima dell'incontro.|scan r28 t7; command rally r26 n6 t5
S|Vista purificata|c|13/12/11|Riveli i nemici nel raggio e rimuovi stati nocivi alleati e zone dannose nemiche vicine; gli annunci dei boss restano.|scan r26 t7; cleanse r8 heal4/5/6
S|Tempo del ricognitore|c|15/14/13|Riveli i nemici per otto secondi e per cinque secondi acceleri lo scorrere delle ricariche.|scan r28 t8; buff cdr1.3/1.4/1.5 t5
S|Decima della vedetta|c|15/14/13|Riveli i nemici e per otto secondi ogni uccisione restituisce poca Risonanza, al massimo una volta al secondo.|scan r28 t8; trig kill t8 icd1 do(res v3/4/5)
U|Osservatorio del ferro|c|1|Riveli i nemici in un ampio raggio; due ripari proteggono fronte e retro mentre un campo mobile devia verso l'esterno i proiettili nemici.|scan r38 t12; barrier @fwd5 l10 t8 hp140/180/220; barrier @back5 l10 t8 hp140/180/220; magnet fol r7 t8 force20 repel
U|Faro del pellegrino|c|1|Riveli i nemici in un ampio raggio e corri piu veloce; un cerchio mobile cura te e gli alleati che riescono a seguirti.|scan r38 t12; buff haste1.35 t8; zone fol r6 t8 zheal7/9/11
U|Udienza del vedente|c|1|Riveli i nemici in un ampio raggio e ostacoli brevemente nuovi attacchi base dei vicini, oltre a nuovi tiri e abilita dei bersagli adatti. Gli annunci gia iniziati restano.|scan r38 t12; disarm r10 n6 t3; silence r10 n6 t3
U|Osservatorio dei creditori|c|1|Riveli i nemici e provi a collegare un gruppo nella normale zona mirata, aprendo anche un debito: i danni condivisi e la riscossione seguono i rispettivi limiti.|scan r38 t12; link @aim g20 r8 n5 t6 share.25; debt @aim g20 r8 n5 t5 mul.25 cap45/60/75
`);
  for (let i = first; i < Bricks.LIST.length; i++) Bricks.LIST[i].edition = '3.2';
})();
