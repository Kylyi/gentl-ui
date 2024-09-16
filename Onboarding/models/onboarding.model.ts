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

    const direction = stepId > this.currentStep ? 'next' : 'back'

    // Lifecycle of steps
    const currentStep = this.steps[this.currentStep]

    if(direction === 'next'){
      await currentStep.onBeforeNextStep?.()
      await this.onNextStep?.()
    } else {
      await currentStep.onBeforePreviousStep?.()
      await this.onPreviousStep?.()
    }

    this.currentStep = stepId < 0 ? 0 : stepId
    this.log('currentStep: ', this.currentStep)
    useOnboardingStore().lastIndexByName[this.name] = this.currentStep
  }

  goToNextStep() {
    this.goToStep(this.currentStep + 1)
  }

  goToPreviousStep() {
    this.goToStep(this.currentStep - 1)
  }

  async endTour() {
    await this.onFinish?.()
    this.isFinished = true
    this.isActive = false
  }

  async exitTour() {
    await this.onExit?.()
    this.isActive = false
  }

  async skipTour() {
    await this.onTourSkip?.()
    this.currentStep = 0
    this.endTour()
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

  // Lifecycle callbacks
 /*
  * Callback when starting the tour.
  */
  onStart?: () => Promise<void> | void
 /*
  * Callback when exiting the tour.
  */
  onExit?: () => Promise<void> | void
 /*
  * Callback when finishing the tour.
  */
  onFinish?: () => Promise<void> | void
 /*
  * Callback when going back a step.
  */
  onPreviousStep?: () => Promise<void> | void
 /*
  * Callback when going forward a step.
  */
  onNextStep?: () => Promise<void> | void
 /*
  * Callback when skipping the tour.
  */
  onTourSkip?: () => Promise<void> | void


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

    this.onStart = args.onStart
    this.onExit = args.onExit
    this.onFinish = args.onFinish
    this.onPreviousStep = args.onPreviousStep
    this.onNextStep = args.onNextStep
    this.onTourSkip = args.onTourSkip
  }
}
