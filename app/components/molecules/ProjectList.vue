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
    <li v-for="project in projects" :key="project.id ?? undefined" :data-reveal="reveal ? '' : undefined" class="layout-grid">
      <Anchor :to="project.url ?? undefined" :locale="false" class="motion-base gap-5 grid col-span-6 grid-cols-6 [&.router-link-active]:text-gray-400 hover:text-gray-400 lg:col-span-8 lg:col-start-5 lg:grid-cols-8">
        <Text as="span" :text="project.year || 'n.d.'" class="col-span-1" />
        <Text as="span" :text="project.title" class="col-span-5 lg:col-span-6" />
      </Anchor>
    </li>
  </ul>
</template>
