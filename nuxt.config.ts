// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/image",
  ],

  css: ["~/assets/css/main.css"],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  app: {
    head: {
      title: "Kommunikations-App",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Eine App zur Unterstützung der Kommunikation",
        },
      ],
    },
  },

  typescript: {
    strict: false,
    typeCheck: false,
  },

  compatibilityDate: "2025-04-07",

  vite: {
    json: {
      stringify: true,
    },
  },
});
