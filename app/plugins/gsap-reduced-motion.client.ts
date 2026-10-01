export default defineNuxtPlugin(() => {
  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: reduce)', () => {
    // instant-complete all GSAP tweens/timelines
    gsap.globalTimeline.timeScale(1000)
    return () => {
      gsap.globalTimeline.timeScale(1)
    }
  })
})
