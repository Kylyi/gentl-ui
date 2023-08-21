// TYPES
import type { DurationUnit } from '~/components/Inputs/DurationInput/functions/useDuration'
import type { INumberInputProps } from '~/components/Inputs/NumberInput/types/number-input-props.type'

export interface IDurationInputProps extends INumberInputProps {
  noStep?: boolean
  initialDurationUnit?: DurationUnit
  allowedUnits?: DurationUnit[]
}
