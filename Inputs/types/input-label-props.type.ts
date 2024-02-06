import { type CSSProperties } from 'vue'

// Types
// TODO: Once Zod is ready, uncomment this and use as `validation`
// import type { IZodValidationItem } from '~/utils/zod/types/zod-validation-item.type'

export type InputLabelProps = {
  /**
   * Whether the input has some content
   *
   * When `false`, the label will be in its default position, otherwise, it will be "stacked" (above the input)
   * Note: For `inline` this doesnt really do anything
   */
  hasContent?: boolean

  /**
   * When true, the `label` and `input` will be on the same line on >md screens, ie. they will be quite wide
   * On smaller screens, the label will be stacked (above the input)
   */
  inline?: boolean

  /**
   * The label of the input
   */
  label?: string

  /**
   * The class of the label
   */
  labelClass?: ClassType

  /**
   * When true, the label will be inside the input (in the container)
   */
  labelInside?: boolean

  /**
   * The style of the label
   */
  labelStyle?: CSSProperties

  /**
   * The placeholder of the input
   */
  placeholder?: string

  /**
   * Adds `*` ater the label to indicate it's a required field
   */
  required?: boolean

  /**
   * The size of the input
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * When `true`, the label will be stacked even when no content is present in the input
   */
  stackLabel?: boolean

  /**
   * Validation object
   */
  validation?: any
}
