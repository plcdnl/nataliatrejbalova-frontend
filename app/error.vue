<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const isNotFound = computed(() => props.error.statusCode === 404)
const title = computed(() => isNotFound.value ? t('error.notFound.title') : t('error.generic.title'))
const message = computed(() => isNotFound.value ? t('error.notFound.message') : t('error.generic.message'))

// Static fallback logos in /public, rotated by server timestamp like the landing
const logos = [1, 2, 3, 4, 5].map(i => `/logo/SAAG_LOGO_0${i}.svg`)
const now = useState('server-now', () => Date.now())
const logo = computed(() => logos[now.value % logos.length])

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
  <main class="errorPage text-black typo-sans-1 text-center bg-white flex flex-col items-center justify-center min-h-svh">
    <NuxtLink
      :to="localePath('/')"
      :aria-label="t('error.backHome')"
      class="errorPage-reveal block"
      @click.prevent="goHome"
    >
      <img :src="logo" alt="" class="h-30 w-auto block">
    </NuxtLink>

    <div class="errorPage-reveal mt-12 max-w-200 lg:mt-16">
      <p>{{ error.statusCode }}</p>
      <h1>{{ title }}</h1>
      <p>{{ message }}</p>
    </div>

    <NuxtLink
      :to="localePath('/')"
      class="errorPage-reveal mt-[1.2em] underline decoration-2 underline-offset-4 hover:no-underline"
      @click.prevent="goHome"
    >
      {{ t('error.backHome') }}
    </NuxtLink>
  </main>
</template>

<style scoped>
.errorPage {
  padding: calc(var(--spacing) * 5);
}

/* Staggered fade-up on first paint */
.errorPage-reveal {
  animation: errorPage-reveal 0.9s cubic-bezier(0.19, 1, 0.22, 1) both;
}

.errorPage-reveal:nth-child(2) {
  animation-delay: 0.08s;
}

.errorPage-reveal:nth-child(3) {
  animation-delay: 0.16s;
}

@keyframes errorPage-reveal {
  from {
    opacity: 0;
    transform: translateY(calc(var(--spacing) * 4));
  }
}

@media (prefers-reduced-motion: reduce) {
  .errorPage-reveal {
    animation: none;
  }
}
</style>
