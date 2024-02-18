// Types
import type { IFloatingUIProps } from '~/components/FloatingUI/types/floating-ui-props.type'
import type { ITimeInputShortcut } from '~/components/Inputs/TimeInput/types/time-input-props.type'

export interface ITimeInputPickerProps extends IFloatingUIProps {
  is12h: boolean
  isAm: boolean
  modelValueLocalized?: string
  preventNextIsAmChange: boolean
  shortcuts?: ITimeInputShortcut[]

  handleManualModelChange: (val: any, emitValue?: boolean) => void
}
