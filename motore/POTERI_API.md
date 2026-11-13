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
