import type { FetchResponse } from 'ofetch'
import { defineGraphqlServerOptions } from 'nuxt-graphql-middleware/server-options'
import { hash } from 'ohash'

// Overrides the layer-craft server options to also emit Cloudflare CDN headers.
// The page merges them from the /gql response through the graphql-cdn-headers plugin.
const CDN_MAX_AGE = 300
const CDN_STALE_WHILE_REVALIDATE = 86400

export default defineGraphqlServerOptions({
  async doGraphqlRequest(context) {
    const { event, operation, operationName, variables, operationDocument } = context

    const config = useRuntimeConfig()
    const headers: Record<string, string> = {}

    const authHeader = getHeader(event, 'Authorization')
    if (authHeader) {
      headers.Authorization = authHeader
    }

    const craftToken = getHeader(event, 'X-Craft-Token')
    if (craftToken) {
      headers['X-Craft-Token'] = craftToken
    }

    let key: string | undefined
    let addToCache: ((data: any, tags: string[]) => Promise<void>) | undefined
    const cacheOperations: string[] = ['query']
    const isCacheable = !!operation && cacheOperations.includes(operation) && !craftToken

    useCDNHeaders((cdn) => {
      if (isCacheable)
        cdn.public().setNumeric('maxAge', CDN_MAX_AGE).setNumeric('staleWhileRevalidate', CDN_STALE_WHILE_REVALIDATE)
      else
        cdn.private()
    }, event)

    if (isCacheable) {
      // Use a cache key based on the operation, operationName, and variables
      key = hash({
        operation,
        operationName,
        variables,
      })

      const dataCache = await useDataCache(key, event)
      const { value, cacheTags, addToCache: _addToCache } = dataCache
      addToCache = _addToCache

      if (value) {
        useCDNHeaders(cdn => cdn.addTags(cacheTags), event)
        return {
          data: (value as any).data,
          errors: (value as any).errors || [],
        } as any
      }
    }

    function doRequest(): Promise<FetchResponse<{ data: any, errors: any[] }>> {
      return $fetch.raw(config.graphqlMiddleware.graphqlEndpoint, {
        method: 'POST',
        ignoreResponseError: true,
        body: {
          query: operationDocument,
          variables,
          operationName,
        },
        headers,
      })
    }

    const res = await doRequest()

    if (res._data?.errors || (operationName === 'Entry' && !res._data?.data?.entry)) {
      console.error('GraphQL result not saved in cache:', operationName, res._data?.errors, variables)
      // Keeps 404s and errored pages out of the CDN too.
      useCDNHeaders(cdn => cdn.private(), event)
    }
    else if (res.ok && res.status === 200 && res._data && isCacheable) {
      const cacheTags = createCacheTags(operationName!, res._data)
      useCDNHeaders(cdn => cdn.addTags(cacheTags), event)
      await addToCache?.(res._data, cacheTags)
    }

    return {
      data: res._data?.data,
      errors: res._data?.errors?.map(e => ({
        ...e,
        path: Array.isArray(e.path) ? e.path : [],
      })) || [],
    } as any
  },
})
