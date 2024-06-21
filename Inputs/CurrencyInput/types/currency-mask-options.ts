export type ICurrencyMaskOptions = {
  viaInput?: boolean
  digits?: number
  empty?: boolean
  locale?: string
  options?: {
    currency: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  }
}
