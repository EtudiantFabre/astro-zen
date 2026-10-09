import type { Locale } from "@types";
import { INTL_LOCALE, settings, getUi } from "@i18n";

/** Lien WhatsApp avec message pré-rempli */
export const whatsappLink = (message?: string) =>
  `https://wa.me/${settings.whatsapp}` +
  (message ? `?text=${encodeURIComponent(message)}` : "");

export const formatNumber = (value: number, locale: Locale) =>
  new Intl.NumberFormat(INTL_LOCALE[locale]).format(value);

/** Nombre d'abonnés affiché, ex. « 3 100+ » / « 3,100+ » */
export const formatSubscribers = (locale: Locale) =>
  `${formatNumber(settings.youtube.subscribers, locale)}+`;

/**
 * Remplace les variables dynamiques dans un texte éditable.
 * Disponible : {subscribers} → nombre d'abonnés YouTube (réglages).
 */
export const fillVariables = (text: string, locale: Locale) =>
  text.replaceAll("{subscribers}", formatSubscribers(locale));

/** Prix formaté : « 15 000 FCFA », « Sur devis » si vide, « Gratuit » si 0 */
export const formatPrice = (
  price: number | null | undefined,
  locale: Locale,
) => {
  const t = getUi(locale).price;
  if (price === null || price === undefined) return t.onQuote;
  if (price === 0) return t.free;
  return `${formatNumber(price, locale)} ${settings.currency}`;
};

export const formatDate = (date: Date, locale: Locale) =>
  new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
