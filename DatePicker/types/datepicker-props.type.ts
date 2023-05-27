import { Dayjs } from 'dayjs'
import { DayEvent } from '~~/components/DatePicker/types/DayEvent.type'
import { DayEnum } from '~~/libs/App/enums/day.enum'

export interface IDatePickerProps {
  allowedDays?: Array<Dayjs> | ((date: Dayjs) => boolean)
  disabledDays?: Array<Dayjs> | ((date: Dayjs) => boolean)
  events?: DayEvent[]
  excludedDays?: DayEnum[]
  modelValue?: Datetime
  noControls?: boolean
  shortcuts?: boolean
}
