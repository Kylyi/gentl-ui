export interface IFileInputProps {
  accept?: string
  disabled?: boolean
  errors?: Pick<ErrorObject, '$message'>[]
  errorTakesSpace?: boolean
  hint?: string
  loading?: boolean
  maxChipsRows?: number
  modelValue?: File[] | null
  multi?: boolean
  placeholder?: string
  readonly?: boolean
  scroller?: boolean
}
