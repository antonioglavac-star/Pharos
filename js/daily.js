// Dnevna razina: svaki dan ista razina za sve igrače (popis DAILY u daily-levels.js, bira se po datumu).
// Otvara se kad je osvijetljen prvi otok. Propušten dan nema posljedica. Prvo rješenje dana donosi
// jedan dio svjetionika; DAY_PARTS dijelova sastavi nagradni svjetionik u kolekciji (BONUS u lighthouses.js).
// Ne utječe na otoke ni na njihove zvjezdice. Koristi samo predmete s prvog otoka.
const DAY_KEY = 'svjetionik-dnevna', DAY_PARTS = 7;
let daily = { days: {}, parts: 0 };   // days: rezultat po datumu (potezi i zvjezdice), parts: skupljeni dijelovi
try { daily = JSON.parse(localStorage.getItem(DAY_KEY)) || daily; } catch (e) {}

// Današnji dan po satu igrača: redni broj dana (za izbor razine), ključ za spremanje i natpis
function today(){
  const d = new Date(), n = Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(2026, 10, 1)) / 864e5);
  return { n, key: `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`, label: `${d.getDate()}. ${d.getMonth()+1}.` };
}
const dailyOpen = () => islandDone(ISLANDS[0].id);
const dailyDone = () => !!daily.days[today().key];
const bonusOpen = () => daily.parts >= DAY_PARTS;

function openDaily(){
  const T = today(), L = DAILY[((T.n % DAILY.length) + DAILY.length) % DAILY.length];
  isl = { id: 'dan', name: 'Dnevna razina', daily: T };
  LV = [{ ...L, hint: 'Današnja razina je ista za sve igrače. Riješi je u što manje poteza.' }];
  ['map','isle','lights','start'].forEach(s => $(s).hidden = true); $('game').hidden = false;
  $('island').textContent = 'Dnevna razina';
  load(0);
  window.scrollTo(0, 0);
}

// Završetak dnevne razine: rezultat dana, dio svjetionika za prvo rješenje i dijeljenje rezultata
function dailyWin(L, s){
  const T = isl.daily, had = daily.days[T.key], first = !had;
  if (first){ daily.parts++; track('dnevna/' + L.id); }
  if (first || moves < had.m) daily.days[T.key] = { m: moves, s };
  try { localStorage.setItem(DAY_KEY, JSON.stringify(daily)); } catch (e) {}
  const best = daily.days[T.key], justBonus = first && daily.parts === DAY_PARTS;
  $('winTitle').textContent = 'Dnevna razina je riješena';
  $('winText').textContent = `Riješeno u ${moves} ${moves===1?'potezu':'poteza'} (cilj: ${L.par}).`
    + (!first ? '' : bonusOpen() && !justBonus ? ' Dobivaš još jedan dio svjetionika.'
      : justBonus ? ' Skupljeni su svi dijelovi: novi svjetionik je u kolekciji!'
      : ` Dobivaš dio svjetionika: ${daily.parts} od ${DAY_PARTS}.`);
  $('winFact').hidden = true;
  $('winLight').hidden = !justBonus;
  if (justBonus){
    const H = BONUS.velirat;
    $('winLight').innerHTML = `<svg viewBox="40 0 80 120" aria-hidden="true">${H.svg}</svg><span><small>Novi svjetionik u kolekciji</small><b>${H.name}</b></span>`;
    $('winLight').onclick = () => openLight('velirat');
  }
  $('next').textContent = 'Izbornik';
  $('winIsle').hidden = true;
  $('winShare').hidden = false;
  $('winShare').textContent = 'Podijeli rezultat';
  $('winShare').onclick = () => share(`Pharos · dnevna razina ${T.label}\n${'★'.repeat(best.s)}${'☆'.repeat(3-best.s)} · ${best.m} ${best.m===1?'potez':'poteza'} (cilj ${L.par})`, $('winShare'));
  $('win').hidden = false;
  $('next').focus();
}

$('dailyBtn').onclick = () => openDaily();
