const REQUEST_HEADERS = ['range', 'if-none-match', 'if-modified-since', 'accept']
const RESPONSE_HEADERS = ['content-type', 'content-length', 'content-range', 'accept-ranges', 'etag', 'last-modified', 'cache-control', 'expires']
const MAX_REDIRECTS = 3

export default defineEventHandler(async (event) => {
  const { url } = getQuery(event)
  const hosts = new Set(useRuntimeConfig(event).mediaProxyHosts.split(',').filter(Boolean))

  const headers: Record<string, string> = {}
  for (const name of REQUEST_HEADERS) {
    const value = getRequestHeader(event, name)
    if (value)
      headers[name] = value
  }

  let target = parseAllowedUrl(url, hosts)
  let upstream = await fetch(target, { headers, redirect: 'manual' })
  for (let i = 0; i < MAX_REDIRECTS && upstream.status >= 300 && upstream.status < 400 && upstream.headers.has('location'); i++) {
    target = parseAllowedUrl(new URL(upstream.headers.get('location')!, target).href, hosts)
    upstream = await fetch(target, { headers, redirect: 'manual' })
  }

  if (!upstream.ok && upstream.status !== 304)
    throw createError({ statusCode: upstream.status, statusMessage: upstream.statusText })

  const type = upstream.headers.get('content-type') ?? ''
  if (upstream.ok && !/^(?:image|video)\//.test(type))
    throw createError({ statusCode: 415, statusMessage: 'Unsupported media type' })

  setResponseStatus(event, upstream.status)
  for (const name of RESPONSE_HEADERS) {
    const value = upstream.headers.get(name)
    if (value)
      setResponseHeader(event, name, value)
  }
  if (!upstream.headers.has('cache-control'))
    setResponseHeader(event, 'cache-control', 'public, max-age=86400')
  setResponseHeader(event, 'x-content-type-options', 'nosniff')
  setResponseHeader(event, 'content-security-policy', 'default-src \'none\'; sandbox')

  return upstream.body ? sendStream(event, upstream.body) : null
})

function parseAllowedUrl(url: unknown, hosts: Set<string>) {
  let parsed: URL
  try {
    parsed = new URL(String(url))
  }
  catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid url' })
  }
  if (!['http:', 'https:'].includes(parsed.protocol) || !hosts.has(parsed.host))
    throw createError({ statusCode: 403, statusMessage: 'Host not allowed' })
  return parsed
}
