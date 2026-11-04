// Types du contenu éditable via l'admin (/admin).
// Les fichiers JSON de src/data/ doivent respecter ces interfaces :
// `astro check` (lancé au build) échoue si un champ manque ou a le mauvais type.

export type Locale = "fr" | "en";

/** Réglages communs aux deux langues — src/data/settings.json */
export interface Settings {
  name: string;
  author: string;
  email: string;
  phone: string;
  /** Numéro WhatsApp au format international, chiffres uniquement (ex. 22870839169) */
  whatsapp: string;
  currency: string;
  siteUrl: string;
  logo: string;
  socialImage: string;
  youtube: {
    url: string;
    channelId: string;
    subscribers: number;
  };
  socialLinks: { text: string; href: string }[];
}

export interface HomeContent {
  seo: { title: string; description: string };
  hero: {
    specialty: string;
    headline: string;
    summary: string;
    primaryCta: string;
    secondaryCta: string;
    whatsappMessage: string;
  };
  proofs: {
    subscribersLabel: string;
    items: { value: string; label: string }[];
  };
}

export interface ServiceItem {
  title: string;
  description: string;
  points?: string[];
  price?: number | null;
  priceFrom?: boolean;
  priceSuffix?: string;
  featured?: boolean;
  cta: string;
  whatsappMessage: string;
}

export interface ServicesContent {
  title: string;
  intro: string;
  items: ServiceItem[];
  note?: string;
}

export type ResourceType = "formation" | "ebook" | "template";
export type ResourceStatus = "available" | "soon";

export interface ResourceItem {
  type: ResourceType | string;
  status: ResourceStatus | string;
  title: string;
  description: string;
  price?: number | null;
  link?: string;
  cta: string;
  whatsappMessage?: string;
}

export interface ResourcesContent {
  title: string;
  intro: string;
  items: ResourceItem[];
}

/** Une formation vendue, avec sa page de vente /formations/<slug> */
export interface CourseModule {
  title: string;
  lessons: string[];
}

export interface CourseItem {
  /** Identifiant de l'URL (/formations/<slug>), identique en FR et EN */
  slug: string;
  status: ResourceStatus | string;
  featured?: boolean;
  title: string;
  /** Accroche courte (cartes, haut de page) */
  tagline: string;
  /** Présentation détaillée (haut de la page de vente) */
  description: string;
  level: string;
  duration: string;
  /** Format : vidéos, lives, accompagnement… */
  format: string;
  price?: number | null;
  /** Prix barré (promotion) */
  oldPrice?: number | null;
  /** Infos sur les sessions live (ex. « 4 lives de 2 h, le samedi à 10 h GMT ») */
  liveSessions?: string;
  /** Prochaine session / cohorte (texte libre) */
  nextCohort?: string;
  outcomes: string[];
  includes: string[];
  audience: string[];
  prerequisites: string[];
  modules: CourseModule[];
  faq: { question: string; answer: string }[];
  /** Lien de paiement sur une plateforme externe (Chariow, Selar, Gumroad…) */
  paymentLink?: string;
  cta: string;
  whatsappMessage: string;
}

export interface CoursesContent {
  title: string;
  intro: string;
  /** Note de paiement affichée sous les boutons d'achat */
  paymentNote?: string;
  items: CourseItem[];
}

export interface ProjectItem {
  name: string;
  summary: string;
  image: string;
  linkPreview?: string;
  linkSource?: string;
}

export interface ProjectsContent {
  title: string;
  items: ProjectItem[];
}

export interface ExperienceItem {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  highlights: string[];
}

export interface ExperienceContent {
  title: string;
  items: ExperienceItem[];
}

export interface SkillsContent {
  title: string;
  items: { category: string; items: string[] }[];
}

export interface EducationItem {
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
  summary?: string;
}

export interface EducationContent {
  title: string;
  items: EducationItem[];
}

export interface AboutContent {
  title: string;
  description: string;
  image: string;
}

export interface YoutubeContent {
  title: string;
  intro: string;
}

export interface ContactContent {
  title: string;
  intro: string;
  responseTime: string;
}

/** Tout le contenu d'une langue (un fichier JSON par section dans src/data/<langue>/) */
export interface SiteContent {
  home: HomeContent;
  services: ServicesContent;
  resources: ResourcesContent;
  courses: CoursesContent;
  projects: ProjectsContent;
  youtube: YoutubeContent;
  experience: ExperienceContent;
  skills: SkillsContent;
  education: EducationContent;
  about: AboutContent;
  contact: ContactContent;
}
