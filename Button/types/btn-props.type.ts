import { NuxtLink } from '#components'

// Types
import type { NavigateToOptions } from '~/shims'

// Constants
import { BUTTON_PRESET } from '~/components/Button/constants/button-preset.constant'

export type INavigation = {
  disabled?: boolean
  download?: boolean
  exact?: boolean
  external?: boolean
  replace?: boolean
  to?: InstanceType<typeof NuxtLink>['to']
  navigateToOptions?: NavigateToOptions
}

export interface IBtnNavigationProps extends INavigation {
  noActiveLink?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export interface IBtnProps extends IBtnNavigationProps {
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
