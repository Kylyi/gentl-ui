// Types
import type { IValueFormatter } from '~/components/ValueFormatter/types/value-formatter-props.type'

export type IMiniCardProps = IValueFormatter & {
  /**
   * The label of the card
   */
  label: string | number

  /**
   * The label of the card
   */
  labelClass?: ClassType

  /**
   * The icon of the card
   */
  icon?: string

  /**
   * Whether the value should be bold or not
   */
  noBold?: boolean

  /**
   * The value class of the card
   */
  valueClass?: ClassType

  /**
   * The previous value class of the card
   */
  previousValueClass?: ClassType

  /**
   * The link we want to redirect to
   */
  to?: any

  /**
   * The link we want to redirect to previous value
   */
  toPreviousValue?: any

  /**
   * The previous value of the field used to compare with current value
   */
  previousValue?: any

  /**
   * The original value ~ the current value for given field
   */
  originalValue?: any
}
