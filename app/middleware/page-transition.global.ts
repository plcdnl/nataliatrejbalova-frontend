import type { TransitionProps } from 'vue'
import type { RouteLocationNormalizedGeneric } from 'vue-router'

export type TransitionFn = (from: RouteLocationNormalizedGeneric, to: RouteLocationNormalizedGeneric) => TransitionProps

/* eslint-disable no-console */
export function transitionLog(...args: unknown[]) {
  if (import.meta.dev) {
    console.info('\x1B[46m TRANSITION \x1B[0m', ...args)
  }
}

export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.dev) {
    transitionLog(`Transition: ${String(from.name)}, ${String(to.name)}`)
  }

  if (to.path === from.path) {
    // primo caricamento: la transizione deve esserci già, altrimenti alla prima navigazione
    // NuxtPage avvolge la pagina in un <Transition> e la rimonta (glitch sul media della home)
    to.meta.pageTransition ??= getDefaultPageTransition(from, to)
    return
  }

  // al click sul titolo in home parte l'orologio comune a titolo, menu e pagina
  if (import.meta.client && isHomeRoute(from) && !isHomeRoute(to)) {
    startIntro()
  }

  const transition = getDefaultPageTransition(from, to)

  to.meta.pageTransition = transition
  from.meta.pageTransition = transition
})
