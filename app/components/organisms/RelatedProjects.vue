<script setup lang="ts">
import type { ProjectFragment, ProjectThumbFragment } from '#graphql-operations'

interface RelatedProjectsProps {
  project: ProjectFragment
  limit?: number
}

const props = withDefaults(defineProps<RelatedProjectsProps>(), {
  limit: 4,
})

const { locale } = useI18n()

// useGraphqlQuery va chiamato prima di qualsiasi await, altrimenti perde il contesto Nuxt in SSR
async function fetchProjects(relatedTo?: string[]) {
  const { data } = await useGraphqlQuery('Entries', {
    section: ['project'],
    limit: props.limit,
    excludeIds: props.project.id ? ['not', props.project.id] : undefined,
    relatedTo,
    site: [locale.value],
  })
  return (data.entries ?? []) as ProjectThumbFragment[]
}

// i correlati scelti in Craft hanno la precedenza; altrimenti i progetti della stessa categoria,
// completati con gli altri progetti se la categoria non basta
const { data } = await useAsyncData(`project-related-${props.project.id}-${locale.value}`, async () => {
  const manual = (props.project.relatedProjects ?? []).filter((p): p is ProjectThumbFragment => !!p)
  if (manual.length)
    return { projects: manual.slice(0, props.limit), manual: true }

  const categories = (props.project.projectCategory ?? []).map(category => category?.id).filter((id): id is string => !!id)

  const [sameCategory, others] = await Promise.all([
    categories.length ? fetchProjects(categories) : [],
    fetchProjects(),
  ])

  const projects = [...sameCategory, ...others]
    .filter((p, i, all) => all.findIndex(q => q.id === p.id) === i)
    .slice(0, props.limit)

  return { projects, manual: false }
}, {
  default: () => ({ projects: [] as ProjectThumbFragment[], manual: false }),
})

// la sezione sta in fondo alla pagina: entra quando arriva nel viewport, non con la transizione di pagina
const $root = useTemplateRef<HTMLElement>('root')
let ctx: ReturnType<typeof gsap.context> | undefined

onMounted(() => {
  const root = $root.value
  if (!root)
    return

  ctx = gsap.context(() => {
    const targets = root.querySelectorAll('[data-related-reveal], li')
    gsap.set(targets, { y: PAGE_REVEAL.y, autoAlpha: 0 })
    gsap.to(targets, {
      y: 0,
      autoAlpha: 1,
      duration: PAGE_REVEAL.duration,
      ease: PAGE_REVEAL.ease,
      stagger: PAGE_REVEAL.stagger,
      clearProps: 'transform,opacity,visibility',
      scrollTrigger: { trigger: root, start: 'top 85%', once: true },
    })
  }, root)
})

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section v-if="data.projects.length" ref="root" class="mt-35svh">
    <div class="layout-grid mb-6" data-related-reveal>
      <Text as="h3" :text="$t(data.manual ? 'project.related' : 'project.more')" class="text-gray-400 col-span-6 lg:col-start-5" />
    </div>
    <ProjectList :projects="data.projects" :reveal="false" />
  </section>
</template>
