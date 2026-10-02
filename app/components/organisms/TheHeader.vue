<script setup lang="ts">
import type { HeaderFragment } from '#graphql-operations'

const { locale } = useI18n()

const { data } = await useAsyncGraphqlQuery('Header', computed(() => ({ site: [locale.value] })), {
  graphqlCaching: { client: true },
})

const links = computed(() => (data.value?.data?.headerEntries?.[0] as HeaderFragment | undefined)?.links ?? [])
</script>

<template>
  <header>
    <div class="container py-3 pointer-events-none inset-x-0 top-0 fixed z-50">
      <Text as="h1" text="Natalia Trejbalova" class="pointer-events-auto" />
    </div>
    <nav v-if="links.length" class="container mt-50svh pt-3 flex flex-col pointer-events-none items-start inset-x-0 top-0 fixed z-50">
      <CraftLink
        v-for="link in links"
        :key="link?.id ?? undefined"
        :link="link?.customLink ?? undefined"
        class="pointer-events-auto"
      />
    </nav>
  </header>
</template>
