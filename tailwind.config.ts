import type { Config } from "tailwindcss";

export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#E6F6FF",
          200: "#BAE3FF",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284C7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        background: "#FFFFFF",
        foreground: "#000000",
      },
    },
  },
  plugins: [],
} satisfies Config;
