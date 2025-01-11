// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  nitro: {
    prerender: {
      autoSubfolderIndex: true,
      routes: ["/login", "/signup", "/forgot-password"],
    },
  },
  css: ["~/css/main.css"],
  future: {
    compatibilityVersion: 4,
  },
  modules: ["@nuxt/ui"],
});
