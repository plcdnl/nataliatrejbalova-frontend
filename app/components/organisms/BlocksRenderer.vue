<script setup lang="ts">
export type BlocksInterface = (Record<string, unknown> & { __typename: string })

interface BlocksRendererProps {
  blocks?: (BlocksInterface | null)[] | null
}

defineProps<BlocksRendererProps>()

const blockComponent = new Map([
  ['blockGrid_Entry', resolveComponent('BlockGrid')],
  ['blockMedia_Entry', resolveComponent('BlockMedia')],
  ['blockText_Entry', resolveComponent('BlockText')],

  ['columnBlockMedia_Entry', resolveComponent('ColumnBlockMedia')],
  ['columnBlockText_Entry', resolveComponent('ColumnBlockText')],
])
</script>

<template>
  <template v-for="(block, i) in blocks" :key="(block?.id as string | undefined) ?? i">
    <component :is="blockComponent.get(block.__typename)" v-if="block && blockComponent.has(block.__typename)" :data="block" />
  </template>
</template>
