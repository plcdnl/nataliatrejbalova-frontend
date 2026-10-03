<script setup lang="ts">
import type { ProjectFragment } from '#graphql-operations'
import type { BlocksInterface } from '~/components/organisms/BlocksRenderer.vue'

const route = useRoute()

const project = await useCraftEntry<ProjectFragment>({ section: ['project'], slug: [route.params.slug as string] })

useCraftSEO({ ...project, excerpt: project.description })

provideLightbox()
</script>

<template>
  <PageContent :title="project.title">
    <BlocksRenderer :blocks="(project.blocks as BlocksInterface[])" />
    <RelatedProjects :project />
    <ProjectLightbox />
  </PageContent>
</template>
