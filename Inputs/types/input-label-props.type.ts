import { type CSSProperties } from 'vue'
import type { IValidationErrorItem } from '~/libs/App/functions/useZod'

export type InputLabelProps = {
  hasContent?: boolean
  inline?: boolean
  label?: string
  labelClass?: ClassType
  labelInside?: boolean
  labelStyle?: CSSProperties
  placeholder?: string

  /**
   * Adds `*` ater the label to indicate it's a required field
   */
  required?: boolean
  size?: 'sm' | 'md' | 'lg'
  stackLabel?: boolean

  /**
   * Validation object
   */
  validation?: IValidationErrorItem
}
