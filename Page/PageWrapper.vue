<script setup lang="ts">
import { config } from '~/config'

type IProps = {
  pad?: boolean
  loading?: boolean
  title?: string
  includeTopBar?: boolean
}

withDefaults(defineProps<IProps>(), {
  pad: true,
  includeTopBar: true,
})

const mounted = ref(false)

onMounted(() => {
  setTimeout(() => (mounted.value = true), 250)
})
</script>

<template>
  <main
    class="page-wrapper"
    :class="{
      'is-scrollable': $route.meta.isPageScrollable,
      'is-mounted': mounted,
      'is-padded': pad,
    }"
  >
    <!-- TopBar -->
    <Component
      :is="config.pageWrapper.topBar"
      v-if="includeTopBar && config.pageWrapper.topBar"
    >
      <template #title-left>
        <slot name="title-left" />
      </template>

      <template
        v-if="title"
        #title
      >
        <h2 font-700>{{ title }}</h2>
      </template>

      <template #title-right>
        <slot name="title-right" />
      </template>
    </Component>
    <slot v-if="!loading" />

    <slot
      v-else
      name="loading"
    >
      <div
        flex="~ center"
        fit
      >
        <Loader />
      </div>
    </slot>
  </main>
</template>

<style lang="scss" scoped>
.page-wrapper {
  --apply: ease-out overflow-auto grow p-3;

  &.is-mounted {
    --apply: transition-padding-250 transition-margin-250;
  }

  &:not(.is-scrollable) {
    --apply: overflow-auto flex flex-col;
  }

  &.is-padded {
    --apply: m-t-$navHeight;
  }
}

.page-drawer.is-open.page-drawer--left ~ .page-wrapper {
  margin-left: calc(var(--drawerLeftMiniWidth));
}

.page-drawer.is-open.page-drawer--left:not(.is-absolute):not(.is-mini)
  ~ .page-wrapper {
  margin-left: calc(var(--drawerLeftWidth));
}

.page-drawer.is-open.page-drawer--right ~ .page-wrapper {
  padding-right: var(--drawerRightMiniWidth);
}

.page-drawer.is-open.page-drawer--right:not(.is-absolute):not(.is-mini)
  ~ .page-wrapper {
  padding-right: var(--drawerRightWidth);
}
</style>
