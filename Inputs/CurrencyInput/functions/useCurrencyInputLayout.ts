import type { Ref } from 'vue'
import type { ICurrencyInputProps } from '~/components/Inputs/CurrencyInput/types/currency-input-props.type'
import type { ICurrencyOptions } from '~/components/Inputs/CurrencyInput/types/currency-options.type'

export function useCurrencyInputLayout(
  props: ICurrencyInputProps,
  emits: (e: 'update:modelValue', val?: number | null | undefined) => void,
  input: Ref<HTMLInputElement | undefined>
) {
  // Layout
  const inputValue = ref('0,00')
  const unmaskedInputValue = computed<number>(() => unmasking(inputValue.value))
  const prevValue = ref(props.min?.toString() ?? 0)

  const currencyOptions = ref<ICurrencyOptions>()

  // Functions
  function init() {
    currencyOptions.value = {
      keyEvent: 'input',
      min: props.min!,
      max: props.max!,
      init: true,
      triggerOnBlur: false,
      backspace: false,
      maskOpts: {
        empty: true,
        digits: 2,
        locale: props.locale,
        options: {
          currency: props.currency,
          style: 'currency',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      },
    }

    currencyOptions.value.maskOpts!.viaInput = true
    inputValue.value = masking(props.modelValue?.toString() ?? '0,00')

    // Listener
    input.value!.addEventListener('input', onMasking)
    input.value!.addEventListener('click', onClick)

    if (currencyOptions.value.triggerOnBlur) {
      input.value!.addEventListener('blur', onMasking)
    }
  }

  /** Clear input value */
  function clear() {
    inputValue.value = '0,00'
    emits('update:modelValue', undefined)
  }

  /** Mask a numeric value */
  function masking(value: string) {
    const {
      digits = 2,
      viaInput = false,
      locale,
      options,
    } = currencyOptions.value!.maskOpts!

    let maskingValue =
      unmasking(value) > currencyOptions.value!.max ||
      unmasking(value) < currencyOptions.value!.min
        ? prevValue.value
        : value

    const numberValue = Number(maskingValue)
    const isNumber = !Number.isNaN(numberValue)

    if (isNumber && !viaInput) {
      maskingValue = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numberValue)
    }

    const { minus, decimal, integer } = getParts(maskingValue, digits)

    const amount = `${minus}${integer}.${decimal}`

    return new Intl.NumberFormat(locale, options).format(
      Number(amount)
    )
  }

  /** Unmask a numeric value */
  function unmasking(value: string, digits = 2) {
    const { minus, decimal, integer } = getParts(value, digits)
    return Number(`${minus}${integer}.${decimal}`)
  }

  /** Get part of a masked input value */
  function getParts(
    value: string | number,
    digits = 2
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

    return String(value).length - cc - 1
  }

  /** Handle masking on input event */
  function onMasking(event: Event) {
    if (
      currencyOptions.value!.backspace &&
      'inputType' in event &&
      event.inputType === 'deleteContentBackward'
    ) {
      return
    }

    inputValue.value = masking(input.value!.value)
    prevValue.value = inputValue.value

    const pos = getPosition(input.value!.value)
    input.value!.setSelectionRange(pos, pos)

    emits('update:modelValue', unmaskedInputValue.value)
  }

  /** Handle click event */
  function onClick() {
    const pos = getPosition(input.value!.value)
    input.value!.focus()
    input.value!.setSelectionRange(pos, pos)
  }

  return {
    inputValue,
    unmaskedInputValue,
    clear,
    init,
    masking,
  }
}
