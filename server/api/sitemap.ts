import { locales } from '../../i18n'

interface SitemapURL {
  loc: string
  _i18nTransform: boolean
}

async function fetchEntries(locale: string) {
  const res = await useGraphqlQuery('Entries', {
    site: [locale],
  })

  return res?.data.entries || []
}

export default defineEventHandler(async () => {
  const urls: SitemapURL[] = []

  const res = await Promise.all([
    ...locales.map(locale => fetchEntries(locale.code)),
  ])

  res.forEach((entries) => {
    urls.push(
      ...entries
        .filter((entry: any) => entry.url)
        .map((entry: any) => ({
          loc: entry.url,
          _i18nTransform: false,
        })),
    )
  })

  return urls
})
