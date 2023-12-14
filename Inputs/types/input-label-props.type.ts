import { type CSSProperties } from 'vue'

// Types
// TODO: Once Zod is ready, uncomment this and use as `validation`
// import type { IZodValidationItem } from '~/utils/zod/types/zod-validation-item.type'

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
  validation?: any
}
