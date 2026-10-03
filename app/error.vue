<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const siteConfig = useSiteConfig()

const isNotFound = computed(() => props.error.statusCode === 404)
const title = computed(() => isNotFound.value ? t('error.notFound.title') : t('error.generic.title'))
const message = computed(() => isNotFound.value ? t('error.notFound.message') : t('error.generic.message'))

useHead({
  title: () => `${props.error.statusCode} · ${title.value}`,
})

useSeoMeta({
  robots: 'noindex, nofollow',
})

async function goHome() {
  await clearError({ redirect: localePath('/') })
}
</script>

<template>
  <main class="container py-3 min-h-svh">
    <!-- stessa griglia delle righe dell'archivio, all'altezza del menu: il codice al posto dell'anno -->
    <div class="layout-grid mt-50svh">
      <!-- niente TheHeader: niente query a Craft, la pagina deve reggere anche se il backend non risponde -->
      <Anchor
        :to="localePath('/')"
        :locale="false"
        class="error-reveal col-span-6 justify-self-start lg:col-span-5"
        style="--i: 0"
        @click.prevent="goHome"
      >
        {{ siteConfig.name }}
      </Anchor>

      <p class="error-reveal col-span-2 lg:col-start-5" style="--i: 1">
        {{ error.status }}
      </p>

      <div class="col-span-4 lg:col-span-5 lg:col-start-8">
        <h1 class="error-reveal" style="--i: 2">
          {{ title }}
        </h1>
        <p class="error-reveal" style="--i: 3">
          {{ message }}
        </p>
        <Anchor
          :to="localePath('/')"
          :locale="false"
          class="error-reveal mt-1.2em motion-snug inline-block italic hover:opacity-50"
          style="--i: 4"
          @click.prevent="goHome"
        >
          {{ t('error.backHome') }}
        </Anchor>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* in CSS e non con gsap, così non c'è il lampo prima dell'idratazione; valori come PAGE_REVEAL */
.error-reveal {
  animation: error-reveal 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  animation-delay: calc(var(--i, 0) * 0.08s + 0.1s);
}

@keyframes error-reveal {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .error-reveal {
    animation: none;
  }
}
</style>
