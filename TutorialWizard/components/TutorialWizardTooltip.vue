<script setup lang="ts">
// Functions
import { arrow, flip, offset, shift, useFloating } from '@floating-ui/vue'
import { useWizardOverlay } from '../functions/useWizardOverlay';
import { getTargetElement } from '~/components/Tooltip/functions/getTargetElement';

// Models
import type { TutorialWizardStep } from '../models/tutorial-wizard-step.model'
import type { TutorialWizardModel } from '../models/tutorial-wizard.model';

const props = defineProps<{
  step: TutorialWizardStep
  wizard: TutorialWizardModel
  noArrow?: boolean
  delay?: [number, number]
}>()

// Utils
const referenceEl = ref<HTMLElement | null>(null)
const { updateOverlayClip } = useWizardOverlay(referenceEl)

  // Layout
const tooltipEl = ref<HTMLElement>()
const arrowEl = ref<HTMLDivElement>()
const middleware = computed(() => [
  offset(props.step.offset),
  flip(),
  shift(),
  ...(props.noArrow ? [] : [arrow({ element: arrowEl, padding: 4 })]),
])
const stepPlacement = computed(() => props.step.placement)
const isLastStep = computed(() => {
  return props.wizard.currentStep === props.wizard.steps.length - 1
})

const { floatingStyles, placement, middlewareData, update } = useFloating(
  referenceEl,
  tooltipEl,
  {
    placement: stepPlacement,
    middleware,
    strategy: 'fixed',
  },
)

// We react to page resize/scroll to reposition the floating UI
const {
  x: pageX,
  y: pageY,
} = useElementBounding(referenceEl, { windowResize: true })

watchThrottled([pageX, pageY], update, {
  throttle: 1,
})

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
watch(() => props.step.id, () => {
    referenceEl.value = getTargetElement(props.step.element)
    scrollToElement(),
    nextTick(() => {
      updateOverlayClip()
    })
  },
  { immediate: true },
)

function scrollToElement() {
  // Doesn't work without a timeout, not sure why
  setTimeout(() => {
    referenceEl.value?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })

  }, 10)
}

// Update overlay clip
onMounted(() => {
  nextTick(() => {
    referenceEl.value = getTargetElement(props.step.element)
    updateOverlayClip()
  })
})
watch(() => props.step, () => {
  nextTick(() => {
    referenceEl.value = getTargetElement(props.step.element)
    updateOverlayClip()
  })
})

// goForwardOn
whenever(() => !!props.step.goForwardOn, () => {
  const goForwardOnElement = getTargetElement(props.step.goForwardOn?.element)

  useMutationObserver(
    goForwardOnElement,
    () => { console.log('Mutation')},
    { attributes: true, subtree: true})
})
</script>

<template>
  <Teleport to="body">
    <div
      class="tutorial-overlay"
      @click.prevent.stop
    />

    <div
      ref="tooltipEl"
      :style="floatingStyles"
      class="tooltip"
      :placement
      v-bind="$attrs"
      @wheel.prevent.stop
      @touchmove.prevent.stop
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
                  {{ step.id + 1 }}/{{ wizard.steps.length }}
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
            <ScrollArea class="tooltip-content__message">
              <p >
                {{ step.message }}
              </p>
            </ScrollArea>
          </slot>
        </div>

        <TutorialWizardStepper :wizard />

        <div class="tooltip-controls">
          <!-- Back -->
          <Btn
            :disabled="step.id === 0"
            :label="$t('onboarding.back')"
            :ripple="false"
            color="blue-500"
            outlined
            no-uppercase
            @click="wizard.goToPreviousStep()"
          />

          <!-- Next/Close -->
          <Btn
            :label="isLastStep ? $t('general.close') : $t('onboarding.next')"
            :ripple="false"
            color="white"
            bg-blue-500
            no-uppercase
            @click="wizard.goToNextStep()"
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
  @apply dark:bg-darker bg-white border-ca border-custom rounded-custom z-$zMenu p-x-4 p-y-2
    max-w-100 xl:min-w-100;

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
      @apply color-slate-950 dark:color-white font-light text-base max-h-50 grow;
    }
  }

  &-controls {
    @apply flex justify-end gap-2 p-t-4 p-b-3;
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
