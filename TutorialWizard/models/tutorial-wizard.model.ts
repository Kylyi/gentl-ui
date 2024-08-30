import type { TutorialWizardStep } from "./tutorial-wizard-step.model";

export class TutorialWizardModel {
  name: string = uuid()

  steps: TutorialWizardStep[]
  currentStep: number = 0
  isActive: boolean = false
  isFinished: boolean = false

  goToStep(step: number) {
    if(step >= this.steps.length) {
      this.endTour()
    }

    this.currentStep = step < 0 ? 0 : step
  }

  goToNextStep() {
    this.goToStep(this.currentStep + 1)
  }

  goToPreviousStep() {
    this.goToStep(this.currentStep - 1)
  }

  endTour() {
    this.isFinished = true
    this.isActive = false
  }

  startTour(step?: number) {
    this.isActive = true
    this.goToStep(step ?? 0)
  }

  constructor(args: Partial<TutorialWizardModel>) {
    this.name = args.name ?? this.name

    // Steps
    this.steps = args.steps?.filter(step => {
      return step.showOn ? step.showOn() : true
    }) ?? []
    this.steps.forEach(step => {
      step.id = this.steps.indexOf(step)
    })

    this.currentStep = args.currentStep ?? this.currentStep
    this.isActive = args.isActive ?? this.isActive
    this.isFinished = args.isFinished ?? this.isFinished
  }
}
