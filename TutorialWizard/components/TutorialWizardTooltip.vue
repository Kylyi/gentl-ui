<script setup lang="ts">
// Functions
import { arrow, flip, offset, shift, useFloating } from '@floating-ui/vue'
import { useWizardOverlay } from '../functions/useWizardOverlay';

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
  offset?: OffsetOptions
  noArrow?: boolean
  delay?: [number, number]
  isLastStep?: boolean
}>()

const emit = defineEmits<{
  nextStep: [],
  previousStep: [],
}>()

// Utils
const highlightedElement = ref<HTMLElement | null>(null)
const { updateOverlayClip } = useWizardOverlay(highlightedElement)

  // Layout
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
    placement: props.step.placement,
    middleware,
    strategy: 'fixed',
  },
)

watch(() => props.step, () => {
  if (tooltipEl.value) {
    tooltipEl.value.scrollIntoView({
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
    referenceEl.value = getTargetElement(props.step.element)
    referenceEl.value?.classList.add('has-tooltip')

    referenceEl.value?.addEventListener('mouseenter', () => {
      referenceEl.value?.classList.add('tooltip-hovered')
    })

    referenceEl.value?.addEventListener('mouseleave', () => {
      referenceEl.value?.classList.remove('tooltip-hovered')
    })

    highlightedElement.value = referenceEl.value as HTMLElement
    updateOverlayClip()
  })
})

watch(() => props.step, () => {
  nextTick(() => {
    referenceEl.value = getTargetElement(props.step.element)
    highlightedElement.value = referenceEl.value as HTMLElement
    updateOverlayClip()
  })
})

// goForwardOn
whenever(() => !!props.step.goForwardOn, () => {
  console.log('goForwardOn', props.step.goForwardOn)
  const goForwardOnElement = getTargetElement(props.step.goForwardOn?.element)
  console.log('goForwardOnElement', goForwardOnElement)

  const observer = new MutationObserver(args => console.log(args))

  observer.observe(
    goForwardOnElement,
    {
      subtree: true,
      characterData: true,
      characterDataOldValue: true,
    }
  )
})
</script>

<template>
  <Teleport to="body">
    <div
      class="tutorial-overlay"
      @click.prevent.stop
      @wheel.prevent.stop
      @touchmove.prevent.stop
    />

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

      <slot>
        <h3>{{ step.heading }}</h3>
        <p>{{ step.message }}</p>
        <div>
          <Btn
            @click="emit('previousStep')"
            :disabled="step.id === 0"
            >
            Previous
          </Btn>

          <Btn @click="emit('nextStep')">
            {{ isLastStep ? 'Finish' : 'Next' }}
          </Btn>
        </div>
        </slot>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.tutorial-overlay {
  @apply fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 cursor-not-allowed overflow-hidden touch-none;

  z-index: calc(var(--zMenu) - 1);

  transition: 0.3s ease;
}

.tooltip {
  @apply dark:bg-darker bg-white border-ca border-custom rounded-custom
    z-$zMenu;

  @apply font-size-$Tooltip-font-size color-$Tooltip-font-color;

  transition: 0.3s ease;
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
