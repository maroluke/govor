// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    "@nuxtjs/tailwindcss",
    [
      "@nuxt/content",
      {
        experimental: {
          // Verwende einen reinen JS-Treiber statt SQLite
          clientDB: false,
        },
      },
    ],
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
      title: "Govor",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
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

  pages: true,
});
