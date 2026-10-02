<script setup lang="ts">
import type { BlockMediaFragment, MediaFragment } from '#graphql-operations'

interface BlockMediaProps {
  data: BlockMediaFragment
}

const props = defineProps<BlockMediaProps>()
const items = computed(() => (props.data.media ?? []) as MediaFragment[])
const isCarousel = computed(() => items.value.length > 1)

const carouselId = `block-media-${useId()}`
const BlossomCarousel = resolveComponent('BlossomCarousel')

const { style: ratioVars } = useMediaRatio(() => props.data)

const videoProps = computed(() => ({
  autoplay: props.data.autoplay ?? false,
  controls: props.data.controls ?? false,
  muted: props.data.autoplay ?? false,
}))
</script>

<template>
  <Section padded class="layout-grid">
    <div class="col-span-6 relative lg:col-start-6">
      <component
        :is="isCarousel ? BlossomCarousel : 'div'"
        :id="isCarousel ? carouselId : undefined"
        :as="isCarousel ? 'div' : undefined"
        class="flex gap-1.5 w-full snap-x snap-mandatory"
      >
        <figure
          v-for="media in items"
          :key="media.id ?? undefined"
          data-blossom-slide
          class="flex shrink-0 flex-col gap-1 w-full snap-center"
        >
          <CraftMedia
            :media
            :video-props="videoProps"
            class="media-ratio w-full block object-cover"
            :style="ratioVars"
            :img-props="{ sizes: '100vw lg:50vw', alt: media.alt || media.title || undefined }"
          />
          <figcaption v-if="data.showCaption && media.caption">
            <Text :html="media.caption" />
          </figcaption>
        </figure>
      </component>

      <CarouselThumbs v-if="isCarousel" :for="carouselId" :items />
    </div>
  </Section>
</template>

<style scoped>
.media-ratio {
  aspect-ratio: var(--ratio-mobile, var(--ratio));

  @screen lg {
    aspect-ratio: var(--ratio);
  }
}
</style>
