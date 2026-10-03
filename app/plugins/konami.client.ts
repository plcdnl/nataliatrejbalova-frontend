const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

/** ritardo casuale: a volte raffiche velocissime, a volte pause lunghe */
function randomDelay() {
  const roll = Math.random()
  if (roll < 0.5)
    return 30 + Math.random() * 120
  if (roll < 0.8)
    return 200 + Math.random() * 800
  return 1000 + Math.random() * 3000
}

/** ↑ ↑ ↓ ↓ ← → ← → B A: i colori del sito si invertono a caso (di nuovo, o da KonamiDisable, per fermare il glitch) */
export default defineNuxtPlugin(() => {
  const html = document.documentElement
  const isActive = useKonami()
  let position = 0
  let timer: ReturnType<typeof setTimeout> | undefined

  function glitch() {
    html.classList.toggle('is-inverted')
    timer = setTimeout(glitch, randomDelay())
  }

  watch(isActive, (active) => {
    clearTimeout(timer)
    html.classList.remove('is-inverted')
    if (active)
      glitch()
  })

  useEventListener(window, 'keydown', (event: KeyboardEvent) => {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key

    if (key !== KONAMI[position]) {
      position = key === KONAMI[0] ? 1 : 0
      return
    }

    position++
    if (position === KONAMI.length) {
      position = 0
      isActive.value = !isActive.value
    }
  })
})
