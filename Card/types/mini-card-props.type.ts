import { IBtnProps } from '~/components/Button/types/btn-props.type'
import { IValueFormatter } from '~/components/ValueFormatter/types/value-formatter-props.type'

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
   * Whether the value should be bold or not
   */
  noBold?: boolean

  /**
   * The value class of the card
   */
  valueClass?: ClassType

  /**
   * The link we want to redirect to
   */
  to?: IBtnProps['to']
}
