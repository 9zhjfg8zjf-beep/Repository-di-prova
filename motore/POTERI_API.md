# Estensione dei poteri — API 3.2

I programmi conservano il formato `op parametro; op ...` e i valori per grado
`d10/14/18`. Gli operatori sotto eseguono comportamenti reali e possono essere
combinati con quelli esistenti. Un primo operatore senza bersaglio o risorsa utile
restituisce un motivo di fallimento: non consuma ricarica o Risonanza.

## Contratti dei nuovi operatori

| Operatore | Parametri | Effetto |
| --- | --- | --- |
| `absorb` | `t6 r4 cap120` | Per la durata, intercetta proiettili nemici nel raggio del giocatore e conserva il loro danno in `player.bank`, fino al tetto. La banca sopravvive alla scadenza, non a morte/cambio ricetta. |
| `release` | `n5 v28 mul1.2 sp.12`, oppure `heal` / `shield` | Consuma tutta la banca: la divide fra proiettili, oppure la converte in cura/scudo. Banca vuota: fallisce. `mul` massimo 2; danno totale massimo 300. |
| `magnet` | `@aim g16 r7 t6 force12`, `repel`, `fol` | Crea un campo che curva i proiettili nemici verso il centro, oppure li respinge. `fol` segue il giocatore. Non cambia la squadra dei proiettili. |
| `transmute` | `r10`, `@aim g16`, uno di `turn` / `heal` / `shield` / `res`, `mul.5` | Consuma i proiettili nemici già presenti nel raggio; `turn` li restituisce come colpi del giocatore, gli altri modi li convertono nella risorsa indicata. Nessun colpo presente: fallisce. |
| `link` | `@aim g18 r8 n3 t6 share.35` | Collega almeno due nemici vicini: una frazione del danno effettivo subito da uno passa agli altri, senza ricorsione. Massimo 6 bersagli, 3 legami; coefficiente sui boss ridotto. |
| `debt` | `g24 t4 mul.5 cap100`, oppure `@aim r6 n3` | Memorizza una quota dei danni realmente subiti dal bersaglio e la infligge alla scadenza. Non ritarda il danno originale. Sui boss la quota è ridotta. |
| `disarm` | `g24 t3`, oppure `@aim r6 n4` | Impedisce nuovi attacchi base senza impedire il movimento. I boss ricevono una durata ridotta e perdono il danno da contatto. |
| `silence` | `g24 t3`, oppure `@aim r6 n4` | Impedisce nuovi tiri dei tiratori e nuove abilità dei boss. Non cancella attacchi già annunciati. Bersagli privi di queste capacità non sono validi. |
| `cleanse` | `r8 heal6` | Rimuove gli stati nocivi dagli alleati e le zone di danno nemiche nel raggio; cura il giocatore per ogni effetto rimosso. Non cancella gli annunci dei boss. Nessun effetto rimovibile: fallisce. |
| `infect` | `g24 t6 dps8 spread3.5 n3` | Infetta il bersaglio. Infligge danno nel tempo e può contagiare fino a `n` altri nemici per generazione; massimo due generazioni e durata discendente. `spread` è il raggio di contagio, non un'area iniziale. |
| `portal` | `g18 r1.2 t10`, `foes`, `shots` | Apre una coppia riutilizzabile: ingresso davanti al giocatore, uscita nel punto mirato. Trasporta giocatore e alleati; i flag includono nemici non boss e proiettili. Cooldown di transito per entità. Una coppia attiva per giocatore. |
| `tether` | `g24 t5 l4 break12 pull12`, oppure `@aim r6 n3` | Vincola i nemici al punto in cui vengono colpiti: oltre `l` li tira indietro; oltre `break` il vincolo si spezza. I boss resistono alla trazione. |
| `barrier` | `@fwd4 l8 t7 hp120`, `reflect` | Segmento fisico per nemici e proiettili nemici. Il giocatore e gli alleati passano. I colpi consumano la resistenza; con `reflect` vengono deviati e convertiti. Massimo 4 segmenti. |
| `mimic` | `g24 t8 mul1` | Sostituisce temporaneamente il primario con l'archetipo di attacco del nemico mirato: tiro, pugno pesante, artiglio o onda del boss. Ripristina esattamente il primario precedente alla scadenza. |
| `rewindfoe` | `g24 t3 d20`, oppure `@aim r6 n3` | Segna posizione e vita dei nemici; alla scadenza li riporta alla posizione segnata e limita la vita a quella memorizzata, poi infligge `d`. Boss: resiste allo spostamento, subisce il colpo. |
| `revive` | `r16 n2 t12 hp60 d12` | Consuma cadaveri nemici recenti e li rialza come alleati a durata. Non rianima boss, scorte, evocazioni o uno stesso cadavere due volte. Massimo 12 alleati evocati/rianimati. |
| `command` | `r24 t6`, `rally`, `@aim g18`, `n6` | Dà ordini agli alleati: senza `rally` attaccano il nemico mirato; con `rally` si radunano nel punto indicato (default giocatore). Non ha effetto se non ci sono alleati mobili, o se manca il bersaglio dell'attacco. |

`debt`, `disarm`, `silence`, `tether` e `rewindfoe` usano un bersaglio
mirato quando manca `r`; con `r` selezionano l'area secondo le regole `@` esistenti.
Le durate e quantità sono limitate nel motore, indipendentemente dai dati.
`@self` seleziona esplicitamente il giocatore; nei callback di `hit`/`each` i nuovi
operatori singoli usano `ctx.tgt`. `shot then(...)` mantiene invece il significato
storico di effetto a fine volo: usare `near @pt`/`circ @pt` per selezionare l'impatto.

## Corpo, controllo e condizioni

| Operatore | Parametri | Effetto |
| --- | --- | --- |
| `form` | `size2 t8` | Cambia taglia reale (`size` da 0.4 a 2.2): raggio e camera proporzionali, portata melee/cono proporzionale, danno moltiplicato per radice della taglia, velocità divisa per la stessa radice. Ripremere riporta alla taglia normale. |
| `phase` | `t4 speed1.2` | Attraversa i muri ed evita i colpi; mentre è attivo non attacca e non lancia altre abilità. Ripremere libera. Alla fine torna all'ultima posizione sicura se si trova dentro un ostacolo. |
| `flight` | `t8 h8 speed1.2` | Volo guidato: guardare in alto/basso mentre si avanza cambia quota, fino a `h` (2.5–12). Gli edifici restano solidi; evita pozze, melee e attacchi al terreno. I proiettili diretti a/da un giocatore in volo hanno quota e velocità verticale reali. Ripremere atterra. |
| `possess` | `g18 t8 mul1` | Controlla direttamente un nemico leggero: il corpo originale resta fermo e vulnerabile, la camera segue l'ospite, movimento e primario comandano l'ospite. Ripremere, scadenza o morte dell'ospite ripristinano il controllo. |
| `pact` | `g24 t5 move l2 d30 root1` oppure `attack`, anche `r/n/@` | Impone una condizione: muoversi di `l` dal segno oppure effettuare un attacco scatena una sola punizione `d` e immobilizzazione. Senza violazione scade. I boss resistono alla punizione e all'immobilizzazione. |
| `stasis` | `g18 t5 d20 fling` | Cattura un nemico leggero, sospendendolo e togliendolo dalla scena. Ripremere o aspettare la scadenza lo libera davanti al giocatore, infliggendo `d`; `fling` lo scaglia. Non cattura boss, pesanti o un bersaglio già afferrato. |

`form`, `phase`, `flight`, `possess` sono incompatibili fra loro. L'attivazione
richiede che non siano in corso un salto, uno scatto o il trasporto sui cavi.
`player.form/phase/flight/possession/captive` espongono `t`, `slot`, `el`;
`phase.safe` conserva la posizione valida, `flight.y` la quota,
`possession.id` e `captive.id` identificano la creatura.
La creatura espone `possessed`, `captive` e `pact`.
Gli indicatori di stasi non vanno resi come creature visibili.
Il corpo originale rimane in `player.x/z` durante il possesso; `player.cam`
segue l'ospite. In volo `player.cam.y` coincide con `flight.y`; con la taglia
è `1.7 * form.size`. I proiettili con `alt` espongono `y` e `vy`, fissati
all'emissione e aggiornati dalla simulazione. I colpi alti possono mancare i
bersagli al suolo; quelli nemici possono mirare al giocatore in volo.

`form` conserva `size` e `safe:{x,z}`; `phase` conserva `speed` e `safe`;
`flight` conserva `speed`, `h` massimo e `y` corrente; `possession` conserva
`id`, `team` precedente e `mul`; `captive` conserva `id`, `x/z` di cattura,
`d` e `fling`. `pact` conserva `x/z` del segno, `l`, `d`, `root`, `attack`
e `serial` degli attacchi. I temporizzatori usano sempre durata residua `t`.

La fase e il possesso bloccano i nuovi cast manuali e l'Eco, anche prima
della ricarica. Un'Eco già prenotata attende fino a due secondi e poi scade.
Gli effetti persistenti lanciati prima rimangono attivi. La ricomposizione
o la morte liberano cattura e possesso senza danno da rilascio e azzerano
patti e trasformazioni. Il rilascio manuale non paga di nuovo il costo.

Eventi aggiunti: `form`, `formEnd`, `phase`, `phaseEnd`, `flight`,
`flightEnd`, `possessBody`, `possessBodyEnd`, `stasis`, `stasisEnd`,
`pact`, `pactBreak`, `pactEnd`. `possessBody` è distinto dal vecchio evento
`possess` delle sentinelle.
`node tcorpo.js` verifica queste sei famiglie e il ripristino del ciclo di vita.

## Stato osservabile e grafica

`s.powers` contiene `fields`, `links`, `portals`, `tethers`, `barriers`, `corpses`.
Ogni effetto ha `id`, coordinate, durata residua `t` ed elemento `el` quando pertinente.
I nemici espongono `debt`, `infection`, `rewind`, `disarmT`, `silenceT`, `command`.
Il giocatore espone `absorb`, `bank`, `mimic`.

Eventi dedicati: `absorbStart`, `absorbHit`, `energyRelease`, `magnet`,
`transmute`, `link`, `debt`, `debtPay`, `disarm`, `silence`, `cleanse`,
`infect`, `portal`, `portalTravel`, `tether`, `tetherBreak`, `barrier`,
`barrierHit`, `mimic`, `mimicEnd`, `rewindfoe`, `rewindReturn`, `revive`,
`command`. Hanno `x,z,el` quando rappresentano un effetto localizzato.
Gli eventi non sostituiscono lo stato: i renderer devono leggere le collezioni
per gli effetti persistenti ed eliminare quelli scaduti.

## Verifiche

`node tnuove.js` prova conseguenze, fallimenti, limiti, boss e pulizia del ciclo
di vita. Il parser rifiuta operatori sconosciuti e normalizza la notazione storica
`nth2`, `nth3`, `nth4` in `nth n2`, `nth n3`, `nth n4`.
