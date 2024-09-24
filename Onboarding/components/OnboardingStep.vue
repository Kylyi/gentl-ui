<script setup lang="ts">
// Functions
import { arrow, flip, offset, shift, useFloating } from '@floating-ui/vue'
import { useOnboardingOverlay } from '../functions/useOnboardingOverlay';
import { getTargetElement, isNestedElement } from '~/components/Tooltip/functions/element-functions';

// Store
import { useOnboardingStore } from '~/components/Onboarding/functions/onboarding.store'
import { useAppStore } from '~/libs/App/app.store'

// Types
import type { OnboradingStepProps } from '~/components/Onboarding/types/onborading-step-props.type';

const props = defineProps<OnboradingStepProps>()

// Utils
const referenceEl = ref<HTMLElement | null>(null)
const {
  updateOverlayClip,
  pauseOverlay,
  resumeOverlay
} = useOnboardingOverlay(toRef(props, 'step'))
const {
  width: windowWidth,
  height: windowHeight
} = useWindowSize()
const onboardingStore = useOnboardingStore()

  // Layout
const tooltipEl = ref<HTMLElement>()
const arrowEl = ref<HTMLDivElement>()
const middleware = computed(() => [
  offset(props.step.offset),
  flip({
    fallbackPlacements: props.step.fallbackPlacements
  }),
  shift(),
  arrow({ element: arrowEl, padding: 4 }),
])
const stepPlacement = computed(() => props.step.placement)
const isLastStep = computed(() => {
  return props.onboarding.currentStep === props.onboarding.steps.length - 1
})

const {
  floatingStyles,
  placement,
  middlewareData,
  update: updateTooltipPosition
} = useFloating(
  referenceEl,
  tooltipEl,
  {
    placement: stepPlacement,
    middleware,
    strategy: 'fixed',
  },
)

// We react to page resize/scroll and el size to reposition the floating UI
const {
  x: elX,
  y: elY,
  width: elWidth,
  height: elHeight,
} = useElementBounding(referenceEl, { windowResize: true })

const {
  width: tooltipWidth,
  height: tooltipHeight,
} = useElementBounding(tooltipEl, { windowResize: true })

watchThrottled([elX, elY, elWidth, elHeight], updateTooltipPosition, {
  throttle: 1,
})

// Arrow placement
watch(middlewareData, middlewareData => {
  if(!arrowEl.value){
    return
  }
  if (middlewareData.arrow) {
    const { x, y } = middlewareData.arrow

    Object.assign(arrowEl.value.style, {
      left: x != null ? `${x}px` : '',
      top: y != null ? `${y}px` : '',
    })
  }
})

// Absolute positioning
const tooltipStyles = computed(() => [
  floatingStyles.value,
  props.step.positioning === 'absolute' && {
    left: `${windowWidth.value/2 - tooltipWidth.value/2}px !important`,
    top: `${windowHeight.value/2 - tooltipHeight.value/2}px !important`,
    transform: 'translate(0, 0) !important',
  }
])

// Lifecycle
watch(() => props.step.id, () => {
    referenceEl.value = getTargetElement(props.step.element)
    scrollToElement(),
    nextTick(() => {
      updateOverlayClip()

      if(props.step.goForwardOn?.targets){
        resumeEventHandler()
      }
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

// KeyBoard controlls
onKeyStroke('ArrowLeft', () => {
  if(props.step.canUseKeyboard){
    props.onboarding.goToPreviousStep()
  }
})
onKeyStroke('ArrowRight', () => {
  if(props.step.canUseKeyboard){
    props.onboarding.goToNextStep()
  }
})
onKeyStroke('Escape', () => {
  if(props.step.canUseKeyboard){
    props.onboarding.skipTour()
  }
})

// Event listener handler
const {
  stop: stopEventHandler,
  resume: resumeEventHandler,
  pause: pauseEventHandler
} = watchPausable(
  () => onboardingStore.lastEvent,
  handleGoForwardOn
)

onMounted(() => {
  if (!!props.step.goForwardOn?.targets){
    nextTick(resumeEventHandler)
  }
})

onUnmounted(() => {
  stopEventHandler()
  onboardingStore.stopEventListener()
})

// GoForwardOn
function handleGoForwardOn() {
  if(!props.step.goForwardOn || !props.step.goForwardOn.targets) {
    return
  }

  const targetHit = props.step.goForwardOn.targets.find(target => {
    return target.event === onboardingStore.lastEvent?.type
      && isNestedElement(getTargetElement(target.element), onboardingStore.lastEventEl)
  })

  if(targetHit) {
      // Check the validation function
      if(props.step.goForwardOn.validationFnc && !props.step.goForwardOn.validationFnc?.()) {
        return
      }

      if(props.onboarding.debug) {
        props.onboarding.log('goForwardOn - all conditions met, going to next step')
      }
      if(props.step.goForwardOn?.pageReroute){
        props.onboarding.log('goToNextStepDebounced: overlay paused')
        pauseOverlay()
      }

      goToNextStepDebounced.value()
  }
}

const goToNextStepDebounced = computed(() => useDebounceFn(
  () => {
    pauseEventHandler()
    setTimeout(() => {
      useAppStore().activeElement?.blur()
      props.onboarding.goToNextStep()
      resumeOverlay()
    }, 5)
  },
  props.step.goForwardOn?.debounce || 0,
  {
    maxWait: props.step.goForwardOn?.maxWait
  }
))

// PageReroute
watch(
  () => useRoute().path,
  (newValue, oldValue) => {
    const goForwardOn = props.step.goForwardOn

    if(goForwardOn?.pageReroute){
      if(typeof goForwardOn.pageReroute === 'boolean' && goForwardOn.pageReroute){
        props.onboarding.goToNextStep()
      }

      // TODO: wrong implementation here, the path should be exact (localized path is the issue)
      else if(goForwardOn.pageReroute?.path && newValue.includes(goForwardOn.pageReroute.path)){
        props.onboarding.goToNextStep()
      }
    }
  }
)
</script>

<template>
  <Teleport to="body">
    <!-- Tutorial overlay -->
    <div
      class="tutorial-overlay"
      @click.prevent.stop
    />

    <!-- Element overlay -->
     <div
      v-if="!step.canInteractWithElement"
      class="element-overlay"
     />

    <div
      ref="tooltipEl"
      :style="tooltipStyles"
      class="tooltip"
      :placement
      v-bind="$attrs"
      @wheel.prevent.stop
      @touchmove.prevent.stop
    >
      <!-- Arrow -->
      <div
        v-if="props.step.positioning === 'component'"
        ref="arrowEl"
        class="arrow"
      />

      <slot v-bind="props">
        <!-- Header -->
         <slot name="header" v-bind="props">
           <div class="tooltip-header">
              <!-- Step counter -->
              <slot name="counter" v-bind="props">
                <p class="tooltip-step-counter">
                  {{ step.id + 1 }}/{{ onboarding.steps.length }}
                </p>
              </slot>

              <!-- Close -->
              <Btn
                icon="i-ion:close"
                color="slate-600 dark:white"
                size="sm"
                no-hover-effect
                @click="onboarding.endTour()"
              />
            </div>
          </slot>

        <!-- Content -->
        <slot name="content" v-bind="props">
          <div class="tooltip-content">
            <!-- Heading -->
            <p class="tooltip-content__heading">
              {{ step.heading }}
            </p>

            <!-- Message -->
            <ScrollArea class="tooltip-content__message">
              <p >
                {{ step.message }}
              </p>
            </ScrollArea>
          </div>
        </slot>

        <slot name="stepper" v-bind="props">
          <OnboardingStepper :onboarding />
        </slot>

        <!-- Controls -->
        <div
          v-if="step.showNavigation"
          class="tooltip-controls"
        >
          <slot name="controls" v-bind="props">
            <!-- Back -->
            <Btn
              :disabled="!step.canGoBack"
              :label="$t('onboarding.back')"
              :ripple="false"
              color="blue-500"
              outlined
              no-uppercase
              @click="onboarding.goToPreviousStep()"
            />

            <!-- Next/Close -->
            <Btn
              :disabled="!step.canGoForward"
              :label="isLastStep ? $t('general.close') : $t('onboarding.next')"
              :ripple="false"
              color="white"
              bg-blue-500
              no-uppercase
              @click="onboarding.goToNextStep()"
            />
          </slot>
        </div>
      </slot>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.tutorial-overlay {
  @apply fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 cursor-not-allowed overflow-hidden touch-none p-4;

  z-index: calc(var(--zMenu) - 1);

  transition: 0.3s linear;
}

.element-overlay {
  @apply absolute cursor-not-allowed bg-transparent touch-none pointer-events-auto z-9999;
}

.tooltip {
  @apply dark:bg-darker bg-white border-ca border-custom rounded-custom z-$zMenu p-x-4 p-y-2
    max-w-100 md:min-w-100;

  transition: 0.3s linear;

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
      @apply 'p-l-0!';
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
