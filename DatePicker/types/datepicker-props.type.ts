import dayjs from 'dayjs'

// Types
import { type DayEvent } from '~/components/DatePicker/types/DayEvent.type'

// Models
import { DayEnum } from '~/libs/App/enums/day.enum'

export interface IDatePickerProps {
  allowedDays?: Array<dayjs.Dayjs> | ((date: dayjs.Dayjs) => boolean)
  disabledDays?: Array<dayjs.Dayjs> | ((date: dayjs.Dayjs) => boolean)
  events?: DayEvent[]
  excludedDays?: DayEnum[]
  modelValue?: Datetime
  noControls?: boolean
  shortcuts?: boolean
}
