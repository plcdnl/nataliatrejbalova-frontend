<script setup lang="ts">
import type { BlockGridFragment } from '#graphql-operations'
import type { BlocksInterface } from '~/components/organisms/BlocksRenderer.vue'

interface BlockGridProps {
  data: BlockGridFragment
}

const props = defineProps<BlockGridProps>()

const columns = computed(() => props.data.columns ?? [])
</script>

<template>
  <Section padded class="blockGrid layout-grid">
    <div
      v-for="column in columns"
      :key="column?.id ?? undefined"
      class="gridColumn flex flex-col gap-5"
    >
      <BlocksRenderer :blocks="(column?.columnBlocks as BlocksInterface[])" />
    </div>
  </Section>
</template>

<style scoped>
.gridColumn {
  grid-column: span 6 / span 6;

  @screen lg {
    grid-column: span 3 / span 3;
  }
}

.gridColumn:first-child {
  @screen lg {
    grid-column-start: 6;
  }
}
</style>
