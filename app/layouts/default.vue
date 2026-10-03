<script setup lang="ts">
</script>

<template>
  <div>
    <TheHeader />
    <slot />
    <ClientOnly>
      <KonamiDisable />
    </ClientOnly>
  </div>
</template>
