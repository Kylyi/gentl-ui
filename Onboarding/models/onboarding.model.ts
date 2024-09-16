// Models
import { checkElementVisibility, getTargetElement } from "~/components/Tooltip/functions/element-functions"
import type { OnboardingStep } from "./onboarding-step.model"

// Store
import { useOnboardingStore } from '~/components/Onboarding/functions/onboarding.store'

export class OnboardingModel {
  name: string = uuid()

  steps: OnboardingStep[]
  currentStep: number = 0
  isActive: boolean = false
  isFinished: boolean = false
  // TODO: Remove after development
  debug: boolean = false

  async goToStep(stepId: number) {
    this.log('goToStep', stepId)
    if(stepId < 0) {
      this.goToStep(0)

      return
    }
    if(stepId >= this.steps.length) {
      this.endTour()
      useOnboardingStore().resetTour(this.name)

      return
    }

    if(
      (!this.steps[stepId].canBeSkippedTo && stepId < this.currentStep)
      || !(await checkElementVisibility(this.steps[stepId]?.element))
    ) {
      this.goToStep(stepId - 1)

      return
    }

    // Lifecycle of steps
    const currentStep = this.steps[this.currentStep]
    if(currentStep.onBeforeLeave){
      await currentStep.onBeforeLeave()
    }

    this.currentStep = stepId < 0 ? 0 : stepId
    console.log('currentStep: ', this.currentStep)
    useOnboardingStore().lastIndexByName[this.name] = this.currentStep
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

  log(...args: any[]){
    if(this.debug){
      console.log(...args)
    }
  }

  constructor(args: Partial<OnboardingModel>) {
    this.name = args.name ?? this.name

    // Steps
    this.steps = args.steps?.filter(step => {
      return step.showOn ? step.showOn() : true
    }) ?? []
    this.steps.forEach(step => {
      step.id = this.steps.indexOf(step)

      if(step.id === 0) {
        step.canGoBack = false
      }
    })

    this.currentStep = args.currentStep ?? this.currentStep
    this.isActive = args.isActive ?? this.isActive
    this.isFinished = args.isFinished ?? this.isFinished
    this.debug = args.debug ?? this.debug
  }
}
