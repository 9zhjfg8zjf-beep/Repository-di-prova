'use strict';
// MOTORE - libreria dei mattoncini. Solo dati: un personaggio e' una ricetta che pesca da qui.
const Bricks = (() => {
  // Elementi: colore, effetto che lasciano su chi colpiscono, parole chiave per il generatore da descrizione.
  const ELEM = {
    folgore: { nome: 'Folgore', c: 0x3fc8ff, c2: 0xdff6ff, css: '#3fc8ff', fx: 'scossa: breve stordimento', kw: ['elettr', 'fulmin', 'tuon', 'saett', 'scaric', 'tecno', 'volt', 'tv', 'schermo', 'segnale'] },
    fuoco: { nome: 'Fuoco', c: 0xff7a20, c2: 0xffd27a, css: '#ff7a20', fx: 'ustione: danno nel tempo', kw: ['fuoc', 'fiamm', 'lava', 'incend', 'brace', 'infern', 'drago', 'calor', 'magma'] },
    gelo: { nome: 'Gelo', c: 0x9fb8ff, c2: 0xf0f6ff, css: '#9fb8ff', fx: 'brina: rallenta, poi congela', kw: ['ghiacc', 'gelo', 'neve', 'fredd', 'brina', 'inverno', 'cristall'] },
    ombra: { nome: 'Ombra', c: 0x9a5cff, c2: 0xd9c2ff, css: '#9a5cff', fx: 'fiacca: il nemico colpisce meno', kw: ['ombra', 'buio', 'oscur', 'notte', 'ninja', 'demon', 'vuoto', 'tenebr', 'spettr'] },
    veleno: { nome: 'Veleno', c: 0x8dff3a, c2: 0xe2ffc0, css: '#8dff3a', fx: 'veleno: si accumula', kw: ['velen', 'acid', 'tossic', 'serpent', 'ragn', 'palud', 'peste', 'spor', 'melma'] },
    luce: { nome: 'Luce', c: 0xffe08a, c2: 0xfffbe6, css: '#ffe08a', fx: 'grazia: ti cura a ogni colpo', kw: ['luce', 'sole', 'angel', 'sacr', 'divin', 'stell', 'oro', 'paladin', 'alba'] },
    sangue: { nome: 'Sangue', c: 0xff2a4a, c2: 0xffb0bc, css: '#ff2a4a', fx: 'sete: ruba vita, finisce i deboli', kw: ['sangu', 'vampir', 'carn', 'cremis', 'berserk', 'furia', 'bestia'] },
    vento: { nome: 'Vento', c: 0x8affd8, c2: 0xe6fff6, css: '#8affd8', fx: 'raffica: spinge via', kw: ['vento', 'aria', 'tornado', 'tempest', 'veloc', 'nuvol', 'uragan', 'cielo'] },
  };

  // Archetipi. slot: P primario (tenuto premuto), M mobilita', S abilita', U suprema (richiede Risonanza piena).
  // I parametri in elenco valgono per i gradi 1, 2, 3.
  const A = [];
  const def = (id, nome, slot, kind, ic, cost, cd, p, desc, kw) => A.push({ id, nome, slot, kind, ic, cost, cd, p, desc, kw });
  // --- Primari
  def('dardo', 'Dardo', 'P', 'proj', 'orb', [1, 2, 3], 0.3, { dmg: [10, 12.5, 15], speed: 34, n: 1 }, 'Un colpo rapido e preciso.', ['dardo', 'proiett', 'spar', 'pistol', 'arco', 'frecc']);
  def('sciame', 'Sciame', 'P', 'proj', 'orb', [2, 3, 4], 0.5, { dmg: 6, speed: 22, n: [3, 4, 5], homing: 1, spread: 0.22 }, 'Piu colpi che inseguono il bersaglio.', ['sciame', 'missil', 'insegu', 'api', 'stormo', 'spirit']);
  def('catena', 'Catena', 'P', 'chain', 'bolt', [2, 3, 4], 0.34, { dmg: [11, 13, 15], chain: [2, 3, 4], range: 24 }, 'Colpisce all\'istante e salta ai vicini.', ['catena', 'arco elettr', 'rimbalz', 'elettr', 'fulmin', 'scaric']);
  def('raggio', 'Raggio', 'P', 'beam', 'beam', [2, 3, 4], 0, { dps: [30, 38, 46], range: [16, 18, 20] }, 'Un fascio continuo sul primo bersaglio.', ['raggio', 'laser', 'fascio', 'occhi', 'visione']);
  def('soffio', 'Soffio', 'P', 'cone', 'cone', [2, 3, 4], 0, { dps: [26, 32, 38], range: [7, 8, 9], half: 0.5 }, 'Un getto a ventaglio, corto ma largo.', ['soffi', 'alito', 'fiamm', 'drago', 'getto', 'spruzz', 'lanciafiamm']);
  def('artigli', 'Artigli', 'P', 'melee', 'claw', [1, 2, 3], 0.42, { dmg: [16, 19, 22], range: 3.3, half: 1.0 }, 'Colpi ravvicinati su tutto cio che hai davanti.', ['artigl', 'spada', 'spade', 'lama', 'lame', 'mischia', 'pugn', 'zann', 'ascia', 'katana', 'coltell', 'martell']);
  def('mortaio', 'Mortaio', 'P', 'mortar', 'arc', [2, 3, 4], 0.85, { dmg: [24, 30, 36], r: [3, 3.5, 4], range: 18 }, 'Un colpo a parabola che esplode dove guardi.', ['mortaio', 'bomba', 'granat', 'esplos', 'catapult', 'obice']);
  // --- Mobilita'
  def('scatto', 'Scatto', 'M', 'dash', 'dash', [1, 2, 3], [2.5, 2.2, 1.9], { dist: [8, 10, 12], dmg: [14, 18, 22] }, 'Uno scatto che attraversa i nemici.', ['scatto', 'schiv', 'carica', 'rapid']);
  def('balzo', 'Balzo', 'M', 'blink', 'blink', [2, 3, 4], [5, 4.2, 3.5], { range: [12, 16, 20], dmg: [10, 14, 18], r: 3 }, 'Ti sposti all\'istante dove guardi.', ['teletrasp', 'balzo', 'blink', 'sparisc', 'portal', 'varco']);
  def('salto', 'Salto', 'M', 'leap', 'leap', [2, 3, 4], [6, 5.2, 4.5], { range: [14, 17, 20], dmg: [30, 40, 50], r: [4, 4.5, 5] }, 'Un salto ad arco che schiaccia all\'arrivo.', ['salto', 'schiant', 'piomb', 'atterr', 'hulk', 'meteor']);
  def('condotto', 'Condotto', 'M', 'cable', 'cable', [2, 3, 4], [2.5, 2, 1.5], { dmg: [60, 75, 90], r: 6.5, speed: [34, 38, 42] }, 'Entri nei cavi della citta e scendi come una folgore.', ['cavi', 'cavo', 'rete', 'corrent', 'condott', 'tecno', 'tv', 'schermo', 'elettr']);
  def('corsa', 'Corsa', 'M', 'haste', 'speed', [1, 2, 3], [8, 7, 6], { dur: [4, 5, 6], mul: [1.6, 1.7, 1.8] }, 'Per qualche secondo corri molto piu forte.', ['corsa', 'veloc', 'sprint', 'flash', 'rapid', 'vento']);
  def('velo', 'Velo', 'M', 'veil', 'veil', [2, 3, 4], [10, 9, 8], { dur: [4, 5, 6], bonus: [1.8, 2.1, 2.4] }, 'Sparisci. Il primo colpo da nascosto fa molto piu male.', ['invisib', 'velo', 'furtiv', 'stealth', 'ninja', 'assassin', 'ombra', 'nascond']);
  // --- Abilita'
  def('nova', 'Nova', 'S', 'nova', 'ring', [2, 3, 4], [6, 5.5, 5], { dmg: [36, 46, 56], r: [5.5, 6, 6.5], knock: 11 }, 'Un\'esplosione tutt\'attorno a te.', ['nova', 'esplos', 'onda d\'urto', 'scoppi', 'area']);
  def('zona', 'Zona', 'S', 'zone', 'zone', [2, 3, 4], [8, 7.5, 7], { dps: [14, 18, 22], r: [3.5, 4, 4.5], dur: [5, 5.5, 6], range: 14 }, 'Un campo che brucia chi ci resta dentro.', ['zona', 'campo', 'pozza', 'nube', 'terreno', 'cerchio']);
  def('trappola', 'Trappola', 'S', 'trap', 'trap', [1, 2, 3], [6, 5, 4], { dmg: [40, 52, 64], r: 3.5, stun: [1, 1.3, 1.6] }, 'Una mina che scatta al passaggio.', ['trappol', 'mina', 'tagliol', 'insidi', 'cacciator']);
  def('scudo', 'Scudo', 'S', 'shield', 'shield', [1, 2, 3], [9, 8.5, 8], { abs: [40, 55, 70], dur: 4 }, 'Assorbe i danni per qualche secondo.', ['scudo', 'barrier', 'armatur', 'tank', 'difes', 'corazz', 'protez']);
  def('cura', 'Cura', 'S', 'heal', 'heal', [2, 3, 4], [12, 11, 10], { heal: [30, 42, 54], dur: 4 }, 'Recuperi vita in pochi secondi.', ['cura', 'guar', 'medic', 'rigener', 'vita', 'sacerdot']);
  def('ipnosi', 'Ipnosi', 'S', 'charm', 'eye', [2, 3, 4], [12, 11, 10], { max: [3, 4, 5], dur: [7, 8, 9], range: 11 }, 'I nemici combattono per te. Vicino a uno schermo va in onda. Ripremi per rilasciare.', ['ipnos', 'ipnot', 'mente', 'controll', 'psich', 'charm', 'incant', 'sedu', 'propagand', 'tv']);
  def('terrore', 'Terrore', 'S', 'fear', 'skull', [2, 3, 4], [10, 9, 8], { r: [8, 9, 10], dur: [3, 3.6, 4.2] }, 'Chi ti sta attorno scappa.', ['terror', 'paura', 'orrore', 'urlo', 'spavent', 'incubo']);
  def('catene', 'Catene', 'S', 'root', 'chain', [2, 3, 4], [9, 8, 7], { range: 10, half: 0.6, dur: [1.6, 2.1, 2.6], dmg: [10, 14, 18] }, 'Blocca sul posto chi hai davanti.', ['caten', 'radic', 'blocc', 'immobil', 'ragnatel', 'legac', 'paralis']);
  def('presa', 'Presa', 'S', 'pull', 'hook', [2, 3, 4], [8, 7, 6], { range: [14, 16, 18], dmg: [16, 22, 28], stun: 0.8 }, 'Agganci un nemico e lo tiri a te.', ['presa', 'tentacol', 'gancio', 'rampin', 'tira', 'frusta', 'cavi']);
  def('spinta', 'Spinta', 'S', 'push', 'push', [1, 2, 3], [6, 5.5, 5], { range: 8, half: 0.7, dmg: [14, 18, 22], knock: [16, 19, 22] }, 'Scaraventi via chi hai davanti.', ['spinta', 'respin', 'telecines', 'forza', 'raffic', 'urto']);
  def('evoca', 'Evoca', 'S', 'summon', 'summon', [2, 3, 4], [16, 15, 14], { n: [2, 3, 4], dur: 12, hp: 40, dmg: [8, 9, 10] }, 'Chiami spiriti che combattono al tuo fianco.', ['evoca', 'necromant', 'servi', 'minion', 'spirit', 'esercit', 'famigl', 'scheletr']);
  def('esca', 'Esca', 'S', 'decoy', 'clone', [2, 3, 4], [14, 13, 12], { dur: [5, 6, 7], dmg: [30, 40, 50], r: 4 }, 'Una tua copia attira i nemici, poi esplode.', ['esca', 'clone', 'copia', 'illusion', 'doppio', 'ologramm', 'specchio']);
  def('possesso', 'Possesso', 'S', 'possess', 'chip', [2, 3, 4], [10, 9, 8], { dur: [14, 17, 20] }, 'Prendi il controllo di una sentinella. Ripremi per rilasciare.', ['possess', 'hack', 'macchin', 'controll', 'tecno', 'robot', 'tv']);
  def('marchio', 'Marchio', 'S', 'mark', 'mark', [1, 2, 3], [8, 7, 6], { dur: [6, 7, 8], mul: [1.25, 1.35, 1.45] }, 'Il bersaglio marchiato subisce piu danni da tutto.', ['marchi', 'maledi', 'segno', 'preda', 'cacci', 'mirino']);
  def('orbite', 'Orbite', 'S', 'orbit', 'orbit', [2, 3, 4], [12, 11, 10], { dur: [8, 9, 10], dps: [18, 23, 28], r: 2.8 }, 'Sfere che ti girano attorno e feriscono chi si avvicina.', ['orbit', 'sfere', 'satellit', 'lame rotant', 'aura']);
  def('fulmine', 'Colpo dal cielo', 'S', 'strike', 'strike', [2, 3, 4], [7, 6.5, 6], { dmg: [55, 70, 85], r: 3.5, range: 18, delay: 0.7 }, 'Dopo un attimo, un colpo cade dove guardi.', ['cielo', 'meteor', 'fulmin', 'colonn', 'giudizi', 'bombard']);
  def('risucchio', 'Risucchio', 'S', 'drain', 'drain', [2, 3, 4], [10, 9, 8], { dps: [16, 20, 24], dur: 3, range: 14, heal: 0.6 }, 'Un legame che toglie vita al nemico e la da a te.', ['risucch', 'vampir', 'dren', 'succh', 'sifon', 'anima']);
  def('bolla', 'Bolla', 'S', 'bubble', 'bubble', [2, 3, 4], [14, 13, 12], { r: [5, 5.5, 6], dur: [4.5, 5, 5.5], range: 12 }, 'Dentro la bolla il tempo dei nemici quasi si ferma.', ['bolla', 'rallent', 'tempo', 'crono', 'stasi', 'gravit']);
  def('torretta', 'Torretta', 'S', 'sentry', 'turret', [2, 3, 4], [16, 15, 14], { dur: [12, 14, 16], dmg: [7, 9, 11] }, 'Pianti una torretta che spara da sola.', ['torrett', 'ingegner', 'costru', 'macchin', 'sentinell', 'robot']);
  def('onda', 'Onda', 'S', 'wave', 'wave', [2, 3, 4], [6, 5.5, 5], { dmg: [26, 33, 40], range: 20, w: 1.7 }, 'Una lama larga che attraversa tutto in linea.', ['onda', 'falce', 'taglio', 'mezzalun', 'fendent', 'lama di', 'lame di']);
  // --- Supreme
  def('sovraccarico', 'Sovraccarico', 'U', 'oc', 'crown', [3, 4, 5], 1, { dur: [10, 12, 14] }, 'Per un po sei piu forte, piu veloce, e ricarichi il doppio.', ['sovraccar', 'trasform', 'furia', 'forma', 'super', 'demon', 'berserk']);
  def('cataclisma', 'Cataclisma', 'U', 'cata', 'ring', [3, 4, 5], 1, { dmg: [110, 140, 170], r: [12, 13, 14] }, 'Un\'esplosione enorme attorno a te.', ['cataclism', 'apocaliss', 'supernov', 'devast', 'esplos']);
  def('pioggia', 'Pioggia', 'U', 'storm', 'strike', [3, 4, 5], 1, { n: [10, 13, 16], dmg: [45, 52, 60], r: 3.2, area: 9 }, 'Una tempesta di colpi dal cielo sulla zona che guardi.', ['pioggia', 'tempest', 'meteor', 'bombard', 'diluvi']);
  def('dominio', 'Dominio', 'U', 'domin', 'eye', [3, 4, 5], 1, { r: [14, 16, 18], dur: [9, 10, 11] }, 'Tutti quelli attorno a te passano dalla tua parte.', ['domini', 'ipnos', 'mente', 'controll', 'propagand', 'tv', 'folla', 'culto']);
  def('tempo', 'Tempo fermo', 'U', 'timestop', 'bubble', [3, 4, 5], 1, { dur: [3.5, 4.2, 5] }, 'Tutto si ferma tranne te.', ['tempo', 'crono', 'ferma', 'orolog', 'stasi']);
  def('colosso', 'Colosso', 'U', 'giant', 'summon', [3, 4, 5], 1, { dur: [14, 16, 18], hp: [300, 380, 460], dmg: [26, 32, 38] }, 'Evochi un gigante che combatte per te.', ['coloss', 'gigant', 'golem', 'titan', 'evoca', 'bestia']);
  def('eclissi', 'Eclissi', 'U', 'eclipse', 'veil', [3, 4, 5], 1, { dur: [5, 6, 7], dps: [24, 30, 36], heal: [0.35, 0.4, 0.45] }, 'Diventi intoccabile: un\'aura ferisce chi e vicino e ti cura.', ['eclissi', 'intocc', 'spettr', 'immortal', 'aura', 'ombra']);

  // --- Seconda ondata: meccaniche nuove
  def('pompa', 'Rosa di schegge', 'P', 'proj', 'cone', [2, 3, 4], 0.75, { dmg: [7, 8, 9], speed: 30, n: [6, 7, 8], spread: 0.11, life: 0.38 }, 'Tanti colpi a ventaglio, letali da vicino.', ['fucile', 'pompa', 'schegge', 'pallettoni']);
  def('mitraglia', 'Raffica', 'P', 'proj', 'orb', [2, 3, 4], 0.12, { dmg: [4.2, 5, 5.8], speed: 40, n: 1, jit: 0.06 }, 'Colpi piccoli e velocissimi.', ['mitragli', 'raffica', 'minigun', 'automatic']);
  def('razzo', 'Razzo', 'P', 'proj', 'strike', [2, 3, 4], 1.0, { dmg: [30, 38, 46], speed: 20, n: 1, boom: [3, 3.5, 4] }, 'Lento, ma esplode dove colpisce.', ['razzo', 'missile', 'bazooka', 'lanciarazz']);
  def('boomerang', 'Boomerang', 'P', 'proj', 'wave', [2, 3, 4], 0.8, { dmg: [14, 17, 20], speed: 22, n: 1, back: 1, pierce: 1, life: 0.6 }, 'Attraversa tutti, poi torna indietro.', ['boomerang', 'chakram', 'scudo lanciat']);
  def('rimbalzo', 'Sfera pazza', 'P', 'proj', 'orbit', [2, 3, 4], 0.45, { dmg: [12, 14, 16], speed: 26, n: 1, bnc: 3, life: 2.2 }, 'Rimbalza sui muri fino a tre volte.', ['rimbalz', 'palla', 'biliard']);
  def('globo', 'Globo lento', 'P', 'proj', 'ring', [2, 3, 4], 1.4, { dmg: [5, 6, 7], speed: 6, n: 1, aura: [2.6, 3, 3.4], pierce: 1, life: 4 }, 'Una sfera lenta che brucia tutto cio che sfiora.', ['globo', 'sfera lenta', 'plasma']);
  def('frusta', 'Frusta', 'P', 'melee', 'hook', [1, 2, 3], 0.5, { dmg: [14, 17, 20], range: 7.5, half: 0.28 }, 'Colpisce lontano, in linea stretta.', ['frusta', 'lingua', 'coda']);
  def('martello', 'Maglio', 'P', 'melee', 'push', [2, 3, 4], 0.95, { dmg: [40, 50, 60], range: 3.8, half: 1.2, stun: 0.35 }, 'Lento e pesante: stordisce chi prende.', ['maglio', 'mazza', 'clava']);
  def('lancia', 'Raggio lungo', 'P', 'beam', 'beam', [2, 3, 4], 0, { dps: [20, 25, 30], range: [30, 34, 38] }, 'Un fascio sottile che arriva lontanissimo.', ['cecchin', 'precisione', 'da lontano']);
  def('getto', 'Getto', 'P', 'cone', 'cone', [2, 3, 4], 0, { dps: [32, 40, 48], range: [12, 13, 14], half: 0.2 }, 'Un getto stretto e lungo.', ['getto', 'idrante', 'spruzzo']);
  def('rampino', 'Rampino', 'M', 'leap', 'hook', [1, 2, 3], [4, 3.5, 3], { range: [18, 22, 26], dmg: 0, r: 2, flat: 1 }, 'Ti tiri in un attimo nel punto che guardi.', ['rampin', 'grappin', 'ragnatel', 'liana']);
  def('passo', 'Passo d\'ombra', 'M', 'behind', 'blink', [2, 3, 4], [6, 5, 4], { range: [16, 18, 20], dmg: [20, 28, 36] }, 'Compari alle spalle del bersaglio e lo colpisci.', ['spalle', 'agguato', 'pugnal']);
  def('scia', 'Scia', 'M', 'dash', 'dash', [2, 3, 4], [5, 4.5, 4], { dist: [10, 12, 14], dmg: [10, 14, 18], trail: [10, 13, 16] }, 'Uno scatto che lascia a terra una scia che brucia.', ['scia', 'cometa', 'moto']);
  def('carica', 'Carica', 'M', 'dash', 'push', [2, 3, 4], [6, 5.5, 5], { dist: [13, 15, 17], dmg: [30, 40, 50] }, 'Una carica lunga che travolge.', ['toro', 'travolg', 'ariete', 'sfond']);
  def('ritirata', 'Ritirata', 'M', 'backflip', 'leap', [2, 3, 4], [6, 5.5, 5], { dist: 9, dmg: [35, 45, 55], r: 4 }, 'Salti indietro lasciando un\'esplosione dove eri.', ['ritirat', 'capriol', 'all\'indietro']);
  def('riavvolgi', 'Riavvolgi', 'M', 'rewind', 'bubble', [3, 4, 5], [14, 12, 10], { back: 3 }, 'Torni dove eri tre secondi fa, con la vita di allora.', ['riavvolg', 'rewind', 'indietro nel tempo']);
  def('ancora', 'Ancora', 'M', 'anchor', 'mark', [2, 3, 4], [8, 7, 6], { dmg: [25, 35, 45], r: 4 }, 'Lasci un segno a terra. Ripremi per tornarci.', ['ancora', 'richiamo', 'punto di ritorno']);
  def('tentacolo', 'Tentacolo', 'S', 'grab', 'hook', [2, 3, 4], [8, 7, 6], { range: [14, 16, 18], dmg: [30, 40, 50], r: [3.5, 4, 4.5], hold: 3 }, 'Afferri un nemico e lo tieni sospeso. Ripremi per scagliarlo dove guardi.', ['tentacol', 'afferr', 'aggrapp', 'sbatt', 'scagli', 'telecines']);
  def('scambio', 'Scambio', 'S', 'swap', 'blink', [1, 2, 3], [7, 6, 5], { range: [18, 22, 26], dmg: [12, 18, 24], stun: 0.8 }, 'Ti scambi di posto col bersaglio.', ['scambi', 'sostitu']);
  def('pozzo', 'Pozzo', 'S', 'zone', 'ring', [3, 4, 5], [13, 12, 11], { dps: [8, 10, 12], r: [5, 5.5, 6], dur: [3.5, 4, 4.5], range: 14, pull: 1 }, 'Un vortice che risucchia i nemici verso il centro.', ['vortic', 'gravit', 'pozzo', 'calamit']);
  def('barriera', 'Barriera', 'S', 'zone', 'shield', [2, 3, 4], [12, 11, 10], { dps: 0, r: [3.5, 4, 4.5], dur: [5, 6, 7], range: 3, ward: 1 }, 'Una cupola che ferma i proiettili nemici.', ['cupola', 'campo di forza']);
  def('totem', 'Totem di cura', 'S', 'zone', 'heal', [2, 3, 4], [14, 13, 12], { dps: 0, r: [4, 4.5, 5], dur: [6, 7, 8], range: 3, heal: [7, 9, 11] }, 'Un cerchio che cura te e gli alleati che ci stanno dentro.', ['totem', 'fontana', 'santuari']);
  def('stendardo', 'Stendardo', 'S', 'zone', 'crown', [2, 3, 4], [14, 13, 12], { dps: 0, r: [5, 5.5, 6], dur: [7, 8, 9], range: 3, fury: [1.25, 1.32, 1.4] }, 'Dentro il cerchio fai piu danno.', ['stendard', 'bandier', 'vessill', 'grido']);
  def('sisma', 'Sisma', 'S', 'quake', 'wave', [2, 3, 4], [7, 6.5, 6], { dmg: [28, 36, 44], r: 3, n: [4, 5, 6] }, 'Una fila di scoppi che corre in avanti.', ['sisma', 'terremot', 'crepa', 'spunton']);
  def('grappolo', 'Grappolo', 'S', 'cluster', 'trap', [2, 3, 4], [10, 9, 8], { dmg: [30, 38, 46], r: 3.2, stun: 0.8, n: 3 }, 'Tre mine sparse a ventaglio.', ['grappol', 'campo minat']);
  def('meteora', 'Meteora', 'S', 'strike', 'strike', [3, 4, 5], [11, 10, 9], { dmg: [100, 125, 150], r: [5, 5.5, 6], range: 20, delay: 1.5 }, 'Lenta ad arrivare, enorme quando cade.', ['asteroid', 'macigno']);
  def('polimorfo', 'Polimorfo', 'S', 'poly', 'clone', [2, 3, 4], [12, 11, 10], { dur: [4, 5, 6] }, 'Il bersaglio diventa piccolo e innocuo.', ['polimorf', 'pecora', 'rana', 'rimpicciol']);
  def('levita', 'Levitazione', 'S', 'lift', 'arc', [2, 3, 4], [10, 9, 8], { range: 10, half: 0.7, dur: [1.8, 2.2, 2.6], dmg: [20, 28, 36] }, 'Sollevi chi hai davanti, poi lo lasci cadere.', ['levit', 'solleva', 'antigravit']);
  def('specchio', 'Specchio', 'S', 'reflect', 'shield', [2, 3, 4], [11, 10, 9], { dur: [3, 3.5, 4], thorns: [0.6, 0.8, 1] }, 'I proiettili tornano al mittente, chi ti colpisce si fa male.', ['specchi', 'riflett', 'spine', 'contrattacc']);
  def('gabbia', 'Gabbia', 'S', 'snare', 'chain', [2, 3, 4], [11, 10, 9], { range: 14, r: [4, 4.5, 5], dur: [2, 2.5, 3] }, 'Blocca sul posto tutti quelli nel cerchio che guardi.', ['gabbia', 'prigion', 'intrappol']);
  def('provoca', 'Provocazione', 'S', 'taunt', 'skull', [1, 2, 3], [10, 9, 8], { r: [10, 11, 12], abs: [10, 13, 16] }, 'Tutti ti attaccano, e ogni nemico ti da un po di scudo.', ['provoc', 'sfida']);
  def('sacrificio', 'Sacrificio', 'S', 'sacr', 'drain', [1, 2, 3], [12, 11, 10], { dur: 6, mul: [1.4, 1.5, 1.6], hp: 18 }, 'Paghi vita per colpire molto piu forte.', ['sacrific', 'patto']);
  def('adrenalina', 'Adrenalina', 'S', 'reset', 'speed', [2, 3, 4], [20, 17, 14], {}, 'Azzera le ricariche degli altri poteri.', ['adrenal', 'secondo fiato']);
  def('gemello', 'Gemello', 'S', 'summon', 'clone', [3, 4, 5], [18, 17, 16], { n: 1, dur: 14, hp: [140, 180, 220], dmg: [16, 20, 24] }, 'Una tua copia forte che combatte per te.', ['gemell', 'sosia']);
  def('schiera', 'Schiera di cloni', 'S', 'decoys', 'clone', [3, 4, 5], [16, 15, 14], { n: 3, dur: [4, 5, 6], dmg: [22, 28, 34], r: 3.5 }, 'Tre copie attorno a te che attirano e poi esplodono.', ['schiera', 'cloni']);
  def('singolarita', 'Singolarita', 'U', 'zone', 'ring', [3, 4, 5], 1, { dps: [20, 25, 30], r: [9, 10, 11], dur: [4, 4.5, 5], range: 16, pull: 2, boom: [90, 115, 140] }, 'Un buco nero che risucchia tutto e poi esplode.', ['singolar', 'buco nero', 'collass', 'implos']);
  def('esercito', 'Esercito', 'U', 'summon', 'summon', [3, 4, 5], 1, { n: [5, 6, 7], dur: 16, hp: 60, dmg: [11, 13, 15] }, 'Una schiera di spiriti scende in campo.', ['orda', 'legione', 'armata']);
  def('meteorite', 'Estinzione', 'U', 'strike', 'strike', [3, 4, 5], 1, { dmg: [240, 300, 360], r: [10, 11, 12], range: 22, delay: 2.2 }, 'Un macigno dal cielo: ci mette un po, cancella tutto.', ['estinzion', 'meteorit', 'impatto']);
  def('ira', 'Ira', 'U', 'rage', 'claw', [3, 4, 5], 1, { dur: [10, 12, 14], mul: [1.6, 1.75, 1.9] }, 'Per un po ogni tuo colpo fa molto piu male.', ['ira ', 'rabbia']);
  def('giudizio', 'Giudizio', 'U', 'judge', 'mark', [3, 4, 5], 1, { r: [18, 20, 22], dmg: [70, 88, 106] }, 'Un colpo dal cielo su ogni nemico che hai attorno.', ['condann', 'sentenz', 'punizion']);
  def('fenice', 'Fenice', 'U', 'phoenix', 'heal', [3, 4, 5], 1, { dur: [20, 25, 30], dmg: [80, 100, 120], r: 8 }, 'Se cadi mentre e attiva, risorgi esplodendo.', ['fenice', 'rinasc', 'risorg']);
  def('turbine', 'Turbine di lame', 'U', 'orbit', 'orbit', [3, 4, 5], 1, { dur: [7, 8, 9], dps: [60, 75, 90], r: 5.5 }, 'Una tempesta di lame ti gira attorno.', ['turbine', 'tritatutto']);
  def('baluardo', 'Baluardo', 'U', 'shield', 'shield', [3, 4, 5], 1, { abs: [180, 230, 280], dur: 8 }, 'Uno scudo enorme per pochi secondi.', ['baluard', 'invulner', 'fortezza']);

  // Innesti: un secondo mattoncino che si attacca a qualsiasi potere e ne cambia il comportamento. Costano un punto.
  const MOD = {
    rapido: { nome: 'Rapido', desc: 'Ricarica piu corta, colpo un po piu debole.', kw: ['rapid', 'veloce'] }, possente: { nome: 'Possente', desc: 'Colpo piu forte, ricarica piu lunga.', kw: ['possent', 'potent'] },
    ampio: { nome: 'Ampio', desc: 'Raggio e portata piu grandi.', kw: ['ampio', 'enorme'] }, eco: { nome: 'Eco', desc: 'Il potere si ripete da solo poco dopo.', kw: [' eco', 'ripet'] },
    esplosivo: { nome: 'Esplosivo', desc: 'Ogni colpo scoppia e ferisce chi sta vicino.', kw: ['esplosiv', 'scoppi'] }, rimbalzo: { nome: 'A rimbalzo', desc: 'Ogni colpo salta a un secondo nemico.', kw: ['rimbalza', 'salta da'] },
    vampirico: { nome: 'Vampirico', desc: 'Una parte del danno torna a te come vita.', kw: ['vampiric', 'ruba vita'] }, critico: { nome: 'Critico', desc: 'Un colpo su quattro fa il doppio.', kw: ['critic', 'fortun'] },
    calamita: { nome: 'Calamita', desc: 'Chi viene colpito e tirato verso di te.', kw: ['attira', 'magnet'] }, marchiante: { nome: 'Marchiante', desc: 'Chi viene colpito subisce piu danni per un po.', kw: ['marchia'] },
    ammazzagiganti: { nome: 'Ammazzagiganti', desc: 'Piu danno a boss e bruti.', kw: ['gigant', 'boss'] }, falciante: { nome: 'Falciante', desc: 'Piu danno ai nemici piccoli.', kw: ['falcia', 'folle di nemici'] },
    risonante: { nome: 'Risonante', desc: 'La Risonanza si carica il doppio.', kw: ['risonan'] }, stordente: { nome: 'Stordente', desc: 'I colpi secchi stordiscono un istante.', kw: ['stordi'] },
    contagio: { nome: 'Contagio', desc: 'Chi muore scoppia e ferisce i vicini.', kw: ['contagi', 'epidemi'] }, persistente: { nome: 'Persistente', desc: 'I colpi lasciano a terra una chiazza che brucia.', kw: ['persist', 'chiazz'] },
    benedetto: { nome: 'Benedetto', desc: 'Colpendo accumuli un po di scudo.', kw: ['benedett'] }, frenetico: { nome: 'Frenetico', desc: 'Ogni colpo accorcia le altre ricariche.', kw: ['frenetic'] },
  };
  const MODS = Object.keys(MOD);
  const ARCH = {}; for (const a of A) ARCH[a.id] = a;
  // ---------- Linguaggio dei poteri: una meccanica e' un piccolo programma scritto a mano ----------
  function splitTop(src, sep) { const out = []; let d = 0, cur = ''; for (const ch of src) { if (ch === '(') d++; else if (ch === ')') d--; if (ch === sep && d === 0) { out.push(cur); cur = ''; } else cur += ch; } out.push(cur); return out; }
  const num = (t) => (t.indexOf('/') > 0 ? t.split('/').map(Number) : Number(t));
  const PROGRAM_OPS = new Set(('circ cone line ring tgt near shot zone sum dash blink leap buff trig chain pop rep if nth heal res cost cdr freeze mem ret aim wait absorb release magnet transmute link debt disarm silence cleanse infect portal tether barrier mimic rewindfoe revive command form phase flight possess pact stasis').split(' '));
  function parseProg(src) {
    const out = [];
    for (const st of splitTop(src, ';')) {
      const toks = splitTop(st.trim(), ' ').filter(Boolean); if (!toks.length) continue; const nth = /^nth(\d+)$/.exec(toks[0]), o = nth ? { op: 'nth', n: Number(nth[1]) } : { op: toks[0] };
      if (!PROGRAM_OPS.has(o.op)) throw new Error('Operatore sconosciuto: ' + o.op);
      for (let i = 1; i < toks.length; i++) {
        const t = toks[i], pi = t.indexOf('(');
        if (pi > 0 && t[t.length - 1] === ')') { o[t.slice(0, pi)] = parseProg(t.slice(pi + 1, -1)); continue; }
        if (t[0] === '@') { o.at = t.slice(1); continue; }
        const m = /^([a-z]+?)(-?\.?\d[\d.]*(?:\/-?\.?\d[\d.]*)*)(?::(-?\.?\d[\d.\/]*))?$/.exec(t);
        if (m) { o[m[1]] = num(m[2]); if (m[3] !== undefined) o[m[1] + '2'] = num(m[3]); } else o[t] = true;
      }
      out.push(o);
    }
    return out;
  }
  const tierOf = (v, t) => (Array.isArray(v) ? (typeof v[0] === 'number' ? v[Math.min(v.length, t) - 1] : v.map((x) => tierOf(x, t))) : v && typeof v === 'object' ? Object.keys(v).reduce((o, k) => { o[k] = tierOf(v[k], t); return o; }, {}) : v);
  const ICOP = { circ: 'ring', cone: 'cone', line: 'beam', ring: 'ring', tgt: 'mark', near: 'mark', shot: 'orb', zone: 'zone', sum: 'summon', dash: 'dash', blink: 'blink', leap: 'leap', buff: 'shield', trig: 'crown', chain: 'bolt', pop: 'strike', rep: 'wave', heal: 'heal', cost: 'drain', if: 'eye', nth: 'orb', mem: 'mark', freeze: 'bubble', res: 'crown', cdr: 'speed', ret: 'blink' };
  const COSTS = { a: [1, 2, 3], b: [2, 3, 4], c: [3, 4, 5] }, SIG = {};
  const slug = (n) => n.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  const STOP = { della: 1, dello: 1, delle: 1, degli: 1, nella: 1, sulla: 1, dalla: 1, quello: 1, quelli: 1, questo: 1, tutti: 1, tutto: 1, dove: 1, dopo: 1, prima: 1, verso: 1, ogni: 1, loro: 1, anche: 1, mentre: 1, quando: 1, molto: 1, poco: 1, sono: 1, come: 1, intorno: 1, attorno: 1, davanti: 1, nemico: 1, nemici: 1, colpo: 1, colpi: 1, secondi: 1, punto: 1, guardi: 1 };
  const errors = [];
  function load(text) { // una riga per meccanica: SLOT|Nome|costo|ricarica|Descrizione|programma
    for (const raw of text.split('\n')) {
      const line = raw.trim(); if (!line || line[0] === '#') continue;
      const f = line.split('|'); if (f.length !== 6) { errors.push('campi: ' + line.slice(0, 50)); continue; }
      const [slot, nome, co, cd, desc, src] = f.map((x) => x.trim()), id = slug(nome);
      if (ARCH[id]) { errors.push('nome doppio: ' + nome); continue; }
      let prog; try { prog = parseProg(src); } catch (e) { errors.push('programma: ' + nome + ': ' + e.message); continue; }
      if (!prog.length || !COSTS[co] || !'PMSU'.includes(slot)) { errors.push('riga non valida: ' + nome); continue; }
      const sig = slot + ':' + src.replace(/-?\.?\d[\d.\/:]*/g, '#');
      if (SIG[sig]) { errors.push('stessa struttura di ' + SIG[sig] + ': ' + nome); continue; } SIG[sig] = nome;
      const kw = (nome + ' ' + desc).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/[^a-z]+/).filter((w) => w.length > 3 && !STOP[w]).map((w) => (w.length > 6 ? w.slice(0, 6) : w));
      const a = { id, nome, slot, kind: 'x', ic: ICOP[prog[0].op] || 'orb', cost: COSTS[co], cd: slot === 'U' ? 1 : num(cd), p: {}, prog, src, desc, kw: Array.from(new Set(kw)) };
      A.push(a); ARCH[id] = a;
    }
  }
  const SLOTS = ['P', 'M', 'S', 'S', 'U'], SLOT_NAME = { P: 'Primario', M: 'Mobilita', S: 'Abilita', U: 'Suprema' };
  const val = (v, t) => (Array.isArray(v) ? v[t - 1] : v);
  // parametri effettivi di un mattoncino al suo grado
  const BAL = {}, DK = { d: 1, dps: 1, boom: 1, fling: 1, orbit: 1 }, DK0 = { dmg: 1, dps: 1, boom: 1, trail: 1 };
  const scaleProg = (v, f) => (Array.isArray(v) ? v.map((x) => scaleProg(x, f)) : v && typeof v === 'object' ? Object.keys(v).reduce((o, k) => { o[k] = DK[k] && typeof v[k] === 'number' ? Math.round(v[k] * f * 100) / 100 : scaleProg(v[k], f); return o; }, {}) : v);
  function balance(map) { for (const k in map) BAL[k] = map[k]; }
  function params(b, raw) { const a = ARCH[b.id], o = { cd: val(a.cd, b.t) }, f = raw ? 1 : BAL[b.id] || 1; for (const k in a.p) { o[k] = val(a.p[k], b.t); if (f !== 1 && DK0[k] && typeof o[k] === 'number') o[k] *= f; } if (a.prog) { o.prog = tierOf(a.prog, b.t); if (f !== 1) o.prog = scaleProg(o.prog, f); } return o; }
  const cost = (r) => r.slots.reduce((s, b) => s + ARCH[b.id].cost[b.t - 1] + (b.m ? 1 : 0), 0);
  const budgetFor = (level) => Math.min(24, 12 + 2 * level);
  const FAME_STEPS = [0, 25, 60, 110, 170, 240, 320];
  const levelFor = (fame) => { let l = 0; while (l < FAME_STEPS.length - 1 && fame >= FAME_STEPS[l + 1]) l++; return l; };

  const R = (nome, desc, ...s) => ({ nome, desc, slots: s.map(([id, el, t]) => ({ id, el, t })) });
  const PRESETS = [
    R('Il Segnale', 'Corrente, schermi e folle ipnotizzate.', ['catena', 'folgore', 1], ['condotto', 'folgore', 1], ['ipnosi', 'folgore', 1], ['possesso', 'folgore', 1], ['sovraccarico', 'folgore', 1]),
    R('Brace', 'Brucia tutto quello che ha vicino.', ['soffio', 'fuoco', 1], ['salto', 'fuoco', 1], ['nova', 'fuoco', 1], ['zona', 'fuoco', 1], ['cataclisma', 'fuoco', 1]),
    R('Brina', 'Rallenta, blocca, ferma il tempo.', ['dardo', 'gelo', 2], ['scatto', 'gelo', 1], ['catene', 'gelo', 1], ['bolla', 'gelo', 1], ['tempo', 'gelo', 1]),
    R('Tenebra', 'Colpisce da nascosta e sparisce.', ['artigli', 'ombra', 2], ['velo', 'ombra', 1], ['terrore', 'ombra', 1], ['esca', 'ombra', 1], ['eclissi', 'ombra', 1]),
    R('Mefite', 'Mine, veleno e servi.', ['mortaio', 'veleno', 1], ['corsa', 'veleno', 1], ['trappola', 'veleno', 2], ['evoca', 'veleno', 1], ['pioggia', 'veleno', 1]),
    R('Aureola', 'Protegge, cura, chiama un gigante.', ['raggio', 'luce', 1], ['balzo', 'luce', 1], ['scudo', 'luce', 1], ['cura', 'luce', 1], ['colosso', 'luce', 1]),
    R('Cremisi', 'Piu colpisce, piu vive.', ['artigli', 'sangue', 2], ['scatto', 'sangue', 2], ['risucchio', 'sangue', 1], ['marchio', 'sangue', 1], ['sovraccarico', 'sangue', 1]),
    R('Maestrale', 'Tiene tutti lontani.', ['sciame', 'vento', 1], ['corsa', 'vento', 2], ['spinta', 'vento', 1], ['onda', 'vento', 1], ['dominio', 'vento', 1]),
  ];
  const DEFAULTS = { folgore: 0, fuoco: 1, gelo: 2, ombra: 3, veleno: 4, luce: 5, sangue: 6, vento: 7 };

  // Porta una ricetta dentro il budget: prima abbassa i gradi, poi (se serve) sostituisce coi mattoncini piu economici.
  function fit(r, budget) {
    let guard = 60;
    while (cost(r) > budget && guard--) {
      let b = null; for (const x of r.slots) if (x.t > 1 && (!b || ARCH[x.id].cost[x.t - 1] > ARCH[b.id].cost[b.t - 1])) b = x;
      if (b) b.t--; else break;
    }
    for (const x of r.slots) { if (cost(r) <= budget) break; if (x.m) delete x.m; }
    return r;
  }
  function upgrade(r, budget, rand) {
    let guard = 40;
    while (guard--) { const c = r.slots.filter((b) => b.t < 3 && cost(r) - ARCH[b.id].cost[b.t - 1] + ARCH[b.id].cost[b.t] <= budget); if (!c.length) break; c[Math.floor((rand ? rand() : 0) * c.length)].t++; }
    return r;
  }
  // Tipi di personaggio generici: una parola sola basta a suggerire elemento e mattoncini.
  const CLASSI = [
    [['vampir'], 'sangue', ['artigli', 'balzo', 'risucchio', 'evoca', 'eclissi']], [['ninja', 'shinobi'], 'ombra', ['artigli', 'velo', 'esca', 'trappola', 'eclissi']], [['assassin', 'sicari'], 'ombra', ['artigli', 'velo', 'marchio', 'esca', 'eclissi']],
    [['paladin', 'cavalier', 'templar'], 'luce', ['artigli', 'scatto', 'scudo', 'cura', 'colosso']], [['necromant', 'negromant'], 'ombra', ['sciame', 'balzo', 'evoca', 'risucchio', 'colosso']], [['drago', 'dragon'], 'fuoco', ['soffio', 'salto', 'nova', 'terrore', 'cataclisma']],
    [['mago', 'maga', 'stregon', 'incantat'], 'folgore', ['dardo', 'balzo', 'fulmine', 'zona', 'pioggia']], [['strega', 'fattucchier'], 'veleno', ['sciame', 'balzo', 'zona', 'marchio', 'dominio']], [['robot', 'androide', 'cyborg', 'mecha'], 'folgore', ['raggio', 'scatto', 'scudo', 'torretta', 'sovraccarico']],
    [['angel', 'serafin'], 'luce', ['raggio', 'salto', 'cura', 'fulmine', 'colosso']], [['demon', 'diavol'], 'fuoco', ['artigli', 'balzo', 'terrore', 'nova', 'sovraccarico']], [['pirat', 'corsar'], 'vento', ['dardo', 'scatto', 'presa', 'trappola', 'pioggia']],
    [['samurai', 'ronin', 'spadaccin'], 'vento', ['artigli', 'scatto', 'onda', 'marchio', 'tempo']], [['cecchin', 'tirator', 'arcier', 'pistoler'], 'vento', ['dardo', 'scatto', 'marchio', 'trappola', 'pioggia']], [['licantrop', 'lupo mannar', 'bestia'], 'sangue', ['artigli', 'salto', 'terrore', 'marchio', 'sovraccarico']],
    [['ingegner', 'inventor', 'meccanic'], 'folgore', ['dardo', 'corsa', 'torretta', 'trappola', 'colosso']], [['berserk', 'barbar', 'vichingh'], 'sangue', ['artigli', 'salto', 'nova', 'spinta', 'sovraccarico']], [['sciaman', 'druid'], 'veleno', ['sciame', 'corsa', 'evoca', 'cura', 'colosso']],
    [['monac', 'lottator', 'pugil'], 'vento', ['artigli', 'scatto', 'spinta', 'scudo', 'sovraccarico']], [['bard', 'cantant', 'idol', 'present', 'conduttor'], 'luce', ['onda', 'corsa', 'ipnosi', 'terrore', 'dominio']], [['alchimist', 'scienziat'], 'veleno', ['mortaio', 'corsa', 'zona', 'bolla', 'pioggia']],
    [['spettr', 'fantasm'], 'ombra', ['sciame', 'velo', 'terrore', 'risucchio', 'eclissi']], [['golem', 'gigant', 'titan'], 'gelo', ['artigli', 'salto', 'nova', 'scudo', 'cataclisma']], [['hacker', 'tecnomant'], 'folgore', ['catena', 'condotto', 'possesso', 'torretta', 'tempo']],
    [['regin', 'imperator', 'tirann', 're '], 'gelo', ['onda', 'balzo', 'catene', 'evoca', 'dominio']], [['ragn', 'aracn'], 'veleno', ['sciame', 'salto', 'catene', 'trappola', 'pioggia']], [['telecinet', 'psichic', 'mentalist'], 'ombra', ['onda', 'balzo', 'spinta', 'presa', 'dominio']],
    [['velocist', 'corridor'], 'folgore', ['artigli', 'corsa', 'orbite', 'spinta', 'tempo']], [['guaritor', 'chieric', 'sacerdot'], 'luce', ['raggio', 'corsa', 'cura', 'scudo', 'colosso']], [['piromant', 'incendiari'], 'fuoco', ['soffio', 'scatto', 'zona', 'fulmine', 'cataclisma']],
  ];
  // Dalla descrizione scritta alla ricetta: conta le parole chiave. Non conosce i nomi dei personaggi, solo cio' che fanno.
  function fromText(text, budget) {
    const t = ' ' + (text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') + ' ';
    let el = null, es = 0; const elScores = {};
    for (const k in ELEM) { let n = 0; for (const w of ELEM[k].kw) if (t.includes(w)) n++; elScores[k] = n; if (n > es) { es = n; el = k; } }
    const sug = {}; let clsEl = null; const clsHit = [];
    for (const [words, cel, ids] of CLASSI) if (words.some((w) => t.includes(w))) { clsHit.push(words[0]); if (!clsEl) clsEl = cel; for (const id of ids) sug[id] = (sug[id] || 0) + 1.5; }
    if (!es && clsEl) el = clsEl;
    const hits = (a) => a.kw.reduce((n, w) => n + (t.includes(w) ? 2 : 0), 0) + (sug[a.id] || 0);
    const base = PRESETS[DEFAULTS[el || 'folgore']], used = new Set(), slots = [], found = [];
    SLOTS.forEach((sl, i) => {
      let best = null, bs = 0;
      for (const a of A) { if (a.slot !== sl || used.has(a.id)) continue; const h = hits(a); if (h > bs) { bs = h; best = a; } }
      const id = best ? best.id : used.has(base.slots[i].id) ? A.find((a) => a.slot === sl && !used.has(a.id)).id : base.slots[i].id;
      used.add(id); if (best && best.kw.some((w) => t.includes(w))) found.push(best.nome);
      slots.push({ id, el: el || 'folgore', t: 1 });
    });
    for (const m of MODS) if (MOD[m].kw.some((w) => t.includes(w))) { slots[0].m = m; found.push('innesto ' + MOD[m].nome); break; }
    const r = upgrade(fit({ nome: '', desc: '', slots }, budget), budget, null);
    return { recipe: r, elem: el, found, tipo: clsHit.length > 0 };
  }
  function randomRecipe(rand, budget) {
    const els = Object.keys(ELEM), el = els[Math.floor(rand() * els.length)], used = new Set();
    const slots = SLOTS.map((sl) => { const c = A.filter((a) => a.slot === sl && !used.has(a.id)), a = c[Math.floor(rand() * c.length)]; used.add(a.id); const o = { id: a.id, el: rand() < 0.75 ? el : els[Math.floor(rand() * els.length)], t: 1 }; if (rand() < 0.45) o.m = MODS[Math.floor(rand() * MODS.length)]; return o; });
    return upgrade(fit({ nome: '', desc: '', slots }, budget), budget, rand);
  }
  function valid(r) {
    if (!r || !Array.isArray(r.slots) || r.slots.length !== 5) return false;
    return r.slots.every((b, i) => b && ARCH[b.id] && ARCH[b.id].slot === SLOTS[i] && ELEM[b.el] && b.t >= 1 && b.t <= 3 && (!b.m || !!MOD[b.m]));
  }

  // ---------- Boss: attacchi segnalati a terra, come dati ----------
  // shape: circle (cerchio sul bersaglio), line (corsia dal boss), cone (ventaglio), ring (anello che si allarga), rain (piu cerchi), summon, charge (il boss percorre la corsia), pools (pozze che restano)
  const ATK = {
    schianto: { shape: 'circle', r: 5, wind: 1.05, dmg: 28, nome: 'Schianto' },
    corsia: { shape: 'line', len: 26, w: 3.2, wind: 0.95, dmg: 24, nome: 'Corsia di brace' },
    carica: { shape: 'charge', len: 24, w: 4.2, wind: 1.1, dmg: 32, nome: 'Carica' },
    pioggia: { shape: 'rain', n: 7, r: 3.2, wind: 0.9, gap: 0.22, spread: 8, dmg: 20, nome: 'Pioggia di tizzoni' },
    anello: { shape: 'ring', r1: 22, speed: 11, band: 1.7, wind: 0.8, dmg: 22, nome: 'Anello' },
    sgherri: { shape: 'summon', n: 3, wind: 0.8, nome: 'Chiama gli sgherri' },
    trimorso: { shape: 'cone', n: 3, half: 0.26, gapA: 0.9, range: 19, wind: 1.15, dmg: 26, nome: 'Tre morsi' },
    spazzata: { shape: 'sweep', n: 6, len: 24, w: 2.4, wind: 0.7, gap: 0.3, arc: 1.9, dmg: 22, nome: 'Spazzata' },
    latrato: { shape: 'ring', r1: 20, speed: 9, band: 1.7, wind: 0.7, dmg: 18, nome: 'Latrato' },
    croce: { shape: 'cross', len: 24, w: 3, wind: 1.0, dmg: 24, nome: 'Croce' },
    picchiata: { shape: 'charge', len: 34, w: 4.5, wind: 1.0, dmg: 30, nome: 'Picchiata' },
    pozze: { shape: 'pools', n: 3, r: 3.6, wind: 0.8, dur: 9, dps: 9, spread: 7, nome: 'Pozze di veleno' },
    coda: { shape: 'cone', n: 1, half: 1.15, range: 9, wind: 0.8, dmg: 26, nome: 'Colpo di coda' },
    spirale: { shape: 'rings', n: 3, r1: 20, speed: 10, band: 1.5, wind: 0.6, gap: 0.9, dmg: 16, nome: 'Spirale' },
  };
  const BOSSES = {
    malacoda: { nome: 'Malacoda', titolo: 'il Fornaio', hp: 3600, r: 2.6, move: 'walk', speed: 2.6, el: 'fuoco', touch: 14, fame: 30,
      fasi: [{ fino: 0.62, seq: ['schianto', 'corsia', 'schianto', 'sgherri'], pausa: 1.5 }, { fino: 0.3, seq: ['schianto', 'pioggia', 'carica', 'corsia'], pausa: 1.2 }, { fino: 0, seq: ['pioggia', 'carica', 'anello', 'schianto', 'sgherri'], pausa: 0.9 }] },
    cerbero: { nome: 'Cerbero', titolo: 'il Guardiano', hp: 4200, r: 3.0, move: 'anchor', speed: 0, el: 'ombra', touch: 16, fame: 35,
      fasi: [{ fino: 0.6, seq: ['trimorso', 'latrato', 'trimorso', 'croce'], pausa: 1.4 }, { fino: 0.3, seq: ['spazzata', 'trimorso', 'pioggia', 'latrato'], pausa: 1.1 }, { fino: 0, seq: ['spazzata', 'croce', 'spirale', 'trimorso', 'sgherri'], pausa: 0.8 }] },
    gerione: { nome: 'Gerione', titolo: 'la Frode', hp: 4600, r: 2.4, move: 'fly', speed: 6, el: 'veleno', touch: 12, fame: 40,
      fasi: [{ fino: 0.6, seq: ['picchiata', 'pozze', 'coda', 'picchiata'], pausa: 1.4 }, { fino: 0.3, seq: ['picchiata', 'spirale', 'pozze', 'coda'], pausa: 1.1 }, { fino: 0, seq: ['picchiata', 'pioggia', 'spirale', 'pozze', 'picchiata'], pausa: 0.8 }] },
  };

  return { ELEM, ARCH, MOD, MODS, load, balance, BAL, parseProg, errors, LIST: A, SLOTS, SLOT_NAME, PRESETS, ATK, BOSSES, FAME_STEPS, params, cost, budgetFor, levelFor, fit, upgrade, fromText, randomRecipe, valid };
})();
if (typeof module !== 'undefined') { module.exports = Bricks; const fs = require('fs'); for (const f of fs.readdirSync(__dirname).filter((n) => /^mec\d+\.js$/.test(n)).sort()) new Function('Bricks', "'use strict';" + fs.readFileSync(__dirname + '/' + f, 'utf8'))(Bricks); }
