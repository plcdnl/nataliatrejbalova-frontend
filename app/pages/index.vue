<script setup lang="ts">
import type { LandingEntryFragment, MediaFragment } from '#graphql-operations'
import { onKeyStroke, useScrollLock } from '@vueuse/core'

const page = await useCraftEntry<LandingEntryFragment>({
  section: ['landing'],
  slug: ['landing'],
})

useCraftSEO(page)
useCraftOrgSchema(page)
useI18nParams(page)

const media = computed(() => (page.media ?? []) as MediaFragment[])

// Rotate the logo by server timestamp; useState carries it into the payload for hydration
const logos = computed(() => (page.logo ?? []) as MediaFragment[])
const now = useState('server-now', () => Date.now())
const logo = computed(() => logos.value[now.value % logos.value.length])

// Info overlay toggled by the logo
const isOpen = ref(false)
const logoButton = useTemplateRef('logoButton')
const scrollLock = useScrollLock(import.meta.client ? document.body : null)
const Flip = useFlip()
let flip: gsap.core.Timeline | null = null

// FLIP the logo between centre and top-left, tweening its fill along the way
async function toggle(open = !isOpen.value) {
  if (open === isOpen.value)
    return
  const el = logoButton.value?.firstElementChild
  const state = el && Flip ? Flip.getState(el, { props: 'fill' }) : null
  flip?.kill()
  isOpen.value = open
  scrollLock.value = open
  if (!state)
    return
  await nextTick()
  flip = Flip!.from(state, {
    duration: 0.9,
    ease: 'expo.inOut',
    scale: true,
  })
}

// Blur so the keypress doesn't leave a focus-visible ring on the logo
onKeyStroke('Escape', () => {
  logoButton.value?.blur()
  toggle(false)
})
</script>

<template>
  <div>
    <MediaRoller
      v-if="media.length"
      :media
      :speed="20"
      :hold="3"
      :roll-radius="0.07"
      :gap="0"
      :snap-distance="44"
      :snap-duration="0.5"
      snap-ease="back.out(2)"
    />
    <button
      v-if="logo"
      ref="logoButton"
      type="button"
      class="cursor-pointer fixed z-20"
      :class="isOpen ? 'top-5 left-5' : 'inset-0 flex items-center justify-center'"
      :aria-expanded="isOpen"
      aria-controls="info-overlay"
      @click="toggle()"
    >
      <CraftSvg
        :media="logo"
        class="shrink-0 block"
        :class="isOpen ? 'w-auto h-20 md:h-35 fill-black' : 'w-[calc(100vw-2.5rem)] h-auto md:w-auto md:h-60 fill-white'"
      />
    </button>
    <Transition
      enter-active-class="motion-base"
      leave-active-class="motion-base"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <section
        v-show="isOpen"
        id="info-overlay"
        class="overscroll-contain bg-white inset-0 fixed z-10 overflow-y-auto"
      >
        <div class="container layout-grid pb-5 pt-30 lg:pt-5 md:pt-45">
          <div class="col-span-full lg:col-span-5 lg:col-start-5">
            <Text :html="page.body" class="typo-sans-1 space-y-1.2em" />
          </div>
          <div class="col-span-full lg:col-span-3">
            <Text :html="page.sidebar" class="typo-sans-1 space-y-1.2em" />
          </div>
        </div>
      </section>
    </Transition>
  </div>
</template>
