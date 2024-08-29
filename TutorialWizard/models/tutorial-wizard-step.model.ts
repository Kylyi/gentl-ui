import type { MaybeElement } from '@floating-ui/vue'
import type { ReferenceElement, Placement, OffsetOptions } from '@floating-ui/dom'
import type { TutorialWizardModel } from './tutorial-wizard.model'
import type { Required } from 'utility-types'

export class TutorialWizardStep {
  // Relative step number in onboarding
  id: number = 0

  // Target element for the tutorial step
  element: MaybeElement<ReferenceElement> | HTMLElement | string | null | Ref<any>

  /**
   * Specifies the event condition for advancing to the next step in the tutorial wizard.
   */
  goForwardOn?: {
    element: MaybeElement<ReferenceElement> | HTMLElement | string | null | Ref<any>
    event: string
  }

  /**
   * Element event that triggers going back a step
   */
  goBackOn?: {
    element: MaybeElement<ReferenceElement> | HTMLElement | string
    event?: Event
  }

  // Placement of the tutorial step
  placement: Placement = 'top'
  offset: OffsetOptions = 10
  // Whether to adapt the placement of the tutorial step based on avaiable space
  adaptPlacement: boolean = true

  heading?: string
  message?: string

  // Condition for indlucing the step in the onboarding
  showOn?: () => boolean


  constructor(args: Partial<TutorialWizardStep>) {
      // Target element
      this.element = args.element

      // Advancement
      this.goForwardOn = args.goForwardOn
      this.goBackOn = args.goBackOn

      // Layout
      this.placement = args.placement ?? this.placement
      this.offset = args.offset ?? this.offset
      this.adaptPlacement = args.adaptPlacement ?? this.adaptPlacement
      this.heading = args.heading
      this.message = args.message

      this.showOn = args.showOn
  }
}
