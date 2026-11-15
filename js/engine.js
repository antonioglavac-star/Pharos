// Pravila igre na jednom mjestu: put zrake i traženje najkraćeg rješenja, bez ikakvog crtanja.
// Isti kod koriste igra (game.js), provjera razina (tools/check-levels.js) i alat za slaganje (tools/urednik.html).

const ICONS = {
  // Boja ima i svoj znak, da se razlikuje i bez boje: crvena je romb, plava krug (isti na filteru i na jedru)
  mark: (c, x, y, r, fill) => c==='r' ? `<path d="M${x} ${y-r*1.25}l${r} ${r*1.25}l${-r} ${r*1.25}l${-r} ${-r*1.25}z" fill="${fill}"/>`
    : c==='b' ? `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>` : '',
  light: d => `<svg class="icon" viewBox="0 0 40 40" style="transform:rotate(${Math.atan2(d[1],d[0])*180/Math.PI}deg)">
     <circle cx="20" cy="20" r="17" fill="#ffc35a22"/>
     <g transform="rotate(90 20 20)"><path d="M14 34h12l-2.5-20h-7z" fill="#e9eff7"/><path d="M15 27h10l-.6-5h-8.8z" fill="#d9534f"/>
     <rect x="15.5" y="9" width="9" height="5" rx="1" fill="#ffc35a"/><path d="M14.5 9h11l-5.5-4z" fill="#d9534f"/></g></svg>`,
  filter: c => `<svg class="icon" viewBox="0 0 40 40"><rect x="9" y="9" width="22" height="22" rx="7" fill="${COL[c]}" fill-opacity=".38" stroke="${COL[c]}" stroke-width="2.5"/>${ICONS.mark(c, 20, 20, 4.6, '#ffffffd9')}</svg>`,
  boat: c => `<svg class="icon" viewBox="0 0 40 40"><path d="M7 25h26l-4 7H11z" fill="#c9d4e3"/><path class="sail" d="M20 6v17H10z" fill="${c?COL[c]:'#e9eff7'}"/>${ICONS.mark(c, 16.4, 18.6, 2.5, '#0a1729')}<path d="M21 9v14h8z" fill="#8ea3bf"/><path d="M5 34c4 0 4-2 8-2s4 2 8 2 4-2 8-2 4 2 6 2" stroke="#8ea3bf55" stroke-width="1.5" fill="none"/></svg>`,
  cave: () => `<svg class="icon" viewBox="0 0 40 40"><path d="M4 34C4 17 10 7 20 7s16 10 16 27z" fill="#34404f"/><path d="M9 30C10 19 14 12 20 11" stroke="#4a5768" stroke-width="2" fill="none" stroke-linecap="round"/><path class="mouth" d="M12 34c0-9 3.5-15 8-15s8 6 8 15z" fill="#07101d"/></svg>`,
  // hrid: kamen s pjenom; u plimi ga prekrije more (klasa .up na ćeliji znači oseka)
  reef: () => `<svg class="icon" viewBox="0 0 40 40"><path class="stone" d="M6 30c1-10 5-18 13-18 4 0 6 3 9 3 4 0 7 6 7 15z" fill="#4a5768"/><path class="stone" d="M12 21c2-4 5-6 8-6" stroke="#6a7889" stroke-width="2" fill="none" stroke-linecap="round"/><path class="sea" d="M3 23c3-2 5 2 8 0s5-2 8 0 5 2 8 0 5-2 8 0 4 1 3 1v12H3z" fill="#2b5f8f" fill-opacity=".8"/><path class="foam" d="M4 30c3-2 5 2 8 0s5-2 8 0 5 2 8 0 5-2 8 0" stroke="#e9eff7" stroke-opacity=".7" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>`,
  // svaka prizma ima svoj prijelaz boja, jer skrivena kopija (npr. u zatvorenom prozoru) ne smije pokvariti ostale
  prism: () => { const g = 'pg' + (++ICONS.n); return `<svg class="icon" viewBox="0 0 40 40"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bfe9ff"/><stop offset="1" stop-color="#5aa7ff"/></linearGradient></defs><path d="M20 7l13 23H7z" fill="url(#${g})" opacity=".9"/><path d="M20 7l-4 23" stroke="#fff8" stroke-width="1"/></svg>`; },
  n: 0
};

// Ćelija je na ploči ako je unutar mreže i, kad razina ima obris (shape), nije označena s '.'
const onBoard = (L,x,y) => x>=0 && y>=0 && x<L.w && y<L.h && (!L.shape || L.shape[y][x]!=='.');

// Razina ima jedan ili dva svjetionika (light i neobavezni light2)
const lightsOf = L => L.light2 ? [L.light, L.light2] : [L.light];
const isLight = (L,x,y) => lightsOf(L).some(l => l.x===x && l.y===y);

// Plima i oseka: svakim potezom more se izmijeni. Na početku je plima (hridi pod morem, zraka prelazi),
// nakon neparnog broja poteza oseka (hridi izrone i zaustave zraku).
const lowTide = n => n % 2 === 1;

const flipMirror = v => v==='/' ? '\\' : '/';

// Stanje ploče iz oznaka razine
function parseCells(L){
  const st = {};
  for (const [k,v] of Object.entries(L.cells)) st[k] =
    (v==='/'||v==='\\') ? {t:'m', v, rot: v==='/'?-45:45}
    : v[0]==='F' ? {t:'F', c:v[1]}
    : v[0]==='B' ? {t:'B', c:v[1]||null}
    : {t:v};
  return st;
}

const mirrorsOf = st => Object.keys(st).filter(k => st[k].t==='m');
const boatsOf = st => Object.keys(st).filter(k => st[k].t==='B');
const hasTide = L => Object.values(L.cells).includes('T');

// Put zrake za zadano stanje ploče. Ogledalo bez odluke (v === null) zaustavlja zraku i zapisuje se u undecided:
// tako traženje rješenja gleda samo ogledala do kojih zraka stvarno dolazi.
function castBeam(L, st, low){
  const segs = [], lit = new Set(), wrong = new Set(), seen = new Set(), caveLit = new Set(), touched = new Set(), undecided = [];
  const q = lightsOf(L).map(l => ({x:l.x, y:l.y, dx:l.d[0], dy:l.d[1], col:'w'}));
  while (q.length){
    const r = q.shift();
    let cx=r.x, cy=r.y; const pts=[[cx+.5,cy+.5]];
    const go = (x,y,dx,dy,col) => { const s=`${x},${y},${dx},${dy},${col}`; if (!seen.has(s)){ seen.add(s); q.push({x,y,dx,dy,col}); } };
    while (true){
      const nx=cx+r.dx, ny=cy+r.dy;
      const edge = [cx+.5+r.dx*.5, cy+.5+r.dy*.5];
      if (!onBoard(L,nx,ny)){ pts.push(edge); break; }
      const k=nx+','+ny, c=st[k];
      touched.add(k);
      // Hrid: u oseci zaustavlja zraku, u plimi je pod morem
      if (c&&c.t==='T'){ if (low){ pts.push(edge); break; } cx=nx; cy=ny; continue; }
      if (isLight(L,nx,ny) || (c&&c.t==='#')){ pts.push(edge); break; }
      if (c&&c.t==='B'){ pts.push([nx+.5,ny+.5]); (!c.c || c.c===r.col ? lit : wrong).add(k); break; }
      if (c&&c.t==='F'){ pts.push([nx+.5,ny+.5]); go(nx,ny,r.dx,r.dy,c.c); break; }
      // Modra špilja: plava zraka prolazi kroz nju, svaka druga staje na ulazu
      if (c&&c.t==='C'){ if (r.col==='b'){ caveLit.add(k); cx=nx; cy=ny; continue; } pts.push(edge); break; }
      if (c&&(c.t==='m'||c.t==='P')){
        pts.push([nx+.5,ny+.5]);
        if (c.v===null){ undecided.push(k); break; }
        const dirs = c.t==='P' ? [[r.dy,r.dx],[-r.dy,-r.dx]]
                   : c.v==='/' ? [[-r.dy,-r.dx]] : [[r.dy,r.dx]];
        for (const [dx,dy] of dirs) go(nx,ny,dx,dy,r.col);
        break;
      }
      cx=nx; cy=ny;
    }
    segs.push({pts, col:COL[r.col]});
  }
  return { segs, lit, wrong, caveLit, touched, undecided };
}

// Najkraće rješenje bez plime: najmanje okretanja da svi brodovi budu osvijetljeni.
// Ide za zrakom: tek kad zraka stigne do ogledala, isprobava obje strane, pa ni 20 ogledala nije problem.
// Vraća best (Infinity ako nema rješenja), sols (popisi ogledala za okrenuti) i capped (pretraga prekinuta).
function solveMin(L, st, low = false){
  const ms = mirrorsOf(st), boats = boatsOf(st), start = {};
  for (const k of ms){ start[k] = st[k].v; st[k].v = null; }
  let best = Infinity, sols = [], nodes = 0, capped = false;
  const rec = (cost, flips) => {
    if (cost > best || capped) return;
    if (++nodes > 400000){ capped = true; return; }
    const r = castBeam(L, st, low);
    if (r.undecided.length){
      const k = r.undecided[0];
      st[k].v = start[k]; rec(cost, flips);
      st[k].v = flipMirror(start[k]); rec(cost + 1, [...flips, k]);
      st[k].v = null;
      return;
    }
    if (boats.every(b => r.lit.has(b))){
      if (cost < best){ best = cost; sols = []; }
      if (sols.length < 64) sols.push(flips);
    }
  };
  rec(0, []);
  for (const k of ms) st[k].v = start[k];
  return { best, sols, capped };
}

// Najkraće rješenje s plimom: redoslijed je važan, pa se pretražuju (okrenuta ogledala, parnost poteza).
// done = koliko je poteza već odigrano; blocked = ogledala koja ne mogu biti prvi potez (npr. u magli).
function solveTide(L, st, done = 0, blocked = new Set()){
  const ms = mirrorsOf(st), boats = boatsOf(st), start = ms.map(k => st[k].v);
  const set = m => ms.forEach((k,i) => st[k].v = (m >> i & 1) ? flipMirror(start[i]) : start[i]);
  const seen = new Set(['0,0']), q = [[0, 0, 0, -1]];
  let out = { best: Infinity, first: null, capped: false };
  for (let h = 0; h < q.length; h++){
    const [m, p, d, first] = q[h];
    if (d > 0){
      set(m);
      if (boats.every(b => castBeam(L, st, lowTide(done + d)).lit.has(b))){ out = { best: d, first: ms[first], capped: false }; break; }
    }
    if (q.length > 600000){ out.capped = true; break; }
    for (let i = 0; i < ms.length; i++){
      if (d === 0 && blocked.has(ms[i])) continue;
      const nm = m ^ (1 << i), np = p ^ 1, key = nm + ',' + np;
      if (!seen.has(key)){ seen.add(key); q.push([nm, np, d + 1, d === 0 ? i : first]); }
    }
  }
  ms.forEach((k,i) => st[k].v = start[i]);
  return out;
}

// Polja pod maglom
function fogCells(L){
  const s = new Set();
  if (L.fog) for (let y=0;y<L.h;y++) for (let x=0;x<L.w;x++) if (L.fog[y][x]==='m') s.add(x+','+y);
  return s;
}

// Može li se rješenje odigrati u magli: skriveno ogledalo smije se okrenuti tek kad ga zraka dotakne.
// Otkrivena polja ostaju otkrivena, pa je dovoljno redom okretati ono što je već vidljivo.
function fogPlayable(L, st, flips){
  const f = fogCells(L);
  if (!f.size) return true;
  const ms = mirrorsOf(st), start = ms.map(k => st[k].v);
  const seen = new Set(castBeam(L, st, false).touched);
  let left = [...flips], ok = true;
  while (left.length){
    const k = left.find(k => !f.has(k) || seen.has(k));
    if (!k){ ok = false; break; }
    st[k].v = flipMirror(st[k].v);
    left = left.filter(x => x !== k);
    for (const t of castBeam(L, st, false).touched) seen.add(t);
  }
  ms.forEach((k,i) => st[k].v = start[i]);
  return ok;
}

// Cijela provjera jedne razine; koriste je alat za provjeru i alat za slaganje.
// Vraća best (najmanji broj poteza), flips (jedno najkraće rješenje), errors (što ne valja, običnim riječima).
function checkLevel(L){
  const errors = [], st = parseCells(L), lights = lightsOf(L);
  if (L.shape && (L.shape.length !== L.h || L.shape.some(r => r.length !== L.w))) errors.push('Obris nije veličine ploče.');
  if (L.fog && (L.fog.length !== L.h || L.fog.some(r => r.length !== L.w))) errors.push('Magla nije veličine ploče.');
  if (errors.length) return { best: Infinity, flips: null, errors };
  const off = [...lights.map(l => l.x+','+l.y), ...Object.keys(L.cells)].filter(k => { const [x,y] = k.split(',').map(Number); return !onBoard(L,x,y); });
  if (off.length) errors.push('Neki predmeti su izvan otoka.');
  const f = fogCells(L);
  if ([...lights.map(l => l.x+','+l.y), ...boatsOf(st)].some(k => f.has(k))) errors.push('Svjetionik i brodovi ne smiju biti u magli.');
  if (lights.some(l => st[l.x+','+l.y])) errors.push('Na polju sa svjetionikom ne smije biti drugi predmet.');
  if (!boatsOf(st).length) errors.push('Na ploči nema nijednog broda.');
  if (errors.length) return { best: Infinity, flips: null, errors };
  if (boatsOf(st).every(b => castBeam(L, st, false).lit.has(b))) return { best: 0, flips: [], errors: ['Razina je riješena već na početku.'] };
  if (hasTide(L)){
    const r = solveTide(L, st);
    if (r.capped) return { best: Infinity, flips: null, errors: ['Previše ogledala uz plimu: razinu ne mogu izračunati. Makni dio ogledala ili hridi.'] };
    if (r.best === Infinity) errors.push('Razina se ne može riješiti.');
    return { best: r.best, flips: null, errors };
  }
  const r = solveMin(L, st);
  if (r.capped) return { best: Infinity, flips: null, errors: ['Razina je preslojevita da bih je izračunao. Makni dio ogledala.'] };
  if (r.best === Infinity) return { best: Infinity, flips: null, errors: ['Razina se ne može riješiti.'] };
  const playable = r.sols.find(s => fogPlayable(L, st, s));
  if (!playable) errors.push('Magla skriva ogledalo koje treba okrenuti, a zraka do njega ne može doći.');
  return { best: r.best, flips: playable || r.sols[0], errors };
}

// Obala: rubovi ćelija ploče spojeni u petlje, pa zaglađeni (stube postaju kose linije)
// i blago valoviti, uvijek jednako za istu razinu. off pomiče liniju prema moru, amp je jačina valovitosti.
function coastPath(L, off, amp){
  const next = {};
  for (let y=0;y<L.h;y++) for (let x=0;x<L.w;x++) if (onBoard(L,x,y)){
    if (!onBoard(L,x,y-1)) next[x+','+y] = [x+1,y];
    if (!onBoard(L,x+1,y)) next[(x+1)+','+y] = [x+1,y+1];
    if (!onBoard(L,x,y+1)) next[(x+1)+','+(y+1)] = [x,y+1];
    if (!onBoard(L,x-1,y)) next[x+','+(y+1)] = [x,y];
  }
  // Valovitost ovisi o ID-u razine, pa obala ne skače pri ponovnom učitavanju
  let seed = 0;
  for (const ch of L.id) seed = (seed*31 + ch.charCodeAt(0)) % 997;
  const ph = [seed*.37, seed*.91, seed*1.53];
  let d = '';
  for (const s of Object.keys(next)){
    if (!next[s]) continue;
    const corners = [];
    for (let k=s; next[k]; ){ const p = next[k]; delete next[k]; corners.push(p); k = p.join(','); }
    // Gusto točke: četiri po rubu ćelije
    let pts = [];
    corners.forEach((a,i) => { const b = corners[(i+1)%corners.length];
      for (let t=0;t<1;t+=.25) pts.push([a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t]); });
    const n = pts.length, at = i => pts[(i+n)%n];
    // Zaglađivanje: svaka točka postaje prosjek susjeda do pola ćelije na svaku stranu (triput)
    for (let pass=0; pass<3; pass++){
      pts = pts.map((_,i) => { let x=0, y=0;
        for (let j=-2;j<=2;j++){ x += at(i+j)[0]; y += at(i+j)[1]; }
        return [x/5, y/5]; });
    }
    // Pomak prema moru (more je lijevo od smjera hoda) plus blagi valovi duž obale
    pts = pts.map((p,i) => {
      const a = at(i-1), b = at(i+1), dx = b[0]-a[0], dy = b[1]-a[1], len = Math.hypot(dx,dy) || 1;
      const u = i*.25, wave = Math.sin(u*2.6+ph[0])*.6 + Math.sin(u*5.3+ph[1])*.3 + Math.sin(u*11+ph[2])*.1;
      const o = off + amp*wave;
      return [p[0] + dy/len*o, p[1] - dx/len*o];
    });
    const mid = i => { const a=at(i), b=at(i+1); return [(a[0]+b[0])/2, (a[1]+b[1])/2]; };
    const r = v => v.map(c => +c.toFixed(3));
    d += 'M'+r(mid(0)) + pts.map((_,i)=>'Q'+r(at(i+1))+' '+r(mid(i+1))).join('') + 'Z';
  }
  return d;
}
