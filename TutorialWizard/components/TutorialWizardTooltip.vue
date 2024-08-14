<script setup lang="ts">
// Functions
import { arrow, flip, offset, shift, useFloating } from '@floating-ui/vue'

// Models
import type { TutorialWizardStep } from '../models/tutorial-wizard-step.model'

// Types
import type {
  OffsetOptions,
  Placement,
  ReferenceElement,
} from '@floating-ui/dom'

const props = defineProps<{
  step: TutorialWizardStep
  referenceTarget: any
  placement: Placement
  offset?: OffsetOptions
  noArrow?: boolean
  delay?: [number, number]
}>()

  // Layout
const model = defineModel({ default: false })
const tooltipEl = ref<HTMLElement>()
const referenceEl = ref<Element>() // Element that menu is attached to
const arrowEl = ref<HTMLDivElement>()
const middleware = ref([
  offset(props.offset),
  flip(),
  shift(),
  ...(props.noArrow ? [] : [arrow({ element: arrowEl, padding: 4 })]),
])

const { floatingStyles, placement, middlewareData } = useFloating(
  referenceEl,
  tooltipEl,
  {
    placement: props.placement,
    middleware,
    strategy: 'fixed',
  },
)

watch(() => props.step, () => {
  if (tooltipEl.value) {
    tooltipEl.value.$el.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }
}, { immediate: true })

const instance = getCurrentInstance()

function getTargetElement(target: any): any {
  if (!import.meta.client) {
    return
  }

  // Target is an element
  if (target instanceof Element) {
    return target as Element
  }

  // Target is a selector
  else if (typeof target === 'string') {
    return document?.querySelector(target) || document?.body || undefined
  }

  // Target is Vue component
  else if (target) {
    const el = unrefElement(target)

    if (el) {
      return el
    }
  }

  return instance?.vnode.el?.parentNode
}

onMounted(() => {
  nextTick(() => {
    referenceEl.value = getTargetElement(props.referenceTarget)
    referenceEl.value && referenceEl.value.classList.add('has-tooltip')

    referenceEl.value?.addEventListener('mouseenter', () => {
      referenceEl.value && referenceEl.value.classList.add('tooltip-hovered')

      setTimeout(() => {
        const isStillInside
          = referenceEl.value?.classList.contains('tooltip-hovered')

        if (isStillInside) {
          model.value = true
        }
      }, props.delay?.[0] || 0)
    })

    referenceEl.value?.addEventListener('mouseleave', () => {
      referenceEl.value && referenceEl.value.classList.remove('tooltip-hovered')

      setTimeout(() => {
        const isStillInside
          = referenceEl.value?.classList.contains('tooltip-hovered')

        if (!isStillInside) {
          model.value = false
        }
      }, props.delay?.[1] || 0)
    })
  })
})
</script>

<template>
  <Teleport to="body">
    <div
      ref="tooltipEl"
      :style="floatingStyles"
      class="tooltip"
      p="x-2 y-1"
      :placement="placement"
      v-bind="$attrs"
    >
      <!-- Arrow -->
      <div
        v-if="!noArrow"
        ref="arrowEl"
        class="arrow"
      />

      <slot />
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.tooltip {
  @apply dark:bg-darker bg-white border-ca border-custom rounded-custom
    z-$zMenu;

  @apply font-size-$Tooltip-font-size color-$Tooltip-font-color;
}

.arrow {
  @apply absolute w-2 h-2 rotate-45 dark:bg-darker bg-white;

  &.has-header {
    @apply bg-white dark:bg-darker;
  }
}

.tooltip[placement^='top'] > .arrow {
  @apply bottom--5px border-b-custom border-r-custom border-ca;
}

.tooltip[placement^='bottom'] > .arrow {
  @apply top--5px border-t-custom border-l-custom border-ca;
}

.tooltip[placement^='left'] > .arrow {
  @apply right--5px border-r-custom border-t-custom border-ca;
}

.tooltip[placement^='right'] > .arrow {
  @apply left--5px border-l-custom border-b-custom border-ca;
}
</style>
