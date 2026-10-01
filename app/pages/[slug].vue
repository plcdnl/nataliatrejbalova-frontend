<script setup lang="ts">
import type { PageEntryFragment } from '#graphql-operations'

const route = useRoute()

const page = await useCraftEntry<PageEntryFragment>({
  section: ['page'],
  slug: [(route.params.slug) as string],
})

useCraftSEO(page)
useCraftOrgSchema(page)
useI18nParams(page)
</script>

<template>
  <div class="container">
    <h1>Nuxt Craft Example</h1>
    <p>{{ page.title }}</p>
    <p>{{ page.slug }}</p>
    <LocaleSwitcher />
  </div>
</template>
