# Pharos

Ime igre je **Pharos** (grčko ime za Hvar i riječ za svjetionik). Mapa projekta i ključ spremanja (`svjetionik-napredak`) zadržavaju staro ime da se ne izgubi napredak igrača.

Opuštajuća mobilna logička igra. Igrač je čuvar svjetionika na jadranskim otocima i okretanjem ogledala vodi zraku svjetla do brodova. Kratke sesije (1–3 min), bez tajmera i stresa.

Vlasnik projekta je Antonio, student UX dizajna bez programerske pozadine. Komuniciraj na hrvatskom, kratko i izravno. Objašnjavaj promjene jednostavnim riječima, bez žargona.

## Vizija

Igrač se kreće kartom hrvatske obale i otok po otok pali svjetlo duž Jadrana. Otoci se dodaju **postupno, kroz nadogradnje**, a ne svi odjednom. Karta od početka prikazuje i otoke koji tek dolaze („uskoro”). Dugoročno karta može obuhvatiti svih 1000+ otoka: veći otoci imaju ručno složene razine, a manji otočići i hridi mogu dobiti kratke ili automatski složene zagonetke.

Svaki otok ima zanimljivost ili legendu (`fact`) koja se otkrije kad igrač riješi sve razine na otoku. **Svaku činjenicu Antonio mora provjeriti prije objave.**

## Struktura

- `index.html` – tri ekrana: početni izbornik (`#start`), karta (`#map`) i igra (`#game`), te prozori „Kako se igra” (`#how`) i „O igri” (`#about`)
- `js/feel.js` – zvukovi (stvoreni u pregledniku, bez audio datoteka), šum valova i vibracija; postavke se pamte pod ključem `svjetionik-postavke`
- `js/menu.js` – početni izbornik i animacija pokretanja (lampa se upali, zraka obiđe nebo i stane na natpisu; dodir je preskače; isključena uz smanjeno kretanje)
- `style.css` – izgled (boje su tokeni u `:root`)
- `js/islands.js` – popis otoka redom otključavanja (`ISLANDS`), boje zraka (`COL`) i prazni `LEVELS`
- `js/islands/<otok>.js` – razine jednog otoka, npr. `js/islands/vis.js` puni `LEVELS.vis`
- `js/game.js` – logika igre: crtanje mreže, okretanje ogledala, praćenje zrake, pobjeda, spremanje napretka
- `js/map.js` – karta otoka i kartica odabranog otoka
- `js/chart.js` – obrisi obale i otoka prema OpenStreetMapu (stvara ga `tools/build-chart.js`, ne mijenjati ručno; upute su na vrhu alata). Navođenje izvora „© OpenStreetMap” mora ostati na karti i u „O igri”
- `assets/` – Antonijev logo i ikona: `pharos-logo.png` i `pharos-app-icon.png` su izvornici (ne mijenjati), a `logo.png` (prozirna pozadina) i `icon-*.png` su pripremljene verzije za igru
- `docs/testiranje.md` – bilješke s testiranja s igračima (za portfolio)
- `manifest.webmanifest` – ime i ikona kad se igra doda na početni zaslon mobitela
- `tools/check-levels.js` – provjerava da je svaka razina rješiva, da je `par` točan i da se ID-jevi ne ponavljaju

Nema build koraka ni ovisnosti. Igra se pokreće otvaranjem `index.html` u pregledniku.

## Objava

- Kod je na GitHubu: https://github.com/antonioglavac-star/Pharos (javni repozitorij, grana `main`)
- Igra je objavljena preko GitHub Pages: https://antonioglavac-star.github.io/Pharos/
- Svaki `git push` na `main` sam objavi novu verziju za 1–2 minute. Commit i push radi samo kad Antonio to zatraži.

## Dodavanje novog otoka

1. U `js/islands.js` otok već postoji u `ISLANDS` (ili ga dodaj na pravo mjesto u redoslijedu) i upiši `fact`.
2. Napravi `js/islands/<id>.js` s `LEVELS.<id> = [ … ]`.
3. Dodaj `<script src="js/islands/<id>.js">` u `index.html`, prije `game.js`.
4. Pokreni `node tools/check-levels.js`.

Otok bez razina na karti piše „uskoro”. Otok s razinama otvara se kad su riješeni svi prethodni otoci koji imaju razine.

## Format razine

```js
{ id:'vis-4', w:6, h:6, par:1, light:{x:0,y:2,d:[1,0]}, hint:'…', cells:{ 'x,y': 'oznaka' } }
```

`id` se **nikad ne mijenja** jer se po njemu u pregledniku pamti napredak igrača (`localStorage`, ključ `svjetionik-napredak`). Nove razine smiju se ubaciti bilo gdje u popis, ali dobivaju novi, još nekorišteni ID. Broj razine na ekranu je samo redni broj u popisu.

Neobavezno polje `shape` daje ploči oblik otoka: `h` redova po `w` znakova, `'.'` je more izvan ploče, a `'x'` je dio ploče. Zraka staje na obali. Svjetionik i sve oznake moraju biti na ploči (to provjerava alat). Igra sama crta zaobljenu obalu i iscrtkanu liniju dubine. Izbjegavaj ćelije ploče koje se dodiruju samo kutom.

```js
shape:['..xxx.',
       'xxxxx.',
       'xxxxxx', … ]
```

Neobavezno polje `fog` (od Sveca) prekriva polja maglom: isti oblik kao `shape`, `'m'` je magla, `'.'` je vidljivo. Polje pod maglom otkrije se kad zraka uđe u njega i ostaje otkriveno do kraja pokušaja; skriveno ogledalo ne može se okretati. Svjetionik i brodovi ne smiju biti u magli. Alat provjerava i da se najkraće rješenje može odigrati redom otkrivanja.

Oznake ćelija:
- `/` i `\` – ogledalo (igrač ga okreće dodirom)
- `#` – stijena (blokira zraku)
- `P` – prizma (dijeli zraku na dvije, okomito na smjer dolaska)
- `Fr`, `Fb` – filter (boji zraku u crveno / plavo)
- `B` – brod (prima bilo koje svjetlo), `Br`, `Bb` – obojeni brod (samo svoja boja)
- `C` – Modra špilja (od Biševa): plava zraka prolazi ravno kroz nju i špilja zasvijetli, svaka druga zraka staje na ulazu

`par` je najmanji broj poteza. Nakon svake izmjene razina obavezno pokreni `node tools/check-levels.js` i ispravi `par` ako ne odgovara. Razina ne smije biti riješena na startu.

## Plan razvoja (redom)

1. ~~Filteri boja~~ (gotovo)
2. ~~Otoci kao zasebne datoteke, spremanje napretka, probna karta~~ (gotovo)
3. Dovršiti otok Vis do 15–20 razina s postupnim rastom težine (16 razina složeno, čeka igranje i dotjerivanje)
4. Novi otoci jedan po jedan (~~Biševo~~ – 12 razina, Modra špilja; ~~Svetac~~ – 12 razina, magla; Sušac, Lastovo, Palagruža…), uz nove mehanike s vremenom (npr. brod koji se kreće, plima, magla, dva svjetionika)
5. ~~Pravi obrisi otoka (OpenStreetMap, uz navođenje izvora)~~ (gotovo za srednju i južnu Dalmaciju); još treba karta s pomicanjem i zumiranjem za cijelu obalu
6. ~~Osjećaj igre: zvuk valova, animacija broda koji uplovljava, vibracija~~ (gotovo, uz postavke u izborniku)
7. UX dokumentacija: persona, user flow, wireframeovi (za portfolio)

## Smjernice

- Vizual: mornarsko plava podloga, tanke linije boje pijeska (`--sand`) kao na staroj pomorskoj karti; jedina topla boja je zraka svjetla (`--beam`)
- Ploča razine ima oblik otoka (polje `shape`). Igra zaglađuje obalu i dodaje blage valove (uvijek iste za istu razinu, ovise o ID-u). Ideja za kasnije: obris prema pravom otoku
- Mora raditi na mobitelu (oko 400 px širine) i podržati `prefers-reduced-motion`
- Tekst u igri je na hrvatskom
