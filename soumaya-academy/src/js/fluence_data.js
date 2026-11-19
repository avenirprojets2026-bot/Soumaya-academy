// Vlot lezen (fluence) : 14 textes ORIGINAUX écrits pour Soumaya Academy, sur les thèmes de son livret de classe
// (le livret de l'éditeur n'est pas recopié). Format : lignes numérotées courtes + 3 questions de compréhension.
// q : [question, bonne réponse, mauvaise 1, mauvaise 2]
export const TEKSTEN = [
  {
    id: 'ardennen', t: 'Naar de Ardennen', c: '#c9a227', fr: 'Vers les Ardennes',
    l: [
      'Elke zomer gaan we met het hele gezin op vakantie.', 'Dit jaar rijden we met de auto naar de Ardennen.', 'Papa zingt luid mee met de radio.', 'Mijn broertje valt onderweg in slaap.',
      'We slapen in een klein houten huisje in het bos.', 'Vlak bij het huisje stroomt een rivier.', 'Elke ochtend eten we buiten op het terras.', 'Daarna trekken we onze stevige wandelschoenen aan.',
      'We klimmen over rotsen en springen over beekjes.', 'Op een dag gaan we kajakken op de rivier.', 'Ik peddel zo hard dat ik helemaal nat word.', 'Iedereen moet lachen, ik ook!',
      's Avonds bakken we marshmallows boven een vuurtje.', 'We kijken naar de sterren en luisteren naar een uil.', 'Ik wou dat de vakantie nooit voorbij ging.',
      'Waar ga jij het liefst naartoe op vakantie?',
    ],
    q: [['Waar slaapt het gezin?', 'In een houten huisje in het bos', 'In een tent aan zee', 'In een groot hotel'], ['Wat doen ze op de rivier?', 'Kajakken', 'Vissen', 'Zwemmen met dolfijnen'], ['Wat doen ze ’s avonds?', 'Marshmallows bakken boven een vuurtje', 'Tv kijken', 'Naar de bioscoop gaan']],
  },
  {
    id: 'voornaam', t: 'Een naam met een verhaal', c: '#c9a227', fr: 'Un prénom avec une histoire',
    l: [
      'Iedereen heeft een voornaam.', 'Je krijgt die naam van je ouders toen je een baby was.', 'Maar waarom kozen ze juist die naam?',
      'Veel namen hebben een betekenis.', 'Een naam kan sterk, lief of dapper betekenen.', 'Sommige namen komen uit een andere taal, zoals het Arabisch of het Grieks.', 'Andere namen komen uit een oud verhaal of een gebed.',
      'Soms krijg je de naam van een oma of een opa.', 'Zo leeft die naam verder in de familie.', 'Soms vinden ouders een naam gewoon heel mooi klinken.',
      'In elk land zijn andere namen populair.', 'Een naam die in België vaak voorkomt, is in een ander land misschien heel zeldzaam.', 'Zo vertelt jouw naam ook iets over waar je familie vandaan komt.',
      'Vraag eens aan je ouders waarom ze jouw naam kozen.', 'Misschien hoor je een mooi verhaal!',
    ],
    q: [['Van wie krijg je je voornaam?', 'Van je ouders', 'Van de juf', 'Van de burgemeester'], ['Waarom krijg je soms de naam van een oma of opa?', 'Zo leeft die naam verder in de familie', 'Omdat het verplicht is', 'Omdat de naam kort is'], ['Wat kan een naam betekenen?', 'Sterk, lief of dapper', 'Altijd “groen”', 'Niets, nooit']],
  },
  {
    id: 'achternaam', t: 'Waar komt je achternaam vandaan?', c: '#c9a227', fr: 'D’où vient ton nom de famille ?',
    l: [
      'Naast je voornaam heb je ook een achternaam.', 'Die naam deel je met je familie.', 'Maar lang geleden bestonden er nog geen achternamen.',
      'In een klein dorp kende iedereen elkaar.', 'Eén voornaam was dan genoeg.', 'Toen de dorpen groter werden, hadden veel mensen dezelfde naam.', 'Er woonden bijvoorbeeld drie mannen die Jan heetten!',
      'Daarom kreeg iedereen er een tweede naam bij.', 'Soms was dat het beroep: de bakker, de smid of de visser.', 'Soms was het de plek waar je woonde: bij de berg of bij de dijk.', 'Soms zei de naam iets over hoe iemand eruitzag: groot, klein of met rood haar.',
      'Zo konden mensen elkaar beter uit elkaar houden.', 'Die namen bleven bestaan en gingen van ouders naar kinderen.', 'Zo is jouw achternaam soms honderden jaren oud!',
      'Weet jij wat jouw achternaam betekent?',
    ],
    q: [['Waarom kregen mensen een achternaam?', 'Om elkaar beter uit elkaar te houden', 'Omdat ze verhuisden', 'Om op school te gaan'], ['Waar kon een achternaam van komen?', 'Van een beroep, een plek of het uiterlijk', 'Van een kleur van de auto', 'Van het weer'], ['Hoe oud kan een achternaam zijn?', 'Honderden jaren', 'Eén week', 'Twee dagen']],
  },
  {
    id: 'proeven', t: 'Wat proef je?', c: '#4fa89a', fr: 'Que goûtes-tu ?',
    l: [
      'Hap! Je neemt een stuk appel.', 'Mmm, dat smaakt lekker.', 'Hoe weet je eigenlijk wat je proeft?',
      'Dat doe je met je tong.', 'Op je tong zitten heel kleine bultjes.', 'Daarin zitten de smaakpapillen.', 'Ze zijn zo klein dat je ze bijna niet ziet.',
      'Je tong proeft vijf smaken.', 'Zoet, zoals een aardbei of honing.', 'Zout, zoals frietjes of chips.', 'Zuur, zoals een citroen.', 'Bitter, zoals witloof.', 'En umami, zoals tomaat of kaas.',
      'De smaakpapillen sturen een berichtje naar je hersenen.', 'Je hersenen zeggen dan: dit is zoet!', 'Ook je neus helpt mee.', 'Knijp je neus dicht en proef iets: je proeft dan veel minder!',
      'Welke smaak vind jij het lekkerst?',
    ],
    q: [['Waarmee proef je?', 'Met je tong', 'Met je oren', 'Met je ellebogen'], ['Welke smaak heeft een citroen?', 'Zuur', 'Zoet', 'Zout'], ['Wat helpt je tong ook mee?', 'Je neus', 'Je knie', 'Je haar']],
  },
  {
    id: 'huid', t: 'Mijn huid voelt alles', c: '#4fa89a', fr: 'Ma peau sent tout',
    l: [
      'Leg je hand eens op de tafel.', 'Voel je dat het hout glad is?', 'Je voelt de hele dag heel veel dingen.', 'Meestal denk je er niet eens aan.',
      'Je voelt met je huid.', 'Je huid bedekt je hele lichaam.', 'Ze is als een zachte jas die je beschermt.', 'In je huid zitten kleine voelertjes.', 'Ze sturen berichtjes naar je hersenen.',
      'Zo weet je of iets hard of zacht is.', 'Of iets ruw of glad is.', 'Of iets warm of koud is.', 'En of iets pijn doet.',
      'Met je vingertoppen voel je het allerbest.', 'Speel eens een spelletje met een vriendin.', 'Doe je ogen dicht.', 'Laat haar iets in je hand leggen.', 'Kun jij raden wat het is?',
    ],
    q: [['Waarmee voel je?', 'Met je huid', 'Met je tanden', 'Met je haar'], ['Waarmee voel je het allerbest?', 'Met je vingertoppen', 'Met je rug', 'Met je hielen'], ['Wat doet je huid voor je lichaam?', 'Ze beschermt het, als een jas', 'Ze maakt muziek', 'Ze geeft licht']],
  },
  {
    id: 'kleren', t: 'Wat doe ik vandaag aan?', c: '#a8326e', fr: 'Que vais-je mettre aujourd’hui ?',
    l: [
      'Elke ochtend sta ik voor mijn kast.', 'Wat zal ik vandaag aandoen?', 'Een jurk, een broek of mijn lievelingstrui?',
      'Eerst kijk ik naar buiten.', 'Regent het? Dan neem ik mijn regenjas en mijn laarzen.', 'Is het koud? Dan doe ik een muts, een sjaal en handschoenen aan.', 'Schijnt de zon? Dan draag ik een T-shirt en een pet.',
      'Kleren tonen ook wie je bent.', 'Ik hou van vrolijke kleuren.', 'Mijn vriendin draagt het liefst blauw.',
      'Sommige mensen dragen speciale kleren voor hun werk.', 'Een kok draagt een witte schort en een koksmuts.', 'Een politieagent draagt een uniform.', 'Een brandweerman draagt een pak dat tegen vuur kan.',
      'En jij, wat trek jij het liefst aan?',
    ],
    q: [['Wat doe je aan als het regent?', 'Een regenjas en laarzen', 'Een badpak', 'Een pet en sandalen'], ['Wat draagt een kok?', 'Een witte schort en een koksmuts', 'Een helm', 'Een uniform van de politie'], ['Waarom draagt een brandweerman een speciaal pak?', 'Het kan tegen vuur', 'Het is mooi roze', 'Het is licht om te zwemmen']],
  },
  {
    id: 'stoffen', t: 'Van schaap tot trui', c: '#a8326e', fr: 'Du mouton au pull',
    l: [
      'Voel eens aan je trui.', 'Is hij zacht, dik of een beetje kriebelig?', 'Waarvan is jouw trui eigenlijk gemaakt?', 'Kijk maar eens op het kleine etiket aan de binnenkant.',
      'Een wollen trui komt van een schaap.', 'In de lente wordt het schaap geschoren.', 'Van de wol maakt men lange draden.', 'Met die draden breit men een warme trui.',
      'Een katoenen T-shirt komt van een plant.', 'De katoenplant heeft witte, pluizige bolletjes.', 'Daarvan maakt men zachte stof.',
      'Andere stoffen worden in een fabriek gemaakt.', 'Ze heten synthetische stoffen.', 'Ze zijn licht en drogen heel snel.', 'Daarom zijn sportkleren vaak synthetisch.',
      'Waarvan is jouw trui vandaag gemaakt?',
    ],
    q: [['Waar komt wol vandaan?', 'Van een schaap', 'Van een plant', 'Van een vis'], ['Hoe ziet de katoenplant eruit?', 'Met witte, pluizige bolletjes', 'Met blauwe bladeren', 'Zonder bloemen of bolletjes'], ['Waarom zijn sportkleren vaak synthetisch?', 'Ze zijn licht en drogen snel', 'Ze zijn heel zwaar', 'Ze ruiken naar bloemen']],
  },
  {
    id: 'jeans', t: 'Het verhaal van de jeans', c: '#a8326e', fr: 'L’histoire du jeans',
    l: [
      'Bijna iedereen heeft een jeansbroek in de kast.', 'Hij is stevig en hij past bij alles.', 'Maar weet jij hoe de jeans is ontstaan?',
      'Lang geleden zochten mannen in Amerika naar goud.', 'Ze werkten de hele dag hard in de mijnen.', 'Hun broeken scheurden heel snel.', 'Ze hadden een broek nodig die niet kapotging.',
      'Een handelaar had een slim idee.', 'Hij gebruikte een dikke, blauwe stof.', 'Een kleermaker zette er kleine metalen knopjes op.', 'Zo scheurden de zakken niet meer.',
      'Eerst droegen alleen werkmannen zo’n broek.', 'Later wilden kinderen en volwassenen hem ook.', 'Nu draagt de hele wereld jeans!',
      'Heb jij vandaag een jeans aan?',
    ],
    q: [['Waarom scheurden de broeken van de goudzoekers?', 'Ze werkten hard in de mijnen', 'Ze waren te lang', 'Ze waren van papier'], ['Wat zette de kleermaker op de broek?', 'Kleine metalen knopjes', 'Bloemetjes', 'Lampjes'], ['Wie droeg eerst zo’n broek?', 'Werkmannen', 'Prinsessen', 'Baby’s']],
  },
  {
    id: 'boekenwinkel', t: 'Lisa werkt in de boekenwinkel', c: '#a8326e', fr: 'Lisa travaille à la librairie',
    l: [
      'De deur gaat open en het belletje rinkelt.', 'Een meisje komt met haar papa de winkel binnen.', '‘Goedemorgen! Kan ik jullie helpen?’ vraagt Lisa.', 'Lisa werkt in de boekenwinkel en ze houdt van boeken.',
      '‘Ik zoek een spannend boek’, zegt het meisje.', '‘Over dieren of over avonturen?’ vraagt Lisa.', '‘Over een draak!’ roept het meisje blij.',
      'Lisa loopt naar het rek met kinderboeken.', 'Ze pakt een dik boek met een groene draak op de kaft.', 'Het meisje bladert erin en begint te glimlachen.', '‘Dit wil ik!’',
      'Samen lopen ze naar de kassa.', 'Papa betaalt en Lisa doet het boek in een zakje.', '‘Veel leesplezier!’ zegt Lisa vrolijk.', 'Het meisje zwaait en loopt huppelend naar buiten.',
    ],
    q: [['Waar werkt Lisa?', 'In de boekenwinkel', 'In een bakkerij', 'In een ziekenhuis'], ['Over wat wil het meisje lezen?', 'Over een draak', 'Over het weer', 'Over auto’s'], ['Wie betaalt het boek?', 'Papa', 'Lisa', 'De juf']],
  },
  {
    id: 'pannenkoeken', t: 'Ik bak pannenkoeken', c: '#4f6f9a', fr: 'Je fais des crêpes',
    l: [
      'Vandaag mag ik pannenkoeken bakken!', 'Eerst lees ik het recept goed.', 'Zo weet ik wat ik nodig heb en wat ik moet doen.',
      'Ik neem bloem, melk, eieren en een snuifje zout.', 'Ook neem ik een grote kom, een garde en een pan.', 'Ik doe de bloem in de kom.', 'Dan breek ik voorzichtig de eieren.', 'Ik giet de melk er beetje bij beetje bij.', 'Ik klop alles goed tot er geen klontjes meer zijn.',
      'Mama zet de pan op het vuur.', 'Ze doet er een klontje boter in.', 'Ik giet een beetje beslag in de hete pan.', 'Na een minuutje draait mama de pannenkoek om.', 'Mmm, wat ruikt dat lekker!',
      'We eten ze op met suiker of met stroop.', 'Wat eet jij het liefst op je pannenkoek?',
    ],
    q: [['Wat doet het kind eerst?', 'Het recept goed lezen', 'De pannenkoek omdraaien', 'De tafel afruimen'], ['Wie zet de pan op het vuur?', 'Mama', 'Het kind alleen', 'De buurman'], ['Waarmee eten ze de pannenkoeken?', 'Met suiker of stroop', 'Met mosterd', 'Met soep']],
  },
  {
    id: 'frituur', t: 'Op vrijdag naar de frituur', c: '#4f6f9a', fr: 'Le vendredi, à la friterie',
    l: [
      'Hoi, ik ben Noor.', 'Op vrijdag gaan we soms met het gezin naar de frituur.', 'Daar kijk ik de hele week naar uit!',
      'Op de muur hangt een groot bord met alles wat je kunt bestellen.', 'Frietjes, kroketten, een frikandel of een burger.', 'Het is altijd moeilijk kiezen!', 'Ik bestel een klein pakje frietjes met mayonaise.', 'Mijn broer kiest een kroket.',
      'De man achter de toog schudt de frietjes in een grote mand.', 'Ze zijn goudbruin en knapperig.', 'Hij doet er een beetje zout op.',
      'We gaan buiten op een bank zitten.', 'De frietjes zijn nog heel warm.', 'Ik blaas eerst voorzichtig.', 'Mmm, de lekkerste frietjes van België!',
      'Wat bestel jij in de frituur?',
    ],
    q: [['Wanneer gaan ze naar de frituur?', 'Op vrijdag', 'Op maandag', 'Elke ochtend'], ['Wat bestelt Noor?', 'Frietjes met mayonaise', 'Een pizza', 'Een kroket'], ['Waarom blaast Noor eerst?', 'De frietjes zijn nog heel warm', 'Ze zijn te zout', 'Ze zijn ijskoud']],
  },
  {
    id: 'ontbijt', t: 'Sam maakt het ontbijt', c: '#4f6f9a', fr: 'Sam prépare le petit-déjeuner',
    l: [
      'Het is zondagochtend.', 'Mama en papa slapen nog.', 'Sam heeft een plan: hij maakt het ontbijt!',
      'Stilletjes loopt hij naar de keuken.', 'Hij legt drie borden op de tafel.', 'Naast elk bord legt hij een mes.', 'Hij zet drie bekers neer voor de melk.', 'In het midden zet hij het brood, de boter en de choco.',
      'Dan perst hij sinaasappels uit.', 'Dat is lastig, maar het lukt!', 'Hij giet het sap voorzichtig in een kan.', 'Er valt maar een klein beetje naast.',
      'Tot slot plukt hij een bloem in de tuin.', 'Hij zet ze in een glaasje water op tafel.', 'Dan hoort hij voetstappen op de trap.', '‘Verrassing!’ roept Sam.', 'Mama en papa zijn heel blij.',
    ],
    q: [['Welke dag is het?', 'Zondag', 'Woensdag', 'Zaterdagavond'], ['Wat perst Sam uit?', 'Sinaasappels', 'Citroenen', 'Tomaten'], ['Wat zet Sam als laatste op tafel?', 'Een bloem in een glaasje water', 'Een taart', 'Een kaars']],
  },
  {
    id: 'gezin', t: 'Ons gezin', c: '#c9a227', fr: 'Notre famille',
    l: [
      'Bij ons thuis wonen vier mensen en één hond.', 'Mijn mama heet Sara en ze is verpleegster.', 'Mijn papa heet Karel en hij is buschauffeur.', 'Ik heb een grote zus, Lotte.', 'Lotte zit al in het middelbaar en ze speelt gitaar.', 'Onze hond heet Bobbie en hij is heel speels.',
      'Op woensdagmiddag ga ik zwemmen.', 'Op zaterdag doen we samen boodschappen.', 'Op zondag maken we vaak een fietstocht.', 'Bobbie loopt dan naast ons mee.',
      'In de herfst rapen we kastanjes in het park.', 'In de winter spelen we gezelschapsspelletjes bij de kachel.', 'Mijn lievelingsspel is ganzenbord.', 'Papa verliest bijna altijd, en dan moeten we lachen.',
      'En jij, met wie woon jij samen?', 'Wat doe jij graag met jouw familie?',
    ],
    q: [['Welk beroep heeft mama?', 'Verpleegster', 'Buschauffeur', 'Juf'], ['Wat doen ze op zondag?', 'Een fietstocht maken', 'Zwemmen', 'Boodschappen doen'], ['Wat is het lievelingsspel?', 'Ganzenbord', 'Voetbal', 'Verstoppertje']],
  },
  {
    id: 'zee', t: 'Een dag aan zee', c: '#c9a227', fr: 'Une journée à la mer',
    l: [
      'Vandaag nemen we de trein naar de kust.', 'Ik zit aan het raam en kijk naar de koeien in de wei.', 'Na een uurtje ruik ik de zee al.',
      'Op het strand bouwen we een groot zandkasteel.', 'Rondom graven we een gracht.', 'Als de golven komen, loopt de gracht vol water.', 'Ik zoek mooie schelpen voor mijn verzameling.', 'Mijn zusje vindt een klein krabbetje.',
      'Daarna huren we een gocart.', 'Papa trapt hard en wij roepen: sneller, sneller!', 's Middags eten we een wafel met slagroom op de dijk.', 'Een meeuw kijkt hongerig naar mijn wafel.', 'Ik houd hem goed vast!',
      'Moe maar blij nemen we de trein terug naar huis.', 'Ben jij al eens naar de zee geweest?',
    ],
    q: [['Hoe gaan ze naar de kust?', 'Met de trein', 'Met het vliegtuig', 'Te voet'], ['Wat vindt het zusje?', 'Een klein krabbetje', 'Een schat', 'Een fiets'], ['Wie kijkt hongerig naar de wafel?', 'Een meeuw', 'Een hond', 'Een koe']],
  },
];
