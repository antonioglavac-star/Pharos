// Jezik igre. Hrvatski je izvorni: sav tekst u igri piše se na hrvatskom, kao i dosad.
// Za engleski ova datoteka prevodi tekst u trenutku kad se pojavi na ekranu: točan hrvatski tekst traži u
// popisu EN, a tekstove s brojevima i imenima u pravilima EN_RULES. Tekst kojeg nema u popisu ostaje na
// hrvatskom, pa novi tekst u igri treba dodati i ovdje. Jezik se bira u Postavkama (ključ svjetionik-jezik);
// prvi put se uzima jezik uređaja.
const LANG_KEY = 'svjetionik-jezik';
let LANG = 'hr';
try { LANG = localStorage.getItem(LANG_KEY) || (/^(hr|bs|sr|sh)/i.test(navigator.language || '') ? 'hr' : 'en'); } catch (e) {}
document.documentElement.lang = LANG;

const EN = {
  // Izbornik
  'Upali svjetla Jadrana, otok po otok.': 'Light up the Adriatic, island by island.',
  'Igraj': 'Play', 'Nastavi': 'Continue', 'Dnevna razina': 'Daily level', 'Karta otoka': 'Island map',
  'Svjetionici': 'Lighthouses', 'Kako se igra': 'How to play', 'Postavke': 'Settings', 'O igri': 'About',
  // Kako se igra
  'Dodirni ogledalo': 'Tap a mirror', 'da ga okreneš i usmjeriš svjetlo.': 'to turn it and steer the light.',
  'Osvijetli sve brodove': 'Light every boat', 'i razina je riješena.': 'and the level is solved.',
  'dijeli zraku na dvije strane.': 'splits the beam two ways.',
  'Filter': 'A filter', 'boji zraku. Obojeni brod prima samo svoju boju.': 'colours the beam. A coloured boat takes only its own colour.',
  'propušta samo plavo svjetlo.': 'lets only blue light through.',
  'skriva polja dok zraka ne prođe kroz njih.': 'hides tiles until the beam passes through them.',
  'Hrid': 'Reef', ': svaki potez mijenja plimu i oseku. U oseci hrid izroni i zaustavi zraku.': ': every move changes the tide. At low tide the reef surfaces and stops the beam.',
  'rade zajedno, a zrake se smiju križati.': 'work together, and their beams may cross.',
  'Korak natrag': 'Undo', 'vraća zadnji potez, a razina te čeka gdje si stao.': 'takes back your last move, and a level waits for you where you left it.',
  'Zapneš li,': 'If you get stuck,', 'Pokaži potez': 'Show a move',
  'označi jedno ogledalo. Imaš tri pomoći, a potrošena se vrati za 20 minuta.': 'marks one mirror. You have three hints, and a used one returns after 20 minutes.',
  'Riješi u': 'Solve in', 'što manje poteza': 'as few moves as possible',
  'za tri zvjezdice. Sve zvjezdice otoka donose': 'for three stars. All of an island’s stars earn a', 'zlatni svjetionik': 'golden lighthouse',
  'Novi predmeti čekaju te na otocima. Svaki se objasni kad ga prvi put sretneš.': 'New objects await you on the islands. Each is explained when you first meet it.',
  'Razumijem': 'Got it',
  // Postavke i napredak
  'Zvukovi': 'Sounds', 'Ogledala, brodovi i pobjeda': 'Mirrors, boats and winning',
  'Šum valova': 'Wave sounds', 'Tiho more u pozadini': 'A quiet sea in the background',
  'Vibracija': 'Vibration', 'Pri dodiru i pobjedi (ne radi na iPhoneu)': 'On taps and wins (not on iPhone)',
  'Napredak': 'Progress',
  'Napredak se pamti samo na ovom uređaju. Kôd napretka čuva ga i ako se podaci izbrišu.': 'Progress is saved only on this device. A progress code keeps it safe even if the data is cleared.',
  'Na iPhoneu: u Safariju dodirni „Podijeli”, pa „Dodaj na početni zaslon”. Tako se napredak ne briše sam.': 'On iPhone: in Safari tap “Share”, then “Add to Home Screen”. That way your progress is not cleared on its own.',
  'Dodaj na početni zaslon': 'Add to home screen', 'Kôd napretka': 'Progress code', 'Gotovo': 'Done',
  'Kopiraj kôd i spremi ga, npr. pošalji ga sebi u poruci. Na drugom uređaju ili nakon brisanja podataka zalijepi ga ovdje i dodirni „Učitaj”.': 'Copy the code and keep it, e.g. send it to yourself in a message. On another device, or after the data is cleared, paste it here and tap “Load”.',
  'Kopiraj': 'Copy', 'Učitaj': 'Load', 'Zatvori': 'Close',
  'Kôd je kopiran.': 'Code copied.', 'Kôd je označen. Kopiraj ga ručno.': 'The code is selected. Copy it by hand.',
  'Kôd nije ispravan. Zalijepi cijeli kôd, od „PH1.” do kraja.': 'That code is not valid. Paste the whole code, from “PH1.” to the end.',
  // Pauza i O igri
  'Pauza': 'Paused', 'Ispočetka': 'Restart', 'Početni izbornik': 'Main menu', 'Izbornik': 'Menu', 'Novo': 'New',
  'je opuštajuća logička igra. Kao čuvar svjetionika vodiš zraku svjetla do brodova i otok po otok pališ svjetla duž Jadrana.': 'is a relaxing puzzle game. As a lighthouse keeper you guide a beam of light to the boats and light up the Adriatic, island by island.',
  'Ime dolazi od grčkog naziva za Hvar i riječi za svjetionik.': 'The name comes from the Greek name for the island of Hvar and the word for lighthouse.',
  'Ideja i dizajn: Antonio Glavač': 'Concept and design: Antonio Glavač',
  'Obrisi obale i otoka: © OpenStreetMap contributors (ODbL).': 'Coast and island outlines: © OpenStreetMap contributors (ODbL).',
  'Igra broji posjete i riješene razine, bez kolačića i bez osobnih podataka (GoatCounter).': 'The game counts visits and solved levels, with no cookies and no personal data (GoatCounter).',
  // Karta, otok i kolekcija
  'Jadransko more': 'Adriatic Sea', 'Osvijetljeno': 'Lit', 'Kolekcija': 'Collection', 'Skupljeno': 'Collected', 'S': 'N',
  'Svaki osvijetljeni otok donosi jedan pravi jadranski svjetionik.': 'Every island you light brings one real Adriatic lighthouse.',
  'Otok': 'Island', 'Razine': 'Levels', 'Zvjezdice': 'Stars', 'Na ovom otoku': 'On this island', 'Potezi': 'Moves',
  'Otok je osvijetljen.': 'The island is lit.',
  'Magla se podigla i otkrila novi otok. Osvijetli ga i otkrij njegovu priču.': 'The fog has lifted and revealed a new island. Light it up and discover its story.',
  'Osvijetli sve razine i otkrij priču otoka.': 'Light every level and discover the island’s story.',
  'Otvori otok': 'Open island', 'Jadran svijetli': 'The Adriatic is alight', 'Svi otoci su osvijetljeni': 'Every island is lit',
  'Skupi zvjezdice': 'Collect stars', 'Podijeli igru': 'Share the game', 'Podijeli': 'Share', 'Podijeli rezultat': 'Share result', 'Kopirano': 'Copied',
  'Igraj ponovno od 1. razine': 'Play again from level 1', 'Zanimljivost otoka': 'Island story', 'Zanimljivost': 'Did you know',
  '★ Zlatni svjetionik: skupljene su sve zvjezdice otoka.': '★ Golden lighthouse: you have every star on the island.',
  'Tri zvjezdice na svakoj razini donose zlatni svjetionik.': 'Three stars on every level earn the golden lighthouse.',
  'Sljedeći otok': 'Next island', 'Skriven u magli': 'Hidden in fog', 'Stiže s idućom nadogradnjom igre': 'Coming with the next update',
  'Osvijetljen': 'Lit', 'Otvoren': 'Open',
  '★ Zlatni': '★ Golden', 'Sve zvjezdice otoka ga pozlate': 'All the island’s stars turn it golden',
  'Novi svjetionici stižu s novim otocima.': 'New lighthouses arrive with new islands.',
  'Nagrada za dnevne razine': 'Reward for daily levels', 'Novi svjetionik u kolekciji': 'New lighthouse in your collection',
  'Položaj': 'Location', 'Izgrađen': 'Built', 'Visina kule': 'Tower height', 'Svjetlo iznad mora': 'Light above sea',
  'Domet svjetla': 'Light range', 'Posada': 'Crew', 'Izvor podataka:': 'Data source:',
  'Da, svjetioničari i danas rade ovdje': 'Yes, keepers still work here', 'Ne, radi automatski': 'No, it runs automatically',
  // Igra
  'Svi brodovi su u luci': 'All boats are home', 'Dnevna razina je riješena': 'Daily level solved',
  'Na kartu': 'To the map', 'Na otok': 'To the island', 'Sljedeća razina': 'Next level',
  'Nastavljaš gdje si stao. Strelica gore desno vraća razinu na početak.': 'You continue where you left off. The arrow at the top right restarts the level.',
  'Okreni označeno ogledalo.': 'Turn the marked mirror.',
  'Potrebno ogledalo skriva se u magli. Usmjeri zraku u maglu da ga otkriješ.': 'The mirror you need is hidden in fog. Send the beam into the fog to reveal it.',
  'Današnja razina je ista za sve igrače. Riješi je u što manje poteza.': 'Today’s level is the same for every player. Solve it in as few moves as you can.',
  'Oseka': 'Low tide', '· hridi su izronile i zaustavljaju zraku. Sljedeći potez donosi plimu.': '· the reefs are up and stop the beam. The next move brings high tide.',
  'Plima': 'High tide', '· hridi su pod morem i zraka prelazi preko njih. Sljedeći potez donosi oseku.': '· the reefs are under water and the beam passes over them. The next move brings low tide.',
  'Sve zvjezdice otoka su tvoje: svjetionik je sada zlatan!': 'You have every star on the island: its lighthouse is now golden!',
  'Dobivaš još jedan dio svjetionika.': 'You get another lighthouse part.',
  'Skupljeni su svi dijelovi: novi svjetionik je u kolekciji!': 'All parts collected: a new lighthouse is in your collection!',
  // Predmeti i upute
  'Ogledalo': 'Mirror', 'Prizma': 'Prism', 'Filter boja': 'Colour filter', 'Modra špilja': 'Blue Cave', 'Magla': 'Fog',
  'Plima i oseka': 'Tides', 'Dva svjetionika': 'Two lighthouses',
  'Dodirni ogledalo da ga okreneš. Zraka se od njega odbija pod pravim kutom. Dovedi svjetlo do svih brodova.': 'Tap a mirror to turn it. The beam bounces off it at a right angle. Bring light to every boat.',
  'Prizma dijeli zraku na dvije: jedna ide lijevo, a druga desno od smjera iz kojeg je zraka došla.': 'A prism splits the beam in two: one goes left and the other right of the direction the beam came from.',
  'Filter boji zraku. Obojeni brod uplovljava samo uz svjetlo svoje boje, a bijeli brod prima svako svjetlo.': 'A filter colours the beam. A coloured boat sails in only with light of its own colour, while a white boat takes any light.',
  'Modra špilja propušta samo plavu zraku, koja prolazi ravno kroz nju. Svaka druga zraka staje na ulazu.': 'The Blue Cave lets only a blue beam through, straight across. Any other beam stops at the entrance.',
  'Magla skriva dio otoka. Kad zraka uđe u maglu, otkrije što je ispod. Ogledalo u magli ne možeš okretati dok ga zraka ne otkrije.': 'Fog hides part of the island. When the beam enters the fog, it reveals what is underneath. You cannot turn a mirror in the fog until the beam reveals it.',
  'Svaki potez mijenja more. U plimi je hrid pod morem i zraka prelazi preko nje, a u oseci hrid izroni i zaustavi zraku. Pazi koliko poteza napraviš.': 'Every move changes the sea. At high tide the reef is under water and the beam passes over it; at low tide the reef surfaces and stops the beam. Watch how many moves you make.',
  'Na ovom otoku svijetle dva svjetionika. Zrake se mogu križati i ne smetaju jedna drugoj, a brodu je dovoljna bilo koja od njih.': 'Two lighthouses shine on this island. Their beams can cross without getting in each other’s way, and a boat needs only one of them.',
  // Zanimljivosti otoka
  'U 4. stoljeću prije Krista Grci su na Visu osnovali grad Issu, jedno od najstarijih naselja na Jadranu.': 'In the 4th century BC the Greeks founded the town of Issa on Vis, one of the oldest settlements on the Adriatic.',
  'U Modroj špilji sunce ulazi kroz otvor ispod mora i boji cijelu špilju plavim svjetlom.': 'In the Blue Cave sunlight enters through an opening below the sea and fills the whole cave with blue light.',
  'Svetac se zove i Sveti Andrija. Na tom udaljenom otoku desetljećima je živjela samo jedna obitelj.': 'Svetac is also called Sveti Andrija. For decades only a single family lived on this remote island.',
  'Svjetionik na Sušcu sagrađen je 1878. godine i jedan je od rijetkih na Jadranu na kojem i danas rade svjetioničari.': 'The lighthouse on Sušac was built in 1878 and is one of the few on the Adriatic where keepers still work today.',
  'Kuće na Lastovu poznate su po ukrašenim dimnjacima, fumarima.': 'The houses on Lastovo are known for their decorated chimneys, called fumari.',
  'Svjetionik na Palagruži stoji gotovo na pola puta između hrvatske i talijanske obale.': 'The lighthouse on Palagruža stands almost halfway between the Croatian and Italian coasts.',
  // Svjetionici
  'Rt Stončica': 'Cape Stončica', 'Otočić Host': 'Host Islet', 'Otočić Sveti Andrija': 'Sveti Andrija Islet', 'Rt Struga': 'Cape Struga',
  'Sjeveroistočni rt otoka Visa': 'North-eastern cape of the island of Vis', 'Na ulazu u luku Vis': 'At the entrance to the port of Vis',
  'Zapadno od luke Dubrovnik': 'West of the port of Dubrovnik', 'Najviši dio otoka Sušca': 'The highest part of the island of Sušac',
  'Na sredini južne strane otoka Lastova': 'Midway along the south side of the island of Lastovo', 'Sjeverozapadni rt Dugog otoka': 'North-western cape of Dugi otok',
  'Visoka osmerokutna kamena kula uz dugu prizemnu zgradu. Svjetlo se vidi do 30 nautičkih milja daleko, a na svjetioniku i danas radi posada.': 'A tall octagonal stone tower beside a long single-storey building. The light can be seen up to 30 nautical miles away, and a crew still works at the lighthouse.',
  'Biševo nema klasični svjetionik. Najbliži stari svjetionik u Viškom arhipelagu je Host, na otočiću pred gradom Visom.': 'Biševo has no classic lighthouse. The nearest old lighthouse in the Vis archipelago is Host, on an islet off the town of Vis.',
  'Kamena kuća i osmerokutna kula na kamenoj terasi. Svjetionik radi bez posade, a struju dobiva iz sunčanih ploča.': 'A stone house and an octagonal tower on a stone terrace. The lighthouse runs without a crew and is powered by solar panels.',
  'Svetac se zove i Sveti Andrija, ali nema klasični svjetionik. Ovo je svjetionik istog imena, na otočiću kod Dubrovnika.': 'Svetac is also called Sveti Andrija, but it has no classic lighthouse. This is the lighthouse of the same name, on an islet near Dubrovnik.',
  'Kuća svjetioničara stoji na vrhu strme stijene, a kula se diže iz sredine krova. Svjetlo je 69 metara iznad mora.': 'The keeper’s house stands on top of a steep rock, and the tower rises from the middle of its roof. The light is 69 metres above the sea.',
  'Dvokatna kamena kuća sa zelenim škurama i kulom u sredini krova. Svjetlo stoji 94 metra iznad mora i vidi se do 24 nautičke milje.': 'A two-storey stone house with green shutters and a tower in the middle of the roof. The light stands 94 metres above the sea and can be seen up to 24 nautical miles away.',
  'Okrugla kula od neožbukanog kamena diže se iz sredine bijele prizemne kuće. Svjetlo je 104 metra iznad mora i vidi se do 27 nautičkih milja.': 'A round tower of bare stone rises from the middle of a white single-storey house. The light is 104 metres above the sea and can be seen up to 27 nautical miles away.',
  'Visoka kula uz dugu zgradu na kraju Dugog otoka. Svjetlo je 41 metar iznad mora i vidi se do 22 nautičke milje, a na svjetioniku i danas radi posada.': 'A tall tower beside a long building at the tip of Dugi otok. The light is 41 metres above the sea and can be seen up to 22 nautical miles away, and a crew still works at the lighthouse.',
  // Savjeti uz razine: Vis
  'Dodirni ogledalo da ga okreneš i usmjeri svjetlo prema brodu.': 'Tap the mirror to turn it and steer the light towards the boat.',
  'Zraka se odbija od svakog ogledala na putu. Pazi na stijene.': 'The beam bounces off every mirror in its way. Watch out for rocks.',
  'Prizma dijeli svjetlo na dvije zrake. Osvijetli oba broda.': 'A prism splits the light into two beams. Light both boats.',
  'Filter boji zraku. Obojeni brod uplovljava samo uz svjetlo svoje boje.': 'A filter colours the beam. A coloured boat sails in only with light of its own colour.',
  'Prizma dijeli zraku, a filteri je boje. Pošalji svaku boju svom brodu.': 'The prism splits the beam and filters colour it. Send each colour to its boat.',
  'Dva puta vode do istog broda. Samo jedan daje pravu boju.': 'Two paths lead to the same boat. Only one gives the right colour.',
  'Ponekad zraka mora obići cijeli otok da stigne do broda.': 'Sometimes the beam has to go all the way round the island to reach a boat.',
  'Kreni od broda i traži put unatrag do svjetionika.': 'Start from the boat and trace the path back to the lighthouse.',
  'Prizma šalje svjetlo na obje strane. Svaki krak treba svoj put.': 'A prism sends light both ways. Each arm needs its own path.',
  'Zraka mora proći kroz filter prije nego stigne do crvenog broda.': 'The beam must pass through the filter before it reaches the red boat.',
  'Bijeli brod prima bilo koje svjetlo, a plavi samo plavo.': 'The white boat takes any light, the blue one only blue.',
  'Veće more i više ogledala. Ne treba okrenuti baš svako.': 'A bigger sea and more mirrors. You do not need to turn every one.',
  'Dvije prizme i tri broda. Pazi kamo odlazi svaki krak.': 'Two prisms and three boats. Watch where each arm goes.',
  'Crveni i plavi brod traže svaki svoj filter. Ne miješaj puteve.': 'The red and the blue boat each need their own filter. Do not mix the paths.',
  'Dva crvena broda, a samo jedan filter.': 'Two red boats, but only one filter.',
  'Zadnje svjetlo Visa. Sve što si naučio, na jednoj ploči.': 'The last light of Vis. Everything you have learned, on one board.',
  // Biševo
  'Modra špilja propušta samo plavo svjetlo. Oboji zraku prije ulaza.': 'The Blue Cave lets only blue light through. Colour the beam before the entrance.',
  'Kroz otok vodi tunel špilja. Plava zraka prolazi ravno kroz njih.': 'A tunnel of caves runs through the island. A blue beam passes straight through them.',
  'Neke špilje vode na krivi put. Prati gdje zraka izlazi.': 'Some caves lead the wrong way. Follow where the beam comes out.',
  'Prizma dijeli plavu zraku. Oba kraka trebaju svoj put kroz špilje.': 'The prism splits the blue beam. Both arms need their own path through the caves.',
  'Crveno svjetlo ne prolazi kroz špilju. Pazi koju boju šalješ kamo.': 'Red light does not pass through a cave. Mind which colour you send where.',
  'Tri špilje i samo jedan pravi put. Kreni od broda unatrag.': 'Three caves and only one right path. Work backwards from the boat.',
  'Dva filtera i prizma. Svaka boja ima svoj brod.': 'Two filters and a prism. Each colour has its boat.',
  'Dva plava broda, a samo jedna prizma.': 'Two blue boats, but only one prism.',
  'Plava zraka ide kroz špilje, a crvena oko njih.': 'The blue beam goes through the caves, the red one around them.',
  'Tri plava broda i dvije prizme. Ne izgubi nijedan krak.': 'Three blue boats and two prisms. Do not lose a single arm.',
  'Jedan crveni i jedan plavi brod. Svaki traži svoj put.': 'One red boat and one blue. Each needs its own path.',
  'Posljednje svjetlo Biševa: tri broda, dvije prizme i četiri špilje.': 'The last light of Biševo: three boats, two prisms and four caves.',
  // Svetac
  'Magla skriva dio otoka. Pošalji zraku u nju i vidi što je ispod.': 'Fog hides part of the island. Send the beam into it and see what is underneath.',
  'Ogledalo u magli ne možeš okrenuti dok ga zraka ne dotakne.': 'You cannot turn a mirror in the fog until the beam touches it.',
  'Svaki otkriveni dio pomaže ti vidjeti put dalje.': 'Every part you reveal helps you see the way ahead.',
  'Prizma šalje zraku na dvije strane, pa i u maglu.': 'The prism sends the beam two ways, into the fog as well.',
  'Crveni filter skriva se u magli.': 'The red filter is hiding in the fog.',
  'Gusta magla na sjeveru otoka. Prvo je osvijetli.': 'Thick fog in the north of the island. Light it up first.',
  'Plava zraka, špilja i prizma. Magla skriva kraj puta.': 'A blue beam, a cave and a prism. Fog hides the end of the path.',
  'Dva broda, jedna prizma i puno magle.': 'Two boats, one prism and a lot of fog.',
  'Oba filtera skrivena su u magli.': 'Both filters are hidden in the fog.',
  'Tri broda i dvije prizme. Jedna prizma čeka u magli.': 'Three boats and two prisms. One prism waits in the fog.',
  'Plava zraka mora kroz maglu do druge špilje.': 'The blue beam must cross the fog to the second cave.',
  'Posljednje svjetlo Sveca: tri crvena broda i duboka magla.': 'The last light of Svetac: three red boats and deep fog.',
  // Sušac
  'Svaki potez mijenja more. U oseci hrid izroni i zaustavi zraku.': 'Every move changes the sea. At low tide the reef surfaces and stops the beam.',
  'Ponekad treba pričekati plimu. Okreni ogledalo koje ne smeta.': 'Sometimes you have to wait for high tide. Turn a mirror that is not in the way.',
  'Tri hridi, a samo plima ih skriva sve.': 'Three reefs, and only high tide hides them all.',
  'Prizma dijeli zraku, a plima mora stići na vrijeme za oba broda.': 'The prism splits the beam, and high tide must come in time for both boats.',
  'Crveni brod i dvije hridi na putu do njega.': 'A red boat and two reefs on the way to it.',
  'Broji poteze: plima mora doći baš kad zraka stigne do hridi.': 'Count your moves: high tide must come just as the beam reaches the reef.',
  'Dva broda i prizma. Na putu su dvije hridi.': 'Two boats and a prism. Two reefs stand in the way.',
  'Prizma šalje svjetlo na dvije strane, a obje vode preko hridi.': 'The prism sends light two ways, and both lead over reefs.',
  'Plavi brod čeka iza hridi, a crveni na zapadu.': 'The blue boat waits behind a reef, the red one in the west.',
  'Tri broda, dvije prizme i dvije hridi.': 'Three boats, two prisms and two reefs.',
  'Dva crvena broda, jedan filter i more koje se stalno mijenja.': 'Two red boats, one filter and a sea that keeps changing.',
  'Posljednje svjetlo Sušca: tri plava broda i dvije hridi.': 'The last light of Sušac: three blue boats and two reefs.',
  // Lastovo
  'Dva svjetionika i dva broda. Svaki svjetionik ima svoj put.': 'Two lighthouses and two boats. Each lighthouse has its own path.',
  'Zrake se mogu križati i ne smetaju jedna drugoj.': 'Beams can cross without getting in each other’s way.',
  'Neka ogledala su zamke. Ne treba okrenuti baš svako.': 'Some mirrors are traps. You do not need to turn every one.',
  'Crveni brod traži crveni filter, a bijeli prima svako svjetlo.': 'The red boat needs the red filter, the white one takes any light.',
  'Prizma šalje jednu zraku na dvije strane, a brodova je tri.': 'The prism sends one beam two ways, and there are three boats.',
  'Plava zraka mora proći kroz špilju do plavog broda.': 'The blue beam must pass through the cave to the blue boat.',
  'Tri broda, jedna prizma i puno lažnih putova.': 'Three boats, one prism and plenty of false paths.',
  'Dva filtera i dvije boje. Pazi koja zraka ide kamo.': 'Two filters and two colours. Mind which beam goes where.',
  'Magla skriva dio puta. Pošalji zraku u nju.': 'Fog hides part of the path. Send the beam into it.',
  'Špilje propuštaju samo plavo, a prizma dijeli zraku.': 'Caves let only blue through, and the prism splits the beam.',
  'Gusta magla skriva put do crvenog broda.': 'Thick fog hides the way to the red boat.',
  'Četiri broda i dvije prizme. Kreni od najudaljenijeg.': 'Four boats and two prisms. Start with the farthest one.',
  'Sve zajedno: filteri, prizma, špilja i magla.': 'All together: filters, a prism, a cave and fog.',
  'Posljednje svjetlo Lastova: 15 poteza, bez ijednog viška.': 'The last light of Lastovo: 15 moves, not one to spare.',
  // Opisi za čitače zaslona
  'Natrag na izbornik': 'Back to menu', 'Natrag': 'Back', 'Natrag na kartu': 'Back to map', 'Natrag na otok': 'Back to island',
  'Ogledalo, dodirni za okretanje': 'Mirror, tap to turn', 'Skriveno u magli': 'Hidden in fog', 'Svjetionik': 'Lighthouse', 'preostalo pomoći': 'hints left'
};

const enMoves = n => n === '1' ? 'move' : 'moves';
const EN_RULES = [
  [/^Razina (\d+)$/, 'Level $1'],
  [/^(\d+)\. razina$/, 'Level $1'],
  [/^Igraj (\d+)\. razinu$/, 'Play level $1'],
  [/^Otplovi na otok (.+)$/, 'Sail to $1'],
  [/^Otok (.+) je osvijetljen$/, '$1 Island is lit'],
  [/^Otok (.+) je osvijetljen! Pharos: upali svjetla Jadrana, otok po otok\.$/, '$1 Island is lit! Pharos: light up the Adriatic, island by island.'],
  [/^Pharos: upali svjetla Jadrana, otok po otok\.$/, 'Pharos: light up the Adriatic, island by island.'],
  [/^Pharos · dnevna razina (.+)\n(.+) · (\d+) (?:potez|poteza) \(cilj (\d+)\)$/, (m, d, st, n, p) => `Pharos · daily level ${d}\n${st} · ${n} ${enMoves(n)} (goal ${p})`],
  [/^Otok (.+) · (\d+)\.$/, '$1 Island · $2'],
  [/^Nagrada · (\d+)\.$/, 'Reward · $1'],
  [/^Za otok (.+)$/, 'For $1 Island'],
  [/^Osvijetli otok (.+) i magla će se podići$/, 'Light $1 and the fog will lift'],
  [/^Osvijetli otok (.+)$/, 'Light $1 Island'],
  [/^Osvijetli svih (\d+) razina i otkrij priču o otoku (.+)\.$/, 'Light all $1 levels and discover the story of $2.'],
  [/^Otok (.+)$/, '$1 Island'],
  [/^Čeka te novi otok: (.+)$/, 'A new island awaits: $1'],
  [/^Osvijetljeno otoka: (\d+) \/ (\d+)$/, 'Islands lit: $1 / $2'],
  [/^Novi otok · (\d+) \/ (\d+) razina$/, 'New island · $1 / $2 levels'],
  [/^(\d+) \/ (\d+) razina$/, '$1 / $2 levels'],
  [/^Skupljeno (\d+) od (\d+)$/, 'Collected $1 of $2'],
  [/^Dnevne razine: (\d+) od (\d+) dijelova$/, 'Daily levels: $1 of $2 parts'],
  [/^(\d+) nautičk(?:ih|e) milj[ae]$/, '$1 nautical miles'],
  [/^Još (\d+) zvjezdic[ae] do zlatnog svjetionika\.$/, (m, n) => `${n} more ${n === '1' ? 'star' : 'stars'} to the golden lighthouse.`],
  [/^Pomoć je potrošena\. Nova stiže za (\d+) min\.$/, 'No hints left. A new one arrives in $1 min.'],
  [/^Napredak je učitan \(riješenih razina: (\d+)\)\.$/, 'Progress loaded (levels solved: $1).'],
  [/^Novi otoci izronit će iz magle s idućom nadogradnjom igre\. Dotad skupi sve zvjezdice: imaš ih (\d+) od (\d+)\.$/, 'New islands will emerge from the fog with the next update. Until then, collect every star: you have $1 of $2.'],
  [/^Novi otoci izronit će iz magle s idućom nadogradnjom igre\. Imaš i sve zvjezdice: (\d+) od (\d+)\. Svaka čast!$/, 'New islands will emerge from the fog with the next update. You have every star too: $1 of $2. Well done!'],
  [/^Dobivaš dio svjetionika: (\d+) od (\d+)\.$/, 'You get a lighthouse part: $1 of $2.'],
  // Poruka o pobjedi ima i neobavezni nastavak (zlatni svjetionik, dio svjetionika), koji se prevodi zasebno
  [/^Riješeno u (\d+) (?:potezu|poteza) \(cilj: (\d+)\)\.(?: (.+))?$/, (m, n, p, rest) => `Solved in ${n} ${enMoves(n)} (goal: ${p}).` + (rest ? ' ' + tr(rest) : '')],
  [/^Zaključano do (\d+)\. razine$/, 'Locked until level $1'],
  [/^Razina (\d+), riješena, (\d) od 3 zvjezdice$/, 'Level $1, solved, $2 of 3 stars'],
  [/^Razina (\d+), otvorena$/, 'Level $1, open'],
  [/^Razina (\d+), zaključana$/, 'Level $1, locked']
];

// Prijevod jednog teksta; na hrvatskom vraća isti tekst
function tr(s){
  if (LANG === 'hr') return s;
  if (Object.prototype.hasOwnProperty.call(EN, s)) return EN[s];
  for (const [re, to] of EN_RULES) if (re.test(s)) return s.replace(re, to);
  return s;
}

if (LANG !== 'hr'){
  // Tekst se prevodi čim se pojavi u stranici, pa ostatak igre ne mora znati za jezike
  const trText = n => {
    const raw = n.nodeValue, core = raw.trim().replace(/\s+/g, ' ');
    if (!core) return;
    const out = tr(core);
    if (out !== core) n.nodeValue = raw.match(/^\s*/)[0] + out + raw.match(/\s*$/)[0];
  };
  const trAttr = el => { const a = el.getAttribute('aria-label'); if (a){ const out = tr(a); if (out !== a) el.setAttribute('aria-label', out); } };
  const walk = root => {
    if (root.nodeType === 3) return trText(root);
    if (root.nodeType !== 1 || /^(SCRIPT|STYLE|TEXTAREA)$/.test(root.tagName)) return;
    trAttr(root);
    root.querySelectorAll('[aria-label]').forEach(trAttr);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n; (n = w.nextNode());) if (!/^(SCRIPT|STYLE|TEXTAREA)$/.test(n.parentNode.tagName)) trText(n);
  };
  walk(document.body);
  new MutationObserver(list => {
    for (const m of list){
      if (m.type === 'characterData') trText(m.target);
      else if (m.type === 'attributes') trAttr(m.target);
      else m.addedNodes.forEach(walk);
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['aria-label'] });
}

// Izbor jezika u Postavkama: sprema se i igra se ponovno učita na novom jeziku
document.querySelectorAll('[data-lang]').forEach(b => {
  b.setAttribute('aria-pressed', b.dataset.lang === LANG);
  b.onclick = () => { try { localStorage.setItem(LANG_KEY, b.dataset.lang); } catch (e) {} location.reload(); };
});
