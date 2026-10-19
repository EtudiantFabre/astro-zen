// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://fabricetoyi.dev",
  // Français à la racine (/), anglais sous /en/
  i18n: {
    locales: ["fr", "en"],
    defaultLocale: "fr",
    routing: { prefixDefaultLocale: false },
  },
  // Polices chargées depuis Google Fonts dans src/layouts/Layout.astro
  vite: {
    plugins: [tailwindcss()],
  },
});
