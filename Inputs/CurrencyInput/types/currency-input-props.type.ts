import type { INumberInputProps } from '~/components/Inputs/NumberInput/types/number-input-props.type'

export type ICurrencyInputProps = INumberInputProps & {
  /**
   * The currency symbol
   */
  currency?: string

  /**
   * Whether the currency symbol should be prepended or appended
   */
  currencyPosition?: 'prepend' | 'append'

  /**
   * Use locale-aware currency
   */
  localeCurrency?: boolean

  /**
   * Whether to show the currency symbol
   */
  noCurrency?: boolean
}
