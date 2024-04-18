import type { Boundary, OffsetOptions, Placement } from '@floating-ui/dom'
import type { CSSProperties } from 'vue'

export type IMenuProps = {
  /**
   * Function we can inject before the hide event
   * Should return whether the hide event should go through or not (boolean)
   */
  beforeHideFnc?: () => boolean | Promise<boolean>

  /**
   * The FloatingUI boundary for `size` middleware
   */
  boundary?: Boundary

  /**
   * When true, the `Menu` will not try to choose best placement, it will just
   * position itself on top of the reference element
   */
  cover?: boolean

  /**
   * The FloatingUI fallback placements
   */
  fallbackPlacements?: Placement[]

  /**
   * When true, the `Menu` will try to fit the width of the reference element
   *
   * * NOTE: Difference between `fit` and `matchWidth` is that `fit` will try to fit the
   * width of the reference element but it can go over it, while `matchWidth` will
   * try to match the width of the reference element exactly
   */
  fit?: boolean

  /**
   * Selectors of the elements that should not trigger the hide event
   */
  ignoreClickOutside?: string[]

  /**
   * When true, the `Menu` needs to be controller via v-model or exposed methods
   */
  manual?: boolean

  /**
   * When true, the `Menu` will try to match the width of the reference element exactly
   *
   * NOTE: Difference between `fit` and `matchWidth` is that `fit` will try to fit the
   * width of the reference element but it can go over it, while `matchWidth` will
   * try to match the width of the reference element exactly
   */
  matchWidth?: boolean

  /**
   * The maximum height for the menu content (including title!)
   */
  maxHeight?: number | string

  /**
   * Model value
   */
  modelValue?: boolean

  /**
   * When true, the `Menu` will not have an arrow
   */
  noArrow?: boolean

  /**
   * When true, the `Menu` will not have a close button
   */
  noClose?: boolean

  /**
   * When true, the `Menu` will not "uplift" the reference element
   *
   * Uplifting = highlighting the reference element
   * NOTE: When overlay is used, the reference element is always uplifted
   */
  noUplift?: boolean

  /**
   * When true, the `Menu` will not have an overlay/backdrop
   */
  noOverlay?: boolean

  /**
   * When true, the `Menu` will not have a transition
   */
  noTransition?: boolean

  /**
   * The FloatingUI offset options
   */
  offset?: OffsetOptions

  /**
   * When true, the `Menu` will not be closable by clicking outside of it
   * -> either ESC or the `CLOSE` button will be the only way to close it
   */
  persistent?: boolean

  /**
   * The FloatingUI placement
   */
  placement?: Placement

  /**
   * The reference element that the `Menu` is attached to
   */
  referenceTarget?: any

  /**
   * Element that triggers the Floating UI
   */
  target?: any

  /**
   * Title of the menu
   */
  title?: string

  /**
   * The duration of show/hide transition the menu
   */
  transitionDuration?: number

  /**
   * The trigger event
   */
  trigger?: 'click' | 'contextmenu'

  /**
   * When true, the `referenceTarget` will use the last position the user clicked
   */
  virtual?: boolean

  ui?: {
    /**
     * Class to apply to the `content`
     */
    contentClass?: ClassType

    /**
     * Style to apply to the `content`
     */
    contentStyle?: CSSProperties

    /**
     * Class to apply to the `header`
     */
    headerClass?: ClassType

    /**
     * Style to apply to the `header`
     */
    headerStyle?: CSSProperties

    /**
     * Class to apply to the `title`
     */
    titleClass?: ClassType

    /**
     * Style to apply to the `title`
     */
    titleStyle?: CSSProperties
  }
}
