import dayjs from 'dayjs'

// Types
import type { IInputProps } from '~/components/Inputs/types/input-props.type'

export interface IDateInputProps extends IInputProps {
  /**
   * An array or method that determines which days are allowed to be selected
   */
  allowedDays?: Array<dayjs.Dayjs> | ((date: dayjs.Dayjs) => boolean)

  /**
   * Whether the calendar should automatically close when a date is selected
   *
   * @default true
   */
  autoClose?: boolean

  /**
   * An array or method that determines which days are disabled
   */
  disabledDays?: Array<dayjs.Dayjs> | ((date: dayjs.Dayjs) => boolean)

  /**
   * Date format that we expect the input to return
   */
  format?: string

  /**
   * The props that should be passed to the input tag (<input>)
   */
  inputProps?: Record<string, any>
}
