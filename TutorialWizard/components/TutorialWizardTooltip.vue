<script setup lang="ts">
// Functions
import { arrow, flip, offset, shift, useFloating } from '@floating-ui/vue'
import { useWizardOverlay } from '../functions/useWizardOverlay';

// Models
import type { TutorialWizardStep } from '../models/tutorial-wizard-step.model'
import type { TutorialWizardModel } from '../models/tutorial-wizard.model';

// Types
import type {
  OffsetOptions,
  Placement,
  ReferenceElement,
} from '@floating-ui/dom'

const props = defineProps<{
  step: TutorialWizardStep
  wizard: TutorialWizardModel
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

// Arrow placement
watch(middlewareData, middlewareData => {
  if (middlewareData.arrow) {
    const { x, y } = middlewareData.arrow

    Object.assign(arrowEl.value!.style, {
      left: x != null ? `${x}px` : '',
      top: y != null ? `${y}px` : '',
    })
  }
})

// Scroll to step
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
  const goForwardOnElement = getTargetElement(props.step.goForwardOn?.element)
  console.log('goForwardOnElement', goForwardOnElement)

  useMutationObserver(goForwardOnElement, () => {
  console.log('Mutation')
}, { characterData: true, subtree: true})
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
        <!-- Header -->
         <slot name="header">
           <div class="tooltip-header">
              <!-- Step counter -->
              <slot name="step-counter">
                <p class="tooltip-step-counter">
                  {{ step.id }}/{{ wizard.steps.length }}
                </p>
              </slot>

              <!-- Close btn -->
               <slot name="close-btn">
                <Btn
                  icon="i-ion:close"
                  color="slate-600 dark:white"
                  size="sm"
                  no-hover-effect
                  @click="wizard.endTour()"
                />
              </slot>
          </div>
        </slot>

        <div class="tooltip-content">
          <!-- Heading -->
          <slot name="heading">
            <p class="tooltip-content__heading">
              {{ step.heading }}
            </p>
          </slot>

          <!-- Message -->
          <slot name="message">
            <p class="tooltip-content__message">
              {{ step.message }}
            </p>
          </slot>
        </div>

        <div class="tooltip-controls">
          <Btn
            :disabled="step.id === 0"
            :label="$t('onboarding.back')"
            :ripple="false"
            outlined
            color="blue-500"
            @click="emit('previousStep')"
          />

          <Btn
            :label="isLastStep ? $t('onboarding.finish') : $t('onboarding.next')"
            :ripple="false"
            color="white"
            bg-blue-500
            @click="emit('nextStep')"
          />
        </div>
      </slot>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.tutorial-overlay {
  @apply fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 cursor-not-allowed overflow-hidden touch-none p-4;

  z-index: calc(var(--zMenu) - 1);

  transition: 0.3s ease;
}

.tooltip {
  @apply dark:bg-darker bg-white border-ca border-custom rounded-custom z-$zMenu p-x-4;

  @apply font-size-$Tooltip-font-size color-$Tooltip-font-color;

  transition: 0.3s ease;

  &-header {
    @apply flex justify-between items-center p-y-1
  }

  &-step-counter {
    @apply text-xs font-light color-slate-600 dark:color-white;
  }

  &-content {
    @apply flex flex-col gap-5;

    &__heading {
      @apply color-slate-950 dark:color-white font-semibold text-xl;
    }

    &__message {
      @apply color-slate-950 dark:color-white font-light text-base;
    }
  }

  &-controls {
    @apply flex justify-end gap-2 p-t-4 p-b-5;
  }
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
