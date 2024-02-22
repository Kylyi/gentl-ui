import { type CSSProperties } from 'vue'

// Types

export type InputLabelProps = {
  hasContent?: boolean
  label?: string
  labelClass?: ClassType
  labelStyle?: CSSProperties
  placeholder?: string

  layout?: 'inline' | 'label-inside' | 'regular'

  /**
   * Adds `*` ater the label to indicate it's a required field
   */
  required?: boolean
  size?: 'sm' | 'md' | 'lg'
  stackLabel?: boolean
}
