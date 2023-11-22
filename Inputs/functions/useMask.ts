// eslint-disable-next-line import/named
import IMask, { InputMask, createMask } from 'imask'

// Types
import type { IMaskOptions } from '~/components/Inputs/types/mask-options.type'

const activeElement = useActiveElement()

export function useMask(options: IMaskOptions) {
  const {
    maskOptions,
    updateValueFnc,
    emptyValue,
    eventHandlers,
    allowIncompleteMaskValue,
  } = options

  const instance = getCurrentInstance()

  // Layout
  const el = ref<HTMLInputElement | HTMLTextAreaElement>()
  const mask = createMask(unref(maskOptions))
  const elMask = ref<InputMask<any> | null>()
  const hasBeenCleared = ref(false)
  const model = toRef(options, 'modelValue', ref(''))
  const hasJustChanged = refAutoReset(false, 100)

  /**
   * Resolves the `modelValue` according to the mask
   * @example mask: '00-00', value: '1234' -> '12-34'
   * @example mask: Number, thousandsSeparator: ' ', value: 1234 (number) -> 1 234
   */
  const resolve = (value: any) => {
    if ('format' in unref(maskOptions) && 'format' in mask) {
      return mask.format(value)
    }

    if (isNil(value) || value === unref(emptyValue)) {
      return ''
    }

    return mask.resolve(String(value))
  }

  /**
   * Returns the input back to its last valid value
   */
  const refresh = () => {
    if (elMask.value && !hasBeenCleared.value && !allowIncompleteMaskValue) {
      if (lastValidValue.value === unref(emptyValue)) {
        elMask.value.typedValue = unref(emptyValue)
      } else {
        elMask.value.typedValue = lastValidValue.value
      }
    }
  }

  /**
   * Emits `emptyValue` and sets the correct mask for it
   */
  const clear = () => {
    if (elMask.value) {
      elMask.value.typedValue = unref(emptyValue)
    }

    hasBeenCleared.value = true
  }

  const destroyMask = () => {
    elMask.value?.destroy()
    elMask.value = null
  }

  // State
  const lastValidValue = ref<any>(unref(model))
  const maskedValue = ref<string | undefined>()
  const unmaskedValue = ref<string | undefined>(String(unref(model)))
  const typedValue = ref<string | number | Date | undefined>(unref(model))

  const isEmpty = computed(() => {
    return (
      typedValue.value === unref(emptyValue) ||
      isNil(unref(typedValue)) ||
      unmaskedValue.value === ''
    )
  })

  const handleManualModelChange = (val: any, emitValue?: boolean) => {
    if (elMask.value) {
      elMask.value.typedValue = val

      if (emitValue) {
        if (options.setModel) {
          options.setModel(val)
        } else {
          instance?.emit('update:model-value', val)
        }
      }
    }
  }

  const handleAccept = () => {
    maskedValue.value = elMask.value?.value
    unmaskedValue.value = elMask.value?.unmaskedValue
    typedValue.value = elMask.value?.typedValue

    hasBeenCleared.value = false
    eventHandlers?.onAccept?.(elMask.value?.unmaskedValue)

    if (maskedValue.value === '' || elMask.value?.mask === maskedValue.value) {
      handleComplete()
    }
  }

  const handleComplete = () => {
    lastValidValue.value =
      maskedValue.value === '' || elMask.value?.mask === maskedValue.value
        ? unref(emptyValue)
        : elMask.value?.typedValue

    eventHandlers?.onCompleted?.(lastValidValue.value)

    hasJustChanged.value = true
    if (updateValueFnc) {
      updateValueFnc(lastValidValue.value)
    } else {
      instance?.emit('update:model-value', lastValidValue.value)
    }
  }

  // Initialize
  maskedValue.value = resolve(unref(model))

  // Watch for mask options change
  watch(
    maskOptions,
    maskOptions => {
      elMask.value?.updateOptions(maskOptions)
      mask.updateOptions(maskOptions as any)
    },
    { deep: true }
  )

  // Watch for element change
  // Also serves as SSR handler
  watch(el, el => {
    if (el) {
      destroyMask()
      elMask.value = IMask(el, unref(maskOptions))
      elMask.value.typedValue = model.value

      elMask.value.on('accept', handleAccept)
      elMask.value.on('complete', handleComplete)
    }
  })

  // Watch for model changes
  watch(model, model => {
    if (
      activeElement.value !== el.value &&
      elMask.value &&
      !hasJustChanged.value
    ) {
      lastValidValue.value = model

      if (lastValidValue.value === unref(emptyValue)) {
        elMask.value.value = resolve(lastValidValue.value)
      } else {
        elMask.value.typedValue = model
      }
    }
  })

  return {
    el,
    elMask,
    hasJustChanged,
    maskedValue,
    unmaskedValue,
    typedValue,
    lastValidValue,
    isEmpty,
    resolve,
    refresh,
    clear,
    handleManualModelChange,
    destroyMask,
  }
}
