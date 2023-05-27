import { Dayjs } from 'dayjs'

// TYPES
import type { IInputProps } from '~~/components/Inputs/types/input-props.type'

export interface IDateInputProps extends IInputProps {
  allowedDays?: Array<Dayjs> | ((date: Dayjs) => boolean)
  autoClose?: boolean
  disabledDays?: Array<Dayjs> | ((date: Dayjs) => boolean)
}
