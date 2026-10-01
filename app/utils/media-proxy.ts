import { hasProtocol, withQuery } from 'ufo'

export const MEDIA_PROXY_PATH = '/api/media'

/**
 * Fa passare un media assoluto dal proxy del server, così arriva dallo stesso dominio del sito
 * (serve ad es. per usarlo come texture WebGL). Gli URL relativi sono già same-origin.
 */
export function mediaProxyUrl<T extends string | null | undefined>(url: T): T {
  if (!url || !hasProtocol(url))
    return url
  return withQuery(MEDIA_PROXY_PATH, { url }) as T
}
