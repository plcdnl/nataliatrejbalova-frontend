<script setup lang="ts">
export type BlocksInterface = (Record<string, unknown> & { __typename: string })

interface BlocksRendererProps {
  blocks?: (BlocksInterface | null)[] | null
}

defineProps<BlocksRendererProps>()

const blockComponent = new Map([
  ['blockGrid_Entry', resolveComponent('LazyBlockGrid')],
  ['blockMedia_Entry', resolveComponent('LazyBlockMedia')],
  ['blockText_Entry', resolveComponent('LazyBlockText')],

  ['columnBlockMedia_Entry', resolveComponent('LazyColumnBlockMedia')],
  ['columnBlockText_Entry', resolveComponent('LazyColumnBlockText')],
])
</script>

<template>
  <template v-for="(block, i) in blocks" :key="(block?.id as string | undefined) ?? i">
    <component :is="blockComponent.get(block.__typename)" v-if="block && blockComponent.has(block.__typename)" :data="block" />
  </template>
</template>
