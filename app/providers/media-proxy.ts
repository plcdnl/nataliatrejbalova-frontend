import { defineProvider } from '@nuxt/image/runtime'
import { mediaProxyUrl } from '~/utils/media-proxy'

export default defineProvider({
  getImage: (src, { modifiers }, ctx) => {
    const { url } = ctx.$img!.getImage(src, { modifiers, provider: ctx.options.provider })
    return { url: mediaProxyUrl(url) }
  },
})
