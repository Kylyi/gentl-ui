export interface ICheckboxProps {
  checkValue?: any
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
  editable?: boolean
  indeterminate?: boolean
  indeterminateValue?: any
  label?: string
  labelClass?: ClassType
  modelValue?: any
  noHoverEffect?: boolean
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  uncheckValue?: any
}
