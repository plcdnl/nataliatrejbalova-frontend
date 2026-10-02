<script setup lang="ts">
import type { ProjectFragment, ProjectThumbFragment } from '#graphql-operations'
import type { BlocksInterface } from '~/components/organisms/BlocksRenderer.vue'

const route = useRoute()
const { locale } = useI18n()

const project = await useCraftEntry<ProjectFragment>({ section: ['project'], slug: [route.params.slug as string] })

const { data: relatedProjects } = await useAsyncData(`project-related-${project.id}`, async () => {
  if (project.relatedProjects?.length)
    return project.relatedProjects as ProjectThumbFragment[]

  const { data } = await useGraphqlQuery('Entries', {
    section: ['project'],
    limit: 6,
    excludeIds: project.id ? ['not', project.id] : undefined,
    site: [locale.value],
  })

  return (data.entries ?? []) as ProjectThumbFragment[]
}, {
  default: () => [] as ProjectThumbFragment[],
})

useCraftSEO({ ...project, excerpt: project.description })
</script>

<template>
  <PageContent :title="project.title">
    <BlocksRenderer :blocks="(project.blocks as BlocksInterface[])" />
  </PageContent>
</template>
