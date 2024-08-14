<script setup lang="ts">
import { ref, watch } from 'vue'
import { TutorialWizardModel } from '../models/tutorial-wizard.model'
import { TutorialWizardStep } from '../models/tutorial-wizard-step.model'
import TutorialWizardTooltip from './TutorialWizardTooltip.vue'

const props = defineProps<{
  wizard: TutorialWizardModel
}>()

const currentStep = ref(props.wizard.currentStep)
const isWizardActive = ref(false)

function start() {
  isWizardActive.value = true
  currentStep.value = 0
}

function next() {
  if (currentStep.value < props.wizard.steps.length - 1) {
    currentStep.value++
  } else {
    isWizardActive.value = false
  }
}

function prev() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

watch(currentStep, (newStep) => {
  props.wizard.currentStep = newStep
})
</script>

<template>
  <div>
    <Btn @click="start" v-if="!isWizardActive">Start Tutorial</Btn>
    <TutorialWizardTooltip
      v-if="isWizardActive"
      :step="wizard.steps[currentStep]"
      :placement="wizard.steps[currentStep].tooltipPosition"
      :referenceTarget="wizard.steps[currentStep].element"
    >
      <template #default>
        <h3>{{ wizard.steps[currentStep].heading }}</h3>
        <p>{{ wizard.steps[currentStep].message }}</p>
        <div>
          <button @click="prev" :disabled="currentStep === 0">Previous</button>
          <button @click="next">
            {{ currentStep === wizard.steps.length - 1 ? 'Finish' : 'Next' }}
          </button>
        </div>
      </template>
    </TutorialWizardTooltip>
  </div>
</template>
