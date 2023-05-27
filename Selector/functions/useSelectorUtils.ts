import { ISelectorUtilsOptions } from '~~/components/Selector/types/selector-utils-options.type'
import { useAppStore } from '~~/libs/App/app.store'

export function useSelectorUtils(options: ISelectorUtilsOptions) {
  const { props, eventHandlers = {} } = options

  const { lastPointerDownEvent } = storeToRefs(useAppStore())
  const instance = getCurrentInstance()
  const { preClick, onBlur, onFocus } = eventHandlers

  // DATA HANDLING
  const model = useVModel(props, 'modelValue')
  const internalValue = ref(model.value)

  watch(model, val => {
    if (isBlurred.value) {
      internalValue.value = val
    }
  })

  // LAYOUT
  const el = ref<any>()
  const isBlurred = ref(true)
  const isFocusPrevented = ref(false)
  const preventNextBlur = autoResetRef(false, 50)

  // INPUT METHODS
  const clear = (shouldFocusAfterClear?: boolean) => {
    instance?.emit('update:modelValue', props.emptyValue)

    if (shouldFocusAfterClear || !isBlurred) {
      // setTimeout(() => focus(), 0)
    }
  }

  const blur = () => {
    isBlurred.value = true
    unrefElement(el)?.blur()
  }

  const handleFocus = (ev?: Event) => {
    const shouldBlur =
      onFocus?.(lastPointerDownEvent.value!.pointerType, ev) || false
    isBlurred.value = shouldBlur

    if (isBlurred) {
      preventNextBlur.value = true
      blur()
    }
  }

  const handleBlur = () => {
    if (!preventNextBlur.value) {
      onBlur?.()
      blur()
      instance?.emit('blur')
    }
  }

  const handleMouseDown = (ev: MouseEvent) => {
    const shouldFocus =
      preClick?.(lastPointerDownEvent.value!.pointerType, ev) ?? true

    if (!shouldFocus) {
      ev.preventDefault()
      ev.stopPropagation()
    } else if ((ev.target as HTMLElement).nodeName !== 'INPUT') {
      ev.preventDefault()
    }
  }

  // WRAPPER
  const wrapperProps = reactivePick(
    props,
    'contentClass',
    'disabled',
    'emptyValue',
    'errors',
    'errorTakesSpace',
    'errorVisible',
    'hint',
    'inline',
    'label',
    'labelClass',
    'labelInside',
    'loading',
    'placeholder',
    'readonly',
    'required',
    'size',
    'stackLabel'
  )

  return {
    el,
    internalValue,
    wrapperProps,
    isBlurred,
    isFocusPrevented,

    handleMouseDown,
    handleBlur,
    handleFocus,
    clear,
  }
}
