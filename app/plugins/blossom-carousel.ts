import { BlossomCarousel, BlossomDot, BlossomDots, BlossomNext, BlossomPrev } from '@blossom-carousel/vue'

declare module 'vue' {
  interface GlobalComponents {
    BlossomCarousel: typeof BlossomCarousel
    BlossomPrev: typeof BlossomPrev
    BlossomNext: typeof BlossomNext
    BlossomDot: typeof BlossomDot
    BlossomDots: typeof BlossomDots
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('BlossomCarousel', BlossomCarousel)
  nuxtApp.vueApp.component('BlossomPrev', BlossomPrev)
  nuxtApp.vueApp.component('BlossomNext', BlossomNext)
  nuxtApp.vueApp.component('BlossomDot', BlossomDot)
  nuxtApp.vueApp.component('BlossomDots', BlossomDots)
})
