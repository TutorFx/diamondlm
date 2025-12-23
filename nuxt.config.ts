// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/mdc',
    'nuxt-auth-utils',
    'nuxt-monaco-editor',
    'motion-v/nuxt'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    postgres: {
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      db: process.env.POSTGRES_DB,
      port: process.env.POSTGRES_PORT,
      host: process.env.POSTGRES_HOSTNAME
    },
    redis: {
      password: process.env.REDIS_PASSWORD,
      port: process.env.REDIS_PORT
    },
    session: {
      password: process.env.NUXT_SESSION_PASSWORD
    },
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434/api'
    },
    kokoro: {
      apiUrl: process.env.KOKORO_API_URL
    },
    public: {
      features: {
        audio: !!process.env.KOKORO_API_URL
      }
    }
  },

  routeRules: {
    '/new-chat': { prerender: true }
  },

  experimental: {
    viewTransition: true
  },

  compatibilityDate: '2025-01-15',

  nitro: {
    experimental: {
      tasks: true
    },
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
