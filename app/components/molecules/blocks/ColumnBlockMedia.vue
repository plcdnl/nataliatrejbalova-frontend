<script setup lang="ts">
import type { ColumnBlockMediaFragment, MediaFragment } from '#graphql-operations'
import { mediaNaturalRatioStyle } from '~/composables/useMediaRatio'

interface ColumnBlockMediaProps {
  data: ColumnBlockMediaFragment
}

const props = defineProps<ColumnBlockMediaProps>()
const items = computed(() => (props.data.media ?? []) as MediaFragment[])

const { style: ratioVars } = useMediaRatio(() => props.data)

// senza ratio impostato in Craft si usano le proporzioni del file
const mediaStyle = (media: MediaFragment) => [ratioVars.value, mediaNaturalRatioStyle(media)]
</script>

<template>
  <LightboxTrigger
    v-for="media in items"
    :key="media.id ?? undefined"
    :media
    class="media-ratio"
    :style="mediaStyle(media)"
  >
    <CraftMedia
      :media
      class="size-full block object-cover"
      :img-props="{ sizes: '100vw lg:25vw', alt: media.alt || media.title || undefined }"
    />
  </LightboxTrigger>
</template>

<style scoped>
.media-ratio {
  aspect-ratio: var(--ratio-mobile, var(--ratio, var(--ratio-natural)));

  @screen lg {
    aspect-ratio: var(--ratio, var(--ratio-natural));
  }
}
</style>
