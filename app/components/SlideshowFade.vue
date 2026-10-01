<script setup lang="ts">
import type { CraftImageProps } from '@studio-fes/layer-craft/app/components/CraftImage.vue'
import type { CraftVideoProps } from '@studio-fes/layer-craft/app/components/CraftVideo.vue'
import type { MediaInterfaceFragment } from '@studio-fes/layer-craft/app/types/graphql-operations'
import type { MediaFragment } from '#graphql-operations'

export interface SlideshowFadeProps {
  media: MediaFragment[]
  /** Permanenza di ogni media, in secondi */
  hold?: number
  /** Durata della dissolvenza, in secondi */
  duration?: number
  imgProps?: CraftImageProps
  videoProps?: CraftVideoProps
}

const props = withDefaults(defineProps<SlideshowFadeProps>(), {
  hold: 5,
  duration: 0.4,
})

const emit = defineEmits<{
  /** Un media è ora completamente visibile */
  change: [index: number]
}>()

const el = useCurrentElement<HTMLElement>()
const isVisible = useElementVisibility(el)

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

// Stessa dissolvenza dello slideshow di Coral Eye: il media successivo entra sopra quello visibile,
// poi quelli sotto vengono nascosti e lo z-index azzerato
let current = 0
let autoplay: gsap.core.Tween | null = null
let transition: gsap.core.Tween | null = null

function getSlides() {
  return gsap.utils.toArray<HTMLElement>('.slideMedia', el.value)
}

function show(index: number) {
  const slides = getSlides()
  const target = slides[index]
  if (!target)
    return

  transition?.kill()
  gsap.set(target, { zIndex: 2, visibility: 'inherit' })
  transition = gsap.to(target, {
    autoAlpha: 1,
    duration: props.duration,
    ease: 'sine.inOut',
    onComplete: () => {
      gsap.set(slides.filter((_, i) => i !== index), { autoAlpha: 0, zIndex: 0 })
      gsap.set(target, { zIndex: 1 })
      transition = null
      current = index
      emit('change', index)
      schedule()
    },
  })
}

function schedule() {
  autoplay?.kill()

  const total = props.media.length
  if (total < 2)
    return

  autoplay = gsap.delayedCall(props.hold, () => show((current + 1) % total))
  if (!isVisible.value)
    autoplay.pause()
}

watch(isVisible, (visible) => {
  if (visible)
    autoplay?.play()
  else
    autoplay?.pause()
})

useGsap(() => {
  gsap.set('.slideMedia', {
    autoAlpha: (i: number) => i === 0 ? 1 : 0,
    zIndex: (i: number) => i === 0 ? 1 : 0,
  })

  current = 0
  schedule()

  return () => {
    autoplay?.kill()
    transition?.kill()
  }
}, { scope: el })
</script>

<template>
  <div class="bg-black h-100svh w-full relative overflow-hidden isolate">
    <div
      v-for="(item, index) in media"
      :key="item.id ?? index"
      class="slideMedia size-full inset-0 absolute"
      :class="{ 'invisible opacity-0': index !== 0 }"
    >
      <CraftMedia
        class="size-full block object-cover"
        :media="(item as MediaInterfaceFragment)"
        :img-props="{
          ...mergedImgProps,
          preload: { fetchPriority: index === 0 ? 'high' : 'auto' },
          loading: index === 0 ? 'eager' : 'lazy',
        }"
        :video-props="mergedVideoProps"
      />
    </div>
  </div>
</template>
