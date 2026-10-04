import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

export default defineNuxtPlugin({
  name: 'lenis',
  dependsOn: ['gsap-nuxt-module'],
  setup(nuxtApp) {
    const ScrollTrigger = useScrollTrigger()
    const lenis = new Lenis()

    lenis.on('scroll', () => ScrollTrigger?.update())

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)

    const refreshScrollTrigger = () => {
      requestAnimationFrame(() => ScrollTrigger?.refresh())
    }

    onNuxtReady(refreshScrollTrigger)
    nuxtApp.hook('page:transition:finish', refreshScrollTrigger)

    return {
      provide: {
        lenis,
      },
    }
  },
})
