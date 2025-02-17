<script setup lang="ts">
import { config } from '~/components/config/components-config'

// Functions
import { getComponentProps } from '~/components/__helpers/get-config-props'

// Types
import type { IPageWrapperProps } from '~/components/Page/types/page-wrapper-props.type'

withDefaults(defineProps<IPageWrapperProps>(), {
  ...getComponentProps('pageWrapper'),
})

// Utils
const route = useRoute()
const { isMobile } = useMobile()

// Layout
const mounted = ref(false)

const topBarComponent = computed(() => {
  if (config.pageWrapper?.topBar) {
    return typeof config.pageWrapper.topBar === 'function'
      ? config.pageWrapper.topBar()
      : config.pageWrapper.topBar
  }

  return undefined
})

onMounted(() => {
  setTimeout(() => (mounted.value = true), 250)
})
</script>

<template>
  <main
    class="page-wrapper"
    :class="{
      'is-scrollable': route.meta.isPageScrollable,
      'is-mounted': mounted,
      'is-padded': pad,
      'is-mobile': isMobile,
      'move-content': moveContent,
    }"
  >
    <!-- TopBar -->
    <Component
      :is="topBarComponent"
      v-if="includeTopBar && topBarComponent"
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

    <!-- Breadcrumbs -->
    <Breadcrumbs v-if="breadcrumbs">
      <template #above>
        <slot name="breadcrumbs-above" />
      </template>

      <template #below>
        <slot name="breadcrumbs-below" />
      </template>

      <template #append>
        <slot name="breadcrumbs-append" />
      </template>

      <template #right>
        <slot name="breadcrumbs-right" />
      </template>
    </Breadcrumbs>

    <!-- Content -->
    <div
      class="page-wrapper__content"
      :class="contentClass"
    >
      <PageTitle
        :title
        :ui
      >
        <template
          v-if="$slots['title-left']"
          #title-left
        >
          <slot name="title-left" />
        </template>

        <template
          v-if="$slots['title-prepend']"
          #title-prepend
        >
          <slot name="title-prepend" />
        </template>

        <template
          v-if="$slots.title"
          #default
        >
          <slot name="title" />
        </template>

        <template
          v-if="$slots['title-append']"
          #title-append
        >
          <slot name="title-append" />
        </template>

        <template
          v-if="$slots['title-right']"
          #title-right
        >
          <slot name="title-right" />
        </template>

        <template
          v-if="$slots['title-below']"
          #title-below
        >
          <slot name="title-below" />
        </template>
      </PageTitle>

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
  @apply ease-out grow z-$zPageWrapper;
  @apply p-$PageWrapper-padding bg-$PageWrapper-bg;

  &.is-mounted {
    transition:
      padding 250ms ease-out,
      margin 250ms ease-out,
      transform 250ms ease-out;
  }

  &:not(.is-scrollable) {
    @apply overflow-auto flex flex-col;
  }

  &.is-padded {
    @apply m-t-$navHeight;
  }

  &__content {
    @apply flex flex-col grow overflow-auto;
    @apply p-$PageWrapper-content-padding bg-$PageWrapper-content-bg rounded-$PageWrapper-content-rounded;
  }
}

.page-drawer.is-open.page-drawer--left.is-mini ~ .page-wrapper {
  margin-left: calc(var(--drawerLeftMiniWidth));
}

.page-drawer.is-open.page-drawer--left:not(.is-absolute):not(.is-mini) ~ .page-wrapper {
  &.is-mobile.move-content {
    transform: translateX(calc(var(--drawerLeftWidth) - var(--drawerLeftMiniWidth)));
  }

  &:not(.is-mobile),
  &.is-mobile:not(.move-content) {
    margin-left: calc(var(--drawerLeftWidth));
  }
}

.page-drawer.is-open.page-drawer--right ~ .page-wrapper {
  padding-right: var(--drawerRightMiniWidth);
}

.page-drawer.is-open.page-drawer--right:not(.is-absolute):not(.is-mini) ~ .page-wrapper {
  padding-right: var(--drawerRightWidth);
}
</style>
