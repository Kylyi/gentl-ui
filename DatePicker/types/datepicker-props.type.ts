import { Dayjs } from 'dayjs'

// Types
import { type DayEvent } from '~/components/DatePicker/types/DayEvent.type'

// Models
import { DayEnum } from '~/libs/App/enums/day.enum'

export interface IDatePickerProps {
  allowedDays?: Array<Dayjs> | ((date: Dayjs) => boolean)
  disabledDays?: Array<Dayjs> | ((date: Dayjs) => boolean)
  events?: DayEvent[]
  excludedDays?: DayEnum[]
  modelValue?: Datetime
  noControls?: boolean
  shortcuts?: boolean
}
