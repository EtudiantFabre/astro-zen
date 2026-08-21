export interface SiteConfig extends HeaderProps {
  title: string;
  description: string;
  lang: string;
  author: string;
  socialLinks: { text: string; href: string }[];
  socialImage: string;
  canonicalURL?: string;
}

export interface SiteContent {
  hero: HeroProps;
  experience: ExperienceProps[];
  projects: ProjectProps[];
  skills: SkillGroupProps[];
  education: EducationProps[];
  about: AboutProps;
}

export interface SkillGroupProps {
  category: string;
  items: string[];
}

export interface EducationProps {
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
  summary?: string;
}

export interface HeroProps {
  name: string;
  specialty: string;
  summary: string;
  email: string;
  phone?: string;
}

export interface ExperienceProps {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  summary: string | string[];
}

export interface ProjectProps {
  name: string;
  summary: string;
  image: string;
  linkPreview?: string;
  linkSource?: string;
}

export interface AboutProps {
  description: string;
  image: string;
}

export interface HeaderProps {
  siteLogo: string;
  navLinks: { text: string; href: string }[];
}
