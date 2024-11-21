import type { CSSProperties } from 'vue'

// Types
import type { NavigateToOptions } from '~/shims'

// Constants
import type { BUTTON_PRESET } from '~/components/Button/constants/button-preset.constant'
import type { ITooltipProps } from '~/components/Tooltip/types/tooltip-props.type'

export type INavigation = {
  disabled?: boolean
  download?: boolean | string
  exact?: boolean
  external?: boolean
  replace?: boolean
  to?: any // should be RouteLocationRaw but that breaks some projects for whatever reason
  navigateToOptions?: NavigateToOptions
}

export type IBtnNavigationProps = INavigation & {
  /**
   * When true, the button will not inherit the default NuxtLink active class
   */
  noActiveLink?: boolean

  /**
   * When true, the button will not have an underline
   */
  noUnderline?: boolean

  /**
   * The native `type` of the button
   */
  type?: 'button' | 'submit' | 'reset'
}

export type IBtnProps = IBtnNavigationProps & {
  /**
   * Alignment of the button content
   */
  align?: 'left' | 'center' | 'right'

  /**
   * Whether the button is disabled
   */
  disabled?: boolean

  /**
   * Defines the style of the button when it's disabled
   */
  disableStyle?: 'filled' | 'flat'

  /**
   * The icon of the button
   */
  icon?: string

  /**
   * The label of the button
   */
  label?: string | number | false

  /**
   * Class for the `label`
   */
  labelClass?: ClassType

  /**
   * The type of loader to use
   */
  loaderType?: 'inline' | 'block'

  /**
   * Whether the button is loading
   */
  loading?: boolean

  /**
   * The color of the loading indicator
   */
  loadingColor?: string

  /**
   * The native `name` of the button
   */
  name?: string

  /**
   * When true, the button will not be bold
   */
  noBold?: boolean

  /**
   * When true, the button will not be dimmed
   */
  noDim?: boolean

  /**
   * When true, the button will not have a hover effect
   */
  noHoverEffect?: boolean

  /**
   * When true, the button will not have an uppercase text
   */
  noUppercase?: boolean

  /**
   * When true, the button will not truncate the label
   */
  noTruncate?: boolean

  /**
   * When true, the button will be outlined
   */
  outlined?: boolean

  /**
   * The preset of the button
   */
  preset?: keyof typeof BUTTON_PRESET

  /**
   * Whether the button should have a ripple effect
   */
  ripple?: boolean

  /**
   * Whether the button should be round
   */
  round?: boolean

  /**
   * Whether the button should be rounded
   *
   * @default true
   */
  rounded?: boolean

  /**
   * The size of the button
   *
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'auto'

  /**
   * Whether the button should be stacked ~ the icon is on top of the label (vertically)
   */
  stacked?: boolean

  /**
   * The tooltip of the button
   */
  tooltip?: string

  /**
   * Class for the tooltip
   */
  tooltipClass?: ClassType

  /**
   * Props for the tooltip
   */
  tooltipProps?: Partial<ITooltipProps> & { style?: CSSProperties, class?: ClassType }
}
