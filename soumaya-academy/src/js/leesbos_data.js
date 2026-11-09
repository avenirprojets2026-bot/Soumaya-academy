// Het Leesbos van meester Bart : les livres Zonnekind lus par meester Bart sur YouTube.
// La voix et les pages viennent de sa vidéo (lecteur YouTube intégré) ; ici seulement les questions et exercices.
// stukken : [début, fin] en secondes dans la vidéo, avec 2 questions de compréhension par passage.
// q = question (nl), fr = aide en français, o = choix (le 1er est juste, mélangés à l'affichage).

export const BOOKS = [
  {
    id: 'nietzoveel', titel: 'Niet zo veel', icon: '🍂', kleur: '#e8792b', yt: 'qpXA4KmPOts',
    samenvatting: 'Tim zoekt schatten in het herfstbos voor juf en zijn vrienden.',
    stukken: [
      { t: [30, 57], titel: 'De mooie bladeren', vragen: [
        { q: 'Voor wie neemt Tim iets mee?', fr: 'Pour qui Tim emporte-t-il quelque chose ?', o: ['Voor juf, Rik, Loes en Saar', 'Voor zijn mama', 'Voor de egel'] },
        { q: 'Welke kleur heeft het blad voor Rik?', fr: 'De quelle couleur est la feuille pour Rik ?', o: ['Vuurrood', 'Goudgeel', 'Oranje'] },
      ] },
      { t: [57, 88], titel: 'De egel', vragen: [
        { q: 'Wie beweegt er onder de bladeren?', fr: 'Qui bouge sous les feuilles ?', o: ['Een egel', 'Een eekhoorn', 'Een bosmuis'] },
        { q: 'Waarom heeft de egel de bladeren nodig?', fr: 'Pourquoi le hérisson a-t-il besoin des feuilles ?', o: ['Zijn familie slaapt er in de winter onder', 'Hij eet de bladeren op', 'Hij wil ermee spelen'] },
      ] },
      { t: [88, 139], titel: 'De eikels en de eekhoorn', vragen: [
        { q: 'Wat raapt Tim op na de bladeren?', fr: 'Que ramasse Tim après les feuilles ?', o: ['Eikels', 'Denappels', 'Paddenstoelen'] },
        { q: 'Waarom wil de eekhoorn zijn eikels houden?', fr: 'Pourquoi l’écureuil veut-il garder ses glands ?', o: ['Voor zijn voorraad voor de winter', 'Om ermee te gooien', 'Voor zijn verjaardag'] },
      ] },
      { t: [139, 199], titel: 'De denappel en de bosmuis', vragen: [
        { q: 'Wat wil Tim nu meenemen?', fr: 'Que veut maintenant emporter Tim ?', o: ['Een denappel', 'Een steen', 'Een tak'] },
        { q: 'Wie zegt: “Nee, nee, nee! Dat is niet van jou”?', fr: 'Qui dit : « Non, non, non ! Ce n’est pas à toi » ?', o: ['De bosmuis', 'Juf', 'Loes'] },
      ] },
      { t: [199, 220], titel: 'Een lege mand', vragen: [
        { q: 'Hoe is de mand van Tim nu?', fr: 'Comment est le panier de Tim maintenant ?', o: ['Leeg', 'Vol', 'Kapot'] },
        { q: 'Hoe voelt Tim zich?', fr: 'Comment se sent Tim ?', o: ['Verdrietig', 'Blij', 'Boos'] },
      ] },
      { t: [220, 268], titel: 'Een geschenk', vragen: [
        { q: 'Wat doen de dieren op het einde?', fr: 'Que font les animaux à la fin ?', o: ['Ze geven Tim een geschenk', 'Ze lopen weg', 'Ze gaan slapen'] },
        { q: 'Waarom kunnen de dieren iets geven?', fr: 'Pourquoi les animaux peuvent-ils donner quelque chose ?', o: ['Ze kunnen een beetje missen', 'Ze hebben niets nodig', 'Tim betaalt hen'] },
      ] },
    ],
    oefeningen: {
      woordenschat: [
        ['de egel', 'een stekelig dier dat in de winter slaapt'], ['de eekhoorn', 'een rood dier met een pluimstaart dat in bomen klimt'],
        ['de bosmuis', 'een klein muisje dat in het bos woont'], ['de eikel', 'de vrucht van de eikenboom'],
        ['de denappel', 'de vrucht van de den, met veel zaadjes'], ['de voorraad', 'veel eten dat je bewaart voor later'],
        ['de schat', 'iets heel moois dat je bewaart'], ['het geschenk', 'een cadeautje'],
      ],
      tegendeel: [['leeg', 'vol'], ['veel', 'weinig'], ['groot', 'klein'], ['boos', 'blij'], ['winter', 'zomer'], ['warm', 'koud']],
      dehet: [['egel', 'de'], ['blad', 'het'], ['eekhoorn', 'de'], ['mand', 'de'], ['bos', 'het'], ['denappel', 'de'], ['voorraad', 'de'], ['geschenk', 'het'], ['winter', 'de'], ['eikel', 'de']],
      meervoud: [['blad', 'bladeren'], ['egel', 'egels'], ['mand', 'manden'], ['dier', 'dieren'], ['vriend', 'vrienden'], ['schat', 'schatten'], ['eikel', 'eikels'], ['denappel', 'denappels']],
      verkleinwoord: [['egel', 'egeltje'], ['blad', 'bladje'], ['mand', 'mandje'], ['boom', 'boompje'], ['muis', 'muisje'], ['huis', 'huisje']],
      verleden: [['loopt', 'liep'], ['ziet', 'zag'], ['neemt', 'nam'], ['geeft', 'gaf'], ['zegt', 'zei']],
      waar: [
        ['Tim vindt de bladeren niet mooi.', false, 'Tim vindt de bladeren mooi.'],
        ['De egel slaapt in de winter onder de bladeren.', true],
        ['De bosmuis is groter dan de denappel.', false, 'De denappel is groter dan de bosmuis.'],
        ['Tim brengt een volle mand mee naar huis.', false, 'Tim heeft een lege mand.'],
        ['De dieren geven Tim een beetje van hun voorraad.', true],
      ],
      gevoel: { keuze: ['blij', 'bang', 'verdrietig', 'verbaasd'], zinnen: [
        ['Tim vindt veel mooie bladeren in het bos.', 'blij'], ['Er beweegt iets onder de bladeren.', 'bang'],
        ['Zijn mand is leeg en hij denkt aan juf.', 'verdrietig'], ['De dieren geven hem een geschenk.', 'verbaasd'],
      ] },
    },
  },
  {
    id: 'kiesmaariets', titel: 'Kies maar iets!', icon: '🍬', kleur: '#d6336c', yt: 'kQU4lSXRCxg',
    samenvatting: 'Kaat mag één snoepje kiezen uit de schatkist van opa… en droomt van later.',
    stukken: [ // pas encore de minutage vidéo : Soumaya lit les pages dans son boekje
      { blz: '2-5', titel: 'De schatkist van opa', vragen: [
        { q: 'Wat heeft opa veel in zijn huis?', fr: 'Qu’est-ce que papi a beaucoup chez lui ?', o: ['Speelgoed', 'Boeken', 'Planten'] },
        { q: 'Wat verstopt opa in de schatkist?', fr: 'Que cache papi dans le coffre ?', o: ['Iets leuks, zoals een stift met glitters', 'Zijn sleutels', 'Een boek'] },
      ] },
      { blz: '6-7', titel: 'Moeilijk kiezen', vragen: [
        { q: 'Hoeveel dingen mag een kind kiezen?', fr: 'Combien de choses un enfant peut-il choisir ?', o: ['Maar één ding', 'Twee dingen', 'Alles'] },
        { q: 'Wat wil Kaat doen als ze groot is?', fr: 'Que veut faire Kaat quand elle sera grande ?', o: ['De kist leeg eten', 'Opa helpen', 'Naar school gaan'] },
      ] },
      { blz: '8-9', titel: 'De snoepwinkel', vragen: [
        { q: 'Welk idee krijgt Kaat?', fr: 'Quelle idée a Kaat ?', o: ['Later wil ze een snoepwinkel', 'Ze wil juf worden', 'Ze wil een hond'] },
        { q: 'Welke rare smaken test Kaat uit?', fr: 'Quels goûts bizarres Kaat teste-t-elle ?', o: ['Worst en tomaten', 'Aardbei en banaan', 'Melk en honing'] },
      ] },
      { blz: '10-11', titel: 'De snoepfabriek', vragen: [
        { q: 'Wat gebeurt er als Kaat op de knoppen drukt?', fr: 'Que se passe-t-il quand Kaat appuie sur les boutons ?', o: ['Duizenden snoepjes rollen van de band', 'De machine stopt', 'Er komt water uit'] },
        { q: 'Hoeveel smaken heeft de reep chocolade van Kaat?', fr: 'Combien de goûts a la tablette de Kaat ?', o: ['Vier', 'Eén', 'Tien'] },
      ] },
      { blz: '12-13', titel: 'Een snoepreis rond de wereld', vragen: [
        { q: 'Waar gaat Kaat naartoe op haar snoepreis?', fr: 'Où va Kaat pendant son voyage ?', o: ['Naar Afrika, Amerika en verre landen', 'Alleen naar de winkel', 'Naar opa'] },
        { q: 'Wat maakt ze met vruchten en bonen?', fr: 'Que fabrique-t-elle avec des fruits et des fèves ?', o: ['De lekkerste kauwgom', 'Soep', 'Brood'] },
      ] },
      { blz: '14-16', titel: 'Wat kies je?', vragen: [
        { q: 'Waarom schrikt Kaat?', fr: 'Pourquoi Kaat sursaute-t-elle ?', o: ['Ze was in haar hoofd ver weg', 'Opa roept boos', 'De kist valt'] },
        { q: 'Wat wil Kaat ontdekken?', fr: 'Que veut découvrir Kaat ?', o: ['De wereld', 'Een schat', 'Het bos'] },
      ] },
      { blz: '17-18', titel: 'Twee snoepjes voor op reis', vragen: [
        { q: 'Wat geeft opa aan Kaat?', fr: 'Que donne papi à Kaat ?', o: ['Een dikke knuffel', 'Een fiets', 'Een kaart'] },
        { q: 'Hoeveel snoepjes mag Kaat kiezen voor op reis?', fr: 'Combien de bonbons Kaat peut-elle choisir pour le voyage ?', o: ['Twee', 'Eén', 'Vijf'] },
      ] },
    ],
    vragenBoek: [
      { q: 'Naar wie gaat Kaat heel graag?', fr: 'Chez qui Kaat aime-t-elle aller ?', o: ['Naar haar opa', 'Naar haar juf', 'Naar haar vriendin'] },
      { q: 'Wat zit er in de schatkist van opa?', fr: 'Qu’y a-t-il dans le coffre au trésor de papi ?', o: ['Snoep en chocolade', 'Speelgoed en boeken', 'Geld en juwelen'] },
      { q: 'Waarom is het moeilijk om te kiezen?', fr: 'Pourquoi est-ce difficile de choisir ?', o: ['Er ligt zoveel lekkers in de kist', 'De kist is leeg', 'Opa kijkt boos'] },
      { q: 'Wat wil Kaat later?', fr: 'Que veut Kaat plus tard ?', o: ['Een snoepwinkel of een snoepfabriek', 'Juf worden', 'Een dierenwinkel'] },
      { q: 'Hoeveel snoepjes mag Kaat op het einde kiezen?', fr: 'Combien de bonbons Kaat peut-elle choisir à la fin ?', o: ['Twee', 'Eén', 'Tien'] },
    ],
    oefeningen: {
      woordenschat: [
        ['de schatkist', 'een grote kist waarin je kostbare dingen bewaart'], ['de snoepwinkel', 'een winkel waar je snoepjes koopt'],
        ['de fabriek', 'een gebouw waar machines producten maken'], ['de smaak', 'hoe iets proeft: zoet, zuur, zout …'],
        ['de kauwgom', 'dit kauw je, maar je slikt het niet door'], ['de reep', 'een stuk chocolade in de vorm van een staaf'],
        ['de knuffel', 'een dikke omhelzing'], ['ontdekken', 'nieuwe dingen leren kennen of vinden'],
      ],
      tegendeel: [['groot', 'klein'], ['leuk', 'saai'], ['zuur', 'zoet'], ['ver', 'dichtbij'], ['open', 'dicht'], ['alles', 'niets']],
      dehet: [['kist', 'de'], ['snoep', 'het'], ['winkel', 'de'], ['fabriek', 'de'], ['reis', 'de'], ['wereld', 'de'], ['kind', 'het'], ['huis', 'het'], ['reep', 'de'], ['smaak', 'de']],
      meervoud: [['opa', 'opa’s'], ['winkel', 'winkels'], ['fabriek', 'fabrieken'], ['reis', 'reizen'], ['land', 'landen'], ['kind', 'kinderen'], ['knop', 'knoppen'], ['smaak', 'smaken']],
      verkleinwoord: [['kist', 'kistje'], ['winkel', 'winkeltje'], ['knop', 'knopje'], ['kind', 'kindje'], ['reis', 'reisje'], ['snoep', 'snoepje']],
      verleden: [['schrikt', 'schrok'], ['ziet', 'zag'], ['kiest', 'koos'], ['geeft', 'gaf'], ['vraagt', 'vroeg'], ['wil', 'wilde']],
      waar: [
        ['Opa heeft weinig speelgoed.', false, 'Opa heeft veel speelgoed.'],
        ['In de schatkist zit alleen chocolade.', false, 'Er zit ook snoep in: muntjes, zure beertjes …'],
        ['Kaat wil later een snoepwinkel.', true],
        ['Kaat schrikt van de vraag van opa.', true],
        ['Op het einde mag Kaat twee snoepjes kiezen.', true],
      ],
      gevoel: { keuze: ['blij', 'twijfelend', 'geschrokken', 'dankbaar'], zinnen: [
        ['Kaat kijkt naar al het snoep in de kist.', 'twijfelend'], ['Opa vraagt plots: “En, wat kies je?”', 'geschrokken'],
        ['Kaat krijgt een geweldig idee: een snoepwinkel!', 'blij'], ['Opa geeft haar twee snoepjes voor op reis.', 'dankbaar'],
      ] },
    },
  },
  {
    id: 'florenroos', titel: 'Flor en Roos', icon: '🎨', kleur: '#7a5cc4', yt: 'qT8otNs9jek',
    samenvatting: 'Flor de schilder moet in het kasteel van de koning wonen… en wordt verliefd op prinses Roos.',
    stukken: [
      { t: [28, 78], titel: 'Flor de schilder', vragen: [
        { q: 'Waar woont Flor de schilder?', fr: 'Où habite Flor le peintre ?', o: ['In een gezellig huisje in de groene heuvels', 'In een groot kasteel', 'In de stad'] },
        { q: 'Wat schildert Flor het liefst?', fr: 'Que peint Flor de préférence ?', o: ['Bloemen', 'Dieren', 'Huizen'] },
      ] },
      { t: [78, 123], titel: 'De koning komt', vragen: [
        { q: 'Wie stapt uit de koets bij het huisje van Flor?', fr: 'Qui descend du carrosse près de la maison de Flor ?', o: ['De koning', 'De prinses', 'Een wachter'] },
        { q: 'Wat vindt de koning van Flor?', fr: 'Que pense le roi de Flor ?', o: ['Hij heeft bijzonder veel talent', 'Hij schildert lelijk', 'Hij is lui'] },
      ] },
      { t: [123, 163], titel: 'Naar het kasteel', vragen: [
        { q: 'Wat vraagt de koning aan Flor?', fr: 'Que demande le roi à Flor ?', o: ['Om in het kasteel te komen wonen', 'Om zijn huis te verkopen', 'Om de bloemen te plukken'] },
        { q: 'Wat geeft de koning aan Flor?', fr: 'Que donne le roi à Flor ?', o: ['Handenvol goudstukken', 'Een paard', 'Een kroon'] },
      ] },
      { t: [163, 217], titel: 'Saaie schilderijen', vragen: [
        { q: 'Wat moet Flor nu schilderen?', fr: 'Que doit peindre Flor maintenant ?', o: ['Een vaas en portretten van de koning', 'Alleen bloemen', 'De groene heuvels'] },
        { q: 'Hoe voelt Flor zich in het kasteel?', fr: 'Comment Flor se sent-il au château ?', o: ['Gevangen', 'Heel gelukkig', 'Trots'] },
      ] },
      { t: [217, 254], titel: 'Prinses Roos', vragen: [
        { q: 'Wie moet Flor nu schilderen?', fr: 'Qui Flor doit-il peindre maintenant ?', o: ['Prinses Roos, de dochter van de koning', 'De koningin', 'De wachters'] },
        { q: 'Wat gebeurt er met Flor en Roos?', fr: 'Que se passe-t-il entre Flor et Roos ?', o: ['Ze worden dolverliefd', 'Ze krijgen ruzie', 'Ze lopen weg'] },
      ] },
      { t: [254, 282], titel: 'Flor durft te vragen', vragen: [
        { q: 'Wat vraagt Flor aan de koning?', fr: 'Que demande Flor au roi ?', o: ['Of hij met de prinses mag trouwen', 'Meer goudstukken', 'Een nieuw penseel'] },
        { q: 'Wat doet de koning dan?', fr: 'Que fait alors le roi ?', o: ['Hij laat Flor in de kerker zetten', 'Hij zegt meteen ja', 'Hij gaat lachen'] },
      ] },
      { t: [282, 320], titel: 'In de kerker', vragen: [
        { q: 'Wat maakt Flor in de kerker?', fr: 'Que fait Flor au cachot ?', o: ['Boze portretten van de koning', 'Een tunnel', 'Een brief voor Roos'] },
        { q: 'Wat doet hij met de tekeningen?', fr: 'Que fait-il avec les dessins ?', o: ['Hij vouwt er vliegtuigjes van en gooit ze naar buiten', 'Hij verscheurt ze', 'Hij geeft ze aan de wachter'] },
      ] },
      { t: [320, 362], titel: 'Iedereen lacht', vragen: [
        { q: 'Waarom lachen de mensen?', fr: 'Pourquoi les gens rient-ils ?', o: ['De koning ziet er gek uit op de tekeningen', 'Er is een feest', 'Flor vertelt grapjes'] },
        { q: 'Wie brengt Flor nieuwe verf en penselen?', fr: 'Qui apporte de la nouvelle peinture et des pinceaux à Flor ?', o: ['Prinses Roos', 'De koning', 'Een wachter'] },
      ] },
      { t: [362, 420], titel: 'Het einde', vragen: [
        { q: 'Wat mag Flor op het einde?', fr: 'Qu’a le droit de faire Flor à la fin ?', o: ['Met Roos trouwen', 'Koning worden', 'In de kerker blijven'] },
        { q: 'Wat belooft Flor aan de koning?', fr: 'Que promet Flor au roi ?', o: ['Alleen nog bloemen schilderen', 'Nooit meer schilderen', 'In het kasteel blijven'] },
      ] },
    ],
    oefeningen: {
      woordenschat: [
        ['de schilder', 'iemand die schilderijen maakt'], ['het penseel', 'daarmee breng je verf op het doek'],
        ['de koets', 'een rijtuig dat door paarden getrokken wordt'], ['het kasteel', 'een groot gebouw waar een koning woont'],
        ['de kerker', 'een donkere gevangenis onder het kasteel'], ['het portret', 'een schilderij van iemand'],
        ['de wachter', 'iemand die het kasteel bewaakt'], ['de goudstukken', 'munten van goud'],
      ],
      tegendeel: [['vroeg', 'laat'], ['rijk', 'arm'], ['gelukkig', 'ongelukkig'], ['saai', 'leuk'], ['lachen', 'huilen'], ['binnen', 'buiten']],
      dehet: [['schilder', 'de'], ['huisje', 'het'], ['doek', 'het'], ['koning', 'de'], ['kasteel', 'het'], ['schilderij', 'het'], ['prinses', 'de'], ['kerker', 'de'], ['penseel', 'het'], ['koets', 'de']],
      meervoud: [['bloem', 'bloemen'], ['heuvel', 'heuvels'], ['penseel', 'penselen'], ['portret', 'portretten'], ['koning', 'koningen'], ['schilderij', 'schilderijen'], ['wachter', 'wachters'], ['gast', 'gasten']],
      verkleinwoord: [['huis', 'huisje'], ['plek', 'plekje'], ['vliegtuig', 'vliegtuigje'], ['bloem', 'bloemetje'], ['kroon', 'kroontje'], ['vaas', 'vaasje']],
      verleden: [['staat op', 'stond op'], ['neemt', 'nam'], ['schrikt', 'schrok'], ['geeft', 'gaf'], ['vindt', 'vond'], ['lacht', 'lachte']],
      waar: [
        ['Flor woont in een groot kasteel.', false, 'Flor woont in een gezellig huisje in de groene heuvels.'],
        ['De koning vindt dat Flor veel talent heeft.', true],
        ['Flor wil heel graag veel geld.', false, 'Flor hoeft zoveel geld niet.'],
        ['Flor en Roos worden verliefd.', true],
        ['Op het einde mag Flor nooit meer schilderen.', false, 'Hij mag met Roos trouwen en weer bloemen schilderen.'],
      ],
      gevoel: { keuze: ['gelukkig', 'geschrokken', 'verdrietig', 'boos', 'verliefd'], zinnen: [
        ['Flor schildert bloemen in de natuur.', 'gelukkig'], ['Flor ziet plots de koning.', 'geschrokken'],
        ['Flor verlangt naar zijn huisje.', 'verdrietig'], ['Flor ziet prinses Roos.', 'verliefd'],
        ['De koning hoort dat Flor met Roos wil trouwen.', 'boos'],
      ] },
    },
  },
  {
    id: 'nielsisnat', titel: 'Niels is nat', icon: '🦆', kleur: '#2f8fd1', yt: 'G792fBn_PHw',
    samenvatting: 'Niels valt in de vijver… en zijn vrienden delen hun kleren met hem.',
    stukken: [
      { t: [10, 31], titel: 'Feest bij Kim', vragen: [
        { q: 'Wie geeft een feest?', fr: 'Qui fait une fête ?', o: ['Kim', 'Niels', 'Papa'] },
        { q: 'Wat doet Kim graag met Niels?', fr: 'Que fait Kim volontiers avec Niels ?', o: ['In de bomen klimmen', 'Schaatsen', 'Naar muziek luisteren'] },
      ] },
      { t: [31, 50], titel: 'Naar het park', vragen: [
        { q: 'Wat draagt Niels?', fr: 'Que porte Niels ?', o: ['Een zak met brood', 'Een bal', 'Een fiets'] },
        { q: 'Waar rennen de kinderen naartoe?', fr: 'Vers où courent les enfants ?', o: ['Naar de vijver', 'Naar school', 'Naar de winkel'] },
      ] },
      { t: [50, 74], titel: 'De eenden', vragen: [
        { q: 'Wat wil de eend?', fr: 'Que veut le canard ?', o: ['Brood', 'Water', 'Snoep'] },
        { q: 'Wat doen de eenden met het brood?', fr: 'Que font les canards avec le pain ?', o: ['Ze vechten om het brood', 'Ze laten het liggen', 'Ze geven het aan de vis'] },
      ] },
      { t: [74, 93], titel: 'De grote vis', vragen: [
        { q: 'Wat ziet Niels in de vijver?', fr: 'Que voit Niels dans l’étang ?', o: ['Een grote vis', 'Een kikker', 'Een schildpad'] },
        { q: 'Wat doen de kinderen als ze de vis willen zien?', fr: 'Que font les enfants pour voir le poisson ?', o: ['Ze duwen elkaar opzij', 'Ze gaan zitten', 'Ze lopen weg'] },
      ] },
      { t: [93, 113], titel: 'Plons!', vragen: [
        { q: 'Wat gebeurt er met Niels?', fr: 'Que se passe-t-il pour Niels ?', o: ['Hij glijdt weg en valt in het water', 'Hij vangt de vis', 'Hij gaat naar huis'] },
        { q: 'Hoe haalt papa Niels uit het water?', fr: 'Comment papa sort-il Niels de l’eau ?', o: ['Hij grijpt hem bij zijn kraag', 'Met een touw', 'Met een boot'] },
      ] },
      { t: [113, 145], titel: 'Niels is nat', vragen: [
        { q: 'Waarom moeten de natte kleren uit?', fr: 'Pourquoi faut-il enlever les vêtements mouillés ?', o: ['Anders wordt Niels ziek', 'Ze zijn te klein', 'Ze zijn vuil'] },
        { q: 'Wil Kim in haar blootje naar huis?', fr: 'Kim veut-elle rentrer toute nue ?', o: ['Nee, dat wil ze liever niet', 'Ja, graag', 'Ze weet het niet'] },
      ] },
      { t: [145, 166], titel: 'Kleren delen', vragen: [
        { q: 'Wat geeft Els aan Niels?', fr: 'Que donne Els à Niels ?', o: ['Haar muts', 'Haar jurk', 'Haar laarzen'] },
        { q: 'Wat geeft papa aan Niels?', fr: 'Que donne papa à Niels ?', o: ['Zijn trui', 'Zijn schoenen', 'Zijn jas'] },
      ] },
      { t: [166, 187], titel: 'Warme choco', vragen: [
        { q: 'Wat maakt mama?', fr: 'Que prépare maman ?', o: ['Warme choco', 'Soep', 'Een taart'] },
        { q: 'Wat zegt Kim tegen Niels?', fr: 'Que dit Kim à Niels ?', o: ['Jij bent mijn beste vriend', 'Jij bent dom', 'Ga naar huis'] },
      ] },
      { t: [187, 232], titel: 'Echte vrienden', vragen: [
        { q: 'Waarom ziet mama Niels niet?', fr: 'Pourquoi maman ne voit-elle pas Niels ?', o: ['Hij heeft andere kleren aan', 'Hij is weg', 'Hij verstopt zich'] },
        { q: 'Wat delen echte vrienden?', fr: 'Que partagent les vrais amis ?', o: ['Alles, ook hun kleren', 'Niets', 'Alleen snoep'] },
      ] },
    ],
    oefeningen: {
      woordenschat: [
        ['de vijver', 'een kleine plas water in het park'], ['de eend', 'een vogel die kwak zegt en zwemt'],
        ['de kraag', 'het stuk van je trui of jas rond je hals'], ['de muts', 'die zet je op je hoofd als het koud is'],
        ['de laarzen', 'hoge schoenen voor regen en modder'], ['de kousen', 'die trek je aan je voeten, in je schoenen'],
        ['rillen', 'beven van de kou'], ['het krentenbrood', 'brood met rozijntjes'],
      ],
      tegendeel: [['nat', 'droog'], ['koud', 'warm'], ['groot', 'klein'], ['snel', 'traag'], ['diep', 'ondiep'], ['lachen', 'huilen']],
      dehet: [['feest', 'het'], ['park', 'het'], ['vijver', 'de'], ['eend', 'de'], ['brood', 'het'], ['vis', 'de'], ['water', 'het'], ['muts', 'de'], ['jurk', 'de'], ['huis', 'het']],
      meervoud: [['vriend', 'vrienden'], ['eend', 'eenden'], ['vis', 'vissen'], ['kind', 'kinderen'], ['muts', 'mutsen'], ['jurk', 'jurken'], ['laars', 'laarzen'], ['schoen', 'schoenen']],
      verkleinwoord: [['zak', 'zakje'], ['eend', 'eendje'], ['vis', 'visje'], ['muts', 'mutsje'], ['stuk', 'stukje'], ['trui', 'truitje']],
      verleden: [['valt', 'viel'], ['ziet', 'zag'], ['gooit', 'gooide'], ['geeft', 'gaf'], ['zegt', 'zei'], ['rent', 'rende']],
      waar: [
        ['Niels geeft een feest.', false, 'Kim geeft een feest.'],
        ['Niels draagt een zak met brood.', true],
        ['De vijver is heel erg diep.', false, 'De vijver is niet erg diep.'],
        ['De vrienden delen hun kleren met Niels.', true],
        ['Mama herkent Niels meteen.', false, 'Mama kijkt verbaasd: Niels heeft andere kleren aan.'],
      ],
      gevoel: { keuze: ['blij', 'geschrokken', 'koud', 'verbaasd'], zinnen: [
        ['De kinderen gaan naar het feest bij Kim.', 'blij'], ['Plons! Niels valt in het water.', 'geschrokken'],
        ['Niels rilt en het water drupt uit zijn kleren.', 'koud'], ['Mama ziet Niels niet in de andere kleren.', 'verbaasd'],
      ] },
    },
  },
  {
    id: 'luna', titel: 'Luna', icon: '🔴', kleur: '#e0a800', yt: 'A2rVkqJwRiw',
    samenvatting: 'Luna heeft een rode vlek op haar wang en bedenkt de straffste verhalen.',
    stukken: [
      { t: [10, 43], titel: 'Een rode vlek', vragen: [
        { q: 'Waar heeft Luna een vlek?', fr: 'Où Luna a-t-elle une tache ?', o: ['Op haar wang', 'Op haar neus', 'Op haar hand'] },
        { q: 'Waarom is de vlek een ramp?', fr: 'Pourquoi la tache est-elle une catastrophe ?', o: ['Iedereen zal haar uitlachen op school', 'Ze doet pijn', 'Ze mag niet buiten'] },
      ] },
      { t: [43, 65], titel: 'De reuzenmug', vragen: [
        { q: 'Waar was Luna op jacht in haar verhaal?', fr: 'Où Luna chassait-elle dans son histoire ?', o: ['In het oerwoud', 'In de zee', 'In de stad'] },
        { q: 'Wie stak Luna in haar wang?', fr: 'Qui a piqué Luna à la joue ?', o: ['Een reuzenmug', 'Een bij', 'Een slang'] },
      ] },
      { t: [65, 95], titel: 'Een zoen van een prins', vragen: [
        { q: 'Waarop reed de prins?', fr: 'Sur quoi roulait le prince ?', o: ['Op rolschaatsen', 'Op een paard', 'Op een fiets'] },
        { q: 'Wat wil de prins later doen?', fr: 'Que veut faire le prince plus tard ?', o: ['Met Luna trouwen', 'Koning worden', 'Op reis gaan'] },
      ] },
      { t: [95, 120], titel: 'Brand!', vragen: [
        { q: 'Wat gebeurde er in Luna’s verhaal?', fr: 'Que s’est-il passé dans l’histoire de Luna ?', o: ['Haar huis stond in brand', 'Haar huis was weg', 'Het regende binnen'] },
        { q: 'Wie heeft Luna gered?', fr: 'Qui Luna a-t-elle sauvé ?', o: ['Haar hele familie, de hond en de goudvis', 'Alleen haar kat', 'Niemand'] },
      ] },
      { t: [120, 146], titel: 'Een land heel ver weg', vragen: [
        { q: 'Naar welk land reisde Luna?', fr: 'Dans quel pays Luna a-t-elle voyagé ?', o: ['India', 'Marokko', 'België'] },
        { q: 'Hoe kwam de rode punt op haar wang?', fr: 'Comment le point rouge est-il arrivé sur sa joue ?', o: ['De wind blies hem van haar voorhoofd', 'Ze viel', 'Een vogel pikte'] },
      ] },
      { t: [146, 168], titel: 'Luna is een fee', vragen: [
        { q: 'Wat leerde Luna op de feeënschool?', fr: 'Qu’apprenait Luna à l’école des fées ?', o: ['Toveren', 'Rekenen', 'Zwemmen'] },
        { q: 'Waarmee prikte ze in haar wang?', fr: 'Avec quoi s’est-elle piqué la joue ?', o: ['Met haar staf', 'Met een naald', 'Met een potlood'] },
      ] },
      { t: [168, 207], titel: 'De marsmannetjes', vragen: [
        { q: 'Hoeveel marsmannetjes landden in de tuin?', fr: 'Combien de Martiens ont atterri dans le jardin ?', o: ['Drie', 'Twee', 'Tien'] },
        { q: 'Waar leken de marsmannetjes op?', fr: 'À quoi ressemblaient les Martiens ?', o: ['Op grote groene bonen', 'Op tomaten', 'Op katten'] },
      ] },
      { t: [207, 262], titel: 'Op de speelplaats', vragen: [
        { q: 'Kijkt iedereen naar Luna op de speelplaats?', fr: 'Tout le monde regarde-t-il Luna dans la cour ?', o: ['Nee, niemand kijkt naar Luna', 'Ja, iedereen', 'Alleen de juf'] },
        { q: 'Waarom kijkt iedereen naar Els?', fr: 'Pourquoi tout le monde regarde-t-il Els ?', o: ['Ze heeft niet één vlek, maar twee!', 'Ze is jarig', 'Ze huilt'] },
      ] },
    ],
    oefeningen: {
      woordenschat: [
        ['de vlek', 'een plekje met een andere kleur'], ['de wang', 'de zijkant van je gezicht'],
        ['de speelplaats', 'daar speel je op school tijdens de pauze'], ['de mug', 'een klein insect dat steekt'],
        ['het oerwoud', 'een groot, wild bos waar het warm is'], ['de rolschaatsen', 'schoenen met wieltjes'],
        ['de fee', 'een meisje dat kan toveren'], ['de marsman', 'een mannetje van een andere planeet'],
      ],
      tegendeel: [['mooi', 'lelijk'], ['snel', 'traag'], ['heet', 'koud'], ['ver', 'dichtbij'], ['groot', 'klein'], ['iedereen', 'niemand']],
      dehet: [['vlek', 'de'], ['verhaal', 'het'], ['school', 'de'], ['prins', 'de'], ['huis', 'het'], ['vuur', 'het'], ['land', 'het'], ['wang', 'de'], ['boon', 'de'], ['raam', 'het']],
      meervoud: [['vlek', 'vlekken'], ['vriend', 'vrienden'], ['mug', 'muggen'], ['prins', 'prinsen'], ['verhaal', 'verhalen'], ['boon', 'bonen'], ['wang', 'wangen'], ['land', 'landen']],
      verkleinwoord: [['vlek', 'vlekje'], ['punt', 'puntje'], ['man', 'mannetje'], ['plek', 'plekje'], ['boot', 'bootje'], ['zoen', 'zoentje']],
      verleden: [['steekt', 'stak'], ['rijdt', 'reed'], ['geeft', 'gaf'], ['draagt', 'droeg'], ['blaast', 'blies'], ['kijkt', 'keek']],
      waar: [
        ['Luna heeft een vlek op haar wang.', true],
        ['Luna vertelt de waarheid over haar vlek.', false, 'Luna bedenkt sterke verhalen.'],
        ['De prins reed op rolschaatsen.', true],
        ['De marsmannetjes waren rood.', false, 'Ze waren groen, zoals bonen.'],
        ['Op de speelplaats kijkt iedereen naar Luna.', false, 'Niemand kijkt naar Luna: iedereen kijkt naar Els.'],
      ],
      gevoel: { keuze: ['bang', 'trots', 'verbaasd', 'jaloers'], zinnen: [
        ['Luna ziet een vlek en denkt dat iedereen haar zal uitlachen.', 'bang'], ['Luna stapt de speelplaats op met haar vlek.', 'trots'],
        ['Niemand kijkt naar Luna. Hoe kan dat nu?', 'verbaasd'], ['Luna denkt: ze zullen allemaal … zijn op mijn vlek.', 'jaloers'],
      ] },
    },
  },
];
