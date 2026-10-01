import { defineProvider } from '@nuxt/image/runtime'
import { mediaProxyUrl } from '~/utils/media-proxy'

/**
 * Usa il provider di default (es. cloudflare) per generare l'URL ridimensionato
 * e lo fa passare dal proxy del server: `<NuxtImg provider="mediaProxy" />`
 */
export default defineProvider({
  getImage: (src, { modifiers }, ctx) => {
    const { url } = ctx.$img!.getImage(src, { modifiers, provider: ctx.options.provider })
    return { url: mediaProxyUrl(url) }
  },
})
