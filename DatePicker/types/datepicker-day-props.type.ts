// Types
import type { DayEvent } from '~/components/DatePicker/types/DayEvent.type'

// Models
import type { Day } from '~/libs/Shared/models/day.model'

export type IDatePickerDayProps = {
  day: Day
  isSelected?: boolean
  isBottomRow?: boolean
  events?: Array<string | DayEvent>
  edge?: boolean
  disabled?: boolean
}
