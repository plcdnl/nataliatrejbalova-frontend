<script setup lang="ts">
import type { ProjectThumbFragment } from '#graphql-operations'

interface ProjectListProps {
  projects: ProjectThumbFragment[]
  /** le righe entrano con la transizione di pagina; false se l'animazione è gestita altrove */
  reveal?: boolean
}

withDefaults(defineProps<ProjectListProps>(), {
  reveal: true,
})
</script>

<template>
  <ul>
    <li v-for="project in projects" :key="project.id ?? undefined" :data-reveal="reveal ? '' : undefined">
      <Anchor :to="project.url ?? undefined" :locale="false" class="layout-grid motion-base [&.router-link-active]:text-gray-400 hover:text-gray-400">
        <Text as="span" :text="project.year || 'n.d.'" class="col-span-2 lg:col-start-5" />
        <Text as="span" :text="project.title" class="col-span-4 lg:col-span-6 lg:col-start-7" />
      </Anchor>
    </li>
  </ul>
</template>
