import type { MaybeElement } from '@floating-ui/vue'
import type { OffsetOptions, Placement, ReferenceElement } from '@floating-ui/dom'

export class OnboardingStep {
  // Relative step number in onboarding
  id: number = 0

  /**
   *
   * Placement
   *
   */

  /**
   * Target element for the tutorial step
   */
  element?: MaybeElement<ReferenceElement> | HTMLElement | string | null | Ref<any>
  /**
   * Position the step absolutely or relatively to a target element
   */
  positioning: 'absolute' | 'component'
  absolutePlacement: 'center' = 'center' // TODO: support custom placement?
  canInteractWithElement: boolean = true

  /**
   * When target element need to be yet rendered (f.e. Menu)
   */
  waitForElement: boolean = false

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
    /**
     * Validation function that needs to be true in order to proceed
     */
    validation?: {
      fnc: (value?: any) => Promise<boolean> | boolean
      /**
       * Element that contains the value to be validated
       * @default step.element
       */
      element?: MaybeElement<ReferenceElement> | HTMLElement | string | null | Ref<any>
    }

    targets?: {
      /**
       * Target element of watched event
       */
      element: MaybeElement<ReferenceElement> | HTMLElement | string | null | Ref<any>
      event: keyof HTMLElementEventMap
    }[]

    pageReroute?: boolean | {
      path: string
    }
    debounce?: number
    maxWait?: number
  }

  /**
   *
   * Lyfecycles
   *
   */

  /**
   * Function fired before going to the next step
   */
  onBeforeNextStep?: () => Promise<void> | void
  /**
   * Function fired before going to previous step
   */
  onBeforePreviousStep?: () => Promise<void> | void

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
  showOn?: () => Promise<boolean> | boolean

  constructor(args: Partial<OnboardingStep>) {
    // Positioning
    this.element = args.element
    this.positioning = args.positioning ?? isNil(args.element) ? 'absolute' : 'component'
    this.absolutePlacement = args.absolutePlacement ?? this.absolutePlacement
    this.canInteractWithElement = args.canInteractWithElement ?? this.canInteractWithElement
    this.waitForElement = args.waitForElement ?? this.waitForElement

    // Controls
    this.canControl = args.canControl ?? this.canControl
    this.canGoBack = args.canGoBack ?? this.canControl
    this.canUseKeyboard = args.canUseKeyboard ?? this.canControl
    this.canGoForward = args.canGoForward ?? this.canControl
    this.canUseStepper = args.canUseStepper ?? this.canControl
    this.canBeSkippedTo = args.canBeSkippedTo ?? this.canBeSkippedTo

    this.goForwardOn = {
      ...args.goForwardOn,
      validation: args.goForwardOn?.validation
        ? {
            fnc: args.goForwardOn.validation.fnc,
            element: args.goForwardOn?.validation.element ?? args.element, // Default to step.element
          }
        : undefined,
    }

    // Lifecycle
    this.onBeforeNextStep = args.onBeforeNextStep
    this.onBeforePreviousStep = args.onBeforePreviousStep

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
