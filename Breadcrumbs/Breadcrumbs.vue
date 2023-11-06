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
})

const breadcrumbEls = ref<(Element | ComponentPublicInstance | null)[]>([])

const breadcrumbsDivEl = ref<HTMLElement>()
const { width: breadcrumbsDivWidth } = useElementSize(breadcrumbsDivEl)

const slotAppendEl = ref<HTMLElement>()
const { width: slotAppendWidth } = useElementSize(slotAppendEl)

const breadcrumbsWidthByIndex = ref<number[]>([])

function calculateAvailableWidth() {
  return floor(breadcrumbsDivWidth.value - slotAppendWidth.value - 4)
}

const isMounted = ref(false)
const isBreadcrumbVisibleByIndex = computed(() => {
  if (!isMounted.value) {
    return Array(breadcrumbs.value.length).fill(true)
  }

  let result = Array(breadcrumbs.value.length).fill(true)
  let visibleBreadcrumbsWidth = breadcrumbsWidthByIndex.value.reduce(
    (a: number, b: number) => a + b,
    0
  )

  // 61px = hidden breadcrumbs btn width
  while (visibleBreadcrumbsWidth > calculateAvailableWidth() - 61) {
    const { b, index } = hideTheRightBreadcrumb(result)
    result = b
    if (index === undefined) {
      break
    }
    visibleBreadcrumbsWidth -= breadcrumbsWidthByIndex.value[index]
  }

  return result
})

const isAnyBreadcrumbHidden = computedEager(() => {
  return isBreadcrumbVisibleByIndex.value.includes(false)
})

const hiddenBreadcrumbs = computedEager(() => {
  return breadcrumbs.value.filter(
    (_, index) => !isBreadcrumbVisibleByIndex.value[index]
  )
})

onMounted(() => {
  setTimeout(() => {
    // calculate breadcrumbs width
    for (const [index, breadcrumb] of breadcrumbs.value.entries()) {
      const breadcrumbEl = breadcrumbEls.value[
        breadcrumbs.value.indexOf(breadcrumb)
      ] as HTMLElement

      if (breadcrumbEl) {
        breadcrumbsWidthByIndex.value[index] =
          breadcrumbEl.offsetWidth + (index === 0 ? 0 : 4) // 4px for gap
      }
    }

    isMounted.value = true
  }, 100)
})

function hideTheRightBreadcrumb(b: boolean[]) {
  if (b.length <= 2) {
    return { b }
  }

  const index = b.findIndex(
    (value, i) => i !== 0 && i !== b.length - 1 && value === true
  )

  if (index === -1) {
    return { b }
  }

  b[index] = false

  return { b, index }
}
</script>

<template>
  <div class="breadcrumbs-wrapper">
    <div
      ref="breadcrumbsDivEl"
      class="breadcrumbs"
      :class="{
        'absolute invisible': !isMounted, // to calculate widths right after mounting
      }"
    >
      <template
        v-for="(breadcrumb, index) in breadcrumbs"
        :key="breadcrumb.to"
      >
        <div
          v-if="isBreadcrumbVisibleByIndex![index]"
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

          <!-- Hidden breadcrumbs btn -->
          <span
            v-if="isAnyBreadcrumbHidden && index === 0"
            flex
            items-center
            p-l-1
          >
            <span
              :class="BUTTON_PRESET.CHEVRON_RIGHT.icon"
              class="breadcrumb-item"
            />
            <HiddenBreadcrumbsBtn :breadcrumbs="hiddenBreadcrumbs" />
          </span>
        </div>
      </template>
      <div ref="slotAppendEl">
        <slot name="append" />
      </div>
    </div>
    <!-- margin is for breadcrumb measuring purpose (in breadcrumbs absolute stays on the left) -->
    <div m-l-a>
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
