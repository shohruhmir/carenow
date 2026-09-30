// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  colorMode: {
    preference: 'light'
  },

  ssr: false,

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
      yandexMapsApiKey: process.env.NUXT_PUBLIC_YANDEX_MAPS_API_KEY || '',
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    },
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/test-utils',
    '@nuxt/ui',
    'nuxt-swiper',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    'nuxt-mapbox',
    'nuxt-aos',
  ],


  vite: {
    plugins: [
      tailwindcss(),
    ],
    server: {
      watch: {
        ignored: ['**/node_modules/**', '**/.git/**', '**/.nuxt/**', '**/.output/**'],
      },
    },
  },
  css: ['~/assets/css/main.css'],


  i18n: {
    defaultLocale: "uz",
    langDir: "./locales/",
    locales: [
      {
        code: "uz",
        name: "uz",
        file: "uz.json",
      },
      {
        code: "ru",
        name: "ru",
        file: "ru.json",
      },
      {
        code: "en",
        name: "en",
        file: "en.json",
      },
    ],
  },

  aos: {
    duration: 700
  }


})