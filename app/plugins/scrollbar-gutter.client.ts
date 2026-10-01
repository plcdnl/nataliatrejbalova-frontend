import { useCssVar } from '@vueuse/core'
import { useIsInfoOpen } from '~/composables/useIsInfoOpen'

export default defineNuxtPlugin(() => {
  const isLocked = useIsInfoOpen()
  const html = document.documentElement

  const gutter = useCssVar('--scrollbar-gutter', html)
  const compensation = useCssVar('--scrollbar-compensation', html)

  function measureFixedWidth(): number {
    const probe = document.createElement('div')
    probe.style.cssText = 'position:fixed;left:0;right:0'
    document.body.appendChild(probe)
    const width = probe.offsetWidth
    probe.remove()
    return width
  }

  watch(isLocked, (locked) => {
    gutter.value = locked ? `${window.innerWidth - html.clientWidth}px` : '0px'
    compensation.value = locked ? `${window.innerWidth - measureFixedWidth()}px` : '0px'
    html.classList.toggle('is-scroll-locked', locked)
  }, { immediate: true })
})
