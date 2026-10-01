<script setup lang="ts">
import type { EntryInterfaceTypeFragment } from '#graphql-operations'

const { locale } = useI18n()

const variables = computed(() => ({
  locale: [locale.value],
  section: ['page'],
}))

const { data: pages } = await useAsyncGraphqlQuery('Entries', variables, {
  transform: response => response.data.entries as EntryInterfaceTypeFragment[],
})

useCraftSEO(pages.value?.[0] as EntryInterfaceTypeFragment)
</script>

<template>
  <div>
    <h1> Starter Craft</h1>
    <ul v-if="pages && pages?.length > 0">
      <li v-for="page in pages" :key="page.id">
        <CraftLink :link="page">
          {{ page.title }}
        </CraftLink>
      </li>
    </ul>
  </div>
</template>
