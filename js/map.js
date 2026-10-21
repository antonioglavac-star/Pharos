// Karta otoka u stilu stare pomorske karte: obrisi tankom linijom, linije dubine, iscrtkano kopno.
let sel = null;

// Kopno i Pelješac (pojednostavljeno, isti koordinatni sustav kao otoci u islands.js)
const COAST = 'M40 0L70 8L81 21L142 24L184 27L239 48L311 93L380 135L440 150V0Z';
const PELJESAC = 'M440 168L380 172L313 180L318 188L380 186L440 182Z';

function islandStatus(i){
  const I = ISLANDS[i];
  if (!LEVELS[I.id]) return 'soon';
  if (islandDone(I.id)) return 'done';
  return islandOpen(i) ? 'open' : 'locked';
}
const STATUS_LABEL = { soon:'uskoro', done:'osvijetljen', open:'otvoren', locked:'zaključan' };

function showMap(){
  $('game').hidden = true; $('start').hidden = true; $('map').hidden = false;
  if (!sel){
    const i = ISLANDS.findIndex((I,i) => islandStatus(i)==='open');
    sel = ISLANDS[i<0 ? 0 : i].id;
  }
  renderMap();
}

function renderMap(){
  const lines = [];
  for (let x=55; x<440; x+=110) lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="390"/>`);
  for (let y=65; y<390; y+=110) lines.push(`<line x1="0" y1="${y}" x2="440" y2="${y}"/>`);
  const isles = ISLANDS.map((I,i) => {
    const st = islandStatus(i), r = `rotate(${I.rot})`;
    return `<g class="isle ${st} ${I.id===sel?'sel':''}" data-id="${I.id}" tabindex="0" role="button"
        aria-label="${I.name}, ${STATUS_LABEL[st]}" transform="translate(${I.x} ${I.y})">
      <ellipse class="hit" rx="${I.rx+8}" ry="${Math.max(I.ry+8,18)}" transform="${r}"/>
      <ellipse class="ring" rx="${I.rx+9}" ry="${I.ry+9}" transform="${r}"/>
      <ellipse class="contour" rx="${I.rx+4}" ry="${I.ry+4}" transform="${r}"/>
      <ellipse class="land" rx="${I.rx}" ry="${I.ry}" transform="${r}"/>
      ${st==='open'||st==='done' ? '<circle class="lamp" r="2.5"/>' : ''}
      <text y="${I.ry+16}">${I.name}</text>
    </g>`;
  }).join('');
  $('chart').innerHTML = `
    <defs><pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="5"/></pattern></defs>
    <g class="grat">${lines.join('')}</g>
    <path class="coast" d="${COAST}"/><path class="coast" d="${PELJESAC}"/>
    <g class="rose" transform="translate(395 330)">
      <path d="M0-22L4-4L22 0L4 4L0 22L-4 4L-22 0L-4-4Z"/><text y="-27">S</text></g>
    ${isles}`;
  $('chart').querySelectorAll('.isle').forEach(g => {
    g.onclick = () => { sel = g.dataset.id; renderMap(); };
    g.onkeydown = e => { if (e.key==='Enter'||e.key===' '){ e.preventDefault(); sel = g.dataset.id; renderMap(); $('cardBtn')?.focus(); } };
  });
  const lit = ISLANDS.filter(I => islandDone(I.id)).length;
  $('litCount').textContent = `${lit}/${ISLANDS.length}`;
  renderCard();
}

function renderCard(){
  const i = ISLANDS.findIndex(I => I.id===sel), I = ISLANDS[i], st = islandStatus(i);
  const lv = LEVELS[I.id] || [], solved = lv.filter(L => progress[L.id]).length;
  const eyebrow = st==='soon' ? 'Uskoro' : `${solved} / ${lv.length} razina`;
  const text = st==='done' ? (I.fact ? `<div class="fact"><b>Zanimljivost</b>${I.fact}</div>` : '<p>Otok je osvijetljen.</p>')
    : st==='open' ? '<p>Osvijetli sve razine i otkrij priču otoka.</p>'
    : st==='locked' ? '<p>Najprije osvijetli prethodni otok.</p>'
    : '<p>Svjetionik na ovom otoku još čeka čuvara. Novi otoci stižu uskoro.</p>';
  const btn = st==='open' ? (solved ? 'Nastavi' : 'Igraj') : st==='done' ? 'Igraj ponovno' : '';
  $('card').innerHTML = `<div class="eyebrow">${eyebrow}</div><h2>${I.name}</h2>${text}
    ${btn ? `<button class="btn primary" id="cardBtn">${btn}</button>` : ''}`;
  if (btn) $('cardBtn').onclick = () => openIsland(I.id);
}
