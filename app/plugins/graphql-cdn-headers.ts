/**
 * Bubbles the CDN headers (max-age, Cache-Tag) of SSR /gql requests up to the page response.
 */
export default defineNuxtPlugin({
  name: 'graphql-cdn-headers',
  dependsOn: ['preview'],
  setup() {
    const state = useGraphqlState()
    const { onRequest, onResponse } = useCacheAwareFetchInterceptor()

    if (!state || !onRequest || !onResponse)
      return

    const { onRequest: previewOnRequest } = state.fetchOptions ?? {}
    state.fetchOptions = {
      ...state.fetchOptions,
      onRequest: previewOnRequest ? [previewOnRequest, onRequest].flat() : onRequest,
      onResponse,
    }
  },
})
