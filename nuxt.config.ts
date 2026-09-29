// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    'nuxt-auth-utils'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Server-only; set via NUXT_DATABASE_URL and NUXT_ANTHROPIC_API_KEY. Checked lazily on first use.
    databaseUrl: '',
    anthropicApiKey: '',
    public: {
      // Optional NUXT_PUBLIC_SITE_URL, e.g. https://rendez-vue.example.com
      siteUrl: ''
    }
  },

  compatibilityDate: '2026-06-30',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
