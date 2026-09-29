// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Server-only; set via NUXT_ANTHROPIC_API_KEY. Checked lazily at AI call time.
    anthropicApiKey: ''
  },

  compatibilityDate: '2026-06-30',

  nitro: {
    experimental: {
      database: true
    },
    database: {
      default: {
        connector: 'node-sqlite',
        options: { path: '.data/db.sqlite' }
      }
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
