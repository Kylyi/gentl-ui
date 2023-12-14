// Types
import type { RouteLocationRaw } from '#vue-router'
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
   * The orginal value class of the card
   */
  originalValueClass?: ClassType

  /**
   * The link we want to redirect to
   */
  to?: RouteLocationRaw

  /**
   * The link we want to redirect to orginal value
   */
  toOriginalValue?: RouteLocationRaw

  /**
   * The orginal value of the field used to compare with current value
   */
  originalValue?: string
}
