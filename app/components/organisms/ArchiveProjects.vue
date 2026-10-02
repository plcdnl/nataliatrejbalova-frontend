<script setup lang="ts">
import type { ProjectThumbFragment } from '#graphql-operations'

interface ArchiveProjectsProps {
  categories?: (string | null | undefined)[]
}

const props = defineProps<ArchiveProjectsProps>()

const { locale } = useI18n()

const relatedTo = computed(() => {
  const ids = (props.categories ?? []).filter((id): id is string => !!id)
  return ids.length ? ids : undefined
})

const { data } = await useAsyncGraphqlQuery('Entries', computed(() => ({
  section: ['project'],
  relatedTo: relatedTo.value,
  site: [locale.value],
})), {
  graphqlCaching: { client: true },
})

const projects = computed(() => (data.value?.data?.entries ?? []) as ProjectThumbFragment[])
</script>

<template>
  <ul>
    <li v-for="project in projects" :key="project.id ?? undefined" data-reveal>
      <Anchor :to="project.url ?? undefined" :locale="false" class="layout-grid motion-base [&.router-link-active]:text-gray-400 hover:text-gray-400">
        <Text as="span" :text="project.year" class="col-span-2 lg:col-start-6" />
        <Text as="span" :text="project.title" class="col-span-4 lg:col-span-5 lg:col-start-8" />
      </Anchor>
    </li>
  </ul>
</template>
