// Ponašanje kao prava aplikacija: tipka "natrag", rad bez interneta, početni zaslon i kôd napretka.

// Tipka "natrag" (Android): umjesto da zatvori igru, vodi korak natrag: prozor se zatvori, razina vodi
// na otok, otok na kartu, karta na izbornik. Tek "natrag" u izborniku izlazi iz igre.
// Radi preko jednog zapisa u povijesti preglednika, koji se obnovi nakon svakog koraka.
let backArmed = false;
const armBack = () => { if (!backArmed){ history.pushState({ pharos: 1 }, ''); backArmed = true; } };
for (const name of ['showMap', 'showIsle', 'openIsland', 'openDaily', 'showLights']){
  const show = window[name];
  window[name] = (...args) => { armBack(); return show(...args); };
}
const openModal = HTMLDialogElement.prototype.showModal;
HTMLDialogElement.prototype.showModal = function(){ armBack(); return openModal.call(this); };
addEventListener('popstate', () => {
  backArmed = false;
  const dlg = [...document.querySelectorAll('dialog[open]')].pop();
  if (dlg) dlg.close();
  else if (!$('game').hidden) leaveLevel();
  else if (!$('isle').hidden) showMap();
  else if (!$('lights').hidden) $('lightsBack').click();
  else if (!$('map').hidden) showStart(false);
  if ($('start').hidden || document.querySelector('dialog[open]')) armBack();
});

// Rad bez interneta: sw.js vraća spremljenu kopiju kad nema mreže. Kopiju puni sama stranica
// popisom svega što je upravo učitala, pa novi otok ili datoteku ne treba nigdje posebno upisivati.
const CACHE = 'pharos';
if ('serviceWorker' in navigator && location.protocol.startsWith('http')){
  navigator.serviceWorker.register('sw.js').catch(() => {});
  addEventListener('load', async () => {
    try {
      const cache = await caches.open(CACHE);
      const urls = ['./', 'index.html', 'manifest.webmanifest', 'assets/icon-192.png',
        ...performance.getEntriesByType('resource').map(r => r.name).filter(u => u.startsWith('http'))];
      for (const u of new Set(urls)){
        try {
          const r = await fetch(u);
          if (r.ok) await cache.put(u, r);
        } catch (e) {}
      }
    } catch (e) {}
  });
}

// Dijeljenje: izbornik za dijeljenje na mobitelu (uz sliku, ako je uređaj podržava), inače kopiranje teksta
const gameUrl = () => location.origin + location.pathname.replace(/index\.html$/, '');
async function share(text, btn, file){
  text = tr(text);   // na jeziku igre (lang.js)
  const data = { title: 'Pharos', text, url: gameUrl() };
  try {
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) data.files = [file];
    if (navigator.share) await navigator.share(data);
    else {
      await navigator.clipboard.writeText(text + '\n' + data.url);
      const old = btn.textContent;
      btn.textContent = tr('Kopirano');
      setTimeout(() => { btn.textContent = old; }, 2000);
    }
  } catch (e) {}
}
// Crtež svjetionika iz kolekcije kao slika za dijeljenje
async function lightImage(id){
  try {
    const svg = lighthouseArt(id).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" ');
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    await img.decode();
    const cv = document.createElement('canvas'); cv.width = 800; cv.height = 600;
    const c = cv.getContext('2d'), sky = c.createLinearGradient(0, 0, 0, 600);
    sky.addColorStop(0, '#0f2a48'); sky.addColorStop(.7, '#16365a');
    c.fillStyle = sky; c.fillRect(0, 0, 800, 600);
    c.drawImage(img, 0, 0, 800, 600);
    const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
    return new File([blob], 'pharos-svjetionik.png', { type: 'image/png' });
  } catch (e) { return null; }
}

// Početni zaslon: igra dodana na početni zaslon radi kao aplikacija i preglednik joj ne briše napredak
const installed = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
let installAsk = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installAsk = e; $('installBtn').hidden = false; });
addEventListener('appinstalled', () => { $('installBtn').hidden = true; });
$('installBtn').onclick = async () => {
  if (!installAsk) return;
  installAsk.prompt(); await installAsk.userChoice;
  installAsk = null; $('installBtn').hidden = true;
};
if (!installed && /iPhone|iPad|iPod/.test(navigator.userAgent))
  $('keepNote').insertAdjacentHTML('beforeend', ' <span>Na iPhoneu: u Safariju dodirni „Podijeli”, pa „Dodaj na početni zaslon”. Tako se napredak ne briše sam.</span>');

// Kôd napretka: zvjezdice i viđene upute kao tekst koji se može kopirati i kasnije učitati
// Oblik: PH1.vis-3323.bisevo-33.u-prism,filter – za svaki otok znamenka po broju iz ID-a razine (vis-1, vis-2…)
const backupCode = () => {
  const parts = ['PH1'];
  for (const I of ISLANDS){
    const stars = [];
    for (const L of LEVELS[I.id] || []) if (progress[L.id]) stars[L.id.split('-').pop() - 1] = progress[L.id];
    if (stars.length) parts.push(I.id + '-' + Array.from(stars, s => s || 0).join(''));
  }
  if (tipsSeen.length) parts.push('u-' + tipsSeen.join(','));
  if (daily.parts) parts.push('d-' + daily.parts);   // dijelovi svjetionika iz dnevnih razina
  return parts.join('.');
};
$('backupBtn').onclick = () => {
  $('backupCode').value = backupCode(); $('backupNote').textContent = '';
  $('backup').showModal();
};
$('backupCopy').onclick = async () => {
  $('backupCode').value = backupCode();
  $('backupCode').select();
  try { await navigator.clipboard.writeText($('backupCode').value); $('backupNote').textContent = 'Kôd je kopiran.'; }
  catch (e) { $('backupNote').textContent = 'Kôd je označen. Kopiraj ga ručno.'; }
};
$('backupLoad').onclick = () => {
  try {
    const parts = $('backupCode').value.trim().split('.');
    if (parts.shift() !== 'PH1') throw new Error('oblik');
    const known = new Set(ISLANDS.flatMap(I => LEVELS[I.id] || []).map(L => L.id));
    let n = 0;
    // Učitani napredak se dodaje postojećem: za svaku razinu ostaje veći broj zvjezdica
    for (const part of parts){
      const cut = part.indexOf('-'), name = part.slice(0, cut), rest = part.slice(cut + 1);
      if (name === 'd'){
        daily.parts = Math.max(daily.parts, parseInt(rest) || 0);
        try { localStorage.setItem(DAY_KEY, JSON.stringify(daily)); } catch (e) {}
        continue;
      }
      if (name === 'u'){ for (const k of rest.split(',')) if (TIPS.some(T => T.key === k) && !tipsSeen.includes(k)) tipSeen(k); continue; }
      [...rest].forEach((s, i) => { const id = `${name}-${i + 1}`; if (known.has(id) && '123'.includes(s)){ saveStars(id, +s); n++; } });
    }
    if (!n) throw new Error('prazno');
    $('backupNote').textContent = `Napredak je učitan (riješenih razina: ${n}).`;
    if (!$('start').hidden) showStart(false);
  } catch (e) { $('backupNote').textContent = 'Kôd nije ispravan. Zalijepi cijeli kôd, od „PH1.” do kraja.'; }
};
