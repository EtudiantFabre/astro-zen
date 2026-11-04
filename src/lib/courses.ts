import { getRelativeLocaleUrl } from "astro:i18n";
import { getContent, getUi } from "@i18n";
import { whatsappLink } from "@lib/format";
import type { CourseItem, Locale } from "@types";

/** Chemin (sans langue) des pages formations */
export const COURSES_PATH = "formations";

export const coursePath = (slug: string) => `${COURSES_PATH}/${slug}`;
export const courseUrl = (locale: Locale, slug: string) =>
  getRelativeLocaleUrl(locale, coursePath(slug));
export const coursesUrl = (locale: Locale) => getRelativeLocaleUrl(locale, COURSES_PATH);

export const getCourses = (locale: Locale) => getContent(locale).courses.items;

export const isAvailable = (course: CourseItem) => course.status === "available";

/**
 * Boutons d'achat d'une formation :
 * - disponible + lien de paiement → plateforme externe, avec WhatsApp/Mobile Money en option
 * - disponible sans lien → WhatsApp (paiement Mobile Money)
 * - bientôt → liste d'attente WhatsApp
 */
export const courseActions = (course: CourseItem, locale: Locale) => {
  const t = getUi(locale).courses;
  const whatsapp = whatsappLink(course.whatsappMessage);
  if (!isAvailable(course)) {
    return { primary: { href: whatsapp, label: t.waitlist }, secondary: null };
  }
  if (course.paymentLink) {
    return {
      primary: { href: course.paymentLink, label: course.cta },
      secondary: { href: whatsapp, label: t.payMobileMoney },
    };
  }
  return { primary: { href: whatsapp, label: course.cta }, secondary: null };
};
