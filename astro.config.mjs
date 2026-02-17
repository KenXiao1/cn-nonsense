import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://cn-nonsense.netlify.app",
  integrations: [sitemap()]
});
