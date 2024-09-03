<script setup lang="ts">
// Store
import { useOnboardingStore } from '~/components/Onboarding/functions/onboarding.store'

const { activeOnboarding } = storeToRefs(useOnboardingStore())
</script>

<template>
    <OnboardingStep
      v-if="activeOnboarding"
      :onboarding="activeOnboarding"
      :step="activeOnboarding.steps[activeOnboarding.currentStep]"
    />
</template>
