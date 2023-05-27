export interface RadioProps {
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
}
