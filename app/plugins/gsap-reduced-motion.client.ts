export default defineNuxtPlugin(() => {
  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.globalTimeline.timeScale(1000)
    return () => {
      gsap.globalTimeline.timeScale(1)
    }
  })
})
