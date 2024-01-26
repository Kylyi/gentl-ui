// Types
import { type DayEvent } from '~/components/DatePicker/types/DayEvent.type'

// Models
import { Day } from '~/libs/App/data/models/day.model'

export interface IDatePickerDayProps {
  day: Day
  isSelected?: boolean
  isBottomRow?: boolean
  events?: Array<string | DayEvent>
  edge?: boolean
  disabled?: boolean
}
