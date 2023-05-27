// eslint-disable-next-line import/named
import IMask, { InputMask, createMask } from 'imask'

// TYPES
import type { IMaskOptions } from '~~/components/Inputs/types/mask-options.type'

const activeElement = useActiveElement()

export function useMask(options: IMaskOptions) {
  const {
    modelValue = ref(''),
    maskOptions,
    updateValueFnc,
    emptyValue,
    eventHandlers,
  } = options

  const instance = getCurrentInstance()

  // LAYOUT
  const el = ref<HTMLInputElement | HTMLTextAreaElement>()
  const mask = createMask(unref(maskOptions))
  const elMask = ref<InputMask<any> | null>()
  const hasBeenCleared = ref(false)

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
    if (elMask.value && !hasBeenCleared.value) {
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

  // STATE
  const lastValidValue = ref<any>(unref(modelValue))
  const maskedValue = ref<string | undefined>()
  const unmaskedValue = ref<string | undefined>(String(unref(modelValue)))
  const typedValue = ref<string | number | Date | undefined>(unref(modelValue))

  const isEmpty = computed(() => {
    return (
      typedValue.value === unref(emptyValue) ||
      isNil(unref(typedValue)) ||
      unmaskedValue.value === ''
    )
  })

  const handleManualModelChange = (val: any) => {
    if (elMask.value) {
      elMask.value.typedValue = val
    }
  }

  const handleAccept = () => {
    maskedValue.value = elMask.value?.value
    unmaskedValue.value = elMask.value?.unmaskedValue
    typedValue.value = elMask.value?.typedValue

    hasBeenCleared.value = false
    eventHandlers?.onAccept?.()

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

    if (updateValueFnc) {
      updateValueFnc(lastValidValue.value)
    } else {
      instance?.emit('update:model-value', lastValidValue.value)
    }
  }

  // INITIALIZE
  maskedValue.value = resolve(unref(modelValue))

  // WATCH FOR MASK OPTIONS CHANGE
  watch(
    maskOptions,
    maskOptions => {
      elMask.value?.updateOptions(maskOptions)
      mask.updateOptions(maskOptions as any)
    },
    { deep: true }
  )

  // WATCH FOR ELEMENT CHANGE
  // Also serves as SSR handler
  watch(el, el => {
    if (el) {
      destroyMask()
      elMask.value = IMask(el, unref(maskOptions))
      elMask.value.typedValue = modelValue.value

      elMask.value.on('accept', handleAccept)
      elMask.value.on('complete', handleComplete)
    }
  })

  // WATCH FOR MODEL CHANGES
  watch(modelValue, modelValue => {
    if (activeElement.value !== el.value && elMask.value) {
      lastValidValue.value = modelValue

      if (lastValidValue.value === unref(emptyValue)) {
        elMask.value.value = resolve(lastValidValue.value)
      } else {
        elMask.value.typedValue = modelValue
      }
    }
  })

  onBeforeUnmount(destroyMask)

  return {
    el,
    elMask,
    maskedValue,
    unmaskedValue,
    typedValue,
    isEmpty,
    resolve,
    refresh,
    clear,
    handleManualModelChange,
  }
}
