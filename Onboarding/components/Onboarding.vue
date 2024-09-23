<script setup lang="ts">
// Model
import type { OnboardingStep } from '../models/onboarding-step.model';
import type { OnboardingModel } from '../models/onboarding.model';

// Store
import { useOnboardingStore } from '~/components/Onboarding/functions/onboarding.store'


const { activeOnboarding } = storeToRefs(useOnboardingStore())

const stepProps = computed(() => {
  return {
    onboarding: activeOnboarding.value as OnboardingModel,
    step: activeOnboarding.value?.steps[activeOnboarding.value.currentStep] as OnboardingStep,
  }
})
</script>

<template>
  <slot
    v-if="activeOnboarding"
    v-bind="stepProps"
  >
    <OnboardingStep
      v-if="activeOnboarding"
      v-bind="stepProps"
    >
      <template v-if="$slots.header" #header="props">
        <slot name="header" v-bind="props" />
      </template>

      <template v-if="$slots.counter" #counter="props">
        <slot name="counter" v-bind="props" />
      </template>

      <template v-if="$slots.content" #content="props">
        <slot name="content" v-bind="props" />
      </template>

      <template v-if="$slots.stepper" #stepper="props">
        <slot name="stepper" v-bind="props" />
      </template>

      <template v-if="$slots.controls" #controls="props">
        <slot name="stepper" v-bind="props" />
      </template>
    </OnboardingStep>
  </slot>
</template>
