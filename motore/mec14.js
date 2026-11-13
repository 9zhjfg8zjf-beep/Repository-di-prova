// Ospiti, condizioni e prigionia: il controllo diretto lascia un corpo da difendere.
(() => {
  const first = Bricks.LIST.length;
  Bricks.load(String.raw`
# ===== POSSESSIONE: dodici modi di preparare il corpo rimasto indietro =====
S|Inquilino dello Stige|b|16/15/14|Controlli per sei secondi movimento e attacco di un nemico leggero. Il tuo corpo resta fermo e vulnerabile; ripremi per tornare.|possess g18 t6 mul.9/1/1.1
S|Corpo in pegno|c|18/17/16|Controlli un nemico leggero per sei secondi; uno scudo protegge il tuo corpo originale, che resta fermo. Ripremi per liberare l'ospite.|possess g18 t6 mul1; buff shield30/38/46 t6
S|Letto del sonnambulo|c|18/17/16|Controlli un nemico leggero e lasci sotto il corpo originale un campo curativo. Il corpo resta vulnerabile; ripremi per tornare.|possess g18 t7 mul.9; zone r3.5 t7 zheal4/5/6
S|Fantoccio del dormiente|c|17/16/15|Controlli un nemico leggero mentre un'esca vicino al corpo originale distrae gli aggressori. Ripremi per tornare al corpo.|possess g18 t6 mul.9; sum esca @fwd3 n1 t6 hp70/90/110
S|Paravento dell'ospite|c|18/17/16|Controlli un nemico leggero e alzi un riparo davanti al corpo originale, che resta vulnerabile dagli altri lati. Ripremi per tornare.|possess g18 t7 mul1; barrier @fwd4 l6 t7 hp90/115/140
S|Corpo sotto il sudario|c|18/17/16|Controlli un nemico leggero e nascondi il corpo originale per pochi secondi. Attaccare dall'ospite consuma il velo; ripremi per tornare.|possess g18 t7 mul.9; buff veil1.2 t4
S|Riflesso del dormiente|c|19/18/17|Controlli un nemico leggero; per sei secondi le ferite al corpo originale respingono e indeboliscono chi gli sta vicino. Ripremi per tornare.|possess g18 t6 mul1; trig hurt t6 icd1 do(circ @self r4 push12 weak1.5)
S|Custodia del respiro|c|20/19/18|Controlli un nemico leggero mentre il corpo assorbe proiettili vicini; dopo sei secondi la banca diventa scudo. Ripremi per tornare prima.|possess g18 t6 mul1; absorb t6 r3 cap80/100/120; wait t6; release shield mul.6
S|Ospite assolto|c|17/16/15|Controlli un nemico leggero e purifichi alleati e zone dannose nemiche vicino al corpo originale. Ripremi per tornare al corpo vulnerabile.|possess g18 t6 mul1; cleanse r7 heal4/5/6
S|Decima dell'inquilino|c|20/19/18|Controlli un nemico leggero; per otto secondi le uccisioni recuperano vita e poca Risonanza al corpo originale. Ripremi per tornare.|possess g20 t8 mul1; trig kill t8 icd1 do(heal v5/7/9; res v2)
U|Cella del burattinaio|c|1|Controlli un solo nemico leggero per dieci secondi; due torrette e un'armatura difendono il corpo originale. Ripremi per tornare: il corpo resta attaccabile.|possess g24 t10 mul1.1; sum torretta n2 far3 t10 hp60/80/100 d10/13/16; buff armor.7 t10
U|Veglia del ricettacolo|c|1|Controlli un solo nemico leggero. Attorno al corpo originale un campo cura e impedisce a intervalli nuovi attacchi base; ripremi per tornare.|possess g24 t10 mul1.1; zone r6 t10 zheal6/8/10 ev1.5 tick(disarm @pt r6 n4 t1.2)
# ===== PATTI: dodici condizioni, ognuna con una sola punizione =====
S|Giuramento del passo|b|10/9/8|Il bersaglio ha quattro secondi per restare entro due metri dal segno: oltrepassarli provoca un solo colpo e un breve blocco. Senza violazione il patto scade.|pact g22 t4 move l2 d26/33/40 root1
S|Giuramento della lama|b|11/10/9|Per quattro secondi il primo attacco del bersaglio provoca un solo colpo di punizione e un breve blocco. Il patto scade senza danno se non attacca.|pact g22 t4 attack d25/32/39 root.8
S|Fuga sotto giuramento|c|14/13/12|Imponi il divieto di allontanarsi dal segno e incuti paura: un nemico leggero che fugge oltre il limite viene punito una volta.|pact g20 t4 move l2.5 d25/32/39 root1; tgt g20 fear2.5
S|Clausola del creditore|c|15/14/13|Il primo attacco del bersaglio viola il patto. Un debito separato accumula una quota dei danni realmente subiti e la riscuote dopo cinque secondi.|pact g22 t4 attack d22/28/34 root.6; debt g22 t5 mul.25 cap30/40/50
S|Riga del giuramento|c|14/13/12|Una linea ferisce e impone ai colpiti un limite di movimento: chi si allontana dal proprio segno viene punito una sola volta.|line l17 w1.7 d12/16/20 each(pact t4 move l2 d20/26/32 root.8)
S|Sigillo lanciato|c|14/13/12|Un proiettile ferisce; a fine volo impone ai tre nemici vicini un patto che punisce una sola volta il loro primo attacco.|shot d14/18/22 v24 then(pact @pt r4 n3 t4 attack d20/26/32 root.7)
S|Clausola dell'immobile|c|14/13/12|Trattieni brevemente il bersaglio e gli imponi di restare vicino al segno anche dopo: uscire dal limite provoca una sola punizione.|tgt g20 root1 then(pact t5 move l2 d28/36/44 root1)
S|Parata del notaio|c|15/14/13|Il primo attacco del bersaglio viola il patto; uno scudo ti protegge per alcuni secondi mentre attendi la sua scelta.|pact g20 t5 attack d26/34/42 root.8; buff shield25/32/39 t5
M|Ritirata del giurato|b|10/9/8|Imponi al bersaglio un limite di movimento e scatti indietro: se ti insegue oltre il segno riceve una sola punizione.|pact g18 t4 move l2.5 d20/26/32 root.8; dash back l8
M|Varco del testimone|c|12/11/10|Imponi un patto che punisce il primo attacco e compari dietro il bersaglio. Il patto scade senza punizione se non attacca.|pact g18 t4 attack d22/28/34 root.7; blink behind g18
U|Cortile del giuramento|c|1|Fino a sei nemici nella zona ricevono un patto di movimento. Un campo dannoso rende costoso restare; uscire dal limite provoca una sola punizione per nemico.|pact @aim g20 r9 n6 t6 move l3 d38/49/60 root1; zone @aim g20 r6 t5 dps10/14/18
U|Udienza delle esche|c|1|Fino a sei nemici nella zona ricevono un patto che punisce il primo attacco; tre esche li provocano. Ogni patto puo punire una sola volta.|pact @aim g20 r9 n6 t6 attack d38/49/60 root1; sum esca @aim g20 n3 far3 t6 hp70/90/110
# ===== STASI: dodici scelte di custodia, riposizionamento e rilascio =====
S|Ampolla dello Stige|b|12/11/10|Catturi un nemico leggero, sospeso e immune ai danni per quattro secondi. Ripremi o attendi: riappare davanti a te e subisce un colpo.|stasis g18 t4 d20/26/32
S|Fionda del carceriere|c|13/12/11|Catturi un nemico leggero e lo rendi immune durante la custodia. Ripremendo o alla scadenza lo ferisci e lo scagli davanti a te.|stasis g18 t4 d20/26/32 fling
S|Custodia misericordiosa|c|15/14/13|Catturi un nemico leggero e recuperi vita. Il prigioniero resta immune; ripremi o attendi quattro secondi per liberarlo davanti a te con un colpo.|stasis g18 t4 d16/21/26; heal v18/24/30
S|Pegno corazzato|c|15/14/13|Catturi un nemico leggero e ottieni uno scudo. Il prigioniero e immune; ripremi o attendi per liberarlo davanti a te e ferirlo.|stasis g18 t5 d18/24/30; buff shield30/38/46 t5
S|Cattura purificante|c|15/14/13|Catturi un nemico leggero e purifichi alleati e zone dannose nemiche vicine. Il prigioniero immune torna davanti a te con un colpo al rilascio o alla scadenza.|stasis g18 t4 d18/24/30; cleanse r7 heal4
S|Infermeria del custode|c|16/15/14|Catturi un nemico leggero e crei un campo curativo ai tuoi piedi. Ripremi o attendi: il prigioniero perde l'immunita, torna davanti a te e viene ferito.|stasis g18 t5 d18/24/30; zone r4 t5 zheal5/7/9
S|Porta della cella|c|16/15/14|Catturi un nemico leggero e alzi un riparo davanti a te. Il prigioniero resta immune fino al rilascio o alla scadenza, quando torna davanti a te con un colpo.|stasis g18 t5 d20/26/32; barrier @fwd5 l7 t5 hp90/115/140
S|Scambio col fantoccio|c|15/14/13|Catturi un nemico leggero e lasci un'esca davanti a te. Il prigioniero immune viene liberato davanti a te e ferito quando ripremi o scade la custodia.|stasis g18 t4 d18/24/30; sum esca @fwd3 n1 t5 hp70/90/110
M|Custodia in ritirata|b|11/10/9|Catturi un nemico leggero e scatti indietro. Ripremi o attendi quattro secondi per liberarlo davanti alla tua nuova posizione e ferirlo.|stasis g16 t4 d16/21/26; dash back l9
M|Trasloco del prigioniero|c|13/12/11|Catturi un nemico leggero e ti teletrasporti verso il punto mirato. Il prigioniero immune viene liberato davanti a te e ferito al secondo uso o alla scadenza.|stasis g18 t4 d18/24/30; blink g14
U|Carovana della cella|c|1|Catturi un solo nemico leggero, corri piu veloce e ottieni uno scudo. Ripremi o attendi sei secondi per ferire e scagliare il prigioniero nella direzione scelta.|stasis g22 t6 d35/45/55 fling; buff haste1.4 shield55/70/85 t7
U|Sentenza degli esclusi|c|1|Catturi un solo nemico leggero mentre quattro onde colpiscono gli altri attorno a te. Resta immune finche ripremi o scadono cinque secondi, poi torna davanti a te e viene ferito.|stasis g22 t5 d30/40/50; rep n4 ev1 do(circ r8 d18/24/30)
`);
  for (let i = first; i < Bricks.LIST.length; i++) Bricks.LIST[i].edition = '3.2';
})();
