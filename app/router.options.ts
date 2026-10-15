import type { RouterConfig } from '@nuxt/schema'

export default {
  scrollBehavior: (to, from, savedPosition) => {
    const nuxtApp = useNuxtApp()

    return new Promise((resolve) => {
      // stessa pagina (es. la query del lightbox): non si scrolla
      if (from.path === to.path) {
        return resolve(false)
      }

      // primo caricamento: si tiene il ripristino nativo del browser
      if (nuxtApp.isHydrating) {
        return resolve(false)
      }

      // si scrolla con Lenis (non con window.scrollTo del router) a pagina vecchia uscita,
      // prima che parta l'enter della nuova; `resize` perché la nuova pagina non è ancora misurata
      nuxtApp.hooks.hookOnce('page:transition:finish', async () => {
        await nextTick()

        const { $lenis } = nuxtApp
        $lenis.resize()
        $lenis.scrollTo(savedPosition?.top ?? 0, { immediate: true, force: true })

        resolve(false)
      })
    })
  },
} satisfies RouterConfig
