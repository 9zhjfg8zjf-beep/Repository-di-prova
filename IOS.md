# DITE — contenitore iOS e verifiche

Aggiornato il 13 novembre 2026. Target applicazione **4.0, build 1**, deployment target iOS 17.
Il contenuto del gioco incluso segue la versione visibile 4.0 del bundle generato.
Non chiamare questa preparazione “App Store ready”: firma, distribuzione, prove fisiche e revisione sono fasi distinte.

## Stato delle verifiche

- Sesta CI [43482793151](https://github.com/9zhjfg8zjf-beep/Repository-di-prova/actions/runs/43482793151)
  su `c906226600bc6834a954d7f88749fb4efe391a73`: **14 Node, 19 browser/build e packaging 8/8 verdi**.
  Target universale: **20/20 unitari per famiglia, 6/6 UI iPhone e 5/6 UI iPad**. Risolte le conversioni
  Swift che bloccavano Debug nella quinta CI. Entrambi i landscape effettivi, inclusi rotazione live e
  nuovo avvio, e il percorso officina/tastiera sono verdi su entrambe le famiglie.
- Unico fallimento iPad: `Window Controls` trovato zero volte prima di qualsiasi azione OS. Foto, albero
  di accessibilità e geometria mostrano fullscreen 1180×820 senza controlli finestra. Il test non ha
  raggiunto né dimostrato il background OS; Minimize non è stato eseguito.
- La sola fixture XCTest ora preme Home su entrambe le famiglie e rimuove Minimize. Conserva i requisiti
  di vero background OS 2/3 prima di activate, foreground 4, pausa al ritorno e ripresa esplicita.
  **La nuova fixture e il background iPad attendono la settima CI**. Minimize in Windowed Apps non è verificato.
  Web, Core e bundle della candidata 17 restano invariati; il gate locale seguente resta valido.
- Candidata 17: **33/33 prove locali verdi** sulla candidata attuale: 19 browser/build e poi 14 Node,
  senza modifiche ai sorgenti o alle prove, entrambi con esito 0. Log: `/tmp/dite-final17-browser.log`
  e `/tmp/dite-final17-node.log`. Packaging 8/8, sync, progetto e asset ripetuti con esito 0. Checksum in `AGENTS.md`.
  Pointer ID pen obsoleto: regressione riprodotta sulla 15 e superata sulla 16. Guardia nelle finestre strette
  e verticali: regressione riprodotta sulla 16 e superata sulla 17.
  Il precedente timeout screenshot `DSL 19-b` sulla 16 resta di causa non dimostrata; il risultato attuale
  viene dal gate completo della 17.
- Il target locale ora è universale `1,2`, con telefono landscape e quattro orientamenti iPad. La guardia web
  osserva il rapporto del canvas anche in una finestra stretta e richiede ripresa esplicita.
  I due landscape effettivi e il percorso officina/tastiera sono verificati dalla sesta CI; resta aperto
  il background iPad con la nuova fixture Home.
  La guardia usa le dimensioni del canvas; i resize di layout che restano landscape sono verificati nel browser.
- La sonda DEBUG legge `effectiveGeometry` e i flag di geometria disponibili da iOS 26. Non pilota il gioco.
  La traccia JS resta opt-in `--ui-testing-event-trace`, assente dai test normali; sonde e log nativi restano
  DEBUG/`--ui-testing`. WPE Linux è una prova complementare, non iOS.
- Gli originali della sesta CI contengono 13 PNG per famiglia e un video iPad, verificati nel workspace
  in `ios-run43482793151/verified-evidence.json`. Il set finale `docs/qa/4.0` (PNG originali, manifest e TXT)
  è da creare dopo una CI completa verde; non è il set Store finale.
- iPhone/iPad fisici, prestazioni, temperatura, autonomia, audio e interruzioni reali: **non verificati**.
- Nessun certificato, profilo, Team ID, account App Store Connect o invio predisposto automaticamente.

Registrare il prossimo esito sul commit effettivo: la correzione della fixture non prova già il background iPad.
Il simulatore non certifica hardware reale.

## File e build

| Percorso | Responsabilità |
| --- | --- |
| `ios/DITE.xcodeproj`, schema condiviso `DITE` | Applicazione, unit test ospitati e UI test. |
| `ios/Config/Development.xcconfig` | iOS 17, versione 4.0/build 1, firma disabilitata, identificatore tecnico. |
| `ios/DITE/GameViewController.swift` | WKWebView, lifecycle, audio, bridge, navigazione e recupero. |
| `ios/DITE/GameSaveStore.swift` | JSON atomico e copie di recupero nel contenitore applicazione. |
| `ios/DITE/BridgeMessage.swift` | Validazione del protocollo, tipi, dimensioni e versione. |
| `ios/DITE/Resources/Game/` | HTML autonomo, licenza Three e manifest SHA256. Non modificare a mano. |
| `scripts/ios_sync.py` | Copia esatta da `motore/dist/index.html`; `--check` fallisce se obsoleto. |
| `scripts/ios_project.py` | Genera il progetto senza dipendenze; `--check` verifica che sia aggiornato. |
| `scripts/ios_test.py` | Prove Linux del packaging e dei metadati, distinte da XCTest. |
| `scripts/ci_ios.sh`, `.github/workflows/dite.yml` | Build unsigned e test reali nei simulatori disponibili. |

Comandi dalla radice del repository, dopo aver installato le dipendenze del motore:

```sh
python3 motore/build.py
python3 scripts/generate_assets.py --check
python3 scripts/ios_sync.py
python3 scripts/ios_project.py
python3 scripts/ios_test.py
python3 scripts/ios_sync.py --check
python3 scripts/ios_project.py --check
```

`ios_sync` non scarica nulla. Rifiuta segnaposto di build e riferimenti HTML/CSS a risorse esterne/separate;
verifica anche licenza, checksum e assenza di trasparenza nell'icona. Non usa la variante PWA `site/`,
che contiene riferimenti a manifest e icona separati. Un errore `--check` non ripara né scrive file.
Il controllo statico non è un analizzatore completo di tutte le chiamate di rete JavaScript.

La CI usa macOS 26/Xcode 26.6, registra versione e UUID del simulatore realmente scelto,
compila Release per dispositivo senza firma e svolge XCTest Debug su iPhone e iPad.
Conserva log, `.xcresult`, screenshot allegati dai test e pacchetti `.app` per 14 giorni.
Sul Mac esporta tutti gli allegati XCTest in `.build/xctest-attachments/`, inclusi i PNG dei test riusciti
e il manifest del tool; conserva anche help del tool, log di esportazione e `xctest-status.json`.
L'esportazione viene tentata anche dopo un fallimento XCTest, mantenendone il codice di uscita originale.
Se i test passano ma l'esportazione fallisce o non contiene PNG, la CI fallisce invece di dichiarare prove visive disponibili.
Non usa lo screenshot finale del simulatore come foto del gioco: il tearDown può avere già chiuso l'app.
La `.app` unsigned per dispositivo **non è installabile/distribuibile** come un'app firmata.
Per eseguire localmente su un Mac configurato: `bash scripts/ci_ios.sh iphone` e `bash scripts/ci_ios.sh ipad`.

## Contenitore e comportamento

- Swift/UIKit, singola scena, nessuna dipendenza nativa esterna e nessun backend.
- WKWebView carica esclusivamente `Game/index.html` dal bundle; la lettura è limitata alla cartella `Game`.
- Il motore e Three sono inclusi nel file. Non servono CDN, server locale, service worker o aggiornamenti remoti.
- Le regole WebKit bloccano richieste HTTP/HTTPS/WS/WSS. Il caricamento inizia solo dopo la loro compilazione.
  La policy di navigazione consente il solo documento locale e i suoi frammenti, non iframe o URL arbitrari.
- Eventuali link esterni richiedono azione dell'utente, HTTPS e corrispondenza esatta con `DITEExternalURLs`
  in Info.plist; vengono aperti dal sistema. L'elenco attuale è vuoto, senza indirizzi o identità inventati.
- Il sito dati WebKit è non persistente. I progressi iOS passano dal salvataggio nativo, non da cookie/localStorage.
- Target universale iPhone/iPad (`TARGETED_DEVICE_FAMILY = 1,2`): telefono nei due landscape, iPad nei
  quattro orientamenti. La sesta CI esegue XCTest sul target universale e verifica i due landscape;
  il caso iPad osservato è fullscreen 1180×820, distinto dalla precedente compatibilità iPhone.
- Il canvas occupa il contenitore; CSS gestisce safe area e margini. Non sommare nuovamente inset UIKit:
  `contentInsetAdjustmentBehavior = .never`. Non usa `UIRequiresFullScreen` per aggirare il ridimensionamento.
  La finestra verticale mostra una guardia e sospende il gioco; tornando in orizzontale serve Riprendi.
- Perdita attività, background e interruzione audio inviano sospensione al router JS. Il ritorno in primo piano
  consente una ripresa esplicita; non fa ripartire automaticamente la partita o l'audio.
- Categoria audio `.ambient`: rispetta silenzioso/blocco schermo e convive con audio di altre app.
  Il clock Web Audio riparte da un gesto nel gioco. Nessuna registrazione o modalità background audio.
- Il blocco dell'autospegnimento è attivo soltanto durante il gioco effettivamente attivo.
- Haptic `light`/`success`, solo su hardware dichiarato compatibile, app attiva e con limite di frequenza.
  Il simulatore può dichiarare la capacità non disponibile: l'interfaccia deve rispettarlo.
- Avvio non completato, caricamento fallito o processo WebKit terminato mostrano un errore nativo con retry manuale.
  Non esistono cicli automatici di reload. Il combattimento interrotto non viene ricostruito: si torna al rifugio.
- Una richiesta JS di reload del documento principale viene intercettata e riaperta dal contenitore:
  bootstrap, salvataggio, lifecycle e handshake ripartono insieme, senza riutilizzare lo snapshot del primo avvio.

## Contratto bridge v1 e salvataggio schema 3

Il native host inietta `window.__DITE_HOST__` a inizio documento, soltanto nel frame principale:

```js
{v:1, platform:'ios', active:true, storage:objectOrNull,
 storageError:null /* oppure 'corrupt'/'unavailable' */,
 capabilities:{storage:true,haptics:false}}
```

`storage.js` installa `window.DiteNative.receive` prima del messaggio `ready`.
I messaggi web→native passano solo da `window.webkit.messageHandlers.dite.postMessage`:

| Messaggio | Campi esatti oltre `v:1` | Effetto |
| --- | --- | --- |
| `ready` | `type:'ready', schemaVersion:3` | Completa handshake; host reinvia lifecycle attuale. L'overlay resta fino al primo stato oltre boot/loading. |
| `save` | `type:'save', id, data` | Snapshot JSON completo, schemaVersion 3, massimo 256 KiB. |
| `state` | `type:'state', screen, playing` | Stato minimo per audio/autospegnimento; nessun Core serializzato. |
| `haptic` | `type:'haptic', style:'light'/'success'` | Feedback breve, limitato e subordinato alla capacità. |

La risposta a `save` è `{v:1,type:'saveResult',id,ok,error}`, con `error:null/'invalid'/'unavailable'`.
`ok:true` arriva soltanto dopo la scrittura atomica; l'interfaccia mostra «Salvato sul dispositivo» dopo ack.
Durante attesa/errore i dati in memoria restano giocabili e lo stato non promette persistenza.
Le risposte appartenenti a una pagina precedente non vengono consegnate dopo il reload.

Il lifecycle usa `{v:1,type:'lifecycle',active,reason}`. `active:true` non equivale a “riprendi partita”.
Il protocollo non accetta JavaScript, percorsi file, URL da aprire o nomi di metodi nativi arbitrari.
Versioni diverse, tipi errati, ID non interi sicuri e campi inattesi sono rifiutati.

La normalizzazione semantica e le migrazioni appartengono al modulo JS comune web/iOS.
Il contenitore conserva ricetta, kit salvati, fama, città/seme, preferenze, onboarding e diario nello stesso JSON;
non conosce il catalogo dei poteri e non elimina campi validi dello schema.
Il file è `Application Support/DITE/progress.json`, scritto su coda seriale con operazione atomica.
Una breve attività background protegge scritture già avviate; non è una promessa contro spegnimento o terminazione forzata.
Se il file corrente è illeggibile, `load` prova davvero `progress.previous.json` e restituisce i progressi
recuperati con `storageError:'corrupt'`; senza copia leggibile non finge un recupero.
Prima della prima scrittura dopo ogni caricamento, il file originale viene conservato atomicamente in
`progress.raw.json`, anche se schema 3 e sintatticamente valido: JS può doverne correggere la semantica.
Solo dopo il commit atomico del nuovo current, un originale leggibile può diventare `progress.previous.json`.
Un originale corrotto non sostituisce la copia precedente leggibile. Se il salvataggio fallisce, current e previous
restano recuperabili. Se la copia raw fallisce, current non viene sovrascritto.
I due slot di recupero sono limitati, persistono tra avvii e non vengono ruotati dalle altre scritture della
stessa sessione; non sono un archivio illimitato. I test iniettano guasti nella copia raw e nella scrittura current.
Il salvataggio non usa `UserDefaults`; eventuali backup del sistema dipendono dalle impostazioni del dispositivo.
Gli UI test usano `DITE-UI-Tests` separato, soltanto in Debug. Non cancellano i progressi della normale app.

## Prove native e limiti

I test unitari coprono protocollo, payload errati/grandi, URL, round-trip, scrittura fallita, concorrenza,
migrazione e conservazione dei dati danneggiati/futuri. Non sostituiscono i test semantici del motore.
Gli UI test sono predisposti per avviare il bundle vero e usare tap e controlli accessibili, senza JS per pilotare il gioco:
ingresso, pausa, impostazioni/ritorno, rotazioni, background e persistenza di una preferenza dopo rilancio.
La rotazione richiede entrambi i landscape effettivi della finestra, non soltanto quelli richiesti al dispositivo.
La sonda accessibile usa `effectiveGeometry` e i flag disponibili da iOS 26; è esclusa da Release e dagli avvii
Debug senza `--ui-testing`. Il test background richiede lo stato OS reale prima di riattivare l'app.
Una prova apre l'officina senza tastiera automatica, modifica Nome e Cerca con la tastiera reale, ruota
il simulatore, chiude la tastiera tramite il comando dell'interfaccia e raggiunge il ritorno al rifugio.
Una prova provoca un primo errore WebGL attraverso uno user script esclusivamente Debug, poi tocca il vero
«Riprova» e raggiunge rifugio e partita. L'iniezione di guasto non è compilata nella build Release.
Le schermate sono allegati XCTest reali; al fallimento viene conservato anche l'albero di accessibilità.
Nella sesta CI sono verdi tutti i sei test UI iPhone e cinque su iPad. Su iPad la fixture si ferma cercando
controlli finestra assenti in fullscreen, prima di ogni azione OS. La nuova fixture Home per entrambe le
famiglie attende la settima CI; conserva veri stati background/foreground e ripresa esplicita.
La traccia eventi JS richiede anche `--ui-testing-event-trace`; i normali UI test non la caricano.

Prima della distribuzione occorrono prove su dispositivi accessibili: multi-touch simultaneo, notch e home indicator,
tastiera e rotazione, sessioni prolungate, memoria, calore, autonomia, silenzioso, Bluetooth e interruzioni audio.
Non chiedere all'utente di sostituirsi al collaudo. Serve accesso a hardware o a un servizio di test fisico.

## Privacy e passaggi ancora necessari per App Store

Il manifest dichiara nessun tracking, nessun dato raccolto e nessuna required-reason API per il wrapper attuale.
Non ci sono SDK analytics, pubblicità, login, chiamate a servizi del gioco, registrazione audio o permessi protetti.
Questa dichiarazione va riesaminata a ogni dipendenza o API aggiunta; un manifest vuoto non è un'esenzione generale.
Privacy policy pubblica, copia consultabile nell'app, informazioni App Store Connect e manifest sono cose distinte.
La policy finale deve descrivere progressi locali, cancellazione, eventuali link/supporto e titolare reale.
Supporto e policy pubblica **non sono ancora configurati**; non inserire dati personali dal contesto/memoria nel repo.

`local.dite.development` è solo un identificatore tecnico per build unsigned. Prima di firmare occorrono
identificatore definitivo, Apple Developer Program, Team/certificati/provisioning e autorizzazioni reali.
Vanno poi completati privacy labels, questionario età sui contenuti effettivi, crittografia/export, stato trader DSA,
metadati e screenshot della build finale, contatto supporto e note per il revisore.
La presenza di WKWebView non decide da sola l'esito: Apple valuta completezza, valore e qualità dell'esperienza.
L'approvazione resta di App Review; nessun test automatico la garantisce.

## Fonti ufficiali verificate durante la preparazione

- [Requisiti SDK correnti](https://developer.apple.com/news/upcoming-requirements/): Xcode 26+/SDK iOS 26+ per upload dal 28 aprile 2026; deployment target distinto.
- [Compatibilità Xcode](https://developer.apple.com/xcode/system-requirements).
- [WKWebView file locali](https://developer.apple.com/documentation/webkit/wkwebview/loadfileurl(_:allowingreadaccessto:)).
- [Scene inactive](https://developer.apple.com/documentation/uikit/uiscenedelegate/scenewillresignactive(_:)).
- [Audio ambient](https://developer.apple.com/documentation/avfaudio/avaudiosession/category-swift.struct/ambient).
- [Safe area WebKit](https://webkit.org/blog/7929/designing-websites-for-iphone-x/).
- [UIRequiresFullScreen deprecato](https://developer.apple.com/documentation/bundleresources/information-property-list/uirequiresfullscreen).
- [Prove sui dispositivi compatibili](https://developer.apple.com/help/app-review/before-submitting-for-review/test-compatible-devices).
- [Privacy App Store](https://developer.apple.com/app-store/app-privacy-details/) e [required-reason API](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api).
- [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), in particolare 2.1, 2.5.2, 4.2 e 5.1.1.
- [Questionario età](https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating) e [descrittori annunciati per il 16 novembre 2026](https://developer.apple.com/news/?id=yxkh08us).
- [Export crittografia](https://developer.apple.com/help/app-store-connect/reference/app-information/export-compliance-documentation-for-encryption).
- [Stato trader DSA](https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements).
