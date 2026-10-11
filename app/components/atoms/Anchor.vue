<script setup lang="ts">
// sovrascrive Anchor di @studio-fes/layer-base finché il layer non corregge il default di prefetch
import type { RouteLocationRaw, RouterLinkProps } from 'vue-router'

export interface NuxtLinkProps<CustomProp extends boolean = false> extends Omit<RouterLinkProps, 'to'> {
  custom?: CustomProp
  to?: RouteLocationRaw
  href?: NuxtLinkProps['to']
  external?: boolean
  target?: '_blank' | '_parent' | '_self' | '_top' | (string & {}) | null
  rel?: 'noopener' | 'noreferrer' | 'nofollow' | 'sponsored' | 'ugc' | (string & {}) | null
  prefetchedClass?: string
  prefetch?: boolean
  prefetchOn?: 'visibility' | 'interaction' | Partial<{
    visibility: boolean
    interaction: boolean
  }>
  trailingSlash?: 'append' | 'remove'
}

export interface AnchorProps extends NuxtLinkProps {
  as?: Component | keyof HTMLElementTagNameMap
  disabled?: boolean
  external?: boolean
  locale?: boolean
  title?: string
}

const props = withDefaults(defineProps<AnchorProps>(), {
  as: 'span',
  disabled: false,
  external: false,
  locale: true,
  // le prop booleane assenti valgono false: senza questo NuxtLink riceverebbe sempre prefetch=false
  prefetch: undefined,
})

const isI18nEnabled = useNuxtApp().$i18n?.locale?.value
const NuxtLinkComponent = computed(() => props.locale && isI18nEnabled ? resolveComponent('NuxtLinkLocale') : resolveComponent('NuxtLink'))

const component = computed(() => {
  if (!props.to)
    return props.as

  return NuxtLinkComponent.value
})

const to = computed(() =>
  typeof props.to === 'string' ? getRelativeUrl(props.to) : props.to,
)

const anchorProps = computed(() => {
  const { to, external, disabled, as: tagName, ...nuxtLinkProps } = reactiveOmit(props, ['locale', 'title'])

  const baseProps: Record<string, any> = {
    ...(to ? nuxtLinkProps : {}),
  }

  if (external) {
    baseProps.target = '_blank'
    baseProps.rel = 'noopener noreferrer'
  }

  if (disabled) {
    baseProps.role = 'button'
    baseProps['aria-disabled'] = 'true'
    baseProps.disabled = true
  }

  if (tagName === 'button') {
    baseProps.type = 'button'
  }

  return baseProps
})
</script>

<template>
  <component :is="component" v-bind="anchorProps" :to="to" :aria-label="title">
    <slot>
      <span v-if="title">{{ title }}</span>
    </slot>
  </component>
</template>
