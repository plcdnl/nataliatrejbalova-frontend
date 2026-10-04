<script setup lang="ts">
import type { BlockMediaFragment, MediaFragment } from '#graphql-operations'
import { useNavigation } from '@blossom-carousel/vue'
import { mediaNaturalRatioStyle } from '~/composables/useMediaRatio'

interface BlockMediaProps {
  data: BlockMediaFragment
}

const props = defineProps<BlockMediaProps>()
const items = computed(() => (props.data.media ?? []) as MediaFragment[])
const isCarousel = computed(() => items.value.length > 1)

const carouselId = `block-media-${useId()}`
const BlossomCarousel = resolveComponent('BlossomCarousel')

const { style: ratioVars } = useMediaRatio(() => props.data)

// nel carosello ogni slide mantiene le proporzioni del suo file (allineate in alto)
// e tutte le immagini sono caricate subito, così lo scorrimento non mostra vuoti
function mediaStyle(media: MediaFragment) {
  return isCarousel.value
    ? mediaNaturalRatioStyle(media)
    : [ratioVars.value, mediaNaturalRatioStyle(media)]
}

// la didascalia sta fuori dallo slider: nel carosello segue la slide attiva
const navigation = useNavigation(computed(() => (isCarousel.value ? carouselId : undefined)))
const activeCaption = computed(() => items.value[Math.max(navigation.value.activeIndex, 0)]?.caption)

const videoProps = computed(() => ({
  autoplay: props.data.autoplay ?? false,
  controls: props.data.controls ?? false,
  muted: props.data.autoplay ?? false,
}))
</script>

<template>
  <Section padded class="block-media layout-grid">
    <div class="col-span-6 relative lg:col-start-5">
      <component
        :is="isCarousel ? BlossomCarousel : 'div'"
        :id="isCarousel ? carouselId : undefined"
        :as="isCarousel ? 'div' : undefined"
        class="flex gap-1.5 w-full items-start snap-x snap-mandatory"
        :class="{ 'of-x-auto of-y-hidden [scrollbar-width:none]': isCarousel }"
      >
        <LightboxTrigger
          v-for="media in items"
          :key="media.id ?? undefined"
          as="figure"
          :media
          data-blossom-slide
          class="flex shrink-0 flex-col w-full items-start snap-center"
        >
          <CraftMedia
            :media
            :video-props="videoProps"
            class="media-ratio w-full block"
            :style="mediaStyle(media)"
            :img-props="{
              sizes: '100vw lg:50vw',
              alt: media.alt || media.title || undefined,
              loading: isCarousel ? 'eager' : undefined,
            }"
          />
        </LightboxTrigger>
      </component>

      <CarouselThumbs v-if="isCarousel" :for="carouselId" :items />
    </div>

    <!-- su mobile sotto il media (gap ridotto), su desktop a destra in sticky -->
    <!-- cambiando slide la didascalia esce e rientra in dissolvenza -->
    <Transition
      mode="out-in"
      enter-active-class="motion-base"
      leave-active-class="motion-base"
      enter-from-class="op-0"
      leave-to-class="op-0"
    >
      <div v-if="data.showCaption && activeCaption" :key="activeCaption" class="col-span-6 -mt-3 lg:mt-0 lg:col-span-2 lg:col-start-11 lg:-ml-2.5">
        <div class="font-size-0.8em lg:top-3 lg:sticky">
          <Text :html="activeCaption" />
        </div>
      </div>
    </Transition>
  </Section>
</template>

<style scoped>
/* tra due blockMedia consecutivi la spaziatura è dimezzata (i margini collassano) */
.section.padded.block-media:has(+ .block-media) {
  margin-bottom: calc(var(--spacing) * 1.5);
}
.section.padded.block-media + .block-media {
  margin-top: calc(var(--spacing) * 1.5);
}

.media-ratio {
  aspect-ratio: var(--ratio-mobile, var(--ratio, var(--ratio-natural)));

  @screen lg {
    aspect-ratio: var(--ratio, var(--ratio-natural));
  }
}
</style>
