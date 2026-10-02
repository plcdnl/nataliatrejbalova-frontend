<script setup lang="ts">
import type { BlockTextFragment } from '#graphql-operations'

interface BlockTextProps {
  data: BlockTextFragment
}

defineProps<BlockTextProps>()
</script>

<template>
  <Section padded class="layout-grid">
    <Text :html="data.text ?? ''" class="col-span-6 space-y-1em lg:col-start-6" />
  </Section>
</template>
