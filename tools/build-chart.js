// Iz OSM obale (natural=coastline) slaže js/chart.js: kopno, ostali otoci i obrisi otoka iz igre.
// 1. Preuzmi obalu s Overpass API-ja (https://overpass-api.de/api/interpreter) upitom:
//    [out:json][timeout:180];way["natural"="coastline"](42.30,15.55,43.65,17.75);out geom;
// 2. node tools/build-chart.js <coast.json> js/chart.js
// Za novi otok dodaj njegovo središte u GAME, a za veće područje promijeni LON0..LAT1 i upit.
const fs = require('fs');
const data = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));

// Prikazano područje (stupnjevi) i projekcija: jednostavna, s korekcijom za geografsku širinu
const LON0 = 15.60, LON1 = 17.45, LAT0 = 42.32, LAT1 = 43.58;
const K = Math.cos((LAT0 + LAT1) / 2 * Math.PI / 180);
const W = 440, S = W / ((LON1 - LON0) * K), H = Math.round((LAT1 - LAT0) * S);
const P = (lon, lat) => [(lon - LON0) * K * S, (LAT1 - lat) * S];

// Središta otoka iz igre (za prepoznavanje obrisa)
const GAME = {
  vis: [16.15, 43.04], bisevo: [16.012, 42.978], svetac: [15.752, 43.022], susac: [16.505, 42.763],
  lastovo: [16.87, 42.76], palagruza: [16.258, 42.3925], korcula: [16.88, 42.94], hvar: [16.70, 43.15],
  brac: [16.63, 43.32], solta: [16.30, 43.38]
};

// 1. Spoji puteve u lance po zajedničkim točkama
const ways = data.elements.filter(e => e.type === 'way' && e.geometry);
const byStart = new Map();
for (const w of ways) byStart.set(w.nodes[0], w);
const used = new Set(), rings = [], open = [];
for (const w of ways) {
  if (used.has(w.id)) continue;
  // idi unatrag do početka lanca (ako je otvoren)
  let first = w, guard = 0;
  const byEnd = new Map(ways.map(x => [x.nodes[x.nodes.length - 1], x]));
  while (guard++ < 5000) { const prev = byEnd.get(first.nodes[0]); if (!prev || prev === w || used.has(prev.id)) break; first = prev; if (first === w) break; }
  const pts = [], startNode = first.nodes[0];
  let cur = first, closed = false;
  while (cur && !used.has(cur.id)) {
    used.add(cur.id);
    const g = cur.geometry.map(p => [p.lon, p.lat]);
    pts.push(...(pts.length ? g.slice(1) : g));
    const endNode = cur.nodes[cur.nodes.length - 1];
    if (endNode === startNode) { closed = true; break; }
    cur = byStart.get(endNode);
  }
  (closed ? rings : open).push(pts);
}

// 2. Otvoreni lanci su obala kopna: zatvori ih preko točke daleko na sjeveroistoku (kopno je tamo)
for (const pts of open) pts.push([LON1 + 3, LAT1 + 3]);
console.log('zatvorenih prstenova:', rings.length, 'otvorenih lanaca:', open.length);

// 3. Projekcija i pojednostavljivanje (Douglas-Peucker)
function dp(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const st = [[0, pts.length - 1]];
  while (st.length) {
    const [a, b] = st.pop(); let md = 0, mi = -1;
    const [ax, ay] = pts[a], [bx, by] = pts[b], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1e-9;
    for (let i = a + 1; i < b; i++) { const d = Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / L; if (d > md) { md = d; mi = i; } }
    if (md > tol) { keep[mi] = 1; st.push([a, mi], [mi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
// Zatvoreni obris: makni ponovljenu zadnju točku i pojednostavi dvije polovice
function dpRing(r, tol) {
  r = r.slice(); const f0 = r[0], l = r[r.length - 1];
  if (f0[0] === l[0] && f0[1] === l[1]) r.pop();
  if (r.length < 4) return r;
  let fi = 0, fd = -1; for (let i = 1; i < r.length; i++) { const dd = Math.hypot(r[i][0] - f0[0], r[i][1] - f0[1]); if (dd > fd) { fd = dd; fi = i; } }
  const a = dp(r.slice(0, fi + 1), tol), b = dp([...r.slice(fi), f0], tol);
  return [...a, ...b.slice(1, -1)];
}
const proj = r =>r.map(([lo, la]) => P(lo, la));
const inside = (pt, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) c = !c; } return c; };
const box = r => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of r) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return { x0, y0, x1, y1 }; };
const d = r => 'M' + r.map(([x, y]) => x.toFixed(1) + ' ' + y.toFixed(1)).join('L') + 'Z';

// Pomak obrisa prema moru (za iscrtkanu liniju dubine): svaka točka ide po prosječnoj normali
function offset(r, o) {
  const n = r.length, area = r.reduce((s, p, i) => { const q = r[(i + 1) % n]; return s + p[0] * q[1] - q[0] * p[1]; }, 0);
  const sgn = area > 0 ? -1 : 1; // smjer prema van ovisi o smjeru obilaska
  return r.map((p, i) => {
    const a = r[(i - 1 + n) % n], b = r[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    return [p[0] + sgn * dy / L * o, p[1] - sgn * dx / L * o];
  });
}

const isles = {}, labels = {}, contours = {}, detail = {};
let land = '';
const gameRing = {};
for (const r of rings) {
  const pr = proj(r);
  for (const [id, [lo, la]] of Object.entries(GAME)) if (inside(P(lo, la), pr)) gameRing[id] = pr;
}
for (const [id] of Object.entries(GAME)) if (!gameRing[id]) console.log('NIJE PRONAĐEN:', id);
const gameSet = new Set(Object.values(gameRing));
for (const r of rings) {
  const pr = proj(r);
  if (gameSet.has(pr)) continue;
  const b = box(pr);
  if (b.x1 < -5 || b.x0 > W + 5 || b.y1 < -5 || b.y0 > H + 5) continue;
  if (b.x1 - b.x0 < 1.4 && b.y1 - b.y0 < 1.4) continue; // premale hridi
  const s = dpRing(pr, .45); if (s.length >= 3) land += d(s);
}
for (const pts of open) land += d(dp(proj(pts), .45));
for (const [id, pr] of Object.entries(gameRing)) {
  const s = dpRing(pr, .3), b = box(s);
  isles[id] = d(s);
  // Detaljniji obris za ekran otoka (otok se tamo prikazuje preko cijele širine)
  const size = Math.max(b.x1 - b.x0, b.y1 - b.y0), ds = dpRing(pr, Math.max(size / 160, .008));
  detail[id] = 'M' + ds.map(([x, y]) => x.toFixed(2) + ' ' + y.toFixed(2)).join('L') + 'Z';
  contours[id] = d(dpRing(offset(dpRing(pr, .8), 3.2), .6));
  // Težište površine: kod dugih otoka tu idu lampa i ime (unutar otoka), kod malih ime ide ispod
  let A = 0, gx = 0, gy = 0;
  s.forEach((p, i) => { const q = s[(i + 1) % s.length], f = p[0] * q[1] - q[0] * p[1]; A += f; gx += (p[0] + q[0]) * f; gy += (p[1] + q[1]) * f; });
  gx /= 3 * A; gy /= 3 * A;
  const big = Math.max(b.x1 - b.x0, b.y1 - b.y0) > 100;
  labels[id] = big ? [+gx.toFixed(1), +gy.toFixed(1), +(Math.max(b.x1 - b.x0, b.y1 - b.y0) / 2).toFixed(1), 0]
    : [+((b.x0 + b.x1) / 2).toFixed(1), +((b.y0 + b.y1) / 2).toFixed(1), +(Math.max(b.x1 - b.x0, b.y1 - b.y0) / 2).toFixed(1), +(b.y1 - (b.y0 + b.y1) / 2).toFixed(1)];
  console.log(id, 'točaka', s.length, 'veličina', (b.x1 - b.x0).toFixed(1) + '×' + (b.y1 - b.y0).toFixed(1));
}
const out = `// Karta: obrisi obale i otoka prema OpenStreetMapu (© OpenStreetMap contributors, ODbL).
// Datoteku stvara alat iz OSM podataka (natural=coastline); ne mijenjati ručno.
// CHART.c[id] = [x, y, polumjer, pola visine] – središte otoka na karti (pola visine 0: ime ide unutar otoka)
const CHART = {
  w: ${W}, h: ${H},
  land: '${land}',
  isles: ${JSON.stringify(isles)},
  contours: ${JSON.stringify(contours)},
  detail: ${JSON.stringify(detail)},
  c: ${JSON.stringify(labels)}
};
`;
fs.writeFileSync(process.argv[3], out);
console.log('veličina datoteke:', (out.length / 1024).toFixed(0), 'KB, visina karte', H);
