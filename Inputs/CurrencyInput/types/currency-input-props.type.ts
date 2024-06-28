import type { INumberInputProps } from '~/components/Inputs/NumberInput/types/number-input-props.type'

export type ICurrencyInputProps = INumberInputProps & {
  /**
   * The currency symbol
   */
  currency?: string
}
