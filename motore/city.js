'use strict';
// MOTORE - generatore di citta'. Da un seme e un tema esce una citta' intera: strade, piazze, arene, canali, cavi, schermi.
const City = (() => {
  const CELL = 4, N = 44, HALF = (N * CELL) / 2, NODE_H = 11, SAG = 1.4, PERIOD = 6, NB = 8; // 8 strade per asse, 7x7 isolati
  const THEMES = {
    dite: { id: 'dite', nome: 'Dite', sotto: 'la citta rovente', liquido: 'lava', liquidSolid: true, canali: 1, boss: ['malacoda', 'cerbero', 'gerione'],
      quartieri: ['Stige', 'Porta Rovente', 'Flegetonte', 'Le Arche', 'Piazza del Segnale', 'Selva Secca', 'Sabbione', 'Mura di Ferro', 'Burrato'] },
    cocito: { id: 'cocito', nome: 'Cocito', sotto: 'la citta di ghiaccio', liquido: 'ghiaccio', liquidSolid: false, canali: 1, boss: ['cerbero', 'gerione', 'malacoda'],
      quartieri: ['Caina', 'Antenora', 'Tolomea', 'Giudecca', 'Piazza del Gelo', 'Pozzo', 'Lago Fermo', 'Torre Muta', 'Vento Fermo'] },
    malebolge: { id: 'malebolge', nome: 'Malebolge', sotto: 'la citta dei fossi', liquido: 'melma', liquidSolid: true, canali: 2, boss: ['gerione', 'malacoda', 'cerbero'],
      quartieri: ['Prima Bolgia', 'Pece', 'Fosso dei Ladri', 'Ponte Rotto', 'Piazza della Frode', 'Fosso dei Maghi', 'Cappe di Piombo', 'Decima Bolgia', 'Pozzo dei Giganti'] },
  };
  function rng(seed) {
    let s = seed >>> 0;
    return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const cellCenter = (c) => c * CELL - HALF + CELL / 2;
  const bandC = (k) => (PERIOD * k + 1) * CELL - HALF; // centro della strada k
  const isBand = (i) => i % PERIOD < 2;

  function gen(seed, themeId) {
    const theme = THEMES[themeId] || THEMES.dite, rand = rng((seed * 2654435761) ^ 0x9e3779b9), ri = (n) => Math.floor(rand() * n);
    const g = [];
    for (let z = 0; z < N; z++) { const r = []; for (let x = 0; x < N; x++) r.push(isBand(x) || isBand(z) ? '.' : '#'); g.push(r); }
    const blockUse = []; for (let i = 0; i < 49; i++) blockUse.push('');
    const fillBlock = (bx, bz, ch) => { for (let z = 6 * bz + 2; z <= 6 * bz + 5; z++) for (let x = 6 * bx + 2; x <= 6 * bx + 5; x++) g[z][x] = ch; };
    // Piazza centrale con la torre
    fillBlock(3, 3, 'o'); blockUse[3 + 3 * 7] = 'piazza';
    for (let z = 21; z <= 22; z++) for (let x = 21; x <= 22; x++) g[z][x] = '#';
    const spawn = { x: 13, z: bandC(4) };
    // Canali
    const canals = [], bridges = [];
    const mkCanal = (horiz) => {
      const opts = [1, 2, 5, 6].filter((k) => !canals.some((c) => c.horiz === horiz && Math.abs(c.k - k) < 2));
      const k = opts[ri(opts.length)], cross = [0, 1, 2, 3, 4, 5, 6, 7], keep = new Set([ri(3), 3 + ri(2), 5 + ri(3)]);
      while (keep.size < 4) keep.add(ri(8));
      for (let a = 0; a < N; a++) for (const b of [6 * k, 6 * k + 1]) { if (horiz) g[b][a] = '~'; else g[a][b] = '~'; }
      for (const c of cross) if (keep.has(c)) for (const a of [6 * c, 6 * c + 1]) for (const b of [6 * k, 6 * k + 1]) { if (horiz) g[b][a] = '='; else g[a][b] = '='; bridges.push(horiz ? [a, b] : [b, a]); }
      canals.push({ horiz, k });
    };
    const firstH = rand() < 0.5; mkCanal(firstH); if (theme.canali > 1) mkCanal(!firstH);
    // dove due canali si incrociano non c'e' ponte
    if (canals.length > 1) { const h = canals.find((c) => c.horiz), v = canals.find((c) => !c.horiz); for (const z of [6 * h.k, 6 * h.k + 1]) for (const x of [6 * v.k, 6 * v.k + 1]) g[z][x] = '~'; }
    const canalBlocks = (bx, bz) => canals.some((c) => (c.horiz ? c.k === bz + 1 : c.k === bx + 1)); // la banda tra i due isolati dell'arena
    // Arene: due isolati per lato fusi in uno spiazzo
    const arenas = [];
    for (let tries = 0; tries < 900 && arenas.length < 3; tries++) {
      const gap = tries < 500 ? 3 : 2;
      const bx = ri(6), bz = ri(6);
      if (bx >= 2 && bx <= 3 && bz >= 2 && bz <= 3) continue;
      if (canalBlocks(bx, bz)) continue;
      if (arenas.some((a) => Math.abs(a.bx - bx) < gap && Math.abs(a.bz - bz) < gap)) continue;
      for (let z = 6 * bz + 2; z <= 6 * bz + 11; z++) for (let x = 6 * bx + 2; x <= 6 * bx + 11; x++) g[z][x] = 'o';
      for (const [i, j] of [[0, 0], [1, 0], [0, 1], [1, 1]]) blockUse[bx + i + (bz + j) * 7] = 'arena';
      arenas.push({ id: arenas.length, bx, bz, x: (6 * bx + 7) * CELL - HALF, z: (6 * bz + 7) * CELL - HALF, r: 18, boss: theme.boss[arenas.length] });
    }
    // Campi aperti con ostacoli bassi
    const props = [], fields = [];
    for (let n = 0, tries = 0; n < 4 && tries < 200; tries++) {
      const bx = ri(7), bz = ri(7); if (blockUse[bx + bz * 7]) continue;
      blockUse[bx + bz * 7] = 'campo'; fillBlock(bx, bz, 'o'); n++;
      const cx = (6 * bx + 4) * CELL - HALF, cz = (6 * bz + 4) * CELL - HALF; fields.push({ x: cx, z: cz });
      for (const [ox, oz] of [[-4.5, -4.5], [4.5, -4], [-4, 4.5], [4.5, 4.5], [0, 0]]) { if (rand() < 0.2) continue; const w = rand() < 0.5; props.push({ x: cx + ox + (rand() - 0.5), z: cz + oz + (rand() - 0.5), hx: w ? 1.3 : 0.7, hz: w ? 0.7 : 1.3 }); }
    }
    const solid = (x, z) => { if (x < 0 || z < 0 || x >= N || z >= N) return true; const t = g[z][x]; return t === '#' || (t === '~' && theme.liquidSolid); };
    const connected = () => {
      const seen = new Uint8Array(N * N), sx = Math.floor((spawn.x + HALF) / CELL), sz = Math.floor((spawn.z + HALF) / CELL), q = [sx + sz * N]; seen[q[0]] = 1; let n = 0, tot = 0;
      for (let h = 0; h < q.length; h++) { const c = q[h], x = c % N, z = (c / N) | 0; n++; for (const [i, j] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + i, Z = z + j; if (!solid(X, Z) && !seen[X + Z * N]) { seen[X + Z * N] = 1; q.push(X + Z * N); } } }
      for (let z = 0; z < N; z++) for (let x = 0; x < N; x++) if (!solid(x, z)) tot++;
      return n === tot;
    };
    // se un pezzo di citta' resta isolato dai canali, aggiungi ponti finche' non e' tutta raggiungibile
    { const miss = []; for (const c of canals) for (let cr = 0; cr < 8; cr++) miss.push([c, cr]);
      for (let i = miss.length - 1; i > 0; i--) { const k = ri(i + 1), t = miss[i]; miss[i] = miss[k]; miss[k] = t; }
      for (const [c, cr] of miss) { if (connected()) break; if (canals.some((o) => o !== c && o.k === cr)) continue; for (const a of [6 * cr, 6 * cr + 1]) for (const b of [6 * c.k, 6 * c.k + 1]) { if (c.horiz) { if (g[b][a] === '~') g[b][a] = '='; } else if (g[a][b] === '~') g[a][b] = '='; } } }
    // Isolati fusi (strada chiusa tra due palazzi), solo se la citta' resta tutta raggiungibile
    for (let t = 0; t < 9; t++) {
      const bx = ri(7), bz = ri(7), hz = rand() < 0.5, ox = hz ? 1 : 0, oz = hz ? 0 : 1;
      if (bx + ox > 6 || bz + oz > 6 || blockUse[bx + bz * 7] || blockUse[bx + ox + (bz + oz) * 7]) continue;
      const cells = []; for (let a = 0; a < 4; a++) for (let b = 0; b < 2; b++) cells.push(hz ? [6 * bx + 6 + b, 6 * bz + 2 + a] : [6 * bx + 2 + a, 6 * bz + 6 + b]);
      if (cells.some(([x, z]) => g[z][x] !== '.')) continue;
      for (const [x, z] of cells) g[z][x] = '#';
      if (!connected()) for (const [x, z] of cells) g[z][x] = '.'; else { blockUse[bx + bz * 7] = 'mega'; blockUse[bx + ox + (bz + oz) * 7] = 'mega'; }
    }
    // Vicoli: un taglio di una cella dentro un isolato
    for (let t = 0; t < 12; t++) {
      const bx = ri(7), bz = ri(7); if (blockUse[bx + bz * 7]) continue; blockUse[bx + bz * 7] = 'vicolo';
      const off = 3 + ri(2), hz = rand() < 0.5;
      for (let a = 2; a <= 5; a++) { const x = hz ? 6 * bx + a : 6 * bx + off, z = hz ? 6 * bz + off : 6 * bz + a; g[z][x] = '.'; }
    }
    if (!connected()) { if (typeof process !== 'undefined' && process.env.DBG) { console.log(g.map((r) => r.join('')).join('\n')); throw new Error('sconnessa'); } return gen(seed + 7919, themeId); }
    const tileAt = (x, z) => { const cx = Math.floor((x + HALF) / CELL), cz = Math.floor((z + HALF) / CELL); return cx < 0 || cz < 0 || cx >= N || cz >= N ? '#' : g[cz][cx]; };
    const inArena = (x, z, pad = 0) => arenas.some((a) => Math.abs(x - a.x) < 20 + pad && Math.abs(z - a.z) < 20 + pad);
    // Rete dei cavi sugli incroci
    const cand = [], idAt = {};
    for (let j = 0; j < NB; j++) for (let i = 0; i < NB; i++) {
      const x = bandC(i), z = bandC(j), t = tileAt(x, z);
      if (t === '#' || t === '~' || inArena(x, z, -2)) continue;
      if (Math.abs(x) < 14 && Math.abs(z) < 14 && !(i === 4 && j === 4)) { if (rand() < 0.5) continue; }
      if (rand() < 0.22 && !(i === 4 && j === 4)) continue;
      idAt[i + ',' + j] = cand.length; cand.push({ i, j, x, z });
    }
    const clearLine = (a, b) => { const n = Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / 2); for (let k = 1; k < n; k++) { const t = k / n; if (tileAt(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t) === '#') return false; } return true; };
    let E = [];
    for (const a of cand) for (const [di, dj] of [[1, 0], [0, 1]]) for (let s = 1; s <= 2; s++) {
      const b = cand[idAt[a.i + di * s + ',' + (a.j + dj * s)]]; if (b === undefined) continue;
      if (clearLine(a, b)) E.push([cand.indexOf(a), cand.indexOf(b)]);
      break;
    }
    // tieni la componente piu' grande
    const comp = new Int32Array(cand.length).fill(-1); let best = -1, bestN = 0;
    for (let i = 0; i < cand.length; i++) {
      if (comp[i] >= 0) continue; const q = [i]; comp[i] = i;
      for (let h = 0; h < q.length; h++) for (const [a, b] of E) { const o = a === q[h] ? b : b === q[h] ? a : -1; if (o >= 0 && comp[o] < 0) { comp[o] = i; q.push(o); } }
      if (q.length > bestN) { bestN = q.length; best = i; }
    }
    const remap = {}, nodes = [];
    cand.forEach((c, i) => { if (comp[i] === best) { remap[i] = nodes.length; nodes.push({ id: nodes.length, x: c.x, z: c.z, y: NODE_H }); } });
    const edges = E.filter(([a]) => comp[a] === best).map(([a, b]) => [remap[a], remap[b]]);
    const adj = nodes.map(() => []); for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a); }
    // Schermi: quello grande in piazza, gli altri sugli angoli dei palazzi
    const screens = [{ x: 0, z: 0, r: 20, big: true, wx: 0, wz: 0, nx: 0, nz: 1 }];
    const far = (x, z, list, d) => list.every((o) => Math.hypot(o.x - x, o.z - z) > d);
    for (let tries = 0; tries < 300 && screens.length < 9; tries++) {
      const i = ri(NB), j = ri(NB), cx = 6 * i + 2, cz = 6 * j + 2; if (cx >= N || cz >= N || g[cz][cx] !== '#') continue;
      const x = bandC(i), z = bandC(j); if (tileAt(x, z) !== '.' || !far(x, z, screens, tries < 150 ? 40 : 28) || inArena(x, z, 4)) continue;
      const side = rand() < 0.5; // la faccia verso la strada orizzontale o verticale
      screens.push(side ? { x, z, r: 15, wx: cellCenter(cx), wz: cz * CELL - HALF - 0.06, nx: 0, nz: -1 } : { x, z, r: 15, wx: cx * CELL - HALF - 0.06, wz: cellCenter(cz), nx: -1, nz: 0 });
    }
    // Punti di strada liberi (centri delle tratte e incroci)
    const spots = [], crossings = [];
    for (let j = 0; j < NB; j++) for (let i = 0; i < NB; i++) {
      const x = bandC(i), z = bandC(j);
      if (tileAt(x, z) === '.' && !inArena(x, z, 2)) crossings.push({ x, z, i, j });
      if (i < NB - 1) { const mx = x + 12; if (tileAt(mx, z) === '.' && tileAt(mx - 3, z) === '.' && !inArena(mx, z, 2)) spots.push({ x: mx, z }); }
      if (j < NB - 1) { const mz = z + 12; if (tileAt(x, mz) === '.' && tileAt(x, mz - 3) === '.' && !inArena(x, mz, 2)) spots.push({ x, z: mz }); }
    }
    const pickFar = (list, used, dSpawn, dEach, n) => { const out = []; for (let tries = 0; tries < 600 && out.length < n; tries++) { const c = list[ri(list.length)]; if (Math.hypot(c.x - spawn.x, c.z - spawn.z) < dSpawn || !far(c.x, c.z, out, dEach) || !far(c.x, c.z, used, 10)) continue; out.push({ x: c.x, z: c.z }); } return out; };
    const turrets = pickFar(spots, [], 34, 36, 7);
    for (const A of arenas) turrets.push({ x: A.x + 13, z: A.z - 13, arena: A.id }); // una sentinella in ogni arena: chi sa possederla la rivolta contro il boss
    const GN = ['Caronte', 'Minosse', 'Pluto', 'Flegias', 'Chirone', 'Nesso', 'Capaneo'];
    const givers = [{ x: spawn.x - 8, z: spawn.z + 1.6 }].concat(pickFar(crossings, turrets, 38, 44, 5).map((c) => ({ x: c.x + 2.7, z: c.z + 2.7 })));
    givers.forEach((gv, i) => { gv.id = i; gv.nome = GN[i % GN.length]; });
    const patrols = pickFar(spots, turrets.concat(givers), 46, 40, 4);
    const district = (x, z) => theme.quartieri[Math.min(2, Math.floor(((x + HALF) / (2 * HALF)) * 3)) + 3 * Math.min(2, Math.floor(((z + HALF) / (2 * HALF)) * 3))];
    return { seed, theme, CELL, N, HALF, NODE_H, SAG, map: g, spawn, canals, arenas, fields, props, nodes, edges, adj, screens, turrets, givers, patrols, spots, crossings, district, nome: theme.nome };
  }
  return { CELL, N, HALF, NODE_H, SAG, PERIOD, NB, THEMES, rng, gen, cellCenter, bandC };
})();
if (typeof module !== 'undefined') module.exports = City;
