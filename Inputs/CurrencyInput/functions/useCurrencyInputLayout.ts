import type { ICurrencyInputProps } from '~/components/Inputs/CurrencyInput/types/currency-input-props.type'
import type { ICurrencyOptions } from '~/components/Inputs/CurrencyInput/types/currency-options.type'

export function useCurrencyInputLayout(
  props: ICurrencyInputProps,
  emits: (e: 'update:modelValue', val?: number | null | undefined) => void,
) {
  // Layout
  const inputValue = ref<undefined | string>(undefined)

  const unmaskedInputValue = computed<number | null>(() =>
    inputValue.value?.length ? unmasking(inputValue.value) : null,
  )
  const prevValue = ref(props.min?.toString() ?? 0)

  const currencyOptions = ref<ICurrencyOptions>({
    min: props.min!,
    max: props.max!,
    init: true,
    triggerOnBlur: false,
    backspace: true,
    maskOpts: {
      empty: true,
      digits: 2,
      locale: props.locale,
      options: {
        currency: props.currency,
        style: 'currency',
        minimumFractionDigits: props.fractionDigits,
        maximumFractionDigits: props.fractionDigits,
      },
    },
  })

  // Functions
  function init() {
    currencyOptions.value.maskOpts.viaInput = true
    inputValue.value = masking(props.modelValue ? props.modelValue?.toString() : '')
  }

  /** Clear input value */
  function clear() {
    inputValue.value = ''
    emits('update:modelValue', undefined)
  }

  /** Mask a numeric value */
  function masking(value: string) {
    if (!value.length) {
      clear()
      return
    }

    const { digits, locale, options } = currencyOptions.value.maskOpts!

    const maskingValue
      = unmasking(value) > currencyOptions.value!.max
      || unmasking(value) < currencyOptions.value!.min
        ? prevValue.value
        : value

    const { minus, decimal, integer } = getParts(maskingValue, digits)
    const amount = `${minus}${integer}.${decimal}`

    return new Intl.NumberFormat(locale, options).format(Number(amount))
  }

  /** Unmask a numeric value */
  function unmasking(value: string, digits = 2) {
    const { minus, decimal, integer } = getParts(value, digits)
    return Number(`${minus}${integer}.${decimal}`)
  }

  /** Get part of a masked input value */
  function getParts(
    value: string | number,
    digits = 2,
  ): {
      minus: string
      decimal: string
      integer: string
    } {
    const strValue = String(value)
    const minus = /-/.test(strValue) ? '-' : ''

    const number = strValue.replaceAll(/\D/g, '').replaceAll(/^0+/g, '')
    const fullValue = number.padStart(digits + 1, '0')
    const decimal = fullValue.slice(digits * -1)
    const integer = fullValue.slice(0, fullValue.length - digits)

    return {
      minus,
      decimal,
      integer,
    }
  }

  /** Get the position of the cursor in the input */
  function getPosition(value: string) {
    const nums = new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'])
    const len = value.length

    let cc = 0

    for (let i = len - 1; i >= 0; i--) {
      if (nums.has(value[i])) {
        break
      }
      cc++
    }

    return value.length - cc
  }

  /** Handle masking on input event */
  function onMasking(event: Event) {
    const targetElement = event.target as HTMLInputElement
    inputValue.value = masking(targetElement.value)

    if (inputValue.value) {
      const unmaskedValue = unmasking(inputValue.value ?? '0,00')
      prevValue.value = inputValue.value || 0
      emits('update:modelValue', unmaskedValue)
    }
  }

  /** Handle click event */
  function onClick(event: MouseEvent) {
    const targetElement = event.target as HTMLInputElement
    const pos = getPosition(targetElement!.value)
    targetElement!.focus()
    targetElement!.setSelectionRange(pos, pos)
  }

  return {
    inputValue,
    unmaskedInputValue,
    clear,
    init,
    masking,
    getPosition,
    onMasking,
    onClick,
  }
}
