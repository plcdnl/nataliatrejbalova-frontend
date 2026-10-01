import { hasProtocol, withQuery } from 'ufo'

export const MEDIA_PROXY_PATH = '/api/media'

export function mediaProxyUrl<T extends string | null | undefined>(url: T): T {
  if (!url || !hasProtocol(url))
    return url
  return withQuery(MEDIA_PROXY_PATH, { url }) as T
}
