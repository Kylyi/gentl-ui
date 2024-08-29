<script setup lang="ts">
import type { TutorialWizardModel } from '../models/tutorial-wizard.model';

type IProps = {
  wizard: TutorialWizardModel
}
const props = defineProps<IProps>()

function handleStepClick(stepIndex: number) {
  props.wizard.goToStep(stepIndex);
};

const test = ref(true)
</script>

<template>
  <div class="wizard-steps">
    <div class="line" />

    <div
      v-for="step in wizard.steps"
      :key="step.id"
      class="step"
      :class="{ 'active': step.id === wizard.currentStep }"
      @click="handleStepClick(step.id)"
    >
    {{ step.id + 1 }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wizard-steps {
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
}
</style>
