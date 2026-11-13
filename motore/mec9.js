Bricks.load(String.raw`
# ===== SUPREME: ultime =====
U|Gabbia di fulmini|c|1|Un recinto di muri attorno al punto che guardi, e dentro piovono scariche.|sum muro n8 @aim g16 far5 t6 hp200; zone @aim g16 r4.5 t6 tick(circ r4.5 d30/38/46 stun.3) ev.7
U|Mareggiata|c|1|Cinque onde larghe partono da te in ogni direzione, una dopo l'altra.|rep n5 ev.3 do(shot n5 ringall d40/50/60 v24 wide r3 t.9 push8)
U|Sguardo che uccide|c|1|Per sei secondi il bersaglio mirato perde vita a vista d'occhio.|aim; rep n12 ev.5 do(tgt d14 hpc.04/.05/.06 slow.3:1)
U|Colonna infinita|c|1|Dove guardi una colonna di fuoco resta accesa e lancia in aria chi la tocca.|zone @aim g18 r4.5 t8 dps44/55/66 burn6 tick(circ r4.5 lift.6:6) ev2
U|Parola di potere|c|1|Una sola parola: il bersaglio resta stordito, marchiato e in fiamme, e i vicini scappano.|tgt stun3 mark1.6:8 burn16 then(circ @tgt r9 fear4)
U|Cuore di ghiaccio|c|1|Diventi una statua intoccabile per tre secondi; quando ti liberi, esplodi e sei curato.|buff invuln t3 hot60 armor.2; wait t3; circ r11 d140/175/210 stun2 chill4
U|Contrappasso|c|1|Per dieci secondi chi ti colpisce perde una fetta della propria vita.|trig hurt t10 icd.3 do(circ r6 max2 d10 hpc.12/.15/.18)
U|Mano sinistra del buio|c|1|Tiri a te il bersaglio, gli togli una fetta di vita e la prendi tu.|tgt yank d60/75/90 hpc.15 ls1 stun1.5
U|Legioni alle porte|c|1|Ai quattro lati compaiono spiriti che convergono su di te.|sum spirito n2 @fwd10 t12 hp50 d14/18/22; sum spirito n2 @back10 t12 hp50 d14/18/22; sum arciere n2 far6 t12 d12/15/18
U|Stretta del serpente|c|1|Una linea lunghissima che tira tutti al suo inizio e li avvelena al massimo.|line l34 w5 d60/75/90 pull26 pois6 slow.6:4
U|Eclissi di sangue|c|1|Per otto secondi un'aura ti segue: ruba vita a tutti e ti rende piu forte.|trig step t8 ev.5 do(circ r8 d16/20/24 ls.5); buff fury1.4 t8
U|Ultima parola|c|1|Un colpo che ignora tutto sul bersaglio; se muore, esplode e la Risonanza torna a meta.|tgt d220/275/330 then(trig kill t.5 n1 do(circ r9 d100/125/150; res v50))
`);
