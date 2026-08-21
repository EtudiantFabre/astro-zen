import type { SiteConfig, SiteContent } from "../types";

export const SITE_CONFIG: SiteConfig = {
  title: "Toyi Fabrice — Développeur Full-Stack",
  author: "Toyi Fabrice Anènafoua",
  description:
    "Développeur Full-Stack (Laravel, Django, Vue.js, Next.js) basé à Lomé, Togo. Plus de 3 ans d'expérience à concevoir, développer et déployer des applications web de bout en bout. Fondateur de micro-ats.com.",
  lang: "fr",
  siteLogo: "/profile-small.jpg",
  navLinks: [
    { text: "Expérience", href: "#experience" },
    { text: "Projets", href: "#projects" },
    { text: "Compétences", href: "#skills" },
    { text: "Formation", href: "#education" },
    { text: "À propos", href: "#about" },
  ],
  socialLinks: [
    { text: "Github", href: "https://github.com/EtudiantFabre" },
    { text: "LinkedIn", href: "https://www.linkedin.com/in/fabrice-toyi-247503210/" },
    { text: "Youtube", href: "https://www.youtube.com/@developpeurtaf" },
    { text: "Twitter", href: "https://x.com/FabriceTAF" },
    { text: "Newsletter", href: "https://developpeurtaf.substack.com/" },
  ],
  socialImage: "/og-image.png",
  canonicalURL: "https://fabricetoyi.dev",
};

export const SITE_CONTENT: SiteContent = {
  hero: {
    name: "Toyi Fabrice",
    specialty: "Développeur Full-Stack",
    summary:
      "Développeur Full-Stack (Laravel, Django, Vue.js, Next.js) basé à Lomé, avec plus de 3 ans d'expérience à concevoir, développer et déployer des applications web de bout en bout. Fondateur et éditeur solo de micro-ats.com, un SaaS d'aide au recrutement mené du code à la production.",
    email: "fabricetoyi87@gmail.com",
    phone: "+228 70 83 91 69",
  },
  experience: [
    {
      company: "Knowbridge University",
      position: "Développeur Full-Stack Laravel & Formateur",
      startDate: "Nov. 2025",
      endDate: "Aujourd'hui",
      summary: [
        "Sollicité par les partenaires de l'université pour des projets digitaux, j'ai livré des applications web de l'analyse des besoins à la mise en production, réduisant les délais de livraison.",
        "Conçu et développé le site officiel ainsi que les applications mobiles internes, en pilotant le design technique et l'implémentation complète.",
        "Formé les étudiants au développement logiciel (cours et encadrement de projets), renforçant leur autonomie technique.",
      ],
    },
    {
      company: "Itplex-Consult",
      position: "Développeur Full-Stack Django",
      startDate: "Fév. 2025",
      endDate: "Nov. 2025",
      summary: [
        "Responsable de la plateforme SaaS SMS.TG : conçu un système de campagnes avec intégration des API opérateurs (YAS, MOOV) permettant l'envoi et le suivi des livraisons en temps réel.",
        "Développé la gestion des clients, quotas, statistiques et facturation, centralisant tout le cycle de campagne dans une seule interface.",
        "Sécurisé les flux de données et implémenté une authentification à double facteur (2FA), renforçant la protection des comptes clients.",
      ],
    },
    {
      company: "ADI-Elite",
      position: "Développeur Full-Stack Laravel",
      startDate: "Oct. 2024",
      endDate: "Déc. 2024",
      summary: [
        "Développé une application web de gestion et d'analyse des données scolaires pour faciliter le suivi des performances académiques.",
        "Exposé les données via une API RESTful Laravel consommée par une application mobile, avec gestion des utilisateurs, rôles et permissions.",
        "Livré une interface réactive Blade + Tailwind CSS assurant une expérience utilisateur fluide.",
      ],
    },
    {
      company: "RGPL Gabon",
      position: "Développeur Full-Stack Laravel — Freelance (à distance)",
      startDate: "Jan. 2024",
      endDate: "Août 2024",
      summary:
        "Conçu et livré en autonomie complète une application web de gestion des données personnelles conforme au RGPD, adaptée au contexte réglementaire gabonais — de l'architecture au déploiement.",
    },
  ],
  projects: [
    {
      name: "MicroAts",
      summary:
        "SaaS d'aide au recrutement (ATS) conçu, développé et déployé en solo, de bout en bout : pipeline de candidats, tri assisté par IA, gestion des offres et des équipes. Front-end, back-end, base de données, CI/CD et hébergement définis de A à Z en tant que développeur-fondateur.",
      linkPreview: "https://micro-ats.com",
      image: "/micro-ats.png",
    },
    {
      name: "Bizzcart Finance AI",
      summary:
        "Plateforme d'intelligence financière : suivi de cours en temps réel, analyse de sentiment social multi-plateformes et prédictions assistées par IA, le tout dans un tableau de bord multilingue (FR/EN) et multi-devises.",
      linkPreview: "https://bizzcart.com",
      image: "/bizzcart.png",
    },
    {
      name: "SMS.TG",
      summary:
        "Plateforme SaaS d'envoi de SMS au Togo : campagnes marketing, notifications et OTP via intégration des API opérateurs (YAS, MOOV), avec quotas, statistiques et facturation. Réalisée chez Itplex-Consult.",
      linkPreview: "https://sms.tg",
      image: "/sms-tg.png",
    },
    {
      name: "Chaîne YouTube — developpeurtaf",
      summary:
        "Chaîne tech de vulgarisation du développement web et mobile (Python, Django, Laravel, PostgreSQL…), réunissant plus de 2 800 abonnés et 200+ vidéos.",
      linkPreview: "https://www.youtube.com/@developpeurtaf",
      image: "/youtube.png",
    },
  ],
  skills: [
    {
      category: "Langages",
      items: ["Python", "PHP", "JavaScript / TypeScript", "Dart", "Java", "Bash", "HTML / CSS"],
    },
    {
      category: "Frameworks",
      items: ["Laravel", "Django", "Vue.js", "Next.js", "Node.js", "Flutter"],
    },
    {
      category: "Bases de données",
      items: ["PostgreSQL", "MySQL", "MongoDB", "Firebase", "Neon", "Supabase"],
    },
    {
      category: "DevOps & Outils",
      items: [
        "Git / GitHub Actions",
        "API REST",
        "UML",
        "Tailwind CSS",
        "Bootstrap",
        "Déploiement (o2switch, Plesk, Heroku, Laravel Cloud, Vercel, Render)",
      ],
    },
    {
      category: "IA",
      items: ["Conception et orchestration d'agents IA en Python"],
    },
    {
      category: "Langues",
      items: ["Français (langue maternelle)", "Anglais (intermédiaire)"],
    },
  ],
  education: [
    {
      school: "Knowbridge University Institute — Sokodé",
      degree: "Master en Informatique (en cours)",
      startDate: "Août 2026",
      endDate: "Aujourd'hui",
    },
    {
      school: "IFNTI — Sokodé",
      degree: "Licence en Informatique",
      startDate: "2020",
      endDate: "2024",
    },
  ],
  about: {
    description: `
      Bonjour, je suis Toyi Fabrice, développeur Full-Stack basé à Lomé, au Togo. Depuis plus de trois ans, je conçois, développe et déploie des applications web de bout en bout — de l'analyse des besoins jusqu'à la mise en production.

      Fondateur et éditeur solo de micro-ats.com, j'aime prendre la responsabilité complète d'un produit et le livrer proprement, jusqu'au bout. En parallèle, je vulgarise la tech sur YouTube (2 800+ abonnés) et j'accompagne de jeunes diplômés vers l'insertion professionnelle.
    `,
    image: "/profile-big.jpg",
  },
};

// Couleur d'accent du thème : #5755ff (modifiable dans src/styles)
