import type { RouteLocationNormalizedGeneric } from 'vue-router'

/** voci del menu */
export const REVEAL = {
  y: 15,
  duration: 0.6,
  ease: 'power2.inOut',
  stagger: 0.08,
} as const

/**
 * contenuti delle pagine: più morbidi, quasi solo dissolvenza, con la sequenza contenuta
 * anche quando ci sono molte righe (archivi)
 */
export const PAGE_REVEAL = {
  y: 6,
  duration: 0.9,
  ease: 'power2.out',
  stagger: 0.05,
  maxStagger: 0.35,
} as const

/** sequenza di uscita dalla home, in secondi dal click */
export const INTRO = {
  flip: 1.1, // durata del titolo che sale
  flipEase: 'power3.inOut',
  media: 0.8, // dissolvenza del media della home, parte insieme al titolo
  mediaEase: 'power2.inOut',
  menu: 0.45, // partenza delle voci del menu
  page: 0.85, // partenza dei contenuti: proseguono l'onda del menu
} as const

let introStart = Number.NEGATIVE_INFINITY

export function isHomeRoute(route: RouteLocationNormalizedGeneric) {
  return String(route.name ?? '').startsWith('index')
}

export function startIntro() {
  introStart = performance.now() / 1000
}

/** quanto manca al momento `at` della sequenza (0 se è già passato) */
export function introDelay(at: number) {
  return Math.max(0, introStart + at - performance.now() / 1000)
}
