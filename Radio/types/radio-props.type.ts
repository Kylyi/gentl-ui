import type { CSSProperties } from 'vue'

export type IRadioProps = {
  /**
   * The color of the radio
   */
  color?:
    | 'primary'
    | 'secondary'
    | 'positive'
    | 'warning'
    | 'negative'
    | 'info'
    | 'light'
    | 'dark'
    | 'darker'

  comparatorFn?: (model: any, val: any) => boolean
  disabled?: boolean
  label?: string
  modelValue: any
  name?: string
  noHoverEffect?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
  val: any

  /**
   * The class of the radio label
   */
  labelClass?: ClassType

  /**
   * The style of the radio label
   */
  labelStyle?: CSSProperties
}
