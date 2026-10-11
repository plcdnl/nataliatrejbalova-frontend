import type { HeaderFragment } from '#graphql-operations'

/** voci del menu e destinazione del titolo (la prima voce), condivise da header e home */
export async function useHeader() {
  const { locale } = useI18n()

  const { data } = await useAsyncGraphqlQuery('Header', computed(() => ({ site: [locale.value] })), {
    graphqlCaching: { client: true },
  })

  const links = computed(() => (data.value?.data?.headerEntries?.[0] as HeaderFragment | undefined)?.links ?? [])

  const titleTo = computed(() => {
    const firstLink = parseCraftLink(links.value[0]?.customLink ?? undefined)
    return firstLink?.to ? getRelativeUrl(firstLink.to) : undefined
  })

  return { links, titleTo }
}
