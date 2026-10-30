// Kolekcija svjetionika: kad igrač osvijetli otok, dobije jedan stvarni svjetionik.
// Podaci su s Plovputovih stranica (plovput.hr, Pomorska signalizacija > Svjetionici), crteži prema njihovim fotografijama.
// Otoci bez klasičnog svjetionika (Biševo, Svetac) dobiju najbliži ili istoimeni, uz iskrenu napomenu (note).
// Antonio provjerava podatke prije objave.
const LIGHTHOUSES = {
  vis: {
    name:'Rt Stončica', where:'Sjeveroistočni rt otoka Visa', year:1865, tower:28, light:38, range:30, crew:true,
    about:'Visoka osmerokutna kamena kula uz dugu prizemnu zgradu. Svjetlo se vidi do 30 nautičkih milja daleko, a na svjetioniku i danas radi posada.',
    src:'https://www.plovput.hr/pomorska-signalizacija/svjetionici/svjetionik/a/view/id/6',
    svg:`<path d="M0 100Q18 90 36 91l20-5h64q22 2 40 12v22H0z" fill="#7b7366"/>
      <path d="M8 98q10-4 20-3M128 94q10 1 18 5" stroke="#5f584d" stroke-width="2" fill="none" stroke-linecap="round"/>
      <rect x="26" y="74" width="78" height="14" fill="#d8cdb4"/><rect x="26" y="84" width="78" height="4" fill="#c3b79c"/>
      <path d="M22 75l12-9h64l10 9z" fill="#c45f3a"/><path d="M22 75l12-9h4l-10 9z" fill="#9e4a2c"/>
      <g fill="#6d6250"><rect x="34" y="78" width="4" height="5"/><rect x="48" y="78" width="4" height="5"/><rect x="62" y="78" width="4" height="5"/><rect x="76" y="78" width="4" height="5"/><rect x="90" y="78" width="4" height="5"/></g>
      <rect x="102" y="80" width="22" height="8" fill="#cfc3a8"/>
      <path d="M106 88V38h13v50z" fill="#d8cdb4"/><path d="M113 88V38h6v50z" fill="#c3b79c"/>
      <rect x="110" y="52" width="2" height="4" fill="#6d6250"/><rect x="110" y="66" width="2" height="4" fill="#6d6250"/>
      <circle cx="112.5" cy="29" r="13" fill="#ffc35a" opacity=".22"/>
      <rect x="103" y="35" width="19" height="3" fill="#e9e4d8"/>
      <path d="M104 35v-6M108 35v-6M112.5 35v-6M117 35v-6M121 35v-6M104 29h17" stroke="#2b3440" stroke-width="1"/>
      <rect x="107" y="23" width="11" height="10" fill="#ffd88a"/><path d="M110.5 23v10M114.5 23v10" stroke="#2b3440" stroke-width=".8"/>
      <path d="M105.5 23q7-8 14 0z" fill="#2b3440"/><circle cx="112.5" cy="15.5" r="1.6" fill="#2b3440"/>`
  },
  bisevo: {
    name:'Otočić Host', where:'Na ulazu u luku Vis', year:1873, tower:11, light:21, range:8, crew:false,
    note:'Biševo nema klasični svjetionik. Najbliži stari svjetionik u Viškom arhipelagu je Host, na otočiću pred gradom Visom.',
    about:'Kamena kuća i osmerokutna kula na kamenoj terasi. Svjetionik radi bez posade, a struju dobiva iz sunčanih ploča.',
    src:'https://www.plovput.hr/pomorska-signalizacija/svjetionici/svjetionik/a/view/id/1',
    svg:`<path d="M6 102q20-16 50-15l56-2q30 1 44 17v18H6z" fill="#7b7366"/>
      <path d="M20 99q12-6 26-7M118 90q16 2 26 9" stroke="#5f584d" stroke-width="2" fill="none" stroke-linecap="round"/>
      <rect x="30" y="80" width="98" height="10" fill="#cfc3a8"/><path d="M30 84h98" stroke="#b9ad93" stroke-width="1"/>
      <rect x="36" y="58" width="58" height="22" fill="#d8cdb4"/><rect x="36" y="74" width="58" height="6" fill="#c3b79c"/>
      <path d="M32 59l13-11h40l13 11z" fill="#c45f3a"/><path d="M32 59l13-11h4l-11 11z" fill="#9e4a2c"/>
      <g fill="#3f7a52"><rect x="44" y="63" width="6" height="10"/><rect x="60" y="63" width="6" height="10"/><rect x="76" y="63" width="6" height="10"/></g>
      <path d="M94 80V40h17v40z" fill="#d8cdb4"/><path d="M103 80V40h8v40z" fill="#c3b79c"/>
      <rect x="99" y="48" width="2.4" height="5" fill="#6d6250"/><rect x="99" y="60" width="2.4" height="5" fill="#6d6250"/>
      <rect x="91" y="37" width="23" height="3" fill="#e9e4d8"/>
      <path d="M92 37v-6M97 37v-6M102.5 37v-6M108 37v-6M113 37v-6M92 31h21" stroke="#2b3440" stroke-width="1"/>
      <circle cx="102.5" cy="26" r="9" fill="#ffc35a" opacity=".25"/>
      <rect x="100" y="25" width="5" height="7" rx="1" fill="#f4f2ec"/><rect x="101" y="22" width="3" height="3" fill="#ffd88a"/>`
  },
  svetac: {
    name:'Otočić Sveti Andrija', where:'Zapadno od luke Dubrovnik', year:1873, tower:17, light:69, range:24, crew:true,
    note:'Svetac se zove i Sveti Andrija, ali nema klasični svjetionik. Ovo je svjetionik istog imena, na otočiću kod Dubrovnika.',
    about:'Kuća svjetioničara stoji na vrhu strme stijene, a kula se diže iz sredine krova. Svjetlo je 69 metara iznad mora.',
    src:'https://www.plovput.hr/pomorska-signalizacija/svjetionici/svjetionik/a/view/id/11',
    svg:`<path d="M14 120l12-36q8-24 30-30l46-2q22 6 30 30l14 38z" fill="#a49c8e"/>
      <path d="M30 104l10-22M48 112l6-30M110 100l-8-26M128 110l-6-22M70 116l4-26" stroke="#7d766a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M26 84q8-6 14-2M118 78q8 2 12 8" stroke="#c9c2b5" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M128 60q-6-18 0-34q6 16 0 34z" fill="#2f5a3a"/><path d="M36 64q-4-12 0-22q4 10 0 22z" fill="#2f5a3a"/>
      <rect x="52" y="40" width="58" height="16" fill="#d8cdb4"/><rect x="52" y="51" width="58" height="5" fill="#c3b79c"/>
      <path d="M48 41l12-9h42l12 9z" fill="#c45f3a"/><path d="M48 41l12-9h4l-10 9z" fill="#9e4a2c"/>
      <g fill="#3f7a52"><rect x="60" y="44" width="5" height="8"/><rect x="74" y="44" width="5" height="8"/><rect x="96" y="44" width="5" height="8"/></g>
      <rect x="74" y="20" width="14" height="13" fill="#d8cdb4"/><rect x="81" y="20" width="7" height="13" fill="#c3b79c"/>
      <rect x="71" y="18" width="20" height="3" fill="#e9e4d8"/>
      <path d="M72 18v-5M76.5 18v-5M81 18v-5M85.5 18v-5M90 18v-5M72 13h18" stroke="#2b3440" stroke-width="1"/>
      <circle cx="81" cy="11" r="11" fill="#ffc35a" opacity=".22"/>
      <rect x="76" y="6" width="10" height="7" fill="#ffd88a"/><path d="M79.5 6v7M82.5 6v7" stroke="#e9e4d8" stroke-width=".8"/>
      <path d="M75 6q6-6 12 0z" fill="#f1efe8"/><path d="M81 3V0" stroke="#e9e4d8" stroke-width="1"/>`
  },
  susac: {
    name:'Otok Sušac', where:'Najviši dio otoka Sušca', year:1878, tower:17, light:94, range:24, crew:true,
    about:'Dvokatna kamena kuća sa zelenim škurama i kulom u sredini krova. Svjetlo stoji 94 metra iznad mora i vidi se do 24 nautičke milje.',
    src:'https://www.plovput.hr/pomorska-signalizacija/svjetionici/svjetionik/a/view/id/17',
    svg:`<path d="M0 106q36-26 80-27q46 1 80 21v20H0z" fill="#7b7366"/>
      <path d="M14 104q14-10 28-12M118 88q16 4 30 12" stroke="#5f584d" stroke-width="2" fill="none" stroke-linecap="round"/>
      <rect x="38" y="86" width="84" height="8" fill="#cfc3a8"/>
      <rect x="44" y="50" width="72" height="36" fill="#e3dccb"/><path d="M44 68h72" stroke="#cdc5b3" stroke-width="1.5"/><rect x="44" y="80" width="72" height="6" fill="#d2cab8"/>
      <g fill="#3f7a52"><rect x="52" y="55" width="7" height="10"/><rect x="76" y="55" width="7" height="10"/><rect x="100" y="55" width="7" height="10"/>
        <rect x="52" y="71" width="7" height="10"/><rect x="76" y="71" width="7" height="10"/><rect x="100" y="71" width="7" height="10"/></g>
      <rect x="71" y="26" width="18" height="18" fill="#e3dccb"/><rect x="80" y="26" width="9" height="18" fill="#d2cab8"/>
      <path d="M40 51l14-11h52l14 11z" fill="#c45f3a"/><path d="M40 51l14-11h4l-12 11z" fill="#9e4a2c"/>
      <rect x="67" y="23" width="26" height="3" fill="#2b3440"/>
      <path d="M68 23v-6M74 23v-6M80 23v-6M86 23v-6M92 23v-6M68 17h24" stroke="#2b3440" stroke-width="1"/>
      <circle cx="80" cy="14" r="12" fill="#ffc35a" opacity=".22"/>
      <rect x="73" y="9" width="14" height="11" fill="#9fc3df"/><rect x="76" y="11" width="8" height="7" fill="#ffd88a"/>
      <path d="M77.5 9v11M82.5 9v11" stroke="#2b3440" stroke-width=".8"/>
      <path d="M72 9q8-8 16 0z" fill="#f1efe8"/><path d="M80 3V1M78 1.5h4" stroke="#2b3440" stroke-width="1"/>`
  }
};

// Crtež svjetionika s morem; isti crtež služi i za zaključanu sliku (sivu, preko CSS-a)
const lighthouseArt = id => `<svg class="lh-art" viewBox="0 0 160 120" aria-hidden="true">
  <rect y="96" width="160" height="24" fill="#173f63"/><path d="M0 104q10-3 20 0t20 0 20 0 20 0 20 0 20 0 20 0 20 0" stroke="#e9eff7" stroke-opacity=".25" fill="none"/>
  ${LIGHTHOUSES[id].svg}</svg>`;

const isleOf = id => ISLANDS.find(I => I.id===id);

function showLights(from){
  ['start','map','isle','game'].forEach(s => $(s).hidden = true);
  $('lights').hidden = false;
  $('lightsBack').onclick = () => from==='map' ? showMap() : showStart(false);
  const ids = Object.keys(LIGHTHOUSES), got = ids.filter(id => islandDone(id));
  $('lightsCount').textContent = `${got.length}/${ids.length}`;
  $('lightsGrid').innerHTML = ids.map(id => {
    const H = LIGHTHOUSES[id], open = islandDone(id), I = isleOf(id);
    // Ime otoka smije se vidjeti tek kad je otok izašao iz magle
    const need = islandStatus(ISLANDS.indexOf(I))==='open' ? 'Osvijetli otok ' + I.name : 'Skriven u magli';
    return `<button class="lh-card ${open ? '' : 'locked'}" data-id="${id}" ${open ? '' : 'disabled'} aria-label="${open ? H.name : 'Zaključan svjetionik. ' + need}">
      ${lighthouseArt(id)}
      <span class="lh-name">${open ? H.name : '???'}</span>
      <span class="lh-sub">${open ? 'Otok ' + I.name + ' · ' + H.year + '.' : need}</span>
    </button>`;
  }).join('') + `<div class="lh-more">Novi svjetionici stižu s novim otocima.</div>`;
  $('lightsGrid').querySelectorAll('.lh-card:not(.locked)').forEach(b => b.onclick = () => openLight(b.dataset.id));
  window.scrollTo(0, 0);
}

function openLight(id){
  const H = LIGHTHOUSES[id], I = isleOf(id);
  $('lightBody').innerHTML = `${lighthouseArt(id)}
    <span class="eyebrow">Za otok ${I.name}</span>
    <h2>${H.name}</h2>
    <p>${H.about}</p>
    ${H.note ? `<p class="lh-note">${H.note}</p>` : ''}
    <dl class="lh-facts">
      <div><dt>Položaj</dt><dd>${H.where}</dd></div>
      <div><dt>Izgrađen</dt><dd>${H.year}.</dd></div>
      <div><dt>Visina kule</dt><dd>${H.tower} m</dd></div>
      <div><dt>Svjetlo iznad mora</dt><dd>${H.light} m</dd></div>
      <div><dt>Domet svjetla</dt><dd>${H.range} nautičkih milja</dd></div>
      <div><dt>Posada</dt><dd>${H.crew ? 'Da, svjetioničari i danas rade ovdje' : 'Ne, radi automatski'}</dd></div>
    </dl>
    <p class="lh-src">Izvor podataka: <a href="${H.src}" target="_blank" rel="noopener">Plovput</a></p>`;
  $('lightDlg').showModal();
}
