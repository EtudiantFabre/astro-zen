// Point d'entrée i18n : charge le contenu (src/data/) et les libellés d'interface (ui.ts).
// Le contenu est éditable via l'admin (/admin) ; les imports explicites ci-dessous
// permettent à `astro check` de valider chaque fichier JSON contre les types.
import type { Locale, Settings, SiteContent } from "@types";
import settingsJson from "../data/settings.json";

import frHome from "../data/fr/home.json";
import frServices from "../data/fr/services.json";
import frResources from "../data/fr/resources.json";
import frProjects from "../data/fr/projects.json";
import frYoutube from "../data/fr/youtube.json";
import frExperience from "../data/fr/experience.json";
import frSkills from "../data/fr/skills.json";
import frEducation from "../data/fr/education.json";
import frAbout from "../data/fr/about.json";
import frContact from "../data/fr/contact.json";

import enHome from "../data/en/home.json";
import enServices from "../data/en/services.json";
import enResources from "../data/en/resources.json";
import enProjects from "../data/en/projects.json";
import enYoutube from "../data/en/youtube.json";
import enExperience from "../data/en/experience.json";
import enSkills from "../data/en/skills.json";
import enEducation from "../data/en/education.json";
import enAbout from "../data/en/about.json";
import enContact from "../data/en/contact.json";

import { ui } from "./ui";

export const LOCALES: Locale[] = ["fr", "en"];
export const DEFAULT_LOCALE: Locale = "fr";

/** Locale BCP 47 utilisée pour formater nombres et dates */
export const INTL_LOCALE: Record<Locale, string> = { fr: "fr-FR", en: "en-US" };

export const settings: Settings = settingsJson;

const content: Record<Locale, SiteContent> = {
  fr: {
    home: frHome,
    services: frServices,
    resources: frResources,
    projects: frProjects,
    youtube: frYoutube,
    experience: frExperience,
    skills: frSkills,
    education: frEducation,
    about: frAbout,
    contact: frContact,
  },
  en: {
    home: enHome,
    services: enServices,
    resources: enResources,
    projects: enProjects,
    youtube: enYoutube,
    experience: enExperience,
    skills: enSkills,
    education: enEducation,
    about: enAbout,
    contact: enContact,
  },
};

export const getContent = (locale: Locale): SiteContent => content[locale];
export const getUi = (locale: Locale) => ui[locale];

export const isLocale = (value: string | undefined): value is Locale =>
  LOCALES.includes(value as Locale);
