<script setup lang="ts">
import { config } from '~/config'

// Types
import type { IPageWrapperProps } from '~/components/Page/types/page-wrapper-props.type'

withDefaults(defineProps<IPageWrapperProps>(), {
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
    </Component>

    <!-- Content -->
    <div
      class="page-wrapper__content"
      :class="contentClass"
    >
      <slot name="title-left" />

      <slot name="title">
        <template v-if="title">
          <div
            class="page-title"
            :class="{
              'has-shadow':
                ui?.titleWithShadow || config.pageWrapper?.ui?.titleWithShadow,
            }"
          >
            <h4 class="page-title__text">
              {{ title }}

              <slot name="title-append" />
            </h4>

            <slot name="title-right" />
          </div>
        </template>
      </slot>

      <slot
        v-if="!loading"
        p="r-2!"
      />
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
  --apply: ease-out grow z-$zPageWrapper p-$PageWrapper-padding;

  &.is-mounted {
    transition: padding 250ms ease-out, margin 250ms ease-out;
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

  &__content {
    --apply: flex flex-col grow p-$PageWrapper-content-padding overflow-auto;
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

.page-title {
  --apply: flex gap-2 p-x-4 md:(p-y-4 p-x-2) max-w-screen-lg m-b-2 p-b-1;

  &__text {
    --apply: grow font-700;
  }

  &.has-shadow {
    box-shadow: 0 8px 8px -9px theme('colors.truegray.300');
  }
}

.dark .page-title {
  &.has-shadow {
    box-shadow: 0 8px 8px -9px theme('colors.truegray.700');
  }
}
</style>
