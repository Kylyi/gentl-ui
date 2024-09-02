import type { CSSProperties } from 'vue'

// Types

export type IInputLabelProps = {
  /**
   * Whether the input has content or not
   */
  hasContent?: boolean

  /**
   * The input's id
   */
  id?: string

  /**
   * The input's label
   */
  label?: string

  /**
   * The input's placeholder
   */
  placeholder?: string

  /**
   * The input's layout
   */
  layout?: 'inline' | 'label-inside' | 'regular'

  /**
   * Adds `*` ater the label to indicate it's a required field
   */
  required?: boolean

  /**
   * The input's size
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * When true, the label will be `floating` even when with no content
   */
  stackLabel?: boolean

  ui?: {
    labelClass?: ClassType
    labelStyle?: CSSProperties
  }
}
