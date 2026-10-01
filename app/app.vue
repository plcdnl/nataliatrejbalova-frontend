<script setup lang="ts">
import { FAVICONS } from '~/utils/palette'

useHead({
  titleTemplate: '%s',
})

const now = useState('server-now', () => Date.now())
useFavicon(() => FAVICONS[now.value % FAVICONS.length]!, { rel: 'icon' })
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
