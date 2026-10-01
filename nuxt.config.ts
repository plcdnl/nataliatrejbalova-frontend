import { defaultLocale, locales } from './i18n'

export default defineNuxtConfig({
  extends: [
    '@studio-fes/layer-craft',
  ],

  modules: [
    '@studio-fes/nuxt-remote-svg',
  ],

  vite: {
    optimizeDeps: {
      include: [
        '@studio-fes/nuxt-remote-svg',
      ],
    },
  },

  eslint: {
    config: {
      standalone: false,
      nuxt: {
        sortConfigKeys: true,
      },
    },
  },

  graphqlMiddleware: {
    downloadSchema: 'dev-only',
  },

  i18n: {
    defaultLocale,
    locales,
    strategy: 'prefix_except_default',
    detectBrowserLanguage: false,
  },

  multiCache: {
    api: {
      enabled: true,
      authorization: import.meta.dev ? false : 'hunter',
      cacheTagInvalidationDelay: 3000, // 3 seconds
    },
    data: {
      enabled: true,
    },
    disableCacheOverviewLogMessage: true,
  },
})
