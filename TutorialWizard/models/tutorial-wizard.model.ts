import type { TutorialWizardStep } from "./tutorial-wizard-step.model";

export class TutorialWizardModel {
  steps: TutorialWizardStep[]
  currentStep: number = 0
  isActive: boolean = false
  isFinished: boolean = false

  goToStep(step: number) {
    if(step >= this.steps.length) {
      this.isFinished = true
      this.isActive = false
    }

    this.currentStep = step < 0 ? 0 : step
  }

  goToNextStep() {
    this.goToStep(this.currentStep + 1)
  }

  goToPreviousStep() {
    this.goToStep(this.currentStep - 1)
  }


  constructor(args: Partial<TutorialWizardModel>) {
    this.steps = args.steps ?? []
  }
}
