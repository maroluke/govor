// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: process.env.NODE_ENV !== "production" },

  modules: [
    "@nuxtjs/tailwindcss",
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
    // Optimierungen für den Build
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            prisma: ["@prisma/client"],
          },
        },
      },
    },
  },

  // Netlify-Deployment-Optimierungen
  nitro: {
    preset: "netlify",
    logLevel: "info",
    routeRules: {
      "/api/**": {
        cors: true,
        headers: { "access-control-allow-methods": "GET, POST, DELETE" },
      },
    },
  },

  pages: true,
});
