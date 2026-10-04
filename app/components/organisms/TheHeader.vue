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

  gsap.set($nav.value, { clearProps: '--reveal' })
  navTl = gsap.timeline({ paused: true })

  if (!isDesktop.value) {
    navTl.fromTo($nav.value, { '--reveal': 0 }, {
      '--reveal': 1,
      'duration': 1,
      'ease': 'power3.inOut',
    }, 0)
  }

  navTl.fromTo($nav.value.querySelectorAll('.nav-item'), { y: REVEAL.y, autoAlpha: 0 }, {
    y: 0,
    autoAlpha: 1,
    duration: REVEAL.duration,
    ease: REVEAL.ease,
    stagger: REVEAL.stagger,
  }, isDesktop.value ? 0 : 0.35) // su mobile le voci seguono il bordo sfumato mentre scende

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
      class="nav container pb-3 flex flex-col pointer-events-none items-start inset-x-0 top-0 fixed z-40 lg:mt-50svh lt-lg:pt-9"
      :class="{ invisible: isHome && !isMounted }"
    >
      <CraftLink
        v-for="link in links"
        :key="link?.id ?? undefined"
        :link="link?.customLink ?? undefined"
        class="nav-item motion-base cursor-pointer pointer-events-auto [&.router-link-active]:text-gray-400 hover:text-gray-400"
      />
    </nav>
  </header>
</template>

<style scoped>
@screen lt-lg {
  .nav {
    /* maschera con bordo sfumato al posto del clip-path: --reveal va da 0 (nascosto) a 1 (visibile) */
    --reveal: 0;
    --reveal-fade: 15rem;
    mask-image: linear-gradient(
      to bottom,
      black calc(var(--reveal) * (100% + var(--reveal-fade)) - var(--reveal-fade)),
      transparent calc(var(--reveal) * (100% + var(--reveal-fade)))
    );
    /* fondo bianco che sfuma sotto le voci, con gradiente eased per evitare lo spigolo dove inizia la sfumatura */
    --bg-fade: 14rem;
    padding-bottom: var(--bg-fade);
    background:
      linear-gradient(white, white) top / 100% calc(100% - var(--bg-fade)) no-repeat,
      linear-gradient(
          to bottom,
          rgb(255 255 255 / 1) 0%,
          rgb(255 255 255 / 0.987) 8.1%,
          rgb(255 255 255 / 0.951) 15.5%,
          rgb(255 255 255 / 0.896) 22.5%,
          rgb(255 255 255 / 0.825) 29%,
          rgb(255 255 255 / 0.741) 35.3%,
          rgb(255 255 255 / 0.648) 41.2%,
          rgb(255 255 255 / 0.55) 47.1%,
          rgb(255 255 255 / 0.45) 52.9%,
          rgb(255 255 255 / 0.352) 58.8%,
          rgb(255 255 255 / 0.259) 64.7%,
          rgb(255 255 255 / 0.175) 71%,
          rgb(255 255 255 / 0.104) 77.5%,
          rgb(255 255 255 / 0.049) 84.5%,
          rgb(255 255 255 / 0.013) 91.9%,
          rgb(255 255 255 / 0) 100%
        )
        bottom / 100% var(--bg-fade) no-repeat;
  }
}
</style>
