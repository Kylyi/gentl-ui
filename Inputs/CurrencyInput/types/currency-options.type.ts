import type { ICurrencyMaskOptions } from '~/components/Inputs/CurrencyInput/types/currency-mask-options'

export type ICurrencyOptions = {
  keyEvent?: string
  triggerOnBlur?: boolean
  init?: boolean
  backspace?: boolean
  maskOpts?: ICurrencyMaskOptions
  max: number
  min: number
}
