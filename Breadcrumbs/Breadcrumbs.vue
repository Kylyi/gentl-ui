<script setup lang="ts">
// CONSTANTS
import { BUTTON_PRESET } from '~/components/Button/constants/button-preset.constant'

const breadcrumbsInjected = injectStrict(breadcrumbsKey, ref([]))

const breadcrumbs = computed(() => {
  return [
    { icon: 'material-symbols:home-rounded', to: $p('/') },
    ...breadcrumbsInjected.value,
  ]
    .flatMap(breadcrumb => [breadcrumb, 'splitter'])
    .slice(0, -1)
})
</script>

<template>
  <div class="breadcrumbs-wrapper">
    <div class="breadcrumbs">
      <template
        v-for="breadcrumb in breadcrumbs"
        :key="breadcrumb.to"
      >
        <!-- CHEVRON -->
        <span
          v-if="typeof breadcrumb === 'string'"
          :class="BUTTON_PRESET.CHEVRON_RIGHT.icon"
        />

        <Btn
          v-else
          v-bind="breadcrumb"
          no-active-link
          color="!dark !dark:light"
          size="sm"
          no-uppercase
        />
      </template>
    </div>

    <slot name="right" />
  </div>
</template>

<style lang="scss">
.breadcrumbs {
  --apply: flex grow flex-gap-x-1 items-center text-sm m-t-2 m-b-1;

  &-wrapper {
    --apply: flex flex-gap-x-1 items-center;
  }
}

.main-bar .breadcrumbs {
  --apply: m-t-0;
}
</style>
