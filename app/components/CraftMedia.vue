<script setup lang="ts">
import type { CraftImageProps } from '@studio-fes/layer-craft/app/components/CraftImage.vue'
import type { CraftVideoProps } from '@studio-fes/layer-craft/app/components/CraftVideo.vue'
import type { MediaFragment } from '#graphql-operations'

interface CraftMediaProps {
  media?: MediaFragment | null
  imgProps?: CraftImageProps
  videoProps?: CraftVideoProps
  fit?: 'cover' | 'contain'
  hideAverageColor?: boolean
}

const props = withDefaults(defineProps<CraftMediaProps>(), {
  fit: 'cover',
})

const isVideo = computed(() => props.media?.kind === 'video')
const isImage = computed(() => props.media?.kind === 'image')

const averageColor = computed(() => props.hideAverageColor ? undefined : (props.media?.averageColor || 'rgb(0 0 0 / 10%)'))
// viewBox con le proporzioni del media: con `contain` l'svg si centra come l'immagine
const averageViewBox = computed(() => `0 0 ${props.media?.width || 1} ${props.media?.height || 1}`)
const mergedVideoProps = computed(() => ({ fit: props.fit, ...props.videoProps }))

const imgRef = useTemplateRef('imgRef')
const isImageLoaded = ref(false)

function syncImageLoaded() {
  const el = imgRef.value?.$el as HTMLImageElement | undefined
  if (el?.complete && el.naturalWidth > 0)
    isImageLoaded.value = true
}

onMounted(syncImageLoaded)
watch(imgRef, syncImageLoaded, { flush: 'post' })

const videoRef = useTemplateRef('videoRef')
const isVideoLoaded = ref(false)

const videoEl = computed(() => {
  const root = videoRef.value?.$el as HTMLElement | undefined
  return root?.querySelector('video, hls-video') as HTMLVideoElement | null
})

function syncVideoLoaded() {
  if (videoEl.value && videoEl.value.readyState >= 2)
    isVideoLoaded.value = true
}

onMounted(syncVideoLoaded)
watch(videoEl, syncVideoLoaded, { flush: 'post' })
useEventListener(videoEl, 'loadeddata', () => {
  isVideoLoaded.value = true
})
useEventListener(videoEl, 'error', () => {
  isVideoLoaded.value = true
})

// una volta caricato il media il colore medio sparisce, così con `contain` non resta un riquadro attorno
const isLoaded = computed(() => isImageLoaded.value || isVideoLoaded.value)

// il media cambia (es. lightbox, hero): si riparte dal colore medio
watch(() => props.media?.id, () => {
  isImageLoaded.value = false
  isVideoLoaded.value = false
})
</script>

<template>
  <div class="craftMedia">
    <svg
      v-if="averageColor"
      class="craftMedia-average motion-base"
      :class="isLoaded ? 'op-0' : 'op-100'"
      :viewBox="averageViewBox"
      :preserveAspectRatio="fit === 'contain' ? 'xMidYMid meet' : 'none'"
      aria-hidden="true"
    >
      <rect width="100%" height="100%" :fill="averageColor" />
    </svg>
    <LazyCraftImage
      v-if="isImage"
      ref="imgRef"
      v-bind="imgProps"
      :image="media"
      class="motion-base"
      :class="isImageLoaded ? 'op-100' : 'op-0'"
      @load="isImageLoaded = true"
      @error="isImageLoaded = true"
    />
    <LazyCraftVideo
      v-else-if="isVideo"
      ref="videoRef"
      v-bind="mergedVideoProps"
      :video="media"
      class="motion-base block"
      :class="isVideoLoaded ? 'op-100' : 'op-0'"
    >
      <template #default="{ progress, isPlaying }">
        <slot name="media-chrome" :progress :is-playing />
      </template>
    </LazyCraftVideo>
    <slot v-else name="empty">
      <DevOnly>
        There is no format for you.
      </DevOnly>
    </slot>
  </div>
</template>

<style scoped>
.craftMedia {
  position: relative;
  --fit: v-bind(fit);
}

.craftMedia > * {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: var(--fit);
  z-index: 1;
}

.craftMedia > .craftMedia-average {
  position: absolute;
  inset: 0;
  z-index: 0;
}
</style>
