<script setup lang="ts">
import type { LandingEntryFragment, MediaFragment } from '#graphql-operations'
import { useIsInfoOpen } from '~/composables/useIsInfoOpen'
import { LOGO_SIZES, logoMask } from '~/utils/logo'

const page = await useCraftEntry<LandingEntryFragment>({
  section: ['landing'],
  slug: ['landing'],
})

useCraftSEO(page)
useCraftOrgSchema(page)
useI18nParams(page)

// Rotate logo, first image and selection colour by server timestamp; useState carries it into the payload for hydration
const now = useState('server-now', () => Date.now())

// Start the roller from a different image on every visit
const media = computed(() => {
  const items = (page.media ?? []) as MediaFragment[]
  const start = now.value % (items.length || 1)
  return [...items.slice(start), ...items.slice(0, start)]
})

// The roller is opt-in via ?roller=true; by default the media crossfade
const route = useRoute()
const useRoller = computed(() => route.query.roller === 'true')

const logo = computed(() => (now.value % LOGO_SIZES.length) + 1)
const logoStyle = computed(() => logoMask(`/logo/alberto_garutti-boxed-${logo.value}.svg`))

// Full class names so UnoCSS picks them up
const selections = ['selection:bg-peach', 'selection:bg-blush', 'selection:bg-sky', 'selection:bg-lime']
const selection = computed(() => selections[now.value % selections.length])

// Info overlay toggled by the logo; the scrollbar-gutter plugin locks the page scroll while it's open
const isOpen = useIsInfoOpen()
</script>

<template>
  <div class="selection:text-black" :class="selection">
    <MediaRoller
      v-if="media.length && useRoller"
      :media
      :speed="20"
      :hold="3"
      :roll-radius="0.07"
      :gap="0"
      :snap-distance="44"
      :snap-duration="0.5"
      snap-ease="back.out(2)"
    />
    <SlideshowFade v-else-if="media.length" :media />

    <button
      type="button"
      class="flex cursor-pointer items-center inset-0 justify-center fixed z-1"
      aria-label="Alberto Garutti"
      :aria-expanded="isOpen"
      aria-controls="info-overlay"
      @click="isOpen = true"
    >
      <span
        class="bg-white shrink-0 w-[calc(100vw-2.5rem)] block lg:h-60 lg:w-auto"
        :style="logoStyle"
      />
    </button>
    <InfoPanel v-model:open="isOpen" :logo :body="page.body" :sidebar="page.sidebar" />
  </div>
</template>
