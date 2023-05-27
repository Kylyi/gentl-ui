import { CSSProperties } from 'vue'

// TYPES
import type { InputLabelProps } from '~~/components/Inputs/types/input-label-props.type'

export interface IInputWrapperProps extends InputLabelProps {
  contentClass?: ClassType
  contentStyle?: CSSProperties
  cursor?: 'cursor-text' | 'cursor-pointer' | 'cursor-default'
  disabled?: boolean
  errorTakesSpace?: boolean
  errorVisible?: boolean
  hint?: string
  loading?: boolean
  noBorder?: boolean
  readonly?: boolean
}
