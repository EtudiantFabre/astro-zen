// Libellés fixes de l'interface (navigation, boutons, formulaire…).
// Le contenu éditorial (textes, prix, offres) se modifie dans l'admin ou dans src/data/.

const fr = {
  nav: {
    home: "Accueil",
    services: "Services",
    resources: "Formations",
    projects: "Projets",
    youtube: "YouTube",
    contact: "Contact",
  },
  header: {
    homeLink: "Accueil",
    openMenu: "Ouvrir le menu",
    cta: "Discutons",
    switchLanguage: "Changer de langue",
  },
  price: {
    onQuote: "Sur devis",
    from: "À partir de",
    free: "Gratuit",
    popular: "Le plus demandé",
  },
  resources: {
    types: {
      formation: "Formation",
      ebook: "E-book",
      template: "Template",
    } as Record<string, string>,
    soon: "Bientôt disponible",
  },
  projects: { source: "Code source", preview: "Aperçu" },
  youtube: {
    watch: "Voir la vidéo",
    play: "Lire la vidéo",
    allVideos: "Voir toute la chaîne",
    subscribe: "S'abonner",
    unavailable:
      "Les vidéos ne sont pas disponibles pour le moment, retrouve-les directement sur la chaîne.",
  },
  contact: {
    email: "M'écrire par email",
    whatsapp: "WhatsApp",
    formTitle: "Envoyer un message",
    name: "Nom",
    emailField: "Email",
    subject: "Sujet",
    subjectOther: "Autre demande",
    message: "Message",
    messagePlaceholder: "Décris ton besoin en quelques lignes…",
    sendWhatsapp: "Envoyer via WhatsApp",
    sendEmail: "Envoyer par email",
    formHint:
      "Le message s'ouvre dans WhatsApp ou ta messagerie, prêt à être envoyé.",
    greeting: "Bonjour Fabrice,",
    signature: "—",
  },
  mobileCta: { whatsapp: "WhatsApp", services: "Mes services" },
  footer: { rights: "Tous droits réservés." },
};

const en: typeof fr = {
  nav: {
    home: "Home",
    services: "Services",
    resources: "Courses",
    projects: "Projects",
    youtube: "YouTube",
    contact: "Contact",
  },
  header: {
    homeLink: "Home",
    openMenu: "Open menu",
    cta: "Let's talk",
    switchLanguage: "Switch language",
  },
  price: {
    onQuote: "On quote",
    from: "From",
    free: "Free",
    popular: "Most requested",
  },
  resources: {
    types: { formation: "Course", ebook: "E-book", template: "Template" },
    soon: "Coming soon",
  },
  projects: { source: "Source code", preview: "Preview" },
  youtube: {
    watch: "Watch the video",
    play: "Play video",
    allVideos: "See the whole channel",
    subscribe: "Subscribe",
    unavailable:
      "Videos are unavailable right now, find them directly on the channel.",
  },
  contact: {
    email: "Email me",
    whatsapp: "WhatsApp",
    formTitle: "Send a message",
    name: "Name",
    emailField: "Email",
    subject: "Subject",
    subjectOther: "Other request",
    message: "Message",
    messagePlaceholder: "Describe what you need in a few lines…",
    sendWhatsapp: "Send via WhatsApp",
    sendEmail: "Send by email",
    formHint: "Your message opens in WhatsApp or your mail app, ready to send.",
    greeting: "Hi Fabrice,",
    signature: "—",
  },
  mobileCta: { whatsapp: "WhatsApp", services: "My services" },
  footer: { rights: "All rights reserved." },
};

export const ui = { fr, en };
export type UiStrings = typeof fr;
