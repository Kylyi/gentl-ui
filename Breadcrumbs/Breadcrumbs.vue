<script setup lang="ts">
import { config } from '~/config'

// Constants
import { BUTTON_PRESET } from '~/components/Button/constants/button-preset.constant'

const breadcrumbsInjected = injectStrict(breadcrumbsKey, ref([]))

const breadcrumbs = computed(() => {
  return [
    {
      icon: 'material-symbols:home-rounded',
      to: $p(config.breadcrumbs.homePath || '/'),
    },
    ...breadcrumbsInjected.value,
  ]
  // .flatMap(breadcrumb => [breadcrumb, 'splitter'])
  // .slice(0, -1)
})

// Refs for breadcrumb container and items
const breadcrumbsWrapperEl = ref<HTMLElement>()
const breadcrumbEls = ref<(Element | ComponentPublicInstance | null)[]>([])
const slotRightEl = ref<HTMLElement>()
const slotAppendEl = ref<HTMLElement>()

// Widths
const { width: containerWidth } = useElementSize(breadcrumbsWrapperEl)
const { width: slotRightWidth } = useElementSize(slotRightEl)
const { width: slotAppendWidth } = useElementSize(slotAppendEl)
const slotsWidth = computed(() => {
  return floor(slotRightWidth.value + slotAppendWidth.value)
})
const breadcrumbsAvaiableWidth = computed(() => {
  return containerWidth.value - slotsWidth.value
})

// Calculate visible breadcrumbs
const isBreadcrumbVisibleByIndex = ref<boolean[]>([])
const breadcrumbsWidthByIndex = ref<number[]>([])

onMounted(() => {
  setTimeout(() => {
    for (const [index, breadcrumb] of breadcrumbs.value.entries()) {
      isBreadcrumbVisibleByIndex.value[index] = true
      const breadcrumbEl = breadcrumbEls.value[
        breadcrumbs.value.indexOf(breadcrumb)
      ] as HTMLElement

      if (breadcrumbEl) {
        breadcrumbsWidthByIndex.value[index] =
          breadcrumbEl.offsetWidth + (index === 0 ? 0 : 4) // 4px for gap
      }
    }
  }, 1)
})
</script>

<template>
  {{ containerWidth }}
  <br />
  slotsWidth: {{ slotsWidth }}
  <br />
  breadCrumbsAvaiableWidth: {{ breadcrumbsAvaiableWidth }}
  <br />
  {{ breadcrumbsWidthByIndex }}
  {{ breadcrumbsWidthByIndex.reduce((a, b) => a + b, 0) }}
  <br />
  visible breadcrumbs by index {{ isBreadcrumbVisibleByIndex }}

  <div
    ref="breadcrumbsWrapperEl"
    class="breadcrumbs-wrapper"
  >
    <div class="breadcrumbs">
      <template
        v-for="(breadcrumb, index) in breadcrumbs"
        :key="breadcrumb.to"
      >
        <div
          :ref="
            el => {
              breadcrumbEls[index] = el
            }
          "
          flex
          flex-col
          items-center
        >
          <!-- Chevron -->
          <span
            v-if="index !== 0"
            :class="BUTTON_PRESET.CHEVRON_RIGHT.icon"
            class="breadcrumb-item"
          />

          <Btn
            v-bind="breadcrumb"
            no-active-link
            color="!dark !dark:light"
            size="sm"
            class="breadcrumb-item"
            :class="{
              'is-last': breadcrumb === breadcrumbs[breadcrumbs.length - 1],
            }"
            no-uppercase
          />
        </div>
      </template>
      <div ref="slotAppendEl">
        <slot name="append" />
      </div>
    </div>
    <div ref="slotRightEl">
      <slot name="right" />
    </div>
  </div>
</template>

<style lang="scss">
.breadcrumbs {
  --apply: flex grow flex-gap-x-1 items-center text-sm m-t-2 m-b-1;

  &-wrapper {
    --apply: flex flex-gap-x-1 items-center;
  }
}

@screen lt-lg {
  .breadcrumbs > .breadcrumb-item {
    --apply: display-none;

    &.is-last {
      --apply: display-flex;
    }
  }
}

.main-bar .breadcrumbs {
  --apply: m-t-0;
}
</style>
