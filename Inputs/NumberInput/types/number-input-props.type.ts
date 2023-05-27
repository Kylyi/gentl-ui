import { IInputProps } from '~~/components/Inputs/types/input-props.type'

export interface INumberInputProps extends IInputProps {
  fractionDigits?: number
  min?: number
  max?: number
  noGrouping?: boolean
  step?: number | 'auto' | null
}
