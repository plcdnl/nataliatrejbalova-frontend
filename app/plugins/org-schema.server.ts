export default defineNuxtPlugin({
  name: 'org-schema',
  enforce: 'pre',
  dependsOn: ['nuxt-graphql-middleware-provide-state'],
  async setup() {
    const nuxtApp = useNuxtApp()
    const site = '$i18n' in nuxtApp ? nuxtApp.$i18n?.locale?.value : undefined

    const { data } = await useGraphqlQuery('OrgSchema', {
      site: site || 'default',
    })

    useCraftOrgSchemaIdentity(data.orgSchema)
  },
})
