export const site = {
  name: "Isola Events",
  byline: "di Dimitri Bouterline · DBYoung",
  domain: "events.dbyoung.it",
  location: "Fattoria Isola · Via Vecchia Aretina 70, 52020 Laterina (AR) · Toscana",
  emailFrom: process.env.RESEND_FROM ?? "Isola Events <eventi@dbyoung.it>",
  emailTo: process.env.BOOKING_TO ?? "booking@dbyoung.it",
  calendlyUrl:
    process.env.NEXT_PUBLIC_CALENDLY_URL ??
    "https://calendly.com/tuo-nome/call-conoscitiva-30min",
  mainSite: "https://dbyoung.it",
  mainEvents: "https://dbyoung.it/eventi",
  fattoria: "https://fattoriaisola.com/it/home-2/",
  instagramIsola: "https://www.instagram.com/fattoria_isola_",
  instagramEvents: "https://www.instagram.com/isola_events_",
} as const;

export type EventKind = "dimitri" | "terzi";

export interface SiteEvent {
  slug: string;
  kind: EventKind;
  title: string;
  tagline: string;
  description: string;
  image: string;
  /** URL remoto usato finché l'originale non è in public/location/ */
  imageFallback: string;
  capacity: string;
  music: string;
  priceFrom: string;
  highlights: string[];
}

/**
 * Due format richiesti dal cliente:
 * 1. Eventi organizzati DA Dimitri in Fattoria Isola
 * 2. Eventi organizzati DA TERZI in Fattoria Isola
 */
export const events: SiteEvent[] = [
  {
    slug: "serata-jazz-blues-sotto-le-stelle",
    kind: "dimitri",
    title: "Serata Jazz & Blues sotto le stelle",
    tagline: "Isola Events presenta · a bordo piscina",
    description:
      "Il format firmato Dimitri Bouterline: quartetto jazz-blues con strumenti veri, cena toscana a bordo piscina 7×14 e parco secolare illuminato. Direzione artistica, band e produzione curate da DBYoung.",
    image: "/location/piscina-sera.jpg",
    imageFallback: "https://fattoriaisola.com/wp-content/uploads/2019/12/festa-alla-Fattoria-dellIsola-1024x576.jpg",
    capacity: "80–150 ospiti",
    music: "Jazz · Blues · Soul con strumenti veri",
    priceFrom: "da €39 / ospite",
    highlights: [
      "Band dal vivo diretta da Dimitri",
      "Cena toscana + Chianti della tenuta",
      "Piscina, gazebo e parco illuminati",
      "Possibilità di pernottamento in 5 appartamenti",
    ],
  },
  {
    slug: "classica-in-villa",
    kind: "dimitri",
    title: "Classica in Villa",
    tagline: "Isola Events presenta · villa seicentesca",
    description:
      "Piano, archi e fiati nella villa seicentesca già del Granduca di Toscana, con la cappella privata per cerimonie. Il ponte di DBYoung tra tradizione classica e suono moderno.",
    image: "/location/villa-parco.jpg",
    imageFallback: "https://fattoriaisola.com/wp-content/uploads/2019/12/parco-villa-da-sopra1.jpg",
    capacity: "60–120 ospiti",
    music: "Classica · Crossover moderno",
    priceFrom: "da €45 / ospite",
    highlights: [
      "Concerto nella villa + aperitivo nel parco",
      "Cappella consacrata per riti e benedizioni di maggio",
      "Visita alla tenuta da 200 ettari",
      "Olio EVO e Chianti acquistabili in loco",
    ],
  },
  {
    slug: "matrimonio-toscano",
    kind: "terzi",
    title: "Il tuo Matrimonio Toscano",
    tagline: "Organizza tu · noi apriamo la tenuta",
    description:
      "Affitta gli spazi e organizza il tuo giorno con i tuoi fornitori: rito in cappella o nel parco, ricevimento a bordo piscina, foto con carrozza e cavalli, notte nei 5 appartamenti in stile toscano.",
    image: "/location/cappella.jpg",
    imageFallback: "https://fattoriaisola.com/wp-content/uploads/2019/12/Cappella-765x1024.jpg",
    capacity: "fino a 150 ospiti · 26 posti letto",
    music: "La tua musica — service e palco disponibili",
    priceFrom: "location da €1.900 / giorno",
    highlights: [
      "Cappella privata + parco + piscina + barbecue",
      "5 appartamenti: Colombaia, Mulino, Fattoria, Officina, Falegnameria",
      "Spazi esterni privati con tavolo e sedie per ogni unità",
      "Supporto logistico Isola Events se lo vuoi",
    ],
  },
  {
    slug: "retreat-corporate-shooting",
    kind: "terzi",
    title: "Retreat, Corporate & Shooting",
    tagline: "Organizza tu · 200 ettari di set naturale",
    description:
      "Yoga al parco, trekking, mountain bike, equitazione e pensione cavalli, calcio/volley/bocce/ping-pong. Un set autentico per brand, produzioni e team che vogliono staccare davvero.",
    image: "/location/cavalli.jpg",
    imageFallback: "https://fattoriaisola.com/wp-content/uploads/2019/12/cavalli-1024x576.jpg",
    capacity: "10–80 ospiti",
    music: "Silenzio della campagna + live su richiesta",
    priceFrom: "location da €900 / giorno",
    highlights: [
      "Piscina con idromassaggio (30.05–30.09)",
      "Attività: bici, cavalli, sport, trekking",
      "A 50 km da Firenze e Siena, 15 km da Arezzo",
      "Catering toscano e pernottamento in loco",
    ],
  },
];

export interface Space {
  name: string;
  detail: string;
  size: string;
  image: string;
}

export const spaces: Space[] = [
  { name: "Piscina 7×14 + gazebo", detail: "Feste, cene e cerimonie all'aperto con scala romana e verde arredato.", size: "fino a 150 ospiti", image: "/location/piscina.jpg" },
  { name: "Parco secolare + villa '600", detail: "Piante rare, viali e villa del Granduca di Toscana per aperitivi e concerti.", size: "fino a 200 ospiti", image: "/location/villa-parco.jpg" },
  { name: "Cappella privata", detail: "Consacrata, attiva soprattutto a maggio. Riti intimi e benedizioni.", size: "fino a 60 ospiti", image: "/location/cappella.jpg" },
  { name: "Scuderie & maneggio", detail: "Equitazione, carrozza, pensione cavalli. Foto e ingressi memorabili.", size: "set + esperienze", image: "/location/cavalli.jpg" },
  { name: "5 appartamenti toscani", detail: "Colombaia · Mulino · Fattoria · Officina · Falegnameria (accessibile). 26 posti letto.", size: "26 posti letto", image: "/location/appartamenti.jpg" },
];

export interface GalleryItem {
  src: string;
  alt: string;
  credit: string;
  fallback: string;
}

/**
 * Metti gli ORIGINALI in public/location/ con questi nomi.
 * `fallback` punta alle foto pubbliche di fattoriaisola.com per anteprima/dev.
 */
export const gallery: GalleryItem[] = [
  { src: "/location/panoramica.jpg", alt: "Panoramica della tenuta", credit: "Fattoria Isola", fallback: "https://fattoriaisola.com/wp-content/uploads/2019/12/1.jpg" },
  { src: "/location/piscina.jpg", alt: "Piscina 7x14 con gazebo", credit: "Fattoria Isola", fallback: "https://fattoriaisola.com/wp-content/uploads/2019/12/Piscina-HD.jpg" },
  { src: "/location/piscina-sera.jpg", alt: "Festa a bordo piscina", credit: "Fattoria Isola", fallback: "https://fattoriaisola.com/wp-content/uploads/2019/12/festa-alla-Fattoria-dellIsola-1024x576.jpg" },
  { src: "/location/villa-parco.jpg", alt: "Villa seicentesca e parco", credit: "Fattoria Isola", fallback: "https://fattoriaisola.com/wp-content/uploads/2019/12/parco-villa-da-sopra1.jpg" },
  { src: "/location/carrozza.jpg", alt: "Carrozza davanti alla fattoria", credit: "Fattoria Isola", fallback: "https://fattoriaisola.com/wp-content/uploads/2019/12/carrozza-davanti-alla-fattoria-isola-1024x576.jpg" },
  { src: "/location/cavalli.jpg", alt: "Cavalli della tenuta", credit: "Fattoria Isola", fallback: "https://fattoriaisola.com/wp-content/uploads/2019/12/cavalli-1024x576.jpg" },
  { src: "/location/cappella.jpg", alt: "Cappella privata", credit: "Fattoria Isola", fallback: "https://fattoriaisola.com/wp-content/uploads/2019/12/Cappella-765x1024.jpg" },
  { src: "/location/appartamenti.jpg", alt: "Interni in stile toscano", credit: "Fattoria Isola", fallback: "https://fattoriaisola.com/wp-content/uploads/2019/12/C_soggiorno-con-tavolo-colombaia-tipo-b-1024x576.jpg" },
];

export const pricing = [
  {
    name: "Essenziale",
    price: "da €39 / ospite",
    for: "Per assaggiare Isola senza pensieri",
    features: ["Aperitivo o cena semplice a bordo piscina", "Playlist/live essenziale DBYoung", "Allestimento base gazebo e luci", "Staff accoglienza"],
    cta: "Richiedi disponibilità",
  },
  {
    name: "Sartoriale",
    price: "da €79 / ospite",
    for: "Il signature: elegante, memorabile",
    features: ["Band dal vivo + direzione artistica Dimitri", "Cena toscana + Chianti della tenuta", "Parco illuminato + cappella disponibile", "Foto con cavalli e carrozza"],
    featured: true,
    cta: "Prenota la call gratuita",
  },
  {
    name: "Gran Galà / Tua Location",
    price: "location da €1.900",
    for: "Matrimoni ed eventi organizzati da te",
    features: ["Uso esclusivo spazi + 5 appartamenti", "Rito in cappella o nel parco", "I tuoi fornitori, nostro supporto logistico", "Pernottamento 26 ospiti in loco"],
    cta: "Parliamone in call",
  },
];
