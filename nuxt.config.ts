import { defaultLocale, locales } from './i18n'

// Host da cui il proxy /api/media può scaricare (backend Craft e CDN delle immagini)
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
  css: ['~/assets/globals.css'],

  runtimeConfig: {
    // sovrascrivibile con NUXT_MEDIA_PROXY_HOSTS (lista separata da virgole)
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
        name: 'AVSyntecaGarutti',
        provider: 'local',
        styles: ['normal', 'italic'],
        weights: [700],
        display: 'block',
      },
    ],
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

  image: {
    providers: {
      mediaProxy: {
        provider: '~/providers/media-proxy',
      },
    },
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
