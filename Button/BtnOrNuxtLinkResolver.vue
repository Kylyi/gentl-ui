<script setup lang="ts">
// FIXME: This solution is not optimal... The proper way would be to import the
// `NuxtLink` component from `#components` and use <component :is="..." />
// approach to create the component but for some reason, once `NuxtLink` is
// imported, imports in the parent component (<Btn />) of preset get broken
// Probably Nuxt bug

import type { IBtnNavigationProps } from '~/components/Button/types/btn-props.type'

const props = defineProps<IBtnNavigationProps>()

// Utils
const nuxtApp = useNuxtApp()
const route = useRoute()

const toPathString = computed(() => {
  const to = props.to

  if (typeof to === 'string') {
    return to
  }

  if (typeof to === 'object' && 'path' in to) {
    return to.path
  }

  return ''
})

const currentPath = computed(() => {
  return $p(route.path, nuxtApp.$i18n.locale.value)
})
</script>

<template>
  <NuxtLink
    v-if="to && !disabled"
    :to="to"
    :external="external"
    :target="external || download ? '_blank' : navigateToOptions?.open?.target"
    :download="download || undefined"
    :class="{
      'router-link-active': !exact && toPathString.startsWith(currentPath),
      'no-active': noActiveLink,
      'no-underline': noUnderline,
    }"
  >
    <slot />
  </NuxtLink>

  <button
    v-else
    :type="type"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<style lang="scss" scoped>
a.btn:not(.no-underline):hover {
  @apply underline;
}

.no-active {
  @apply color-black dark:color-white;
}
</style>
