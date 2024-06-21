import type { ICurrencyOptions } from '~/components/Inputs/CurrencyInput/types/currency-options.type'

const instances = new Map()
const GUID = Symbol('GUID')

export class CurrencyModel {
  options: ICurrencyOptions
  input: HTMLInputElement
  events = new Set<string>()
  prevValue = '0,00'

  constructor(input: HTMLInputElement, options: ICurrencyOptions) {
    this.options = {
      keyEvent: 'input',
      triggerOnBlur: false,
      init: false,
      backspace: false,
      maskOpts: {},
      ...options,
    }

    this.prevValue = this.masking(options.min.toString())
    this.options.maskOpts!.viaInput = true
    this.events = new Set()
    this.input = input

    // Initialize
    if (this.options.init) {
      this.options.maskOpts!.viaInput = false

      this.input.value = this.masking(this.input.value)

      this.options.maskOpts!.viaInput = true
    }

    // Listener
    this.input.addEventListener(this.options.keyEvent!, this)
    this.events.add(this.options.keyEvent!)

    this.input.addEventListener('click', this)
    this.events.add('click')

    if (this.options.triggerOnBlur) {
      this.input.addEventListener('blur', this)
      this.events.add('blur')
    }

    // Storage instance
    // @ts-expect-error `unique symbol` can't be used to index type HTMLInputElement
    this.input[GUID] = this.#id()
    // @ts-expect-error `unique symbol` can't be used to index type HTMLInputElement
    instances.set(this.input[GUID], this)
  }

  /** Get the position of the cursor in the input */
  static position(value: string) {
    const nums = new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'])
    const len = value.length

    let cc = 0

    for (let i = len - 1; i >= 0; i--) {
      if (nums.has(value[i])) {
        break
      }
      cc++
    }

    return String(value).length - cc
  }

  /** Get the parts of a masked input value */
  static getParts(
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

  /** Clear input value */
  clear() {
    this.input.value = ''
  }

  /**  Convert a masked value into an unmasked numeric value */
  unmasking(value: string, digits = 2) {
    const { minus, decimal, integer } = CurrencyModel.getParts(value, digits)
    return Number(`${minus}${integer}.${decimal}`)
  }

  /** Mask a numeric value */
  masking(value: string) {
    const {
      digits = 2,
      empty = false,
      locale = 'pt-BR',
      options = {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      },
      viaInput = false,
    } = this.options.maskOpts!

    let maskingValue =
      this.unmasking(value) > this.options?.max ||
      this.unmasking(value) < this.options?.min
        ? this.prevValue
        : value

    const numberValue = Number(maskingValue)
    const isNumber = !Number.isNaN(numberValue)

    if (isNumber && !viaInput) {
      maskingValue = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(numberValue)
    }

    const { minus, decimal, integer } = CurrencyModel.getParts(
      maskingValue,
      digits
    )

    if (
      empty &&
      integer === '0' &&
      ['00', '000'].includes(decimal) &&
      minus === ''
    ) {
      return ''
    }

    const amount = `${minus}${integer}.${decimal}`

    return new Intl.NumberFormat(locale, options).format(Number(amount))
  }

  /** Generate a unique identifier */
  #id() {
    return useId()
  }

  /** Handle masking on input event */
  onMasking(event: Event) {
    if (
      this.options.backspace &&
      'inputType' in event &&
      event.inputType === 'deleteContentBackward'
    ) {
      return
    }

    this.input.value = this.masking(this.input.value)
    this.prevValue = this.input.value

    const pos = CurrencyModel.position(this.input.value)
    this.input.setSelectionRange(pos, pos)
  }

  /**
   * Handle click event.
   */
  onClick() {
    const pos = CurrencyModel.position(this.input.value)
    this.input.focus()
    this.input.setSelectionRange(pos, pos)
  }

  /**
   * Destroy the Currency instance.
   */
  destroy() {
    this.input.value = this.unmasking(this.input.value).toString()

    for (const _event of this.events) {
      this.input.removeEventListener(_event, this)
    }

    // @ts-expect-error `unique symbol` can't be used to index type HTMLInputElement
    if (instances.has(this.input[GUID])) {
      // @ts-expect-error `unique symbol` can't be used to index type HTMLInputElement
      instances.delete(this.input[GUID])
    }
  }

  /** Handle events */
  handleEvent(event: Event) {
    if (event.type === 'click') {
      this.onClick()
    } else {
      this.onMasking(event)
    }
  }
}
