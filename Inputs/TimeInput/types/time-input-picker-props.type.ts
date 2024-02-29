// Types
import type { IFloatingUIProps } from '~/components/FloatingUI/types/floating-ui-props.type'
import type { ITimeInputShortcut } from '~/components/Inputs/TimeInput/types/time-input-props.type'

export type ITimeInputPickerProps = IFloatingUIProps & {
  /**
   * Whether the time picker uses 12h or 24h
   */
  is12h: boolean

  /**
   * When using 12h, we also distinguish between AM and PM
   */
  isAm: boolean

  /**
   * The actual model
   */
  modelValue?: any

  /**
   * The localized model value
   */
  modelValueLocalized?: string

  /**
   * Will prevent next `AM / PM` change
   */
  preventNextIsAmChange: boolean

  /**
   * Shortcuts for quick time selection
   */
  shortcuts?: ITimeInputShortcut[]
}
