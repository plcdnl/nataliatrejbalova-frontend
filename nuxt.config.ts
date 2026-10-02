import { defaultLocale, locales } from './i18n'

const mediaProxyHosts = [import.meta.env.NUXT_PUBLIC_BACKEND_URL, import.meta.env.NUXT_IMAGE_CLOUDFLARE_BASE_URL]
  .filter(Boolean)
  .map(url => new URL(url!).host)
  .join(',')

export default defineNuxtConfig({
  extends: [
    '@studio-fes/layer-craft',
  ],

  modules: [
    '@studio-fes/nuxt-remote-svg',
  ],
  components: [
    { path: '~/components', pathPrefix: false },
  ],
  css: [
    '~/assets/globals.css',
    '@blossom-carousel/vue/style.css',
  ],

  runtimeConfig: {
    mediaProxyHosts,
  },

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

  fonts: {
    families: [
      {
        name: 'Adobe Caslon Pro',
        provider: 'adobe',
        styles: ['normal', 'italic'],
        weights: [600, 700],
      },
    ],
    adobe: {
      id: ['soh8sle'],
    },
  },

  graphqlMiddleware: {
    downloadSchema: 'dev-only',
  },

  gsap: {
    plugins: ['CustomEase', 'Flip'],
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
      cacheTagInvalidationDelay: 3000,
    },
    data: {
      enabled: true,
    },
    disableCacheOverviewLogMessage: true,
  },
})
