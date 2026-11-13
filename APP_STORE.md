# DITE 4.0 — scheda App Store e consegna per il caricamento

Preparato il 13 novembre 2026. Questo documento contiene testi pronti da trasferire nei campi indicati,
valori ancora da completare e il percorso per ottenere le immagini della build effettiva.
La **candidata 17 supera 33/33 prove locali attuali**: 14 Node e 19 browser/build, entrambi con esito 0.
Packaging 8/8, sincronizzazione, progetto e asset sono verdi; log e checksum sono in `AGENTS.md`.
La [quinta CI 43480792340](https://github.com/9zhjfg8zjf-beep/Repository-di-prova/actions/runs/43480792340),
su `5f55c7f`, conferma 14 Node, packaging 8/8 e bundle.
La Release universale compila, ma entrambe le build Debug falliscono prima di XCTest per conversioni Swift
rinominate: nessun test nativo eseguito e nessuna foto prodotta. I cinque usi sono corretti con
`NSCoder.string(for:)` in questo ramo; la sesta CI ripeterà l'intera suite. Il codice web resta identico
e il gate locale resta valido.
L'ultima CI con XCTest eseguiti resta la quarta, sulla candidata 15: 20 unitari per famiglia, UI 6/6 iPhone
e 4/6 iPad in compatibilità. Il collaudo del nuovo target universale resta da completare.
Non esiste una build distribuibile o un invio App Store; la versione pubblicata resta 3.2.
Esiti, checksum e verifiche pendenti sono in [IOS.md](IOS.md) e [AGENTS.md](AGENTS.md).
Prima del caricamento, associare questi testi alla build nativa realmente verificata, senza usare la sola
versione web come prova del funzionamento iOS.

## Scheda italiana

Lingua principale proposta: **Italiano**. Categoria proposta: **Giochi**, sottocategorie **Azione** e **Avventura**.
Il titolo resta da verificare nel proprio account App Store Connect; non è stato prenotato.

| Campo | Testo proposto | Limite Apple |
| --- | --- | --- |
| Nome | DITE | 4 / 30 caratteri |
| Sottotitolo | Cinque poteri, tre città | 24 / 30 caratteri |
| Versione | 4.0 | Deve corrispondere alla build caricata |
| Numero build attuale | 1 | Incrementare se si carica una nuova build |
| Testo promozionale | Crea il tuo kit, esplora tre città e affronta i custodi. Centinaia di poteri da combinare in un'avventura in prima persona, anche offline. | 138 / 170 caratteri |

I limiti di nome e sottotitolo provengono da [App information](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information/);
descrizione, promozionale e parole chiave da [Platform version information](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information/).

### Descrizione

Copiare il contenuto del blocco come testo semplice nel campo Descrizione, senza delimitatori Markdown.
Lunghezza del testo: 1720 / 4000 caratteri, inclusi spazi e a capo.

```text
Cinque poteri. Una strada tua. In DITE componi il tuo personaggio ed esplori città generate in prima persona, tra abitanti da aiutare, missioni e custodi da affrontare.

COSTRUISCI IL TUO KIT
Scegli un primario, un movimento, due abilità e una suprema. Parti con un kit pronto oppure entra in officina: cerca tra 1343 meccaniche, scegli grado, elemento e innesto, poi equipaggia la combinazione che preferisci entro i tuoi punti disponibili.

TROVA IL TUO STILE
Attacchi, difese, evocazioni, mobilità e controllo: puoi combinare barriere, portali, volo, trasformazioni e molto altro. Ogni spazio ha il suo ruolo. Il primario risponde alla tua pressione e i poteri attivi indicano quando puoi terminarli.

ESPLORA DITE, COCITO E MALEBOLGE
Percorri tre ambientazioni con piante generate, incontra gli abitanti e affronta sei tipi di missione. Conquista Fama per ampliare il budget del tuo kit. Nelle arene, osserva i segnali dei custodi e spostati prima dei loro colpi.

IMPARA GIOCANDO
Una guida breve segue movimento, mira, attacchi, abilità e accettazione della prima missione. Puoi saltarla, riprenderla o riaprire l'aiuto. Il registro conserva i totali e le ultime 32 imprese completate sul dispositivo.

GIOCA IN ORIZZONTALE
Regola sensibilità, comandi per mancini, volume, qualità grafica, movimento e lampi ridotti. Apri la pausa quando ti serve; dopo un'interruzione scegli tu quando riprendere.

DITE è un gioco per giocatore singolo, utilizzabile offline, senza account, pubblicità o acquisti in-app. Kit, Fama e preferenze si salvano sul dispositivo; non è previsto un trasferimento dei progressi tra dispositivi. Alla riapertura dell'app riparti dal rifugio: il combattimento interrotto non viene ricostruito.
```

### Parole chiave

Lunghezza del testo: **93 / 100 byte**. Il testo seguente usa solo ASCII, quindi caratteri e byte coincidono.
Non ripete il nome dell'app e non contiene nomi di altri giochi o personaggi.

```text
poteri,magia,esplorazione,combattimento,missioni,boss,officina,offline,elementi,prima persona
```

### Novità della versione

Per la **prima pubblicazione iOS**, App Store Connect non richiede il campo delle novità; il numero 4.0
segue la versione del gioco e non implica che esistano precedenti release native.
Se si tratta invece di un aggiornamento di un'app già presente, usare soltanto le novità rispetto alla
versione effettivamente pubblicata. La base per quel confronto è: rifugio, navigazione mobile, guida
giocabile, registro locale, preferenze e miglioramenti dei comandi. Non descriverli come nuovi senza confronto.

## Dati da completare nell'account

I segnaposto non vanno copiati nella scheda pubblica. Inserire i dati reali direttamente negli strumenti
appropriati; certificati, chiavi e credenziali di firma non appartengono al repository.

| Campo | Valore da fornire o scelta da completare |
| --- | --- |
| Publisher / venditore | `[IDENTITÀ REALE DELL'ACCOUNT APPLE DEVELOPER]` |
| Nome sviluppatore visibile | `[NOME CONSENTITO PER L'ACCOUNT E DA USARE PUBBLICAMENTE]` |
| Titolare dei diritti e copyright | `[ANNO E TITOLARE REALE]`; non derivarli dal nome del repository |
| Titolare della privacy policy | `[IDENTITÀ REALE E RECAPITO PERTINENTE]` |
| Support URL | `[URL HTTPS PUBBLICO CON ISTRUZIONI E CONTATTO FUNZIONANTE]`; la pagina del gioco da sola non è assistenza |
| Privacy Policy URL | `[URL HTTPS DELLA POLICY FINALE]`; deve descrivere i progressi locali e il comportamento effettivo |
| Policy consultabile nell'app | `[PERCORSO O LINK IMPLEMENTATO E VERIFICATO]`; oggi non è configurato |
| Marketing URL | Facoltativo; scegliere una pagina pubblica del progetto quando pronta |
| Contatto riservato App Review | `[NOME, EMAIL E TELEFONO REALE CON PREFISSO INTERNAZIONALE]` |
| Bundle ID definitivo | `[IDENTIFICATORE REGISTRATO NEL TEAM]`; sostituisce `local.dite.development` prima della firma |
| Team / firma | `[TEAM ID E CONFIGURAZIONE DI DISTRIBUZIONE AUTORIZZATA]`; certificati e provisioning negli strumenti Apple/CI |
| SKU | `[CODICE INTERNO DEFINITIVO]`; proposta tecnica `dite-ios`, da assegnare quando si crea la scheda |
| Build da sottoporre | `[VERSIONE, BUILD, COMMIT E RISULTATO DELLE VERIFICHE NATIVE]` |
| Prezzo e territori | `[SCELTA DEL PUBLISHER]`; assenza di acquisti in-app non determina il prezzo di download |
| Pubblicazione | Proposta: rilascio manuale dopo approvazione, per controllare scheda e build prima dell'uscita |

Supporto e policy sono campi distinti; la documentazione Apple li descrive nelle pagine
[Platform version information](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information/)
e [App information](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information/).

Per le dichiarazioni del prodotto, partire da questi fatti verificabili nei sorgenti:

- Il gioco non ha backend, account, pubblicità, analytics o integrazione StoreKit per acquisti e abbonamenti.
  La build attuale non richiede login, microfono, fotocamera o posizione.
- I progressi sono locali; il manifest `PrivacyInfo.xcprivacy` dichiara assenza di tracking e dati raccolti.
  Compilare le risposte App Privacy sulla build finale, inclusi eventuali servizi introdotti per il supporto.
- Il contenuto include combattimento fantastico, nemici e ambientazioni infernali. Compilare il questionario
  età sul contenuto reale; non è stata attribuita qui una classe d'età né selezionata la categoria bambini.
- Restano da completare le risposte effettive per export/crittografia, diritti sui contenuti e stato trader
  nei territori pertinenti. Le fonti e i dettagli sono in [IOS.md](IOS.md), senza dati legali presunti.

## Note per App Review

**Sign-in required: no.** Nessun account demo necessario. Il contatto del revisore resta quello reale
da inserire nella tabella precedente. Il blocco è una bozza per la build finale: prima dell'invio,
verificare nel simulatore/dispositivo gli stessi passaggi, senza strumenti di debug.
Apple ammette note in qualsiasi lingua; il testo seguente occupa **1979 / 4000 byte UTF-8**. Riferimento:
[App Review information](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information#app-review-information).

```text
DITE è un gioco per giocatore singolo in prima persona, con interfaccia italiana, utilizzabile in entrambe le orientazioni orizzontali. Non richiede account o connessione al gioco e non contiene pubblicità, acquisti in-app o abbonamenti. Il gioco e il motore sono inclusi nell'app; non vengono scaricati livelli o codice.

Percorso di prova:
1. Avviare in orizzontale. Dal rifugio, toccare "Entra a Dite" (nome accessibile: "Entra nel gioco"). Al primo avvio è già equipaggiato un kit con Dardo, Scatto, Scudo, Nova e Cataclisma.
2. Trascinare a sinistra per muoversi e nella zona destra libera per guardare. Tenere premuto il pulsante grande Dardo per il primario; è possibile mirare trascinando sullo stesso pulsante. Gli altri quattro pulsanti attivano movimento, due abilità e suprema. La suprema si carica colpendo.
3. La guida osserva le azioni reali. È possibile usare "Salta percorso" oppure aprire Guida dal rifugio o dalla pausa per riprenderla. Non è necessario completare la guida per usare il gioco.
4. Avvicinarsi a un abitante con il segno ! e usare il comando "Accetta: ...". L'obiettivo compare nell'interfaccia. Completare missioni assegna Fama; il Registro del rifugio mostra i risultati ottenuti.
5. In Pausa, aprire Impostazioni e tornare indietro: si resta in pausa fino a "Riprendi". Sono presenti sensibilità, comandi per mancini, audio, qualità, movimento e lampi ridotti.
6. Dal rifugio aprire Scegli kit o Officina. I cinque spazi sono primario, movimento, due abilità e suprema. In officina si modificano una bozza e i relativi costi; "Equipaggia" applica il kit, "Annulla" conserva quello precedente. Il kit iniziale costa 8 punti su 12 disponibili.

Ricetta, Fama, preferenze, guida e registro sono salvati sul dispositivo. Tornando in primo piano il gioco resta in pausa; dopo una chiusura e riapertura si torna al rifugio con i progressi salvati, senza ricostruire il combattimento precedente. Non c'è sincronizzazione tra dispositivi.
```

I nomi accessibili dei controlli sono quelli usati anche da `ios/DITEUITests/DITEUITests.swift`.
Rivedere le note se cambiano testi, funzionalità, monetizzazione o salvataggio prima dell'invio.

## Immagini dalla build reale

La quinta CI non ha prodotto foto: XCTest non è stato avviato.
La quarta CI contiene **13 PNG iPhone e 11 PNG più 2 video iPad**, esportati dagli XCTest reali.
Restano evidenze diagnostiche della candidata 15: su iPad mostrano ancora la compatibilità iPhone.
Il set `docs/qa/4.0` con PNG originali, manifest e TXT deve ancora essere creato.
**Il set Store è da acquisire e approvare sulla build finale**, dopo il collaudo del nuovo target universale;
le immagini della candidata 15 o di Chromium non ne dimostrano il funzionamento.
Il workflow `.github/workflows/dite.yml` conserva `ios-iphone-evidence` e `ios-ipad-evidence`, con
`SimulatorTests.xcresult`, log, `selected-simulator.json` e immagini; la conservazione attuale è di 14 giorni.
La CI esporta gli allegati in `.build/xctest-attachments/`. Dopo il completamento del collaudo UI, selezionare
le immagini del gioco effettivo e conservarle insieme a commit, build e dispositivo.

| Ordine proposto | Cosa mostra | Allegato XCTest già previsto | Uso |
| --- | --- | --- | --- |
| 1 | Città in prima persona e cinque comandi | `game` | Immagine iniziale: deve rendere riconoscibile il gioco |
| 2 | Officina e composizione del kit | `forge-without-keyboard` | Catalogo e scelta poteri, senza tastiera sopra i controlli |
| 3 | Rifugio e kit equipaggiato | `lobby-landscape-left` | Ingresso e attività disponibili |
| 4 | Preferenze di grafica e comfort | `preference-restored` | Opzioni realmente presenti |
| 5, facoltativa | Missione o custode in azione | Non coperto dalle attuali catture XCTest | Acquisire una sessione nativa reale prima di aggiungerla |

Le catture di pausa, background e tastiera servono anche alla diagnosi; non devono necessariamente entrare
nella scheda. Usare immagini nitide della UI effettiva, senza inventare progressi, sovrapporre finti comandi
o montare scene che la build non può mostrare. Il piano non richiede mockup o un video promozionale.

Apple consente **1–10 immagini per dimensione**, PNG o JPEG, senza trasparenza. La dimensione iPhone
richiesta nella tabella corrente è **Dynamic Island, display medio**: il simulatore preferito iPhone 17 Pro
corrisponde a questa famiglia. Per il landscape iPhone,
la tabella consultata comprende **2622×1206** e **2556×1179** per la famiglia Dynamic Island media.
Confrontare i pixel esportati e il simulatore realmente scelto con i campi del Media Manager: lo script CI
sceglie tra simulatori installati e non garantisce da solo una specifica dimensione commerciale.
Il progetto è universale (`TARGETED_DEVICE_FAMILY = 1,2`): Release compilata nella quinta CI,
collaudo XCTest ancora da eseguire dopo la correzione Debug.
La quarta CI riguarda il precedente target iPhone in compatibilità iPad. Per la build universale acquisire
anche il set iPad richiesto da 13 pollici sul target nativo verificato, senza ingrandire una foto iPhone. Fonte:
[Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/).

## Passaggio alla scheda effettiva

Quando sono disponibili build verificata e account, creare la scheda con l'identità e il Bundle ID definitivi,
trasferire i testi italiani, completare supporto/privacy e risposte sul prodotto, poi selezionare la build
firmata caricata. Allegare le schermate esportate dalla stessa versione e le note di prova aggiornate.
Il numero di build, il commit e il risultato della CI devono permettere di collegare ogni materiale al codice.

| Evidenza da collegare | Valore attuale |
| --- | --- |
| Quinta CI e commit | [43480792340](https://github.com/9zhjfg8zjf-beep/Repository-di-prova/actions/runs/43480792340), `5f55c7fcd90b3b9f2af9da48ed0ec2aef39c8c85`; Node 14 e packaging 8 verdi |
| Build/XCTest della quinta CI | Release universale compilata; Debug fallita su entrambe le famiglie prima di XCTest, nessun unitario/UI eseguito né foto prodotta |
| Ultimi XCTest eseguiti | Quarta CI, candidata 15: 20/20 unitari per famiglia, 6/6 UI iPhone e 4/6 iPad in compatibilità |
| Candidata 17 locale | 33/33 prove attuali verdi (14 Node + 19 browser/build), esito 0; packaging 8/8 e controlli bundle verdi; log/checksum in `AGENTS.md` |
| Sesta CI nativa | Verificare i cinque fix `NSCoder.string(for:)`, poi target universale e tastiera, entrambi i landscape effettivi e background OS; asserzioni invariate |
| Rotazione e background iPad | Nuova sonda `effectiveGeometry`; `Window Controls` → `Minimize` con etichette ancora da verificare, fallimento diagnostico se assenti |
| Screenshot nativi | Originali quarta CI verificati; selezione `docs/qa/4.0` da creare, set Store finale ancora da acquisire |
| Prove su hardware fisico | Da eseguire con hardware accessibile al collaudo |
| Archivio firmato / build App Store Connect | Da preparare con account e firma autorizzati |
| Supporto e policy pubblici | Da configurare con identità reale |

La compilazione, la firma, l'invio e l'approvazione sono risultati separati. Questo documento prepara
i contenuti del caricamento; collaudo UI, firma e distribuzione restano da completare.
