// COMPOSITION FUNCTIONS
import { useMask } from '@/components/Inputs/functions/useMask'

// TYPES
import type { IInputUtilsOptions } from '~~/components/Inputs/types/input-utils-options.type'

// STORE
import { useAppStore } from '~~/libs/App/app.store'

export function useInputUtils(options: IInputUtilsOptions) {
  const { props, maskRef, eventHandlers = {}, maskEventHandlers } = options

  const { lastPointerDownEvent } = storeToRefs(useAppStore())
  const instance = getCurrentInstance()
  const { preClick, onBlur, onFocus } = eventHandlers
  const hasBeenTouched = ref(false)

  const debouncedChange = useDebounceFn((val: any) => {
    if (!props.emitOnBlur) {
      instance?.emit('update:model-value', val)
      touch()
    }
  }, props.debounce)

  // MASK
  const { modelValue, emptyValue } = toRefs(props)
  const {
    el,
    elMask,
    hasJustChanged,
    refresh,
    maskedValue,
    typedValue,
    lastValidValue,
    isEmpty,
    clear: clearMask,
    handleManualModelChange,
  } = useMask({
    modelValue,
    maskOptions: maskRef,
    updateValueFnc: debouncedChange,
    emptyValue,
    eventHandlers: maskEventHandlers,
  })

  // WRAPPER
  const wrapperProps = reactivePick(
    props,
    'contentClass',
    'contentStyle',
    'disabled',
    'emptyValue',
    'errors',
    'errorTakesSpace',
    'errorVisible',
    'hint',
    'inline',
    'label',
    'labelStyle',
    'labelClass',
    'labelInside',
    'loading',
    'placeholder',
    'readonly',
    'required',
    'size',
    'stackLabel'
  )

  // LAYOUT
  const isBlurred = ref(true)
  const preventNextBlur = autoResetRef(false, 50)

  // INPUT METHODS
  const focus = (alignCursor?: boolean) => {
    unrefElement(el)?.focus()

    if (alignCursor) {
      setTimeout(() => elMask.value?.updateCursor(elMask.value.value.length), 0)
    }
  }
  const select = () => unrefElement(el)?.select()
  const reset = () => (hasBeenTouched.value = false)
  const touch = () => (hasBeenTouched.value = true)
  const getInputElement = () => el
  const blur = () => {
    isBlurred.value = true
    unrefElement(el)?.blur()
  }

  const clear = (shouldFocusAfterClear?: boolean) => {
    touch()
    clearMask()

    if (shouldFocusAfterClear || !isBlurred.value) {
      setTimeout(() => focus(), 0)
    }
  }

  const handleFocus = (ev: Event) => {
    setTimeout(() => elMask.value?.alignCursorFriendly())

    const shouldBlur =
      onFocus?.(lastPointerDownEvent.value!.pointerType, ev) || false
    isBlurred.value = shouldBlur

    if (isBlurred.value) {
      preventNextBlur.value = true
      blur()
    }
  }

  const handleMouseDown = (ev: MouseEvent) => {
    const evTarget = ev.target as HTMLElement

    // We prevent focusing the input when clicking the label
    // (label has a `pointer-events: none` ~ we check the `wrapper-body` instead)
    if (evTarget.classList.contains('wrapper-body') && props.inline) {
      ev.preventDefault()
      ev.stopPropagation()

      return
    }

    const shouldFocus =
      preClick?.(lastPointerDownEvent.value!.pointerType, ev) ?? true

    if (!shouldFocus) {
      ev.preventDefault()
      ev.stopPropagation()
    } else {
      const isTargetInput =
        (ev.target as HTMLElement).nodeName === 'INPUT' ||
        (ev.target as HTMLElement).nodeName === 'TEXTAREA'

      if (!isTargetInput) {
        ev.preventDefault()
      }

      focus(!isTargetInput)
    }
  }

  const handleBlur = () => {
    if (!preventNextBlur.value) {
      onBlur?.()
      blur()
      refresh()

      if (props.emitOnBlur) {
        hasJustChanged.value = true
        instance?.emit('update:model-value', lastValidValue.value)
        touch()
      }

      instance?.emit('blur')
    }
  }

  // TOUCH & AUTOFOCUS on init
  setTimeout(() => {
    if (props.autofocus) {
      focus()
    }
    if (props.immediate) {
      touch()
    }

    const val = unref(modelValue)
    const isEmptyValue =
      isNil(val) || val === '' || val === unref(props.emptyValue)

    if (!isEmptyValue) {
      touch()
    }
  })

  return {
    el,
    maskedValue,
    typedValue,
    hasBeenTouched,
    isBlurred,
    wrapperProps,
    hasNoValue: isEmpty,
    handleMouseDown,
    handleBlur,
    handleFocus,
    clear,
    focus,
    select,
    blur,
    reset,
    touch,
    getInputElement,
    handleManualModelChange,
  }
}
