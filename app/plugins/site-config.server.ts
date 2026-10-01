export default defineNuxtPlugin({
  name: 'site-config',
  enforce: 'pre',
  dependsOn: ['nuxt-graphql-middleware-provide-state'],
  async setup() {
    const { data } = await useGraphqlQuery('SiteConfig')
    updateSiteConfig({
      name: data.siteConfig?.siteName,
      url: data.siteConfig?.siteUrl,
    })

    if (data.siteConfig?.siteUrl) {
      const runtimeConfig = useRuntimeConfig()
      runtimeConfig.public.i18n.baseUrl = data.siteConfig?.siteUrl
    }
  },
})
