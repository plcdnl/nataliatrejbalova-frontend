<script setup lang="ts">
import type { PageArchiveEntryFragment, PageEntryFragment } from '#graphql-operations'
import type { BlocksInterface } from '~/components/organisms/BlocksRenderer.vue'

const route = useRoute()

const slug = route.params.slug as string
const entry = await useCraftEntry<PageEntryFragment | PageArchiveEntryFragment>({ section: ['page'], slug: [slug] })

useCraftSEO(entry)
</script>

<template>
  <PageContent v-if="entry.__typename === 'pageArchive_Entry' && entry.archiveType === 'projects'">
    <ArchiveProjects :categories="entry.projectCategory?.map(category => category?.id)" />
  </PageContent>
  <PageContent v-else :title="entry.title">
    <BlocksRenderer v-if="entry.__typename === 'pageDefault_Entry'" :blocks="(entry.blocks as BlocksInterface[])" />
  </PageContent>
</template>
