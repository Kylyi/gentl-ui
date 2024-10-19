// @unocss-include

// Types
import type { IFieldProps } from '~/components/Field/types/field-props.type'

export type IColorProps = {
  /**
   * A list of colors that are not allowed to be selected
   */
  disallowedColors?: string[]

  /**
   * The model value
   */
  modelValue?: any

  /**
   * The icon to use for the color picker
   */
  icon?: 'i-material-symbols:format-color-text-rounded' | 'i-mdi:palette' | string

  /**
   * Whether to hide the icon for the color picker
   */
  noIcon?: boolean

  /**
   * When true, the color picker will use RGBA values
   */
  rgba?: boolean
} & IFieldProps
