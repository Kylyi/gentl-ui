<script setup lang="ts">
import type { OnboardingModel } from '../models/onboarding.model'

type IProps = {
  onboarding: OnboardingModel
}
const props = defineProps<IProps>()

const isClickable = computed(() => {
  return props.onboarding.steps[props.onboarding.currentStep].canUseStepper
})

function handleStepClick(stepIndex: number) {
  if (!isClickable.value || !props.onboarding.steps[stepIndex].canBeSkippedTo) {
    return
  }

  props.onboarding.goToStep(stepIndex)
};

const test = ref(true)
</script>

<template>
  <div class="onboarding-steps">
    <div class="line" />

    <div
      v-for="step in onboarding.steps"
      :key="step.id"
      class="step"
      :class="{
        'active': step.id === onboarding.currentStep,
        'not-clickable': !isClickable || !onboarding.steps[step.id].canBeSkippedTo,
      }"
      @click="handleStepClick(step.id)"
    >
      {{ step.id + 1 }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.onboarding-steps {
  @apply flex justify-between items-center w-full p-x-0 p-y-5 relative;
}

.line {
  @apply absolute top-[50%] left-0 right-0 h-0.5 bg-[#e0e0e0] z-1;
}

.step {
  @apply w-7 h-7 border-rd-1/2 flex justify-center items-center cursor-pointer relative z-2
    bg-white dark:(bg-darker color-white) border-gray-300 border-2;

  transition: background-color 0.3s ease;

  &.active {
    @apply color-blue-500 border-blue-500;
  }

  &.not-clickable {
    @apply cursor-not-allowed;
  }
}
</style>
