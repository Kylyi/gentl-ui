<script setup lang="ts">
import { config } from '~/components/config/components-config'

// Constants
import { BUTTON_PRESET } from '~/components/Button/constants/button-preset.constant'

const breadcrumbsInjected = injectStrict(breadcrumbsKey, ref([]))

const breadcrumbs = computed(() => {
  return [
    {
      icon: 'lucide:home',
      to: $p(config.breadcrumbs.homePath || '/'),
    },
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
        v-for="(breadcrumb, idx) in breadcrumbs"
        :key="`${breadcrumb.to}-${idx}`"
      >
        <!-- Chevron -->
        <span
          v-if="typeof breadcrumb === 'string'"
          :class="BUTTON_PRESET.CHEVRON_RIGHT.icon"
          class="breadcrumb-item"
        />

        <Btn
          v-else
          v-bind="breadcrumb"
          no-active-link
          color="!dark !dark:light"
          size="sm"
          class="breadcrumb-item"
          :class="{
            'is-last': breadcrumb === breadcrumbs[breadcrumbs.length - 1],
          }"
          :no-dim="breadcrumb === breadcrumbs[breadcrumbs.length - 1]"
          no-uppercase
        />
      </template>

      <slot name="append" />
    </div>

    <slot name="right" />
  </div>
</template>

<style lang="scss">
.breadcrumbs {
  --apply: flex grow flex-gap-x-1 items-center text-sm m-t-2 m-b-1;

  &-wrapper {
    --apply: flex flex-gap-x-1 items-center md:p-x-3;
    --apply: bg-$Breadcrumbs-bg;
  }
}

@screen lt-lg {
  .breadcrumbs > .breadcrumb-item {
    --apply: hidden;

    &.is-last {
      --apply: flex;
    }
  }
}

.main-bar .breadcrumbs {
  --apply: m-t-0;
}
</style>
