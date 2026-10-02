<script setup lang="ts">
import type { MediaFragment } from '#graphql-operations'

interface CarouselThumbsProps {
  for: string
  items: (MediaFragment | null)[]
}

const props = defineProps<CarouselThumbsProps>()
</script>

<template>
  <BlossomDots
    v-slot="{ index, active }"
    :for="props.for"
    class="carouselThumbs flex gap-1 bottom-2 left-2 absolute z-10 lg:bottom-3 lg:left-3"
  >
    <BlossomDot
      class="thumb motion-snug rounded-0.5 op-50 shrink-0 w-10 aspect-4/5 block of-hidden hover:op-80 lg:w-12"
      :class="{ 'op-100!': active }"
      :aria-label="`Vai alla slide ${index + 1}`"
    >
      <CraftMedia
        :media="items[index]"
        class="size-full block object-cover"
        :img-props="{ sizes: '64px', alt: '' }"
        hide-average-color
      />
    </BlossomDot>
  </BlossomDots>
</template>
