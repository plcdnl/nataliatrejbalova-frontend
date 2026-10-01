<script setup lang="ts">
import type { CraftImageProps } from '@studio-fes/layer-craft/app/components/CraftImage.vue'
import type { CraftVideoProps } from '@studio-fes/layer-craft/app/components/CraftVideo.vue'
import type { MediaInterfaceFragment } from '@studio-fes/layer-craft/app/types/graphql-operations'
import type { MediaFragment } from '#graphql-operations'
import type { VerticalLoopTimeline } from '~/utils/verticalLoop'

export interface MediaRollerProps {
  media: MediaFragment[]
  /** Velocità di scorrimento in px/s */
  speed?: number
  /** Durata della pausa su ogni manifesto, in secondi */
  hold?: number
  /** Spazio (px) di nastro tra un manifesto e l'altro */
  gap?: number
  /** px di ripartenza dolce */
  restartDistance?: number
  /** px percorsi durante lo scattino */
  snapDistance?: number
  /** secondi dello scattino */
  snapDuration?: number
  snapEase?: string
  /** Colore del nastro tra un manifesto e l'altro */
  bandColor?: string
  paused?: boolean
  /** Altezza del nastro (qualsiasi valore CSS) */
  height?: string
  label?: string
  imgProps?: CraftImageProps
  videoProps?: CraftVideoProps
}

const props = withDefaults(defineProps<MediaRollerProps>(), {
  speed: 90,
  height: '100svh',
  hold: 3,
  gap: 24,
  restartDistance: 60,
  snapDistance: 44,
  snapDuration: 0.5,
  snapEase: 'back.out(2)',
  bandColor: '#000000',
  paused: false,
  label: 'Nastro pubblicitario che scorre dal basso verso l\'alto',
})

const emit = defineEmits<{
  /** Un manifesto si è fermato in posizione */
  change: [index: number]
  moving: [moving: boolean]
}>()

// Il loop di Coral Eye gira a speed 1 = 100px/s: la sua timeline resta in pausa
// e la scansione qui sotto ne sposta il tempo, così i px restano px
const LOOP_PX_PER_SECOND = 100

const stageEl = useTemplateRef<HTMLElement>('stage')
const trackEl = useTemplateRef<HTMLElement>('track')
const size = shallowRef<{ W: number, VH: number } | null>(null)

const state = { pos: 0 }
let loop: VerticalLoopTimeline | null = null
let tl: gsap.core.Timeline | null = null

const mergedImgProps = computed<CraftImageProps>(() => ({
  sizes: '1024px lg:100vw',
  ...props.imgProps,
}))

const mergedVideoProps = computed<CraftVideoProps>(() => ({
  autoplay: true,
  muted: true,
  loop: true,
  ...props.videoProps,
}))

function measure() {
  const el = stageEl.value
  if (!el)
    return
  const W = el.clientWidth
  const VH = el.clientHeight
  const prev = size.value
  // ignora i piccoli resize in altezza (barra degli indirizzi su mobile)
  if (!W || !VH || (prev && Math.abs(W - prev.W) <= 2 && Math.abs(VH - prev.VH) <= 40))
    return
  size.value = { W, VH }
}

function destroy() {
  tl?.kill()
  tl = null
  loop?.destroy()
  loop = null
}

function setLoopPos() {
  if (!loop)
    return
  const duration = loop.duration()
  loop.time(gsap.utils.wrap(0, duration, state.pos / LOOP_PX_PER_SECOND))
}

// --- Timeline: ripartenza dolce, cammino costante, scattino, pausa ---

async function build() {
  destroy()
  await nextTick()

  const items = Array.from(trackEl.value?.children ?? []) as HTMLElement[]
  const N = items.length
  if (!size.value || N < 2)
    return

  state.pos = 0
  loop = verticalLoop(items, { paused: true, speed: 1, paddingBottom: props.gap }) ?? null
  if (!loop)
    return

  const step = items[0]!.offsetHeight + props.gap
  const restartTime = (2 * props.restartDistance) / props.speed // con power1.in la velocità finale = speed
  const drift = step - props.restartDistance - props.snapDistance
  const driftTime = drift / props.speed

  tl = gsap.timeline({
    repeat: -1,
    paused: true,
    onUpdate: setLoopPos,
  })

  let cur = 0
  for (let i = 0; i < N; i++) {
    const lab = `step${i}`
    const snap = `snap${i}`
    const next = (i + 1) % N
    tl.addLabel(lab)
      .call(() => emit('moving', true), [], lab)
      .fromTo(state, { pos: cur }, { pos: cur + props.restartDistance, duration: restartTime, ease: 'power1.in', immediateRender: false }, lab)
      .fromTo(state, { pos: cur + props.restartDistance }, { pos: cur + props.restartDistance + drift, duration: driftTime, ease: 'none', immediateRender: false })
      .addLabel(snap)
      .fromTo(state, { pos: cur + props.restartDistance + drift }, { pos: cur + step, duration: props.snapDuration, ease: props.snapEase, immediateRender: false }, snap)
      .call(() => {
        emit('moving', false)
        emit('change', next)
      }, [], `${snap}+=${props.snapDuration}`)
      .to({}, { duration: props.hold })
    cur += step
  }

  setLoopPos()
  syncPlayback()
}

const visibility = useDocumentVisibility()

function syncPlayback() {
  if (!tl)
    return
  if (props.paused || visibility.value === 'hidden')
    tl.pause()
  else
    tl.resume()
}

useResizeObserver(stageEl, useDebounceFn(measure, 300))

watch(
  [size, () => props.media.length, () => props.speed, () => props.hold, () => props.gap, () => props.restartDistance, () => props.snapDistance, () => props.snapDuration, () => props.snapEase],
  build,
)

watch([() => props.paused, visibility], syncPlayback)

onMounted(measure)

onBeforeUnmount(destroy)
</script>

<template>
  <div
    ref="stage"
    class="w-full relative overflow-hidden"
    :style="{ background: bandColor, height }"
    role="img"
    :aria-label="label"
  >
    <div
      ref="track"
      class="flex flex-col h-full"
      :style="{ gap: `${gap}px` }"
      aria-hidden="true"
    >
      <div
        v-for="(item, p) in media"
        :key="item.id ?? p"
        class="will-change-transform shrink-0 h-full w-full overflow-hidden"
      >
        <CraftMedia
          class="size-full object-cover"
          :media="(item as MediaInterfaceFragment)"
          :img-props="mergedImgProps"
          :video-props="mergedVideoProps"
        />
      </div>
    </div>
  </div>
</template>
