<script setup lang="ts">
import type { CraftImageProps } from '@studio-fes/layer-craft/app/components/CraftImage.vue'
import type { CraftVideoProps } from '@studio-fes/layer-craft/app/components/CraftVideo.vue'
import type { MediaFragment } from '#graphql-operations'

interface CraftSvgProps {
  media: MediaFragment | null | undefined
  imgProps?: CraftImageProps
  videoProps?: CraftVideoProps
}

const props = defineProps<CraftSvgProps>()
const isSvg = computed(() => props.media && props.media?.format === 'svg')
</script>

<template>
  <RemoteSvg v-if="media && isSvg" :src="media.url" />
  <CraftMedia v-else-if="media" :media />
</template>
