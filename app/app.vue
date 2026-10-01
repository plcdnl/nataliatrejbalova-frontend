<script setup lang="ts">
import { faviconSvg, PALETTE } from '~/utils/palette'

useHead({
  titleTemplate: '%s',
})

const now = useState('server-now', () => Date.now())
useFavicon(() => faviconSvg(PALETTE[now.value % PALETTE.length]!), { rel: 'icon' })
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
