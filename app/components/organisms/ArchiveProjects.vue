<script setup lang="ts">
import type { ProjectThumbFragment } from '#graphql-operations'

const { locale } = useI18n()

const { data } = await useAsyncGraphqlQuery('Entries', computed(() => ({
  section: ['project'],
  site: [locale.value],
})), {
  graphqlCaching: { client: true },
})

const projects = computed(() => (data.value?.data?.entries ?? []) as ProjectThumbFragment[])
</script>

<template>
  <ul>
    <li v-for="project in projects" :key="project.id ?? undefined">
      <NuxtLinkLocale :to="`/project/${project.slug}`" class="layout-grid">
        <Text as="span" :text="project.year" class="col-span-2 lg:col-start-6" />
        <Text as="span" :text="project.title" class="col-span-4 lg:col-span-5 lg:col-start-8" />
      </NuxtLinkLocale>
    </li>
  </ul>
</template>
