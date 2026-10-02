<script setup lang="ts">
import type { ColumnBlockTextFragment } from '#graphql-operations'

interface ColumnBlockTextProps {
  data: ColumnBlockTextFragment
}

defineProps<ColumnBlockTextProps>()
</script>

<template>
  <Text :html="data.text ?? ''" />
</template>
