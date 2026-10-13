<script setup lang="ts">
import type { ProjectThumbFragment } from '#graphql-operations'

interface ProjectListProps {
  projects: ProjectThumbFragment[]
  /** le righe entrano con la transizione di pagina; false se l'animazione è gestita altrove */
  reveal?: boolean
  /** righe grigie che diventano nere all'hover (es. progetti correlati) */
  invert?: boolean
}

withDefaults(defineProps<ProjectListProps>(), {
  reveal: true,
  invert: false,
})
</script>

<template>
  <ul>
    <li v-for="project in projects" :key="project.id ?? undefined" :data-reveal="reveal ? '' : undefined" class="layout-grid">
      <Anchor :to="project.url ?? undefined" :locale="false" class="motion-base gap-5 grid col-span-6 grid-cols-6 lg:col-span-8 lg:col-start-5 lg:grid-cols-8" :class="invert ? 'text-gray-400 hover:text-black' : '[&.router-link-active]:text-gray-400 hover:text-gray-400'">
        <Text as="span" :text="project.year || 'n.d.'" class="col-span-1" />
        <Text as="span" :text="project.title" class="col-span-5 lg:col-span-6" />
      </Anchor>
    </li>
  </ul>
</template>
