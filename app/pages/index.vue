<script setup lang="ts">
import type { SplashscreenFragment } from '#graphql-operations'

const { locale } = useI18n()

const { data } = await useAsyncGraphqlQuery('Splashscreen', computed(() => ({ site: [locale.value] })), {
  graphqlCaching: { client: true },
})

const splashscreen = computed(() => data.value?.data?.splashscreenEntries?.[0] as SplashscreenFragment | undefined)
const media = computed(() => splashscreen.value?.media?.[0])

const hasSocialImage = computed(() => !!(splashscreen.value?.seo?.social?.facebook?.image || splashscreen.value?.seo?.social?.twitter?.image))

useCraftSEO({
  ...splashscreen.value,
  // senza un'immagine social impostata in Craft, l'anteprima di condivisione usa il media della home
  thumbImage: !hasSocialImage.value && media.value?.kind === 'image' ? [media.value] : undefined,
})

// il media sfuma al click, insieme al titolo che sale, senza aspettare il caricamento della pagina successiva
const router = useRouter()
const $root = useTemplateRef<HTMLElement>('root')

watch(() => isHomeRoute(router.currentRoute.value), (isHome) => {
  gsap.to($root.value, {
    autoAlpha: isHome ? 1 : 0,
    duration: INTRO.media,
    ease: INTRO.mediaEase,
    overwrite: true,
  })
})
</script>

<template>
  <div ref="root" class="bg-black inset-0 fixed" aria-hidden="true">
    <CraftMedia
      v-if="media"
      :media
      :video-props="{ autoplay: true, muted: true, loop: true, controls: false, pauseOnLeave: false }"
      :img-props="{ sizes: '1024px lg:100vw', alt: '' }"
      class="size-full object-cover"
    />
  </div>
</template>
