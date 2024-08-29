<script setup lang="ts">
import { TutorialWizardModel } from '../models/tutorial-wizard.model'
import TutorialWizardTooltip from './TutorialWizardTooltip.vue'

const props = defineProps<{
  wizard: TutorialWizardModel
}>()
defineEmits<{
  'update:wizard': [TutorialWizardModel]
}>()
const wizard = defineModel<TutorialWizardModel>('wizard', {
  required: true
})


function start() {
  wizard.value.isActive = true
  wizard.value.goToStep(0)
}
</script>

<template>
  <div>
    <Btn @click="start" v-if="!wizard.isActive">Start Tutorial</Btn>

    <TutorialWizardTooltip
      v-if="wizard.isActive"
      :step="wizard.steps[wizard.currentStep]"
      :wizard
    >
    </TutorialWizardTooltip>
  </div>
</template>
