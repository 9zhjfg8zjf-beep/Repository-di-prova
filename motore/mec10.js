// Terza ondata: energia raccolta, traiettorie, conversioni e ostacoli reali.
// Ogni riga e un programma esplicito; i numeri da soli non definiscono una nuova meccanica.
(() => {
  const first = Bricks.LIST.length;
  Bricks.load(String.raw`
# ===== PRIMARI: ogni attacco sceglie anche come difendersi =====
P|Pugno esattore|b|.7|Un pugno apre per un secondo una presa sui proiettili vicini, solo se colpisce.|cone r3.4 h.8 d14/17/20 then(absorb t1.2 r2.5 cap60)
P|Tre monete|b|.6|Due dardi, poi assorbi per un secondo e restituisci la banca in tre colpi.|nth n3 do(absorb t1 r3 cap70; wait t1; release n3 v28 mul1 sp.15) else(shot d10/12/14 v32)
P|Credito del ferito|b|.9|Sotto meta vita raccogli proiettili per un secondo e converti la banca in cura; altrimenti lanci un dardo.|if hpb50 do(absorb t1 r3 cap50; wait t1; release heal mul.4) else(shot d14/17/20 v30)
P|Chiodo polare|b|.65|Il dardo lascia alla fine del volo un piccolo campo che attira le traiettorie nemiche.|shot d10/12/14 v28 then(magnet @pt r3 t1.5 force10)
P|Ventaglio inverso|b|.9|Spingi chi hai davanti e per un istante respingi i proiettili attorno a te.|cone r4 h.9 d12/15/18 push5; magnet fol r3.5 t.65 force14 repel
P|Ago bipolare|b|.7|Alterni dardi che lasciano alla fine del volo un campo attrattivo e un campo repulsivo.|nth n2 do(shot d11/13/15 v30 then(magnet @pt r3 t1.2 force14 repel)) else(shot d11/13/15 v30 then(magnet @pt r3 t1.2 force14))
P|Scoria convertita|b|.8|Alla fine del volo il dardo restituisce i proiettili nemici che trova vicino a se.|shot d13/16/19 v27 then(transmute @pt r3 turn mul.6)
P|Palmo della fonderia|b|.8|Se il palmo colpisce, fonde in cura i proiettili presenti attorno al primo nemico raggiunto.|cone r4 h.65 d15/18/21 then(transmute @tgt r3 heal mul.25)
P|Dazio del passante|b|.75|In corsa i tuoi dardi convertono i proiettili vicini alla fine del volo in scudo; da fermo li convertono in Risonanza.|if moving do(shot d11/13/15 v30 then(transmute @pt r3 shield mul.4)) else(shot d11/13/15 v36 pierce then(transmute @pt r2 res mul.2))
P|Parata di calce|b|1|Un fendente riuscito alza per un secondo un piccolo riparo davanti a te.|cone r3.7 h1 d18/22/26 then(barrier @fwd3 l3 t1 hp24/30/36)
P|Terza pietra|b|.7|Ogni terzo tiro alza un riparo breve; gli altri due sono dardi semplici.|nth n3 do(barrier @fwd4 l4 t1.5 hp32/40/48; shot d12/15/18 v30) else(shot d12/15/18 v32)
P|Credenza di pietra|b|.8|Con scudo spari e alzi un piccolo riflettore; senza scudo usi un fendente che ne dona un poco per bersaglio.|if shielded do(shot d12/15/18 v31; barrier @fwd3 l3 t.8 hp24 reflect) else(cone r3.6 h.9 d13/16/19 sh5)

# ===== MOVIMENTI: ingresso, uscita e raccolta cambiano la scelta =====
M|Passo del tributo|b|8/7/6|Scatti e assorbi proiettili all'arrivo; dopo due secondi restituisci la banca in un ventaglio.|dash l10/12/14 then(absorb t1.8 r4 cap80); wait t2; release n4 v26 mul1 sp.2
M|Rientro del tesoriere|c|13/12/11|Lasci un segno, salti e raccogli proiettili; dopo tre secondi converti la banca in scudo e torni al segno.|mem; leap g16 then(absorb t2.4 r4 cap100); wait t3; release shield mul.7; ret
M|Scarto polare|b|7/6/5|Lasci davanti un campo che attira i proiettili e scatti all'indietro.|magnet @fwd4 r5 t3 force18; dash back l8/10/12
M|Orbita del viandante|b|9/8/7|Salti nel punto mirato: all'arrivo un campo respinge i proiettili e corri piu veloce per tre secondi.|leap g16 then(magnet fol r4 t3 force16 repel; buff haste1.3 t3)
M|Passo del fonditore|b|7/6/5|Scatti; all'arrivo restituisci i proiettili nemici gia presenti nel raggio.|dash l10/12/14 then(transmute @pt r5 turn mul.7)
M|Soglia rifusa|c|10/9/8|Ti teletrasporti, converti in scudo i proiettili all'arrivo e alzi un riparo davanti.|blink g15 then(transmute @pt r4 shield mul.6; barrier @fwd3 l4 t3 hp65)
M|Uscita murata|b|8/7/6|Alzi un riparo dietro di te, poi scatti in avanti lasciando il riparo a coprire la ritirata.|barrier @back3 l6 t4 hp90; dash fwd l11/13/15
M|Salto del muratore|b|9/8/7|Salti nel punto mirato e alzi davanti un riparo che restituisce i proiettili.|leap g17 then(barrier @fwd4 l6 t4 hp80/100/120 reflect)

# ===== ABILITA: assorbimento e banca condivisa =====
S|Borsa di Pluto|b|10/9/8|Per cinque secondi assorbi i proiettili vicini; conservi la banca per un altro potere di rilascio.|absorb t5 r4 cap100/130/160
S|Cedola di brace|b|11/10/9|Assorbi per tre secondi, poi restituisci tutta la banca in un solo colpo.|absorb t3 r4 cap90/120/150; wait t3; release n1 v34 mul1.2
S|Ripartizione del debito|b|11/10/9|Assorbi per due secondi e mezzo, poi dividi la banca in sette proiettili a ventaglio.|absorb t2.5 r4.5 cap110/140/170; wait t2.5; release n7 v25 mul1 sp.14
S|Obolo del convalescente|b|13/12/11|Assorbi per quattro secondi; alla fine converti la banca in cura.|absorb t4 r4 cap100/130/160; wait t4; release heal mul.5
S|Cassa del pellegrino|b|12/11/10|Assorbi per tre secondi; alla fine la banca diventa scudo.|absorb t3 r5 cap100/130/160; wait t3; release shield mul.8
S|Bilancio prudente|c|13/12/11|Raccogli proiettili per tre secondi: sotto meta vita la banca cura, altrimenti parte in cinque colpi.|absorb t3 r4.5 cap120/150/180; wait t3; if hpb50 do(release heal mul.5) else(release n5 v30 mul1.1 sp.1)
S|Guardia esattrice|c|14/13/12|Per sei secondi ogni ferita apre una breve finestra di assorbimento; alla fine rilasci la banca.|trig hurt t6 icd.6 do(absorb t1.1 r4 cap120/150/180); wait t6; release n3 v32 mul1.2 sp.16
S|Pedaggio dei colpi|c|13/12/11|Per cinque secondi i tuoi colpi aprono brevi finestre di assorbimento; alla fine la banca diventa scudo.|trig hit t5 icd.7 do(absorb t.8 r3.5 cap90/120/150); wait t5; release shield mul.7
S|Riscossione in marcia|b|12/11/10|Corri piu veloce mentre raccogli proiettili; dopo tre secondi e mezzo restituisci la banca in due colpi.|buff haste1.35 t3.5; absorb t3.5 r4 cap100/130/160; wait t3.5; release n2 v38 mul1 sp.08
S|Riserva dell'assediato|c|15/14/13|Assorbi per quattro secondi con una piccola armatura; poi usi la banca come cura se sei ferito, altrimenti come scudo.|absorb t4 r4 cap120/150/180; buff armor.8 t4; wait t4; if hpb70 do(release heal mul.45) else(release shield mul.75)

# ===== ABILITA: campi che cambiano traiettoria, non squadra =====
S|Pozzo delle saette|b|9/8/7|Nel punto mirato un campo curva i proiettili nemici verso il suo centro per cinque secondi.|magnet @aim g18 r7 t5 force18
S|Corona repulsiva|b|10/9/8|Per quattro secondi un campo ti segue e respinge le traiettorie nemiche.|magnet fol r5 t4 force20 repel
S|Doppia polarita|c|12/11/10|Un campo attrattivo davanti e uno repulsivo dietro deviano i colpi per quattro secondi.|magnet @fwd6 r5 t4 force17; magnet @back4 r5 t4 force17 repel
S|Dogana immobile|b|11/10/9|Alzi un riparo e davanti ad esso un campo che attira le traiettorie dei colpi nemici.|barrier @fwd3 l6 t5 hp100/125/150; magnet @fwd6 r6 t5 force18
S|Fossa del conduttore|c|12/11/10|Attiri i proiettili nel punto mirato, dove una zona rallenta le creature che vi entrano.|magnet @aim g16 r7 t5 force20; zone @aim g16 r4 t5 slow.35:1
S|Respiro del polo|b|12/11/10|Per sei secondi emetti tre brevi campi repulsivi che ti seguono, separati da una pausa.|rep n3 ev2 do(magnet fol r5 t1 force24 repel)
S|Setaccio di Cocito|b|11/10/9|Un dardo lascia alla fine del volo un campo attrattivo e un cerchio che rallenta.|shot d18/22/26 v24 then(magnet @pt r6 t4 force18; zone @pt r3 t4 slow.4:1)
S|Polo d'agguato|c|13/12/11|Un'esca attira i nemici; quando cade lascia un campo che allontana i proiettili dal suo corpo.|sum esca n1 @fwd5 t5 hp45 d0 die(magnet @pt r7 t4 force22 repel)
S|Perno dei sette passi|b|12/11/10|Per cinque secondi ogni scatto concluso lascia nel punto d'arrivo un campo attrattivo di due secondi.|trig dashend t5 n3 do(magnet @pt r6 t2 force18); buff haste1.25 t5
S|Cerniera dei flussi|c|14/13/12|Un campo che ti segue raccoglie le traiettorie, mentre assorbi i proiettili che arrivano piu vicino.|magnet fol r8 t4 force18; absorb t4 r3.5 cap130/160/190

# ===== ABILITA: conversioni istantanee e convertitori a tempo =====
S|Rifusione ostile|b|9/8/7|Restituisci come tuoi i proiettili nemici gia presenti attorno a te. Senza proiettili non si attiva.|transmute r7 turn mul.8
S|Elettuario di scorie|b|11/10/9|Consumi i proiettili nemici vicini e converti il loro danno in cura. Richiede proiettili presenti.|transmute r7 heal mul.4
S|Pelle di scorie|b|10/9/8|Consumi i proiettili nemici vicini per ottenere scudo. Richiede proiettili presenti.|transmute r8 shield mul.7
S|Moneta di risonanza|b|12/11/10|Consumi i proiettili nemici gia presenti nel punto mirato per recuperare Risonanza.|transmute @aim g18 r7 res mul.3
S|Riciclo del ferito|c|12/11/10|Sotto meta vita converti i proiettili vicini in cura; altrimenti li restituisci ai nemici.|if hpb50 do(transmute r8 heal mul.4) else(transmute r8 turn mul.8)
S|Fonderia ambulante|c|14/13/12|Per quattro secondi un cerchio ti segue e ogni secondo converte i proiettili presenti in scudo.|zone fol r5 t4 ev1 tick(transmute @pt r5 shield mul.35)
S|Crogiolo distante|c|13/12/11|Un cerchio nel punto mirato converte ogni secondo i proiettili presenti in colpi alleati per quattro secondi.|zone @aim g18 r5 t4 ev1 tick(transmute @pt r5 turn mul.65)
S|Arca del contraccolpo|c|14/13/12|Per cinque secondi ogni ferita converte in cura i proiettili vicini al luogo da cui arriva il colpo.|trig hurt t5 icd1 do(transmute @pt r5 heal mul.3)
S|Scorie dopo la lama|b|12/11/10|Per cinque secondi, fino a tre tuoi colpi convertono in Risonanza i proiettili vicini al bersaglio.|trig hit t5 n3 icd.8 do(transmute @pt r4 res mul.2)
S|Forno a due camere|c|15/14/13|Per due secondi attiri i proiettili nel punto mirato; un cerchio li converte in scudo alla propria scadenza.|magnet @aim g16 r7 t2 force22; zone @aim g16 r6 t2 end(transmute @pt r6 shield mul.7)

# ===== ABILITA: ripari fisici, resistenza e tempi di attraversamento =====
S|Argine dello Stige|b|10/9/8|Alzi davanti a te un riparo lungo che ferma nemici e proiettili per sette secondi o finche viene distrutto.|barrier @fwd4 l8 t7 hp120/150/180
S|Lastra di Malebolge|c|12/11/10|Alzi un riparo che restituisce i proiettili nemici, consumando la propria resistenza.|barrier @fwd5 l7 t5 hp90/120/150 reflect
S|Portico del viandante|c|13/12/11|Alzi due ripari, davanti e dietro; tu e gli alleati potete attraversarli.|barrier @fwd4 l8 t6 hp90/120/150; barrier @back4 l8 t6 hp90/120/150
S|Baluardo sanitario|c|14/13/12|Alzi un riparo davanti e lasci ai tuoi piedi una piccola zona di cura per cinque secondi.|barrier @fwd4 l7 t5 hp100/130/160; zone r3.5 t5 zheal5/6/7
S|Palizzata progressiva|c|14/13/12|Per quattro secondi alzi un nuovo riparo ogni secondo e mezzo davanti alla tua posizione attuale.|rep n3 ev1.5 do(barrier @fwd4 l5 t4 hp60/75/90)
S|Pietra dell'ultima ferita|c|13/12/11|Per cinque secondi, le prime due ferite alzano un riparo davanti a te.|trig hurt t5 n2 icd1 do(barrier @fwd3 l6 t3 hp70/90/110)
S|Rifugio del bersaglio|b|12/11/10|Colpisci il nemico mirato e alzi un riparo nel punto in cui si trova.|tgt d18/22/26 then(barrier @pt l5 t4 hp70/90/110)
S|Riflettore del duello|c|13/12/11|Un riparo riflettente copre la fronte mentre una spinta allontana chi ti e vicino.|barrier @fwd4 l6 t4 hp90/115/140 reflect; circ r4.5 d10/13/16 push12
S|Muraglia dell'avaro|c|15/14/13|Alzi un riparo e raccogli i proiettili che arrivano entro tre metri da te; dopo quattro secondi la banca diventa scudo.|barrier @fwd5 l8 t4 hp120/150/180; absorb t4 r3 cap100/130/160; wait t4; release shield mul.8
S|Cancellata mobile|c|14/13/12|Per sei secondi le prime tre abilita diverse da questa alzano un riparo davanti a te.|trig cast t6 n3 icd.8 do(barrier @fwd4 l5 t2.5 hp55/70/85)

# ===== SUPREME: trasformazioni del campo di battaglia =====
U|Tesoro di Pluto|c|1|Per sei secondi raccogli proiettili in un ampio raggio; poi restituisci la banca in nove colpi.|absorb t6 r7 cap240/270/300; wait t6; release n9 v30 mul1.5 sp.12
U|Misericordia del forziere|c|1|Raccogli proiettili per sei secondi mentre una zona cura gli alleati; alla fine la banca ti dona scudo.|absorb t6 r6 cap220/260/300; zone fol r6 t6 zheal7/9/11; wait t6; release shield mul1
U|Testamento del conduttore|c|1|Per sette secondi le ferite aprono ampie finestre di assorbimento; poi la banca cura se sei sotto meta vita, altrimenti diventa una salva.|trig hurt t7 icd.5 do(absorb t1.6 r6 cap250/275/300); buff armor.75 t7; wait t7; if hpb50 do(release heal mul.6) else(release n6 v34 mul1.5 sp.14)
U|Giostra dei poli|c|1|Per otto secondi un campo repulsivo ti segue; quattro onde lente partono da te durante la sua durata.|magnet fol r10 t8 force26 repel; rep n4 ev1.5 do(shot n6 ringall wide r1.8 d18/22/26 v15 t1.2)
U|Magnete della bolgia|c|1|Nel punto mirato attiri traiettorie per cinque secondi e trattieni i nemici con un vortice che esplode alla fine.|magnet @aim g20 r11 t5 force28; zone @aim g20 r7 t5 zpull2 dps10/13/16 boom50/65/80
U|Congiunzione del ferro|c|1|Due campi attirano le traiettorie davanti e dietro; dopo due secondi converti i proiettili vicini in colpi alleati.|magnet @fwd7 r9 t4 force24; magnet @back7 r9 t4 force24; wait t2; transmute r15 turn mul1
U|Grande rifusione|c|1|Per sei secondi converti ogni secondo in colpi alleati i proiettili presenti in un ampio cerchio che ti segue.|zone fol r10 t6 ev1 tick(transmute @pt r10 turn mul.8)
U|Pioggia monetaria|c|1|Per sei secondi, tre conversioni trasformano i proiettili attorno a te in Risonanza; un'armatura attenua le ferite nel frattempo.|buff armor.65 t6; rep n3 ev2 do(transmute r10 res mul.25)
U|Forno dei misericordiosi|c|1|Per sei secondi il cerchio mirato converte i proiettili presenti in cura per te e cura gli alleati che vi restano.|zone @aim g18 r8 t6 zheal8/10/12 ev1 tick(transmute @pt r8 heal mul.3)
U|Porte di Dite|c|1|Alzi davanti e dietro due grandi ripari riflettenti; gli alleati possono attraversarli per otto secondi.|barrier @fwd6 l14 t8 hp220/260/300 reflect; barrier @back6 l14 t8 hp220/260/300 reflect
U|Cinta del contrappasso|c|1|Per otto secondi le tue prime quattro ferite alzano ripari riflettenti; recuperi lentamente vita durante la difesa.|trig hurt t8 n4 icd1.2 do(barrier @fwd4 l9 t4 hp100/130/160 reflect); buff hot35/45/55 t8
U|Cattedrale del ritorno|c|1|Alzi due ripari e assorbi i proiettili che arrivano fra essi; dopo cinque secondi restituisci la banca in una salva.|barrier @fwd7 l12 t6 hp180/220/260; barrier @back7 l12 t6 hp180/220/260; absorb t5 r6 cap240/270/300; wait t5; release n7 v32 mul1.4 sp.16
`);
  for (let i = first; i < Bricks.LIST.length; i++) Bricks.LIST[i].edition = '3.2';
})();
