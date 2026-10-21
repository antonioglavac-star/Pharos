// Provjera razina: za svaku razinu traži najmanji broj okretanja ogledala
// koji osvjetljava sve brodove i uspoređuje ga s "par" vrijednošću.
// Pokretanje: node tools/check-levels.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Učitaj popis otoka, pa sve datoteke s razinama iz js/islands/
const js = path.join(__dirname, '..', 'js');
vm.runInThisContext(fs.readFileSync(path.join(js, 'islands.js'), 'utf8')
  .replace('const COL', 'globalThis.COL').replace('const LEVELS', 'globalThis.LEVELS').replace('const ISLANDS', 'globalThis.ISLANDS'));
for (const f of fs.readdirSync(path.join(js, 'islands')).filter(f => f.endsWith('.js')))
  vm.runInThisContext(fs.readFileSync(path.join(js, 'islands', f), 'utf8'));

function parse(L) {
  const st = {};
  for (const [k, v] of Object.entries(L.cells)) st[k] =
    (v === '/' || v === '\\') ? { t: 'm', v }
    : v[0] === 'F' ? { t: 'F', c: v[1] }
    : v[0] === 'B' ? { t: 'B', c: v[1] || null }
    : { t: v };
  return st;
}

// Isto kao u game.js: ćelija je na ploči ako je unutar mreže i nije '.' u obrisu (shape)
const onBoard = (L, x, y) => x >= 0 && y >= 0 && x < L.w && y < L.h && (!L.shape || L.shape[y][x] !== '.');

// Obris mora imati h redova po w znakova, a svjetionik i svi predmeti moraju biti na ploči
function shapeErrors(L) {
  if (!L.shape) return [];
  if (L.shape.length !== L.h || L.shape.some(r => r.length !== L.w)) return ['obris nije veličine ' + L.w + '×' + L.h];
  const off = [L.light.x + ',' + L.light.y, ...Object.keys(L.cells)].filter(k => { const [x, y] = k.split(',').map(Number); return !onBoard(L, x, y); });
  return off.length ? ['izvan obrisa: ' + off.join(' ')] : [];
}

function litBoats(L, st) {
  const lit = new Set(), seen = new Set();
  const q = [{ x: L.light.x, y: L.light.y, dx: L.light.d[0], dy: L.light.d[1], col: 'w' }];
  while (q.length) {
    const r = q.shift();
    let cx = r.x, cy = r.y;
    const go = (x, y, dx, dy, col) => { const s = [x, y, dx, dy, col] + ''; if (!seen.has(s)) { seen.add(s); q.push({ x, y, dx, dy, col }); } };
    while (true) {
      const nx = cx + r.dx, ny = cy + r.dy;
      if (!onBoard(L, nx, ny)) break;
      const k = nx + ',' + ny, c = st[k];
      if ((nx === L.light.x && ny === L.light.y) || (c && c.t === '#')) break;
      if (c && c.t === 'B') { if (!c.c || c.c === r.col) lit.add(k); break; }
      if (c && c.t === 'F') { go(nx, ny, r.dx, r.dy, c.c); break; }
      if (c && (c.t === 'm' || c.t === 'P')) {
        const d = c.t === 'P' ? [[r.dy, r.dx], [-r.dy, -r.dx]] : c.v === '/' ? [[-r.dy, -r.dx]] : [[r.dy, r.dx]];
        for (const [a, b] of d) go(nx, ny, a, b, r.col);
        break;
      }
      cx = nx; cy = ny;
    }
  }
  return lit;
}

let ok = true;
const ids = new Set();
for (const [island, list] of Object.entries(LEVELS)) {
  if (!ISLANDS.some(I => I.id === island)) { console.log(`Otok "${island}" nije u popisu ISLANDS`); ok = false; }
  for (const L of list) {
  if (ids.has(L.id)) { console.log(`${L.id}: ID se ponavlja`); ok = false; }
  ids.add(L.id);
  for (const e of shapeErrors(L)) { console.log(`${L.id}: ${e}`); ok = false; }
  const st = parse(L);
  const mirrors = Object.keys(st).filter(k => st[k].t === 'm');
  const init = mirrors.map(k => st[k].v);
  const boats = Object.keys(st).filter(k => st[k].t === 'B');
  let best = Infinity, solvedAtStart = false;
  for (let m = 0; m < 1 << mirrors.length; m++) {
    mirrors.forEach((k, i) => st[k].v = (m >> i & 1) ? (init[i] === '/' ? '\\' : '/') : init[i]);
    const lit = litBoats(L, st);
    if (boats.every(k => lit.has(k))) {
      let n = 0; for (let x = m; x; x >>= 1) n += x & 1;
      if (n === 0) solvedAtStart = true;
      best = Math.min(best, n);
    }
  }
  let status = 'OK';
  if (best === Infinity) { status = 'NERJEŠIVA'; ok = false; }
  else if (solvedAtStart) { status = 'RIJEŠENA NA STARTU'; ok = false; }
  else if (best !== L.par) { status = `par bi trebao biti ${best}`; ok = false; }
  console.log(`${L.id}: min ${best === Infinity ? '-' : best}, par ${L.par} -> ${status}`);
  }
}
process.exit(ok ? 0 : 1);
