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

const { isMobile, isSidebarOpen } = useMobile()

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
      'is-mobile-and-sidebar-open': isMobile && isSidebarOpen,
    }"
  >
    <!-- TopBar -->
    <Component
      :is="config.pageWrapper.topBar"
      v-if="includeTopBar && config.pageWrapper.topBar"
    >
      <template #breadcrumbs-above>
        <slot name="breadcrumbs-above" />
      </template>

      <template #breadcrumbs-below>
        <slot name="breadcrumbs-below" />
      </template>

      <template #breadcrumbs-append>
        <slot name="breadcrumbs-append" />
      </template>

      <template #title-left>
        <slot name="title-left" />
      </template>

      <template
        v-if="title"
        #title
      >
        <slot name="title">
          <h4
            text="h4"
            font-700
            m="b-0"
          >
            {{ title }}

            <slot name="title-append" />
          </h4>
        </slot>
      </template>

      <template #title-right>
        <slot name="title-right" />
      </template>
    </Component>
    <div p-x-3>
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
    </div>
  </main>
</template>

<style lang="scss" scoped>
.page-wrapper {
  --apply: ease-out overflow-auto grow z-$zPageWrapper;

  &.is-mounted {
    --apply: transition-padding-250 transition-margin-250;
  }

  &:not(.is-scrollable) {
    --apply: overflow-auto flex flex-col;
  }

  &.is-padded {
    --apply: m-t-$navHeight;
  }

  &.is-mobile-and-sidebar-open {
    --apply: overflow-x-hidden rounded-l-2 p-r-0;
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
