/**
 * nuxt-multi-cache separa i Cache-Tag con spazi, Cloudflare li vuole separati da virgole
 * e non ammette spazi: l'header viene riscritto prima di ogni risposta, senza duplicati.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('beforeResponse', (event) => {
    const value = getResponseHeader(event, 'cache-tag')
    if (!value)
      return

    const tags = new Set(String(value).split(/[\s,]+/).filter(Boolean))
    setResponseHeader(event, 'cache-tag', [...tags].join(','))
  })
})
