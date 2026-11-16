// Generator dnevnih razina: jedan svjetionik, samo mehanike s Visa (ogledala, prizma, filteri).
// node gen-daily.js <project> <koliko> <izlazna datoteka>
const fs = require('fs'), path = require('path'), vm = require('vm');
const js = path.join(process.argv[2], 'js');
for (const f of ['islands.js', 'engine.js']) vm.runInThisContext(fs.readFileSync(path.join(js, f), 'utf8'));
const { castBeam, solveMin, parseCells, checkLevel, mirrorsOf } = vm.runInThisContext('({castBeam,solveMin,parseCells,checkLevel,mirrorsOf})');
const COUNT = +process.argv[3], OUT = process.argv[4];
let o, s;
const rnd = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const ri = n => Math.floor(rnd() * n);

function edgeLight() {
  const side = ri(4);
  return side === 0 ? { x: 0, y: 1 + ri(o.h - 2), d: [1, 0] } : side === 1 ? { x: 1 + ri(o.w - 2), y: o.h - 1, d: [0, -1] }
    : side === 2 ? { x: o.w - 1, y: 1 + ri(o.h - 2), d: [-1, 0] } : { x: 1 + ri(o.w - 2), y: 0, d: [0, 1] };
}

function build() {
  const L = { id: o.id, w: o.w, h: o.h, cells: {} };
  L.light = edgeLight();
  const lk = l => l.x + ',' + l.y, lights = new Set([lk(L.light)]);
  const path = new Set(lights), sol = [];
  let turns = o.turns, prisms = o.prisms || 0; const filters = [...(o.filters || [])];
  const beams = [{ x: L.light.x, y: L.light.y, dx: L.light.d[0], dy: L.light.d[1], col: 'w' }];
  let guard = 0;
  while (beams.length && guard++ < 80) {
    const b = beams.shift(); let x = b.x, y = b.y; const cells = [];
    while (true) { x += b.dx; y += b.dy; if (x < 0 || y < 0 || x >= o.w || y >= o.h) break; const k = x + ',' + y; if (L.cells[k] || lights.has(k)) break; cells.push(k); }
    const corner = k => { const [a, c] = k.split(',').map(Number); return (a === 0 || a === o.w - 1) && (c === 0 || c === o.h - 1); };
    const opts = cells.map((k, i) => i).filter(i => !path.has(cells[i]) && !corner(cells[i]));
    if (!opts.length) return null;
    const i = opts[ri(opts.length)];
    for (let j = 0; j <= i; j++) path.add(cells[j]);
    const k = cells[i], [cx, cy] = k.split(',').map(Number), left = turns + prisms + filters.length, r = rnd();
    if (left === 0) { L.cells[k] = 'B' + (b.col === 'w' ? '' : b.col); continue; }
    if (filters.length && b.col === 'w' && (r < .3 || (!turns && !prisms))) { const c = filters.shift(); L.cells[k] = 'F' + c; beams.push({ x: cx, y: cy, dx: b.dx, dy: b.dy, col: c }); continue; }
    if (prisms && r < .45) { prisms--; L.cells[k] = 'P'; beams.push({ x: cx, y: cy, dx: b.dy, dy: b.dx, col: b.col }, { x: cx, y: cy, dx: -b.dy, dy: -b.dx, col: b.col }); continue; }
    if (turns) { turns--; const v = rnd() < .5 ? '/' : '\\'; L.cells[k] = v; sol.push(k); const d = v === '/' ? [-b.dy, -b.dx] : [b.dy, b.dx]; beams.push({ x: cx, y: cy, dx: d[0], dy: d[1], col: b.col }); continue; }
    L.cells[k] = 'B' + (b.col === 'w' ? '' : b.col);
  }
  if (beams.length || turns || prisms || filters.length) return null;
  const free = () => { for (let t = 0; t < 200; t++) { const k = ri(o.w) + ',' + ri(o.h); if (!L.cells[k] && !path.has(k)) return k; } return null; };
  for (const [n, f] of [[o.decoys || 0, () => rnd() < .5 ? '/' : '\\'], [o.rocks || 0, () => '#']])
    for (let i = 0; i < n; i++) { const k = free(); if (!k) return null; L.cells[k] = f(); }
  const pool = [...sol];
  if (pool.length < o.par) return null;
  for (let i = 0; i < o.par; i++) { const k = pool.splice(ri(pool.length), 1)[0]; L.cells[k] = L.cells[k] === '/' ? '\\' : '/'; }
  return L;
}

function shapeOk(L, sh) {
  const on = (x, y) => x >= 0 && y >= 0 && x < L.w && y < L.h && sh[y][x];
  for (let y = -1; y < L.h; y++) for (let x = -1; x < L.w; x++) {
    const a = on(x, y), b = on(x + 1, y), c = on(x, y + 1), d = on(x + 1, y + 1);
    if ((a && d && !b && !c) || (b && c && !a && !d)) return false;
  }
  let start = null, n = 0;
  for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++) if (sh[y][x]) { n++; start = start || [x, y]; }
  const seen = new Set([start + '']), q = [start];
  while (q.length) { const [x, y] = q.pop(); for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (x + a) + ',' + (y + b); if (on(x + a, y + b) && !seen.has(k)) { seen.add(k); q.push([x + a, y + b]); } } }
  return seen.size === n;
}
function makeShape(L, need) {
  const sh = Array.from({ length: L.h }, () => Array(L.w).fill(true));
  const target = Math.round(L.w * L.h * .78);
  let n = L.w * L.h;
  for (let t = 0; t < 600 && n > target; t++) {
    const x = ri(L.w), y = ri(L.h), k = x + ',' + y;
    if (!sh[y][x] || need.has(k)) continue;
    const open = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([a, b]) => { const X = x + a, Y = y + b; return X < 0 || Y < 0 || X >= L.w || Y >= L.h || !sh[Y][X]; }).length;
    if (open < 2) continue;
    sh[y][x] = false;
    if (!shapeOk(L, sh)) { sh[y][x] = true; continue; }
    n--;
  }
  return sh.map(r => r.map(v => v ? 'x' : '.').join(''));
}

function one(opts, seed, ms) {
  o = opts; s = seed;
  const out = [], end = Date.now() + ms;
  while (Date.now() < end && out.length < 60) {
    const L = build(); if (!L) continue;
    const st = parseCells(L), r = solveMin(L, st);
    if (r.capped || r.best !== o.par || r.sols.length > 1) continue;
    for (const k of r.sols[0]) st[k].v = st[k].v === '/' ? '\\' : '/';
    const b = castBeam(L, st, false);
    if (Object.keys(L.cells).some(k => L.cells[k][0] === 'F' && !b.touched.has(k))) continue;
    out.push({ L, score: b.touched.size + Object.keys(L.cells).length * .5, on: b.touched });
  }
  out.sort((a, b) => b.score - a.score);
  for (const c of out.slice(0, 15)) {
    const L = c.L;
    L.shape = makeShape(L, new Set([...c.on, ...Object.keys(L.cells), L.light.x + ',' + L.light.y]));
    const v = checkLevel({ ...L, par: o.par });
    if (!v.errors.length && v.best === o.par) return { id: o.id, w: L.w, h: L.h, par: o.par, light: L.light, shape: L.shape, cells: L.cells };
  }
  return null;
}

const levels = [], PARS = [4, 5, 6, 5, 4, 6, 5];
let seed = 4242, fails = 0;
while (levels.length < COUNT) {
  const i = levels.length, par = PARS[i % 7];
  // Ako zadani sastav ne uspijeva, pojednostavi ga (manje predmeta), da generator nikad ne zapne
  const easy = fails >= 2, bare = fails >= 4;
  const opts = { id: 'dan-' + (i + 1), w: 7, h: 7, par, turns: par + (bare ? 0 : 1) + (easy ? 0 : i % 2), prisms: !bare && i % 3 === 0 ? 1 : 0,
    filters: easy ? (i % 2 && !bare ? ['r'] : []) : i % 4 === 1 ? ['r'] : i % 4 === 3 ? ['b', 'r'] : [], decoys: bare ? 2 : 2 + (i % 2), rocks: 2 };
  const L = one(opts, seed += 7919, 2500);
  if (L) { levels.push(L); console.log(`${L.id} par ${L.par} (pokušaja ${fails + 1})`); fails = 0; }
  else fails++;
}
const q = v => JSON.stringify(v).replace(/"/g, "'");
const lit = l => `{x:${l.x},y:${l.y},d:[${l.d}]}`;
fs.writeFileSync(OUT, levels.map(L =>
  `  { id:${q(L.id)}, w:${L.w}, h:${L.h}, par:${L.par}, light:${lit(L.light)}, shape:${q(L.shape)},\n    cells:{${Object.entries(L.cells).map(([k, v]) => q(k) + ':' + (v === '\\' ? "'\\\\'" : q(v))).join(',')}} }`).join(',\n') + '\n');
console.log('gotovo', levels.length);
