// TYPES
import type { ITimeInputShortcut } from '~/components/Inputs/TimeInput/types/time-input-props.type'
import type { FloatingUIBaseProps } from '~~/components/Dialog/types/dialog-props.type'

export interface ITimeInputPickerProps extends FloatingUIBaseProps {
  is12h: boolean
  isAm: boolean
  modelValueLocalized?: string
  preventNextIsAmChange: boolean
  shortcuts?: ITimeInputShortcut[]
  usedTouch: boolean

  handleManualModelChange: (val: any) => void
}
