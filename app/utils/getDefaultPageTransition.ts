import type { TransitionProps } from 'vue'
import type { TransitionFn } from '~/middleware/page-transition.global'

// elementi della pagina che entrano in sequenza (blocchi, righe degli archivi, titoli)
const REVEAL_SELECTOR = '[data-reveal]'

export const getDefaultPageTransition: TransitionFn = (from, to) => {
  const fromHome = isHomeRoute(from)

  return {
    mode: 'out-in',
    onEnter(el, done) {
      const targets = isHomeRoute(to)
        ? []
        : [...(el as HTMLElement).querySelectorAll<HTMLElement>(REVEAL_SELECTOR)]
            .filter(target => target.getBoundingClientRect().top < window.innerHeight)

      if (!targets.length) {
        gsap.from(el, { autoAlpha: 0, duration: 0.34, ease: 'none', onComplete: done, onInterrupt: done })
        return
      }

      gsap.from(targets, {
        y: PAGE_REVEAL.y,
        autoAlpha: 0,
        duration: PAGE_REVEAL.duration,
        ease: PAGE_REVEAL.ease,
        stagger: { amount: Math.min(PAGE_REVEAL.maxStagger, (targets.length - 1) * PAGE_REVEAL.stagger) },
        // dalla home i contenuti proseguono l'onda delle voci del menu
        delay: fromHome ? introDelay(INTRO.page) : 0.05,
        clearProps: 'transform,opacity,visibility',
        onComplete: done,
        onInterrupt: done,
      })
    },
    onLeave(el, done) {
      // la home sfuma già da sola al click (vedi pages/index.vue): qui si aspetta solo che finisca
      if (fromHome) {
        gsap.delayedCall(introDelay(INTRO.media), done)
        return
      }
      gsap.to(el, { autoAlpha: 0, duration: 0.25, ease: 'none', onComplete: done, onInterrupt: done })
    },
    onLeaveCancelled(el) {
      gsap.killTweensOf(el)
    },
    onEnterCancelled(el) {
      gsap.killTweensOf(el)
      gsap.killTweensOf((el as HTMLElement).querySelectorAll(REVEAL_SELECTOR))
    },
  } satisfies TransitionProps
}
