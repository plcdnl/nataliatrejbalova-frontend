<script setup lang="ts">
import type { MediaFragment } from '#graphql-operations'

interface LightboxTriggerProps {
  media: MediaFragment
  as?: string
}

const props = withDefaults(defineProps<LightboxTriggerProps>(), { as: 'div' })

const lightbox = useLightbox()
const $el = useTemplateRef<HTMLElement>('el')

let unregister: (() => void) | undefined

onMounted(() => {
  if (lightbox && $el.value)
    unregister = lightbox.register({ media: props.media, el: $el.value })
})

onBeforeUnmount(() => unregister?.())

// nei caroselli il trascinamento termina con un click: lo si ignora
const DRAG_THRESHOLD = 6
let start: { x: number, y: number } | undefined

function onPointerdown(e: PointerEvent) {
  start = { x: e.clientX, y: e.clientY }
}

function onClick(e: MouseEvent) {
  if (!lightbox || !$el.value)
    return
  if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > DRAG_THRESHOLD)
    return
  lightbox.open($el.value)
}
</script>

<template>
  <component
    :is="as"
    ref="el"
    :class="{ 'cursor-zoom-in': lightbox }"
    :role="lightbox ? 'button' : undefined"
    :tabindex="lightbox ? 0 : undefined"
    @pointerdown="onPointerdown"
    @click="onClick"
    @keydown.enter="lightbox && $el && lightbox.open($el)"
  >
    <slot />
  </component>
</template>
