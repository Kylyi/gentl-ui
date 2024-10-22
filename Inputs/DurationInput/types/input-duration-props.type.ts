// TYPES
import type { DurationUnit } from '~/components/Inputs/DurationInput/functions/useDuration'
import type { INumberInputProps } from '~/components/Inputs/NumberInput/types/number-input-props.type'

export type IDurationInputProps = INumberInputProps & {
  /**
   * The initial duration unit
   */
  initialDurationUnit?: DurationUnit

  /**
   * The units that are allowed to be selected
   *
   * @default ['minute', 'hour', 'day']
   */
  allowedUnits?: DurationUnit[]
}
