// Types
import type { NavigateToOptions } from '~/shims'
import type { RouteLocationRaw } from '#vue-router'

// Constants
import { BUTTON_PRESET } from '~/components/Button/constants/button-preset.constant'

export type INavigation = {
  disabled?: boolean
  download?: boolean
  exact?: boolean
  external?: boolean
  replace?: boolean
  to?: RouteLocationRaw | undefined
  navigateToOptions?: NavigateToOptions
}

export type IBtnNavigationProps = INavigation & {
  noActiveLink?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export type IBtnProps = IBtnNavigationProps & {
  align?: 'left' | 'center' | 'right'
  disabled?: boolean
  disableStyle?: 'filled' | 'flat'
  icon?: string
  label?: string | number | false
  labelClass?: ClassType
  loaderType?: 'inline' | 'block'
  loading?: boolean
  loadingColor?: string
  name?: string
  noBold?: boolean
  noDim?: boolean
  noHoverEffect?: boolean
  noUppercase?: boolean
  noTruncate?: boolean
  outlined?: boolean
  preset?: keyof typeof BUTTON_PRESET
  ripple?: boolean
  round?: boolean
  rounded?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'auto'
  stacked?: boolean
}
