// Types
import { type IBtnProps } from '~/components/Button/types/btn-props.type'
import { type IValueFormatter } from '~/components/ValueFormatter/types/value-formatter-props.type'

export interface IMiniCardProps extends IValueFormatter {
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
   * The orginal value class of the card
   */
  originalValueClass?: ClassType

  /**
   * The link we want to redirect to
   */
  to?: IBtnProps['to']

  /**
   * The link we want to redirect to orginal value
   */
  toOriginalValue?: IBtnProps['to']

  /**
   * The orginal value of the field used to compare with current value
   */
  originalValue?: string
}
