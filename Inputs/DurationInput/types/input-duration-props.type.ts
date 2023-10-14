// TYPES
import type { DurationUnit } from '~/components/Inputs/DurationInput/functions/useDuration'
import type { INumberInputProps } from '~/components/Inputs/NumberInput/types/number-input-props.type'

export interface IDurationInputProps extends INumberInputProps {
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

  /**
   * The props that should be passed to the input tag (<input>)
   */
  inputProps?: Record<string, any>
}
