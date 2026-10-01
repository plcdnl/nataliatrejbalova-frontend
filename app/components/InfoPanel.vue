<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'
import { LOGO_FRAME, LOGO_INSETS, LOGO_SIZES, logoMask } from '~/utils/logo'

export interface InfoPanelProps {
  logo: number
  body?: string | null
  sidebar?: string | null
}

const props = defineProps<InfoPanelProps>()

const open = defineModel<boolean>('open', { default: false })

onKeyStroke('Escape', () => {
  if (!open.value)
    return
  (document.activeElement as HTMLElement | null)?.blur()
  open.value = false
})

let hadSelection = false

function hasSelection() {
  return !!window.getSelection()?.toString()
}

function onPointerdown() {
  hadSelection = hasSelection()
}

function onClick(event: MouseEvent) {
  if (hadSelection || hasSelection() || (event.target as HTMLElement).closest('a'))
    return
  open.value = false
}

const mask = computed(() => {
  const [x, y] = LOGO_INSETS[props.logo - 1]
  return {
    ...logoMask(`/logo/alberto_garutti-${props.logo}.svg`, LOGO_SIZES[props.logo - 1], 'left top'),
    translate: `${(-x / LOGO_FRAME[0]) * 100}% ${(-y / LOGO_FRAME[1]) * 100}%`,
  }
})
</script>

<template>
  <Transition
    enter-active-class="motion-snug"
    leave-active-class="motion-snug"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <section
      v-show="open"
      id="info-overlay"
      class="overscroll-contain bg-white cursor-pointer inset-0 fixed z-10 overflow-y-auto"
      @pointerdown="onPointerdown"
      @click="onClick"
    >
      <button
        type="button"
        class="cursor-pointer left-2.5 top-2.5 fixed z-1 lg:left-5 lg:top-[calc(1.25rem+0.25em)]"
        aria-label="Alberto Garutti"
        aria-expanded="true"
        aria-controls="info-overlay"
        @click.stop="open = false"
      >
        <span class="bg-black h-25 w-auto block lg:h-35" :style="mask" />
      </button>
      <div class="container layout-grid pb-5 pt-35 lg:pt-5">
        <div class="col-span-full lg:col-span-5 lg:col-start-5">
          <Text v-if="body" :html="body" class="typo-sans-1 cursor-text space-y-1.2em" />
        </div>
        <div class="col-span-full lg:col-span-3">
          <Text v-if="sidebar" :html="sidebar" class="typo-sans-1 cursor-text space-y-1.2em" />
        </div>
      </div>
    </section>
  </Transition>
</template>
