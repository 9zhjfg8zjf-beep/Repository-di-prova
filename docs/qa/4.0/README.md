# DITE 4.0 — prove della versione

Questo pacchetto conserva gli originali selezionati del run [43497161293](https://github.com/9zhjfg8zjf-beep/Repository-di-prova/actions/runs/43497161293), sorgente `3ba5abe95502fc00332b8fb50503bcde063317aa`. Non contiene mockup: le immagini provengono da XCTest su simulatori iPhone e iPad. Il manifest riporta ambiente, test, nome originale, dimensioni, EXIF, SHA256 e artifact di provenienza.

## Risultati verificati

I risultati completi sono in `provenance/final-gate.json` e nei report originali di ciascuna famiglia. `root-review.json` registra la revisione visiva delle 15 immagini, con gli stessi hash del manifest. I file originali non sono stati ruotati, ritagliati o ricodificati.

| Evidenza | Contenuto |
| --- | --- |
| iPhone: 7 PNG | Partita, officina prima/dopo tastiera e rotazione, pausa nei due avvii landscape e dopo rotazione, schermata di sistema dopo Home |
| iPad: 8 PNG | Partita, officina prima/dopo tastiera e rotazione, pausa nei due avvii landscape e dopo background, rifugio, schermata di sistema dopo Home |
| 13 TXT osservazione pixel | Campione effettivamente accettato per ciascuna immagine dell'app selezionata |
| Orientamento | Tre letture originali per famiglia: avvio Right, rotazione Left, nuovo avvio Left |
| Lifecycle | Stati OS prima/dopo Home e riattivazione; il ritorno richiede Riprendi |

I controlli e i testi principali risultano leggibili e contenuti nelle schermate. Il footer dell'officina resta disponibile dopo l'uso della tastiera. Sull'iPhone il nome lungo nella colonna dei poteri è abbreviato, con il nome completo nei dettagli; dopo tastiera/rotazione la colonna mantiene il proprio scorrimento. Le schermate di sistema sono diagnostiche e non vengono presentate come schermate del gioco.

Tutte le 26 immagini originali del run hanno pixel non uniformi. Tutte le 24 acquisizioni app (12 per famiglia, prima della selezione) sono state accettate al primo tentativo; la lobby è stata fotografata prima del primo tocco. Il test esistente include anche sei asserzioni sintetiche del filtro pixel: non sono sei casi XCTest aggiuntivi.

La precedente cattura uniforme della lobby iPad ha portato a richiedere pixel visibili prima di conservare uno screenshot. La sua causa resta non dimostrata; questo run documenta immagini valide e non autorizza a dichiarare risolto un ipotetico difetto del renderer.

## Limiti

Il progetto è unsigned e questi sono simulatori: non dimostrano fluidità, temperatura, batteria, audio o vibrazioni su un dispositivo fisico. Non attestano firma, TestFlight, pubblicazione App Store, metadati commerciali o privacy/supporto definitivi. Non è stato verificato Minimize con Windowed Apps.

Le prove della pagina pubblica, quando presenti in `published-web/`, sono separate dagli originali nativi e registrano i byte effettivamente serviti da GitHub Pages.
