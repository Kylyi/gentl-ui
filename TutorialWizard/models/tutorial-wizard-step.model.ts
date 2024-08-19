import type { MaybeElement } from '@floating-ui/vue'
import type { ReferenceElement, Placement } from '@floating-ui/dom'
import type { TutorialWizardModel } from './tutorial-wizard.model'
import type { Required } from 'utility-types'

export class TutorialWizardStep {
  id: number

  // Target element for the tutorial step
  element: MaybeElement<ReferenceElement> | HTMLElement | string | null | Ref<any>

  /**
   * Specifies the event condition for advancing to the next step in the tutorial wizard.
   */
  goForwardOn?: {
    element: MaybeElement<ReferenceElement> | HTMLElement | string | null
    event: Event
  }

  /**
   * Element event that triggers going back a step
   */
  goBackOn?: {
    element: MaybeElement<ReferenceElement> | HTMLElement | string
    event?: Event
  }

  // Placement of the tutorial step
  placement: Placement
  // Whether to adapt the placement of the tutorial step based on avaiable space
  adaptPlacement: boolean = true

  heading?: string
  message?: string


  constructor(args: Partial<TutorialWizardStep>) {
      this.id = args.id ?? uuid()

      // Target element
      this.element = args.element

      // Advancement
      this.goForwardOn = args.goForwardOn
      this.goBackOn = args.goBackOn

      // Layout
      this.placement = args.placement ?? 'top'
      this.adaptPlacement = args.adaptPlacement ?? this.adaptPlacement
      this.heading = args.heading
      this.message = args.message
  }
}
