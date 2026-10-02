<script setup lang="ts">
import type { HeaderFragment } from '#graphql-operations'

const { locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const Flip = useFlip()
const isDesktop = useMq('lg')

const { data } = await useAsyncGraphqlQuery('Header', computed(() => ({ site: [locale.value] })), {
  graphqlCaching: { client: true },
})

const links = computed(() => (data.value?.data?.headerEntries?.[0] as HeaderFragment | undefined)?.links ?? [])

const router = useRouter()
const isHome = computed(() => router.currentRoute.value.path === localePath('/'))

const titleTo = computed(() => {
  const firstLink = parseCraftLink(links.value[0]?.customLink ?? undefined)
  return firstLink?.to ? getRelativeUrl(firstLink.to) : undefined
})

const isMenuOpen = ref(false)

watch(() => route.fullPath, () => {
  isMenuOpen.value = false
})

watch(isDesktop, (desktop) => {
  if (desktop)
    isMenuOpen.value = false
})

onKeyStroke('Escape', () => {
  isMenuOpen.value = false
})

useHead({
  htmlAttrs: {
    class: computed(() => isMenuOpen.value ? 'is-scroll-locked' : undefined),
  },
})

const $title = useTemplateRef<HTMLElement>('title')

watch(isHome, async () => {
  if (!$title.value)
    return

  const state = Flip.getState($title.value)
  await nextTick()
  Flip.from(state, { duration: INTRO.flip, ease: INTRO.flipEase })
}, { flush: 'pre' })

const $nav = useTemplateRef<HTMLElement>('nav')
const isMounted = useMounted()
const isNavVisible = computed(() => !isHome.value && (isDesktop.value || isMenuOpen.value))

let navTl: gsap.core.Timeline | undefined
let navDelay: gsap.core.Tween | undefined

function buildNavTimeline() {
  navTl?.kill()
  if (!$nav.value)
    return

  gsap.set($nav.value, { clearProps: 'clipPath' })
  navTl = gsap.timeline({ paused: true })

  if (!isDesktop.value) {
    navTl.fromTo($nav.value, { clipPath: 'inset(0% 0% 100% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 0.6,
      ease: 'power2.inOut',
    }, 0)
  }

  navTl.fromTo($nav.value.querySelectorAll('.nav-item'), { y: REVEAL.y, autoAlpha: 0 }, {
    y: 0,
    autoAlpha: 1,
    duration: REVEAL.duration,
    ease: REVEAL.ease,
    stagger: REVEAL.stagger,
  }, isDesktop.value ? 0 : 0.25)

  navTl.progress(isNavVisible.value ? 1 : 0)
}

onMounted(buildNavTimeline)

watch([isDesktop, () => links.value.length], async () => {
  await nextTick()
  buildNavTimeline()
})

watch(isNavVisible, (visible) => {
  navDelay?.kill()
  if (!navTl)
    return

  if (visible) {
    // su desktop, uscendo dalla home, le voci partono a metà della salita del titolo
    navDelay = gsap.delayedCall(isDesktop.value ? introDelay(INTRO.menu) : 0, () => {
      navTl?.timeScale(1).play()
    })
  }
  else {
    navTl.timeScale(1.5).reverse()
  }
})

onUnmounted(() => {
  navDelay?.kill()
  navTl?.kill()
})

const siteConfig = useSiteConfig()
</script>

<template>
  <header>
    <div
      class="container py-3 flex pointer-events-none transition-colors duration-1000 inset-x-0 top-0 justify-between fixed z-50"
      :class="isHome ? 'h-svh items-center text-white' : 'items-start'"
    >
      <!-- in home l'area cliccabile del titolo copre tutto lo schermo -->
      <Anchor
        :to="titleTo"
        :locale="false"
        class="pointer-events-auto"
        :class="{ 'after:content-empty after:inset-0 after:fixed': isHome }"
      >
        <h1 ref="title">
          {{ siteConfig.name }}
        </h1>
      </Anchor>

      <button
        v-if="!isHome && links.length"
        type="button"
        class="pointer-events-auto lg:hidden"
        :aria-expanded="isMenuOpen"
        aria-controls="main-nav"
        @click="isMenuOpen = !isMenuOpen"
      >
        {{ isMenuOpen ? $t('menu.close') : $t('menu.open') }}
      </button>
    </div>

    <nav
      v-if="links.length"
      id="main-nav"
      ref="nav"
      class="nav container pb-3 flex flex-col items-start inset-x-0 top-0 fixed z-40 lg:mt-50svh lt-lg:pt-[calc(50svh+0.75rem)] lt-lg:bg-white lg:pointer-events-none lt-lg:bottom-0"
      :class="{ invisible: isHome && !isMounted }"
    >
      <CraftLink
        v-for="link in links"
        :key="link?.id ?? undefined"
        :link="link?.customLink ?? undefined"
        class="nav-item motion-base pointer-events-auto [&.router-link-active]:text-gray-400 hover:text-gray-400"
      />
    </nav>
  </header>
</template>

<style scoped>
@screen lt-lg {
  .nav {
    clip-path: inset(0% 0% 100% 0%);
  }
}
</style>
