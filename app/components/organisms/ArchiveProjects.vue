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
  <ProjectList :projects />
</template>
