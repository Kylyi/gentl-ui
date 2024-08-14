import type { TutorialWizardStep } from "./tutorial-wizard-step.model";

export class TutorialWizardModel {
  steps: TutorialWizardStep[]
  currentStep: number = 0


  constructor(args: Partial<TutorialWizardModel>) {
    this.steps = args.steps ?? []
  }
}
