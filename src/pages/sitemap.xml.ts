// Sitemap généré au build : une URL par langue, avec les liens hreflang
import type { APIRoute } from "astro";
import { getAbsoluteLocaleUrl } from "astro:i18n";
import { LOCALES } from "@i18n";

export const GET: APIRoute = () => {
  const alternates = LOCALES.map(
    (l) =>
      `<xhtml:link rel="alternate" hreflang="${l}" href="${getAbsoluteLocaleUrl(l, "")}"/>`,
  ).join("");
  const urls = LOCALES.map(
    (l) => `<url><loc>${getAbsoluteLocaleUrl(l, "")}</loc>${alternates}</url>`,
  ).join("");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`,
    { headers: { "Content-Type": "application/xml" } },
  );
};
