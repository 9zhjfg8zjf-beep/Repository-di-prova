// Corpo e navigazione: taglia reale, passaggio incorporeo e volo guidato.
// Le forme incompatibili non vengono concatenate. La fase non aggiunge attacchi.
(() => {
  const first = Bricks.LIST.length;
  Bricks.load(String.raw`
# ===== TAGLIA: dodici decisioni sul corpo del giocatore =====
M|Pulviscolo corrente|b|10/9/8|Per cinque secondi diventi minuscolo e ottieni anche una breve accelerazione: meno portata e danno, piu agilita.|form size.45 t5; buff haste1.25 t5
M|Passo del bastione|c|12/11/10|Diventi grande per sei secondi e scatti; all'arrivo una spinta circolare apre spazio.|form size1.8 t6; dash l9 d12/15/18 then(circ r4.5 d14/18/22 push10)
S|Polvere velata|b|13/12/11|Per sei secondi diventi piccolo e invisibile; il primo colpo diretto riuscito rompe il velo, non la taglia.|form size.5 t6; buff veil1.6 t6
S|Spalle della montagna|b|13/12/11|Raddoppi la taglia per sette secondi e ottieni scudo: colpi piu lunghi e forti, corpo piu lento e facile da colpire.|form size2 t7; buff shield45/60/75 t7
S|Torace del forziere|c|15/14/13|Cresci per sei secondi e assorbi i proiettili vicini per quattro; poi restituisci la banca in cinque colpi.|form size1.9 t6; absorb t4 r4 cap120/150/180; wait t4; release n5 v28 mul1 sp.15
S|Granello repulsivo|b|13/12/11|Diventi piccolo per sei secondi; per quattro secondi un campo ti segue e allontana le traiettorie nemiche.|form size.55 t6; magnet @self fol r4 t4 force18 repel
S|Palmi del soccorso|c|15/14/13|Cresci per sette secondi; per sei secondi i tuoi colpi riusciti ti curano, con una breve pausa fra le cure.|form size1.8 t7; trig hit t6 icd.7 do(heal v4/5/6)
S|Perno del gigante|c|14/13/12|Cresci per sei secondi e vincoli al loro posto fino a tre nemici vicini: allontanarsi li tira indietro.|form size1.7 t6; tether @self r6 n3 t4 l3 break10 pull12
S|Seme purificato|b|13/12/11|Diventi piccolo per sei secondi e purifichi gli alleati e le zone nocive attorno a te; curi solo se rimuovi effetti.|form size.6 t6; cleanse @self r5 heal5
S|Pilastro del portico|c|15/14/13|Cresci per sette secondi e alzi davanti a te un riparo fisico di cinque secondi.|form size1.8 t7; barrier @fwd5 l8 t5 hp110/140/170
U|Atlante del vestibolo|c|1|Diventi enorme per otto secondi; un'aura circolare ferisce chi ti resta vicino e uno scudo protegge il corpo ingrandito.|form size2.2 t8; buff orbit20/25/30 r5 shield80/100/120 t8
U|Seme della processione|c|1|Per dieci secondi diventi minuscolo; richiami gli alleati verso di te e una zona mobile li cura per otto secondi.|form size.4 t10; command @self rally r24 n6 t6; zone fol r6 t8 zheal7/9/11

# ===== FASE: dodici passaggi senza attacchi mentre sei incorporeo =====
M|Passo senza peso|b|10/9/8|Per tre secondi attraversi i muri ed eviti i colpi, ma non puoi attaccare o lanciare abilita. Ripremi per uscire.|phase t3 speed1.2
M|Cammino del convalescente|b|13/12/11|Entri in fase per quattro secondi e recuperi lentamente vita nello stesso intervallo. In fase non attacchi; puoi uscirne ripremendo.|phase t4 speed1.1; buff hot18/24/30 t4
M|Pelle oltre la soglia|c|13/12/11|Entri in fase per tre secondi e ottieni uno scudo di sette secondi, utile anche quando torni solido. Ripremi per uscire prima.|phase t3 speed1.15; buff shield35/45/55 t7
M|Pellegrinaggio chiuso|c|14/13/12|Entri in fase per tre secondi e lasci un segno; dopo poco piu di tre secondi torni comunque al segno. Ripremi per uscire prima dalla fase.|phase t3 speed1.3; mem; wait t3.2; ret
M|Soglia del vento cavo|b|13/12/11|Entri in fase per quattro secondi; un campo mobile allontana per quattro secondi le traiettorie nemiche. Ripremi per tornare solido.|phase t4 speed1.1; magnet @self fol r5 t4 force18 repel
M|Ritirata incorporea|b|12/11/10|Entri in fase per tre secondi e lasci dietro un riparo fisico che dura cinque secondi. Non attacchi in fase; ripremi per uscirne.|phase t3 speed1.2; barrier @back4 l6 t5 hp90/115/140
S|Scrigno senza corpo|c|15/14/13|Per quattro secondi attraversi i muri e assorbi proiettili vicini; poco dopo la banca diventa scudo. Puoi terminare prima la fase ripremendo.|phase t4 speed1.1; absorb t4 r4 cap110/140/170; wait t4.2; release shield mul.75
S|Lavacro della soglia|c|15/14/13|Entri in fase per tre secondi, purifichi cio che ti circonda e lasci sul posto una zona di cura di quattro secondi. Ripremi per uscire.|phase t3 speed1.15; cleanse @self r6 heal4; zone @self r4 t4 zheal5/6/7
S|Intervallo operoso|c|15/14/13|Entri in fase per quattro secondi; per sette secondi le ricariche scorrono piu velocemente. In fase non usi altri poteri; ripremi per uscire.|phase t4 speed1.2; buff cdr1.6 t7
S|Membrana di scorie|c|14/13/12|Entri in fase per quattro secondi e converti subito in scudo i proiettili gia vicini. Senza proiettili ottieni comunque la fase; ripremi per uscire.|phase t4 speed1.15; transmute @self r6 shield mul.6
U|Processione incorporea|c|1|Entri in fase per sei secondi e una zona mobile cura te e gli alleati per sei secondi. Non attacchi in fase; ripremi per tornare solido.|phase t6 speed1.25; zone fol r7 t6 zheal9/12/15
U|Porte del corpo assente|c|1|Entri in fase per sei secondi e alzi davanti e dietro due ampi ripari per otto secondi. Gli alleati li attraversano; ripremi per uscire dalla fase.|phase t6 speed1.15; barrier @fwd5 l12 t8 hp180/220/260; barrier @back5 l12 t8 hp180/220/260

# ===== VOLO: dodici modi di usare la quota senza attraversare edifici =====
M|Ali del pellegrino|b|11/10/9|Voli fino a otto secondi: guardare in alto o in basso mentre avanzi cambia quota, fino a otto metri. Ripremi per atterrare.|flight t8 h8 speed1.2
M|Volo sotto scudo|c|13/12/11|Voli per sei secondi fino a sei metri e ottieni uno scudo di sei secondi. Gli edifici restano solidi; ripremi per atterrare.|flight t6 h6 speed1.35; buff shield30/40/50 t6
M|Ali controcorrente|c|14/13/12|Voli per sei secondi fino a dieci metri; per quattro secondi un campo mobile respinge i proiettili. Ripremi per atterrare.|flight t6 h10 speed1.15; magnet @self fol r5 t4 force20 repel
M|Volo con richiamo|c|15/14/13|Lasci un segno e voli fino a sette secondi; dopo poco piu di sette secondi torni al punto di partenza. Ripremi per atterrare prima.|flight t7 h10 speed1.2; mem; wait t7.2; ret
S|Condensatore alato|c|16/15/14|Voli per otto secondi e assorbi proiettili per cinque; dopo cinque secondi restituisci la banca in una salva. Ripremi per atterrare.|flight t8 h8 speed1.1; absorb t5 r4.5 cap130/160/190; wait t5; release n5 v30 mul1.1 sp.14
S|Ali del ristoro|c|16/15/14|Voli fino a otto secondi; per otto secondi recuperi una parte del danno che infliggi. Ripremi per atterrare.|flight t8 h7 speed1.15; buff ls.25/.3/.35 t8
S|Sentinella sospesa|c|16/15/14|Voli fino a otto secondi; per sei secondi i tuoi colpi riusciti disarmano brevemente il bersaglio, al massimo una volta al secondo. Ripremi per atterrare.|flight t8 h6 speed1.1; trig hit t6 icd1 do(disarm g24 t1.2)
S|Guardia sopra il portico|c|15/14/13|Voli fino a otto secondi e alzi davanti un riparo al suolo di sei secondi per proteggere gli alleati. Ripremi per atterrare.|flight t8 h8 speed1.1; barrier @fwd4 l8 t6 hp110/140/170
S|Nido del soccorso|c|16/15/14|Voli fino a otto secondi e lasci al decollo una zona che cura per sette secondi chi vi resta. Ripremi per atterrare.|flight t8 h9 speed1.1; zone @self r5 t7 zheal7/9/11
S|Alfiere dei tetti|c|16/15/14|Voli fino a otto secondi e ordini agli alleati mobili di radunarsi nel punto mirato. Senza alleati ottieni comunque il volo; ripremi per atterrare.|flight t8 h8 speed1.2; command @aim g18 rally r24 n6 t6
U|Cielo delle cerniere|c|1|Voli fino a dieci secondi; per otto secondi le prime tre altre abilita creano un campo mobile che devia i proiettili. Ripremi per atterrare.|flight t10 h12 speed1.2; trig cast t8 n3 icd1 do(magnet @self fol r7 t3 force24 repel)
U|Santuario sospeso|c|1|Voli fino a dieci secondi; per otto secondi un cerchio sotto di te cura e purifica gli alleati e le zone nocive. Ripremi per atterrare.|flight t10 h10 speed1.15; zone fol r7 t8 zheal8/10/12 ev1 tick(cleanse @pt r6 heal2)
`);
  for (let i = first; i < Bricks.LIST.length; i++) Bricks.LIST[i].edition = '3.2';
})();
