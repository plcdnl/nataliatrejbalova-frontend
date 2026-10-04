<script setup lang="ts">
interface PageContentProps {
  title?: string | null
}

defineProps<PageContentProps>()
</script>

<template>
  <div class="container">
    <div v-if="title" class="layout-grid h-0 top-3 sticky z-10 lt-lg:top-9">
      <Text as="h2" :text="title" class="col-span-6 lg:col-start-5" data-reveal />
    </div>
    <div class="mt-50svh pb-3">
      <slot />
    </div>
  </div>
</template>
