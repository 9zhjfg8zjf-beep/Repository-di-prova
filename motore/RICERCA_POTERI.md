# DITE — ricerca delle famiglie di poteri

Ricerca verificata il 13 novembre 2026. Documento di progetto per chi continua il motore, non elenco completo dei poteri di ogni opera.
Lo scopo è trovare decisioni di gioco diverse: bersagli, condizioni, risorse, movimento, conseguenze e possibilità di risposta.
Nomi dei personaggi e delle opere servono a identificare le fonti; le meccaniche, i nomi e la rappresentazione di DITE restano originali.
Una famiglia può essere presente solo in parte: una zona verde non dimostra contagio, un'esca non dimostra duplicazione degli input.

## Come leggere lo stato

- **Esistente**: capacità già presenti prima dell'estensione, negli archetipi e in `mec1.js`–`mec9.js`.
- **Prima estensione**: operatori in [POTERI_API.md](POTERI_API.md) e programmi espliciti in `mec10.js`–`mec12.js`; presenza nel sorgente, non dichiarazione autonoma di pubblicazione.
- **Seconda estensione nel sorgente**: `form`, `phase`, `flight`, `possess`, `pact`, `stasis`, con programmi espliciti in `mec13.js`–`mec14.js` e contratti in `POTERI_API.md`.
- **Copie e ricognizione nel sorgente**: `clone` e `scan`, con 48 programmi in `mec15.js`. Coprono replica degli attacchi primari diretti e rilevamento nel raggio, con i limiti indicati sotto.
- **Gap**: comportamento non coperto dalla capacità indicata, anche se un nome, un effetto grafico o una combinazione gli somiglia.
- Per versione pubblicata e verifiche effettivamente concluse fanno fede lo **Stato** di [AGENTS.md](../AGENTS.md) e i risultati delle prove sul commit interessato.

## Fonti primarie: cosa è stato verificato

**V** = testo ufficiale letto; **I** = testo ufficiale letto nell'indice della ricerca perché l'apertura diretta è incompleta o bloccata; **T** = fonte ufficiale usata solo per il tema.
Le sintesi sono intenzionalmente brevi. Le regole e i valori dei giochi citati appartengono alla pagina/versione consultata, non sono valori da importare in DITE.

| Fonte | Evidenza verificata | Spunto progettuale, distinto dalla fonte |
| --- | --- | --- |
| [M1] Aizawa, V | Sopprime il potere delle persone che osserva. | Interdizione temporanea con bersaglio valido; non uno stordimento universale. |
| [M2] Monoma, V | Può usare temporaneamente il potere di chi tocca. | Copia con durata, requisito di acquisizione e ripristino del kit originale. |
| [M3] Kurogiri, V | Collega spazi e vi trasferisce cose attraverso il proprio corpo. | Passaggio riutilizzabile, con regole esplicite per corpi e proiettili. |
| [M4] Mirio, V | Il suo corpo lascia passare ciò che lo attraversa. | Intangibilità distinta da invisibilità e teletrasporto. |
| [M5] Mr. Compress, V | Comprime persone e oggetti in piccole sfere. | Cattura temporanea; definire liberazione, immunità e comportamento dei danni. |
| [M6] Shoda, V | Può produrre un secondo impatto nel punto di un colpo precedente. | Preparazione e conseguenza differita; `debt` ne è una reinterpretazione, non la stessa regola. |
| [M7] Komori, V | Diffonde spore che fanno crescere funghi nelle zone umide. | Contagio locale come scelta originale; la fonte non stabilisce il contagio fra nemici usato da DITE. |
| [M8] Eri, V | La scheda descrive un riavvolgimento e ne segnala aspetti ancora ignoti. | Memoria di uno stato con ambito ristretto; evitare di dedurne un reset universale del mondo. |
| [M9] Honenuki, V | Ammorbidisce ciò che tocca, compreso il terreno. | Modifica fisica del suolo: una semplice zona rallentante copre solo una parte del concetto. |
| [M10] Yui Kodai, V | Cambia la dimensione degli oggetti toccati, esclusi gli esseri viventi. | Ridimensionamento di oggetti con collisioni e massa coerenti; non già fornito da `form`. |
| [M11] Tamaki, V | Riproduce sul proprio corpo caratteristiche di ciò che mangia. | Trasformazione alimentata da acquisizione di risorse; forma e acquisizione sono due sistemi separati. |
| [M12] Shinso, V | Controlla chi risponde alla sua domanda. | Controllo subordinato a una condizione; un semplice cambio di squadra non riproduce quel vincolo. |
| [M13] Twice, V | Crea duplicati di sé o di altri. | Separare esche, alleati autonomi e copie che ripetono gli input. |
| [M14] Gentle, V | Conferisce elasticità a ciò che tocca. | Superfici che modificano traiettorie e movimento; una spinta istantanea non basta. |
| [M15] Koda, V | Comunica con gli animali e impartisce ordini. | Comando di una squadra esistente, distinto dall'evocarla. |
| [B1] Brawl Stars, MysteryAtTheHub, I | R-T combina marchi e un corpo diviso con attacchi sincronizzati; Willow controlla temporaneamente un nemico usando il suo attacco base. | Marchi, doppia origine degli attacchi e controllo diretto sono tre famiglie separate. |
| [B2] Brawl Stars, BizarreCircus, V | Charlie ha un proiettile di ritorno, una cattura in bozzolo distruttibile e piccole evocazioni; le note successive correggono durata e interazioni del bozzolo. | Proiettile, prigionia e gregari richiedono prove diverse; non prendere valori iniziali ignorando gli aggiornamenti nella stessa pagina. |
| [O1] Sigma, I | Assorbe proiettili convertendoli in salute aggiuntiva; dispone anche di una barriera collocabile e richiamabile. | Banca energetica e riparo sono risorse diverse; DITE non implementa automaticamente ogni modalità di quel riparo. |
| [C1] Rogue, I | Assorbe temporaneamente poteri e ricordi; la scheda descrive variazioni del requisito di contatto. | Imitazione temporanea; non attribuire a `mimic` furto di ricordi o copia integrale. |
| [C2] Bishop, I | Assorbe, conserva e rilascia energia, utilizzabile anche per rinforzarsi. | Accumulo con tetto e consumo verificabile, distinto da un bonus gratuito al danno. |
| [C3] Martian Manhunter, V | La scheda elenca metamorfosi, telepatia, volo, invisibilità e intangibilità, fra le altre capacità. | Cinque famiglie da verificare separatamente; la presenza di una non copre le altre. |
| [C4] Firestorm, V | Ristruttura materia inorganica; la scheda include assorbimento di radiazioni e volo. | Trasmutazione del mondo distinta dalla conversione dei proiettili. |
| [C5] Plastic Man, V | Allunga e rimodella il corpo in forme diverse. | Trasformazione, portata e collisioni; un'animazione allungata non certifica fisica elastica. |
| [C6] Green Lantern Corps, V | La scheda elenca costrutti di luce solida, armi, campi di forza e volo. | Costruzioni con funzione e resistenza; non equivalenza automatica fra una barriera e qualsiasi costruzione. |
| [H1] Hazbin Hotel, T | La presentazione ufficiale descrive riabilitazione dei demoni, ambientazione infernale e una figura legata alla radio. | Ispirazione tematica per riscossioni, assoluzioni, segnali e patti; non una scheda verificata dei poteri dei personaggi. |

Per Hazbin non sono stati ricavati contratti meccanici da wiki, ricordi di episodi o clip non visionate.
`pact` è quindi una regola originale di DITE: punisce una violazione di movimento o attacco; questa ricerca non ne attesta un equivalente canonico preciso.
Non sono stati importati dialoghi, immagini, modelli, suoni o descrizioni estese delle fonti.

## Matrice delle famiglie e della copertura reale

Gli ID fra apici inversi esistono nel catalogo caricato; i riferimenti ai file indicano dove trovarli.
Il trattino significa che questa estensione non aggiunge una capacità specifica alla riga.

| Famiglia | Esistente | Prima estensione nel sorgente | Corpo, copie e sensi nel sorgente / limite ancora aperto |
| --- | --- | --- | --- |
| Colpi, raffiche, rimbalzi, ritorno | `shot`, `cone`, `line`, `ring`, `chain`; molti programmi distinti. | Effetti locali successivi al volo, per esempio `spina_della_febbre` (`mec11`). | Le forme dei colpi non equivalgono a nuovi sistemi di corpo, materia o sensi. |
| Marchi e conseguenze condizionali | `segnatore`, `colpo_sul_marchiato` (`mec1`): applicazione e consumo di stati. | `conto_della_pena`, `complici_della_pena` (`mec11`): debito differito e condivisione reale dei danni. | `giuramento_del_passo` (`mec14`), `pact`: una punizione alla violazione, scadenza senza danno se rispettato. Altri contratti richiedono condizioni nuove. |
| Assorbimento e riserva | Scudi, cura e riflessione non conservano necessariamente energia spendibile. | `pugno_esattore` (`mec10`), `absorb`/`release`: banca, tetto, spesa. | Restano aperte acquisizione di materiali, munizioni e altre economie autonome. |
| Conversione | Elementi ed effetti di danno già combinabili. | `scoria_convertita` (`mec10`), `transmute`: cambia proiettili presenti in colpi o risorse. | Non modifica edifici, suolo, oggetti arbitrari o materiali [C4]. |
| Traiettorie e forze | Spinte, attrazioni e sollevamenti; `geyser` (`mec1`). | `chiodo_polare` (`mec10`), `magnet`: devia i colpi nemici; `picchetto_di_stige` (`mec12`), `tether`: vincolo elastico ai nemici. | Elasticità delle superfici [M14] e gravità tridimensionale generale restano distinte. |
| Spazio e percorsi | Scatto, salto, teletrasporto e cavi della città. | `cerniera_del_lete` (`mec12`): portali riutilizzabili, con destinatari espliciti. | `ali_del_pellegrino` (`mec13`), `flight`: quota e tiro tridimensionale. Restano esclusi piattaforme percorribili, atterraggio sui tetti e navigazione aerea generale degli alleati. |
| Corpo e metamorfosi | Potenziamenti, `poly` sui nemici, evocazioni di giganti. | `maschera_del_dannato` (`mec12`) cambia il primario imitato, non il corpo. | `spalle_della_montagna` (`mec13`), `form`: taglia, raggio, camera e portata cambiano realmente. Elasticità corporea e assimilazione alimentare [M11, C5] restano altri requisiti. |
| Invisibilità e intangibilità | `scatto_e_sparisci` (`mec2`) usa `veil`. | — | `passo_senza_peso` (`mec13`), `phase`: attraversa muri senza attaccare, poi torna solido in un punto valido; distinto dall'occultamento [M4, C3]. |
| Controllo della mente e ordini | `tradimento` (`mec5`) cambia temporaneamente squadra; l'archetipo `possesso` riguarda una sentinella. | `editto_del_bersaglio` (`mec12`), `command`: ordina agli alleati ammessi; i cloni sincronizzati sono esclusi. | `inquilino_dello_stige` (`mec14`), `possess`: controllo diretto di un leggero, corpo originale vulnerabile. Il requisito di risposta di [M12] non è implementato. |
| Interdizione degli attacchi | `bolas` (`mec1`) immobilizza; stordimento e paura hanno altre conseguenze. | `abdicazione_del_braccio`, `sillaba_proibita` (`mec11`): disarmo e silenzio con destinatari diversi. | `ampolla_dello_stige` (`mec14`), `stasis`: un leggero sospeso e immune, rilascio manuale o a scadenza. Non è compressione di oggetti né un bozzolo distruttibile [M5, B2]. |
| Contagio | Veleno, ustione, zone e reazioni alle uccisioni. | `febbre_del_vestibolo` (`mec11`), `infect`: contagio con raggio e generazioni limitate. | Il contagio fra nemici è una regola DITE; la fonte delle spore [M7] non prova questa stessa propagazione. |
| Cura e dissipazione | `morso` (`mec1`) ruba vita; `heal`, scudi e rigenerazione. | `lavacro_delle_scorie` (`mec11`) purifica; `custode_delle_spoglie` (`mec12`) consuma cadaveri recenti e rianima alleati. | Immunità generica, resurrezione del giocatore e cancellazione di ogni effetto non sono implicite. |
| Duplicati e gregari | `doppio_di_te` (`mec8`) evoca uno spirito; `ombre_di_te` (`mec7`) evoca esche. | `revive` e `command` ampliano gestione e provenienza della squadra. | `due_ombre_operose` (`mec15`), `clone`: fino a tre corpi vulnerabili seguono e replicano il primario diretto. Non copiano il kit completo e non dividono il corpo del giocatore [M13, B1]. |
| Ripari e costruzioni | Evocazioni di muri, torrette e zone protettive. | `parata_di_calce` (`mec10`), `barrier`: segmento fisico con resistenza e riflessione opzionale. | Mancano costruzioni articolate, piattaforme percorribili e modifica della topologia della città [C6]. |
| Tempo e memoria | `passo_nel_vuoto` (`mec2`) include `freeze`; presenti memoria e ritorno personali. | `appello_del_lete` (`mec12`), `rewindfoe`: ripristino limitato del nemico; `debt` riscuote danno aggiuntivo. | `stasis` sospende un bersaglio; non annulla una storia intera, ripristina caduti o cura automaticamente [M8]. |
| Informazione e sensi | `radar` (`mec6`) applica periodicamente un marchio nell'area. | — | `occhio_del_vestibolo` (`mec15`), `scan`: aggiorna i nemici nel raggio anche oltre i muri; non concede linea di tiro, danno o mira automatica. Restano esche sensoriali e contromisure al rilevamento. |
| Terreno e materia | `zavorra` (`mec1`) rallenta; zone e colpi possono suggerire fango o sisma. | `transmute` resta limitato ai proiettili; `barrier` aggiunge ripari temporanei. | Terreno distruttibile, suolo deformabile/elastico, scavo e ridimensionamento di oggetti restano gap [M9, M10, M14, C4]. |
| Prezzi e risorse | `sangue_per_sangue` (`mec1`) paga vita; Risonanza e ricariche governano il kit. | La banca di `absorb` è una nuova risorsa; cadaveri recenti alimentano `revive`. | `pact` aggiunge condizioni e punizioni, non raccolta di materiali, inventario o un sistema economico generale. |

## Contratti da preservare nelle descrizioni

1. `silence` impedisce nuovi tiri dei tiratori e nuove abilità dei boss; non cancella gli attacchi già annunciati. `disarm` impedisce nuovi attacchi base e lascia muovere.
2. `debt` aggiunge alla scadenza una quota del danno realmente subito, con tetto; il danno originale arriva subito. Non descriverlo come protezione o differimento del danno in ingresso.
3. `infect` parte da un bersaglio; `spread` è il raggio di contagio, `n` limita i nuovi contagi per generazione, le generazioni sono al massimo due. Non chiamarlo contagio infinito.
4. `cleanse` riguarda stati nocivi degli alleati e zone dannose nemiche vicine; cura per quanto rimosso. Non cancella qualsiasi condizione o annuncio del boss.
5. `link` richiede almeno due bersagli; condivide una quota del danno effettivo senza ricorsione. `tether` limita il movimento ma può spezzarsi e i boss resistono alla trazione.
6. `mimic` sceglie l'archetipo del primario nemico, non copia l'intero kit. `rewindfoe` non restituisce la vita già persa e i boss resistono allo spostamento.
7. `shot.then` si esegue alla fine del volo: per effetti sull'impatto usare selezioni locali `@pt`, `near` o `circ` coerenti. Non dichiarare un callback su ogni nemico perforato.
8. Sui bersagli annidati usare il contesto corretto: un effetto dopo un colpo deve riguardare quel colpito, non un nuovo nemico che il giocatore guarda nel frattempo.
9. Durate, quantità, linee di vista, cap e condizioni di fallimento fanno parte della meccanica. Cambiare solo colore o numeri non crea una nuova famiglia.
10. `clone` ripete solo gli attacchi primari diretti supportati, senza callback, innesti, evocazioni o ricorsione; con un primario incompatibile fallisce. Massimo tre copie fisiche vulnerabili, con vita separata e durata.
11. `scan` segue il giocatore e aggiorna fino a 64 ID ostili nel raggio, anche senza linea di vista; non modifica i controlli di mira o di collisione degli attacchi. Gli indicatori devono sparire alla fine o alla pulizia dello stato.
12. Taglia, fase, volo e possesso sono incompatibili fra loro; il possesso lascia vulnerabile il corpo originale. La stasi cattura un solo leggero e il rilascio non rianima un morto né cattura boss o pesanti.

## Cosa serve per chiudere i gap

- **Copie oltre il primario diretto**: la replica sincronizzata è presente; rimangono replica del kit completo, controllo indipendente di più corpi e divisione con vita condivisa. Non rimuovere i limiti ai callback senza risolvere ricorsione e crescita delle entità.
- **Terreno distruttibile**: modificare collisioni e visibilità insieme alla grafica; aggiornare percorsi di missioni e nemici, limiti, salvataggio dello stato e possibilità di fuga.
- **Contromisure sensoriali**: il rilevamento attraverso ostacoli è presente; rimangono falsi bersagli informativi, occultamento selettivo, tracce sonore e regole che permettano di contrastare o ingannare la scansione.
- **Piattaforme e costruzioni**: appoggio reale del giocatore, bordi, camera, accessibilità dei percorsi e rimozione sicura quando scadono. Un piano disegnato senza collisioni non basta.
- **Materia e risorse**: introdurre oggetti/materiali identificabili, raccolta, capacità, consumo e trasformazioni consentite; `transmute` e la Risonanza non coprono già questi sistemi.
- **Interazioni e ripristino**: conservare le prove di conseguenze, fallimenti, scadenza, morte e cambio ricetta per corpo, controllo, copie e scansioni; verificare di nuovo i boss quando cambia il motore, non soltanto il catalogo.
- Per ciascuna capacità nuova servono almeno una prova causale isolata e immagini del browser che mostrino stato attivo, effetto e fine. Il solo cambio di un numero nello stato non certifica leggibilità o qualità.
- `tprog` controlla caricamento ed effetti misurabili; non dimostra da solo che ogni descrizione sia vera. Integrare con prove semantiche, fuzz, missioni, boss e verifiche grafiche indicate in `AGENTS.md`.
- `tbal` misura il contributo di danno in un incontro limitato: non certifica il bilanciamento di controllo, cura, mobilità o informazione. Non scambiare un punteggio basso di `scan` per assenza di utilità.

## Registro delle fonti

Le sigle sopra rimandano a pagine ufficiali, non a repertori di fan. Per [B1], [O1], [C1], [C2] il testo è stato letto nell'indice ufficiale restituito dalla ricerca; l'accesso diretto risultava incompleto o bloccato.

[M1]: https://heroaca.com/character/chara_group04/04-02/
[M2]: https://heroaca.com/character/chara_group02/02-03/
[M3]: https://heroaca.com/character/chara_group06/06-02/
[M4]: https://heroaca.com/character/chara_group03/03-03/
[M5]: https://heroaca.com/character/chara_group06/06-12/
[M6]: https://heroaca.com/character/chara_group02/02-06/
[M7]: https://heroaca.com/character/chara_group02/02-16/
[M8]: https://heroaca.com/character/chara_group12/12-01/
[M9]: https://heroaca.com/character/chara_group02/02-05/
[M10]: https://heroaca.com/character/chara_group02/02-14/
[M11]: https://heroaca.com/character/chara_group03/03-04/
[M12]: https://heroaca.com/character/chara_group03/03-02/
[M13]: https://heroaca.com/character/chara_group06/06-11/
[M14]: https://heroaca.com/character/chara_group06/07-01/
[M15]: https://heroaca.com/character/chara_group01/01-20/
[B1]: https://supercell.com/en/games/brawlstars/blog/release-notes/mysteryatthehub-patch-notes/
[B2]: https://supercell.com/en/games/brawlstars/blog/release-notes/bizarrecircus-patch-notes/
[O1]: https://overwatch.blizzard.com/en-us/heroes/sigma/
[C1]: https://www.marvel.com/characters/rogue/in-comics
[C2]: https://www.marvel.com/characters/bishop-lucas-bishop
[C3]: https://www.dc.com/characters/martian-manhunter
[C4]: https://www.dc.com/characters/firestorm
[C5]: https://www.dc.com/characters/plastic-man
[C6]: https://www.dc.com/characters/green-lantern-corps
[H1]: https://www.aboutamazon.com/news/entertainment/where-to-watch-hazbin-hotel-prime-video
