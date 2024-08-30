<script setup lang="ts">
// Models
import { TutorialWizardModel } from '~/components/TutorialWizard/models/tutorial-wizard.model'

// Store
import { useOnboardingStore } from '~/components/TutorialWizard/functions/onboarding.store'


const { activeOnboarding } = storeToRefs(useOnboardingStore())

const tour = computed(() => {
  return activeOnboarding.value?.tour
})
</script>

<template>
    <TutorialWizardTooltip
      v-if="tour"
      :step="tour.steps[tour.currentStep]"
      :wizard="tour"
    />
</template>
