<script setup lang="ts">
import { FAVICONS } from '~/utils/palette'

const now = useState('server-now', () => Date.now())
const favicon = computed(() => FAVICONS[now.value % FAVICONS.length]!)

useHead({
  titleTemplate: '%s',
  link: [{ key: 'favicon', rel: 'icon', type: 'image/svg+xml', href: favicon }],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
