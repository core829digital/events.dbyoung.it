import type { Lang } from "./i18n";

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
  /** URL di scorta se il file locale non è disponibile */
  imageFallback: string;
  capacity: string;
  music: string;
  highlights: string[];
  en: {
    title: string;
    tagline: string;
    description: string;
    capacity: string;
    music: string;
    highlights: string[];
  };
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
    highlights: [
      "Band dal vivo diretta da Dimitri",
      "Cena toscana + Chianti della tenuta",
      "Piscina, gazebo e parco illuminati",
      "Possibilità di pernottamento in 5 appartamenti",
    ],
    en: {
      title: "Jazz & Blues Night Under the Stars",
      tagline: "Isola Events presents · poolside",
      description:
        "Dimitri Bouterline's signature format: a live jazz-blues quartet with real instruments, Tuscan dinner by the 7×14 pool and the illuminated centuries-old park. Artistic direction, band and production by DBYoung.",
      capacity: "80–150 guests",
      music: "Jazz · Blues · Soul with real instruments",
      highlights: [
        "Live band directed by Dimitri",
        "Tuscan dinner + estate Chianti",
        "Illuminated pool, gazebos and park",
        "Overnight stay in 5 apartments available",
      ],
    },
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
    highlights: [
      "Concerto nella villa + aperitivo nel parco",
      "Cappella consacrata per riti e benedizioni di maggio",
      "Visita alla tenuta da 200 ettari",
      "Olio EVO e Chianti acquistabili in loco",
    ],
    en: {
      title: "Classical Music in the Villa",
      tagline: "Isola Events presents · 17th-century villa",
      description:
        "Piano, strings and winds in the 17th-century villa once owned by the Grand Duke of Tuscany, with the private chapel for ceremonies. DBYoung's bridge between classical tradition and modern sound.",
      capacity: "60–120 guests",
      music: "Classical · Modern crossover",
      highlights: [
        "Concert in the villa + aperitivo in the park",
        "Consecrated chapel for rites and May blessings",
        "Tour of the 200-hectare estate",
        "EVO oil and Chianti available on site",
      ],
    },
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
    highlights: [
      "Cappella privata + parco + piscina + barbecue",
      "5 appartamenti: Colombaia, Mulino, Fattoria, Officina, Falegnameria",
      "Spazi esterni privati con tavolo e sedie per ogni unità",
      "Supporto logistico Isola Events se lo vuoi",
    ],
    en: {
      title: "Your Tuscan Wedding",
      tagline: "Host yours · we open the estate",
      description:
        "Rent the spaces and plan your day with your own vendors: ceremony in the chapel or the park, reception by the pool, photos with carriage and horses, overnight stay in the 5 Tuscan apartments.",
      capacity: "up to 150 guests · 26 beds",
      music: "Your music — PA and stage available",
      highlights: [
        "Private chapel + park + pool + barbecue",
        "5 apartments: Colombaia, Mulino, Fattoria, Officina, Falegnameria",
        "Private outdoor spaces with table and chairs for each unit",
        "Isola Events logistics support if you want it",
      ],
    },
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
    highlights: [
      "Piscina con idromassaggio (30.05–30.09)",
      "Attività: bici, cavalli, sport, trekking",
      "A 50 km da Firenze e Siena, 15 km da Arezzo",
      "Catering toscano e pernottamento in loco",
    ],
    en: {
      title: "Retreats, Corporate & Shootings",
      tagline: "Host yours · 200 hectares of natural set",
      description:
        "Park yoga, trekking, mountain biking, horse riding and livery, football, volleyball, bocce and ping-pong. An authentic set for brands, productions and teams that want to truly unplug.",
      capacity: "10–80 guests",
      music: "Countryside silence + live on request",
      highlights: [
        "Pool with whirlpool (30.05–30.09)",
        "Activities: bikes, horses, sports, trekking",
        "50 km from Florence and Siena, 15 km from Arezzo",
        "Tuscan catering and overnight stay on site",
      ],
    },
  },
];

export function localizeEvent<T extends SiteEvent>(e: T, lang: Lang) {
  if (lang === "it") return e;
  return { ...e, ...e.en };
}

export interface Space {
  name: string;
  detail: string;
  size: string;
  image: string;
  en: { name: string; detail: string };
}

export const spaces: Space[] = [
  { name: "Piscina 7×14 + gazebo", detail: "Feste, cene e cerimonie all'aperto con scala romana e verde arredato.", size: "fino a 150 ospiti", image: "/location/piscina.jpg", en: { name: "7×14 pool + gazebos", detail: "Outdoor parties, dinners and ceremonies with Roman steps and furnished greenery." } },
  { name: "Parco secolare + villa '600", detail: "Piante rare, viali e villa del Granduca di Toscana per aperitivi e concerti.", size: "fino a 200 ospiti", image: "/location/villa-parco.jpg", en: { name: "Centuries-old park + 17th-century villa", detail: "Rare plants, avenues and the Grand Duke's villa for aperitivi and concerts." } },
  { name: "Cappella privata", detail: "Consacrata, attiva soprattutto a maggio. Riti intimi e benedizioni.", size: "fino a 60 ospiti", image: "/location/cappella.jpg", en: { name: "Private chapel", detail: "Consecrated, especially active in May. Intimate rites and blessings." } },
  { name: "Scuderie & maneggio", detail: "Equitazione, carrozza, pensione cavalli. Foto e ingressi memorabili.", size: "set + esperienze", image: "/location/cavalli.jpg", en: { name: "Stables & riding", detail: "Horse riding, carriage, livery. Memorable photos and entrances." } },
  { name: "5 appartamenti toscani", detail: "Colombaia · Mulino · Fattoria · Officina · Falegnameria (accessibile). 26 posti letto.", size: "26 posti letto", image: "/location/appartamenti.jpg", en: { name: "5 Tuscan apartments", detail: "Colombaia · Mulino · Fattoria · Officina · Falegnameria (accessible). 26 beds." } },
];

export function localizeSpace(s: Space, lang: Lang) {
  if (lang === "it") return s;
  return { ...s, name: s.en.name, detail: s.en.detail };
}

export const appartamenti: { name: string; it: string; en: string }[] = [
  { name: "Colombaia", it: "55 mq · 5 persone · 1° piano · camera tripla con baldacchino + soggiorno con divano-letto, vista campagna", en: "55 sqm · 5 guests · 1st floor · triple room with canopy bed + living room with sofa bed, countryside view" },
  { name: "Mulino", it: "50 mq · 5 persone · piano terra · terrazza vista piscina + camino per la stagione fredda", en: "50 sqm · 5 guests · ground floor · pool-view terrace + fireplace for the cold season" },
  { name: "Fattoria", it: "80 mq · 6 persone · scala privata · 2 triple + mobili antichi veri, giardino con gazebo", en: "80 sqm · 6 guests · private stairs · 2 triple rooms + genuine antique furniture, garden with gazebo" },
  { name: "Officina", it: "45 mq · 4 persone · piano terra · matrimoniale + divano-letto, terrazza coperta", en: "45 sqm · 4 guests · ground floor · double room + sofa bed, covered terrace" },
  { name: "Falegnameria", it: "60 mq · 6 persone · piano terra accessibile · 2 triple + soggiorno, terrazza", en: "60 sqm · 6 guests · accessible ground floor · 2 triple rooms + living room, terrace" },
];

export interface GalleryItem {
  src: string;
  alt: string;
  altEn: string;
  credit: string;
  fallback: string;
}

/** Le foto della tenuta di Fattoria Isola (`fallback` come scorta di sicurezza). */
export const gallery: GalleryItem[] = [
  { src: "/location/panoramica.jpg", alt: "Panoramica della tenuta", altEn: "Estate overview", credit: "Fattoria Isola", fallback: "https://fattoriaisola.com/wp-content/uploads/2019/12/1.jpg" },
  { src: "/location/piscina.jpg", alt: "Piscina 7x14 con gazebo", altEn: "7×14 pool with gazebos", credit: "Fattoria Isola", fallback: "https://fattoriaisola.com/wp-content/uploads/2019/12/Piscina-HD.jpg" },
  { src: "/location/piscina-sera.jpg", alt: "Festa a bordo piscina", altEn: "Poolside party", credit: "Fattoria Isola", fallback: "https://fattoriaisola.com/wp-content/uploads/2019/12/festa-alla-Fattoria-dellIsola-1024x576.jpg" },
  { src: "/location/villa-parco.jpg", alt: "Villa seicentesca e parco", altEn: "17th-century villa and park", credit: "Fattoria Isola", fallback: "https://fattoriaisola.com/wp-content/uploads/2019/12/parco-villa-da-sopra1.jpg" },
  { src: "/location/carrozza.jpg", alt: "Carrozza davanti alla fattoria", altEn: "Carriage in front of the farm", credit: "Fattoria Isola", fallback: "https://fattoriaisola.com/wp-content/uploads/2019/12/carrozza-davanti-alla-fattoria-isola-1024x576.jpg" },
  { src: "/location/cavalli.jpg", alt: "Cavalli della tenuta", altEn: "Estate horses", credit: "Fattoria Isola", fallback: "https://fattoriaisola.com/wp-content/uploads/2019/12/cavalli-1024x576.jpg" },
  { src: "/location/cappella.jpg", alt: "Cappella privata", altEn: "Private chapel", credit: "Fattoria Isola", fallback: "https://fattoriaisola.com/wp-content/uploads/2019/12/Cappella-765x1024.jpg" },
  { src: "/location/appartamenti.jpg", alt: "Interni in stile toscano", altEn: "Tuscan-style interiors", credit: "Fattoria Isola", fallback: "https://fattoriaisola.com/wp-content/uploads/2019/12/C_soggiorno-con-tavolo-colombaia-tipo-b-1024x576.jpg" },
];
