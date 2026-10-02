<script setup lang="ts">
interface PageContentProps {
  title?: string | null
}

defineProps<PageContentProps>()
</script>

<template>
  <div class="container py-3">
    <div v-if="title" class="layout-grid h-0 top-3 sticky z-10">
      <Text as="h2" :text="title" class="col-span-6 lg:col-start-6" data-reveal />
    </div>
    <div class="mt-50svh">
      <slot />
    </div>
  </div>
</template>
