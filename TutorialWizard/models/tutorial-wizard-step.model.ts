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
   *
   * Controls
   *
   */

  /**
   * Whether user can generally controll the step by available navigation
   */
  canControl: boolean = true
  canGoBack: boolean
  canGoForward: boolean
  canUseKeyboard: boolean
  /**
   * Whether user can use stepper to skip to another step
   */
  canUseStepper: boolean
  /**
   * Whether the step can be skipped to another step
   *
   * Meant for steps that require some action to be done before them -
   * e.g. clicking a input field, routing to a different page etc.
   */
  canBeSkippedTo: boolean = true

  /**
   * Specifies the event condition for advancing to the next step in the tutorial wizard.
   */
  goForwardOn?: {
    element: MaybeElement<ReferenceElement> | HTMLElement | string | null | Ref<any>
    triggerFnc: () => Promise<boolean> | boolean
  }

  /**
   * Element event that triggers going back a step
   */
  goBackOn?: {
    element: MaybeElement<ReferenceElement> | HTMLElement | string
    event?: Event
  }

  /**
   *
   * Layout
   *
   */


  /**
   * Whether to show "Back" and "Next" buttons
   */
  showNavigation: boolean = true
  /**
   * Placement of the tutorial step
   */
  placement: Placement = 'top'
  fallbackPlacements?: Placement[]
  offset: OffsetOptions = 10
  /**
   * Whether to adapt the placement of the tutorial step based on avaiable space
   */
  adaptPlacement: boolean = true

  heading?: string
  message?: string

  /**
   * Condition for indlucing the step in the onboarding
   */
  showOn?: () => boolean


  constructor(args: Partial<TutorialWizardStep>) {
      // Target element
      this.element = args.element

      // Controls
      this.canControl = args.canControl ?? this.canControl
      this.canGoBack = args.canGoBack ?? this.canControl
      this.canUseKeyboard = args.canUseKeyboard ?? this.canControl
      this.canGoForward = args.canGoForward ?? this.canControl
      this.canUseStepper = args.canUseStepper ?? this.canControl
      this.canBeSkippedTo = args.canBeSkippedTo ?? this.canBeSkippedTo

      this.goForwardOn = args.goForwardOn
      this.goBackOn = args.goBackOn

      // Layout
      this.showNavigation = args.showNavigation ?? this.showNavigation
      this.placement = args.placement ?? this.placement
      this.fallbackPlacements = args.fallbackPlacements
      this.offset = args.offset ?? this.offset
      this.adaptPlacement = args.adaptPlacement ?? this.adaptPlacement
      this.heading = args.heading
      this.message = args.message

      this.showOn = args.showOn
  }
}
