# DITE 5.0 — Le memorie

Nove luoghi originali distribuiti fra Dite, Cocito e Malebolge: fonderia, archivio, specola, serra, chiostro, darsena, orto, mercato e teatro. Ogni luogo contiene custode, memoria da leggere, sigillo elementale, leva, reliquiario, risorsa e panca. Il sigillo risponde a un lancio riuscito, vicino e rivolto verso di esso: è una risonanza, non una simulazione universale dei materiali. Le grate cambiano davvero la collisione. Le ricompense non si ripetono cambiando città o rigenerando la mappa.

L’atlante segue il luogo scelto, conserva le memorie e consente il viaggio verso luoghi già scoperti, solo con partenza e arrivo sicuri e senza missioni o trasformazioni in corso. Tre frammenti permettono una scelta persistente per città: titolo e luce dei luoghi cambiano. Le scorte curano fuori dal pericolo; le panche hanno un tempo di recupero.

I comandi aggiungono dimensione, opacità e raggio del joystick configurabili, una zona morta e feedback immediato alla pressione. La qualità automatica scende e risale con isteresi usando il tempo reale dei fotogrammi. Un RAF precedente alla ripresa non può invertire il tempo di simulazione.

La suite ora comprende 37 comandi: 16 Node e 21 browser/build, più packaging e iOS separati. Le prove nuove sono `tmobile_policy.js`, `tcontrols_browser.js`, `tadventure.js` e `tadventure_browser.js`. Collaudo locale verde: 16 prove Node e 21 browser/build, più 8 packaging e 4 asset. Gli esiti nativi correnti sono nella [CI della revisione 5.0](https://github.com/9zhjfg8zjf-beep/Repository-di-prova/pull/2/checks); i risultati storici 4.0 sotto non valgono come collaudo della 5.0. [Evidenze locali](qa/5.0/local.json). Nessuna certificazione di prestazioni su hardware fisico o equivalenza con un titolo AAA.

## Limiti delle prove

Il generatore è verificato su 300 mappe (900 collocazioni, ingresso libero e percorso sulla griglia). Collisione della grata e interazioni complete sono esercitate nei nove luoghi; non si tratta di 900 visite manuali. Il browser usa Chromium con rendering software: viewport e input touch non equivalgono a un telefono fisico.

Le icone PNG sono confrontate per dimensioni, modo, metadati e pixel esatti. Il flusso compresso può differire fra le librerie DEFLATE delle wheel Pillow Windows/Linux. Quattro test impediscono che il confronto accetti pixel alterati, trasparenza, dimensioni o metadati diversi. Per generare/verificare gli asset servono Python 3.11+ e la versione Pillow fissata.
