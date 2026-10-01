<script setup lang="ts">
import type { LandingEntryFragment } from '#graphql-operations'

const route = useRoute()

const page = await useCraftEntry<LandingEntryFragment>({
  section: ['landing'],
  slug: ['landing'],
})

useCraftSEO(page)
useCraftOrgSchema(page)
useI18nParams(page)
</script>

<template>
  <div class="container">
    <h1>{{ page }}</h1>
  </div>
</template>
