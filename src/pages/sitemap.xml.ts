// Sitemap généré au build : une URL par page et par langue, avec les liens hreflang
import type { APIRoute } from "astro";
import { getAbsoluteLocaleUrl } from "astro:i18n";
import { LOCALES, DEFAULT_LOCALE } from "@i18n";
import { COURSES_PATH, coursePath, getCourses } from "@lib/courses";

// Accueil, catalogue des formations et une page par formation
const paths = ["", COURSES_PATH, ...getCourses(DEFAULT_LOCALE).map((c) => coursePath(c.slug))];

export const GET: APIRoute = () => {
  const urls = paths
    .map((path) => {
      const alternates = LOCALES.map(
        (l) =>
          `<xhtml:link rel="alternate" hreflang="${l}" href="${getAbsoluteLocaleUrl(l, path)}"/>`,
      ).join("");
      return LOCALES.map(
        (l) => `<url><loc>${getAbsoluteLocaleUrl(l, path)}</loc>${alternates}</url>`,
      ).join("");
    })
    .join("");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`,
    { headers: { "Content-Type": "application/xml" } },
  );
};
