// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/mdc',
    'nuxt-auth-utils',
    'nuxt-monaco-editor'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  experimental: {
    viewTransition: true
  },

  compatibilityDate: '2025-01-15',

  nitro: {
    experimental: {
      tasks: true
    },
    preset: 'bun',
    scheduledTasks: {
      '*/10 * * * * *': ['queue:process']
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
