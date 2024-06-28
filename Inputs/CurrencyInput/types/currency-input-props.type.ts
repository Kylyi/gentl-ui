import type { INumberInputProps } from '~/components/Inputs/NumberInput/types/number-input-props.type'

export type ICurrencyInputProps = Omit<INumberInputProps, 'mask'> & {
  locale?: string
  currency?: string
}
