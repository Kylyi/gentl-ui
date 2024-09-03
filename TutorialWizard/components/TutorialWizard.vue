<script setup lang="ts">
// Models
import { TutorialWizardModel } from '~/components/TutorialWizard/models/tutorial-wizard.model'

// Store
import { useOnboardingStore } from '~/components/TutorialWizard/functions/onboarding.store'


const { activeOnboarding } = storeToRefs(useOnboardingStore())
</script>

<template>
    <TutorialWizardTooltip
      v-if="activeOnboarding"
      :step="activeOnboarding.steps[activeOnboarding.currentStep]"
      :wizard="activeOnboarding"
    />
</template>
