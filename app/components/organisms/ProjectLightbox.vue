<script setup lang="ts">
const { t } = useI18n()
const { $lenis } = useNuxtApp()
const lightbox = useLightbox()
const { isActive, close } = useMagicModal(LIGHTBOX_ID)

const items = computed(() => lightbox?.items.value ?? [])
const index = computed({
  get: () => lightbox?.index.value ?? 0,
  set: (value) => {
    if (lightbox)
      lightbox.index.value = value
  },
})
const hasMany = computed(() => items.value.length > 1)
const currentMedia = computed(() => items.value[index.value]?.media)

const $carousel = useTemplateRef<{ el: HTMLElement | null }>('carousel')
const scroller = computed(() => $carousel.value?.el ?? null)

// frecce e click cambiano slide di colpo, senza traslazione; drag e swipe restano nativi
function goTo(i: number) {
  const el = scroller.value
  if (!el)
    return
  const target = Math.min(Math.max(i, 0), items.value.length - 1)
  el.scrollTo({ left: target * el.clientWidth, behavior: 'instant' })
}

const prev = () => goTo(index.value - 1)
const next = () => goTo(index.value + 1)

onKeyStroke('ArrowLeft', () => isActive.value && prev())
onKeyStroke('ArrowRight', () => isActive.value && next())

// l'indice segue lo scroll del carosello (drag, swipe, frecce)
useEventListener(scroller, 'scroll', () => {
  const el = scroller.value
  if (!el?.clientWidth)
    return
  const i = Math.round(el.scrollLeft / el.clientWidth)
  if (i === index.value)
    return
  index.value = i
  // solo i cambi fatti a lightbox aperto spostano la pagina sotto, non il click di apertura
  const item = items.value[i]
  if (item)
    syncBackground(item.el)
}, { passive: true })

// all'apertura il carosello monta nascosto: si salta alla slide cliccata appena ha una larghezza
let pendingJump = false

watch(isActive, (active) => {
  pendingJump = active
})

useResizeObserver(scroller, () => {
  if (!pendingJump || !scroller.value?.clientWidth)
    return
  pendingJump = false
  goTo(index.value)
})

// click a sinistra/destra per scorrere, ignorando quello che chiude un trascinamento
const DRAG_THRESHOLD = 6
let start: { x: number, y: number } | undefined
const side = ref<'prev' | 'next'>()

function onPointerdown(e: PointerEvent) {
  start = { x: e.clientX, y: e.clientY }
}

function onPointermove(e: PointerEvent) {
  const isLeft = e.clientX < window.innerWidth / 2
  if (isLeft && index.value > 0)
    side.value = 'prev'
  else if (!isLeft && index.value < items.value.length - 1)
    side.value = 'next'
  else
    side.value = undefined
}

function onClick(e: MouseEvent) {
  if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > DRAG_THRESHOLD)
    return
  if (side.value === 'prev')
    prev()
  else if (side.value === 'next')
    next()
}

// la pagina sotto segue il lightbox: alla chiusura si ritrova il media appena visto
const SYNC_DURATION = 1.2

function syncBackground(el: HTMLElement) {
  const parent = el.parentElement
  if (parent && parent.scrollWidth > parent.clientWidth) {
    const box = parent.getBoundingClientRect()
    const rect = el.getBoundingClientRect()
    // i caroselli cambiano slide di colpo, mentre la pagina scorre in modo visibile
    parent.scrollTo({
      left: parent.scrollLeft + rect.left - box.left - (box.width - rect.width) / 2,
      behavior: 'instant',
    })
  }

  const rect = el.getBoundingClientRect()
  const top = window.scrollY + rect.top - Math.max(0, (window.innerHeight - rect.height) / 2)
  $lenis.scrollTo(top, { duration: SYNC_DURATION, force: true })
}

useHead({
  htmlAttrs: {
    class: computed(() => isActive.value ? 'is-scroll-locked' : undefined),
  },
})
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <aside class="projectLightbox contents" data-lenis-prevent>
        <MagicModalProvider :id="LIGHTBOX_ID" :options="{ scrollLock: false }">
          <MagicModalBackdrop />
          <MagicModalContent>
            <div class="grid grid-cols-[100%] grid-rows-[100%] w-full select-none h-svh">
              <BlossomCarousel
                v-if="isActive"
                ref="carousel"
                as="div"
                class="flex [grid-area:1/1] [scrollbar-width:none] of-x-auto of-y-hidden snap-x snap-mandatory"
                :class="{
                  'cursor-w-resize': side === 'prev',
                  'cursor-e-resize': side === 'next',
                }"
                @pointerdown="onPointerdown"
                @pointermove="onPointermove"
                @click="onClick"
              >
                <figure
                  v-for="(item, i) in items"
                  :key="i"
                  data-blossom-slide
                  class="px-4 py-14 flex shrink-0 size-full snap-center lg:px-24 lg:py-20"
                >
                  <CraftMedia
                    :media="item.media"
                    class="size-full min-h-0 block"
                    fit="contain"
                    :img-props="{
                      sizes: '100vw lg:80vw',
                      alt: item.media.alt || item.media.title || undefined,
                    }"
                    :video-props="{ autoplay: true, muted: true, loop: true }"
                  />
                </figure>
              </BlossomCarousel>

              <div class="container py-3 flex gap-4 pointer-events-none [grid-area:1/1] items-start self-start justify-between">
                <span v-if="hasMany" class="tabular-nums">{{ index + 1 }} / {{ items.length }}</span>
                <button
                  type="button"
                  class="ml-auto motion-base pointer-events-auto hover:op-50"
                  @click="close"
                >
                  {{ t('lightbox.close') }}
                </button>
              </div>

              <!-- finché le caption non sono compilate in Craft si usa il titolo del file -->
              <div
                v-if="currentMedia?.caption || currentMedia?.title"
                class="container pb-3 text-center pointer-events-none [grid-area:1/1] self-end"
              >
                <Text v-if="currentMedia.caption" :html="currentMedia.caption" />
                <template v-else>
                  {{ currentMedia.title }}
                </template>
              </div>
            </div>
          </MagicModalContent>
        </MagicModalProvider>
      </aside>
    </Teleport>
  </ClientOnly>
</template>

<style>
.projectLightbox {
  --magic-modal-z-index: 100;
  --magic-modal-backdrop-color: color-mix(in srgb, var(--colors-white) 90%, transparent);
}
</style>
