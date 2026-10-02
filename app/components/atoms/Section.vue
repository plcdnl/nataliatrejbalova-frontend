<script setup lang="ts">
interface SectionProps {
  padded?: boolean
}

defineProps<SectionProps>()
</script>

<template>
  <section class="section" :class="{ padded }">
    <slot />
  </section>
</template>

<style scoped>
.section {
  position: relative;
}

.section.padded {
  margin-block: calc(var(--spacing) * 6);
}

/* il primo blocco resta allineato all'inizio del contenuto (e quindi al menu) */
.section.padded:first-child {
  margin-top: 0;
}
</style>
