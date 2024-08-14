import type { MaybeElement } from '@floating-ui/vue'
import type { ReferenceElement, Placement } from '@floating-ui/dom'

export class TutorialWizardStep {
  id: string
  element: MaybeElement<ReferenceElement> | HTMLElement | string | null
  resolveFnc?: () => boolean
  placement: Placement
  heading?: string
  message?: string


  constructor(args: {
    id: string
    element: MaybeElement<ReferenceElement> | HTMLElement | string | null
    resolveFnc?: () => boolean
    placement?: Placement
    heading?: string
    message?: string
  }) {
      this.id = args.id
      this.element = args.element
      this.resolveFnc = args.resolveFnc
      this.placement = args.placement ?? 'top'
      this.heading = args.heading
      this.message = args.message
  }
}
