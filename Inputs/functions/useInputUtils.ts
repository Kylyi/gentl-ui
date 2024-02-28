// Types
import type { IInputUtilsOptions } from '~/components/Inputs/types/input-utils-options.type'

// Functions
import { useMask } from '~/components/Inputs/functions/useMask'

// Store
import { useAppStore } from '~/libs/App/app.store'

export function useInputUtils(options: IInputUtilsOptions) {
  const {
    props,
    maskRef,
    eventHandlers = {},
    maskEventHandlers,
    menuElRef,
    preventFocusOnTouch,
    setModel,
  } = options

  const appStore = useAppStore()
  const instance = getCurrentInstance()
  const { onBlur, onFocus } = eventHandlers
  const hasBeenTouched = ref(false)

  const debouncedChange = useDebounceFn((val: any) => {
    if (!props.emitOnBlur) {
      setModel?.(val) ?? instance?.emit('update:model-value', val)
    }
  }, props.debounce)

  // Mask
  const { modelValue, emptyValue } = toRefs(props)
  const {
    el,
    elMask,
    hasJustChanged,
    refresh,
    destroyMask,
    maskedValue,
    typedValue,
    lastValidValue,
    isEmpty,
    clear: clearMask,
    handleManualModelChange,
  } = useMask({
    modelValue,
    allowIncompleteMaskValue: props.allowIncompleteMaskValue,
    maskOptions: maskRef,
    updateValueFnc: debouncedChange,
    emptyValue,
    eventHandlers: maskEventHandlers,
    setModel,
  })

  // Wrapper
  const wrapperProps = reactivePick(
    props,
    'disabled',
    'emptyValue',
    'errorTakesSpace',
    'errorVisible',
    'hint',
    'label',
    'layout',
    'loading',
    'modelValue',
    'originalValue',
    'placeholder',
    'readonly',
    'required',
    'size',
    'stackLabel',
    'noBorder',
    'validation',
    'ui',
    'zod'
  )

  // Layout
  const isBlurred = ref(true)
  const menuEl = computed(() => toValue(menuElRef))
  const hasContent = computed(() => {
    return props.hasContent || !isEmpty.value
  })

  const hasClearableBtn = computed(() => {
    return (
      !props.readonly && !props.disabled && props.clearable && hasContent.value
    )
  })

  // Input methods
  const getInputElement = () => el.value
  const select = () => unrefElement(el)?.select()

  const focus = (alignCursor?: boolean) => {
    unrefElement(el)?.focus()

    if (alignCursor === true) {
      elMask.value?.alignCursorFriendly()
    }
  }

  const blur = () => {
    isBlurred.value = true
    unrefElement(el)?.blur()
  }

  const clear = (shouldFocusAfterClear?: boolean) => {
    clearMask()

    if (shouldFocusAfterClear || !isBlurred.value) {
      setTimeout(() => focus(), 0)
    }
  }

  function handleBlur(ev: FocusEvent) {
    const relatedTarget = ev.relatedTarget as HTMLElement
    const lastTarget = appStore.lastPointerDownEl

    const isFocusable =
      lastTarget?.classList.contains('input-wrapper__focusable') ||
      !!lastTarget?.closest('.input-wrapper__focusable')

    const isSameWrapper =
      el.value?.closest('.wrapper__body') ===
      lastTarget?.closest('.wrapper__body')

    // `Tab` handling
    const relatedTargetWrapper = relatedTarget?.closest('.wrapper__body')
    const isRelatedTargetFocusable =
      !relatedTargetWrapper ||
      relatedTargetWrapper === el.value?.closest('.wrapper__body')

    // We prevent the blur event when clicking on focusable elements
    // in the same wrapper
    if (isFocusable && isSameWrapper && isRelatedTargetFocusable) {
      ev.preventDefault()
      focus()

      return
    }

    isBlurred.value = true

    onBlur?.()
    blur()
    refresh()

    if (props.emitOnBlur) {
      hasJustChanged.value = true
      setModel?.(lastValidValue.value) ??
        instance?.emit('update:model-value', lastValidValue.value)
    }

    instance?.emit('blur')
  }

  // In some cases, we click into the wrapper but not directly in the `.control`
  // element, so the `focus` does not get triggered. We need to handle this case manually
  function handleClickWrapper(ev: MouseEvent) {
    const target = ev.target as HTMLElement
    const isFocusable =
      target.classList.contains('input-wrapper__focusable') ||
      !!target.closest('.input-wrapper__focusable')

    if (isFocusable) {
      handleFocusOrClick(ev)
    }
  }

  // Click & focus handling
  function handleFocusOrClick(ev?: Event) {
    if (appStore.hasUserLeftPage) {
      return
    }

    const isSelectEvent = ev?.type === 'select'
    const isFocusEvent = ev instanceof FocusEvent

    if (!props.disabled && !props.readonly) {
      if (isFocusEvent || isSelectEvent) {
        const inputMenu = el.value?.closest('.floating-element')

        $hide({ all: true, ignoreUntilEl: inputMenu })
      }

      menuEl.value?.show()
    }

    // In some cases, for example `DateInput`, we don't want to focus the input
    // on mobile phones
    const isTouchEvent = appStore.lastPointerDownEvent?.pointerType !== 'mouse'
    const isFocusPrevented = preventFocusOnTouch && isTouchEvent

    // When event is not a `FocusEvent`, we focus it and align the cursor
    const isInputFocused = appStore.activeElement === el.value

    if (
      !isFocusEvent &&
      !isSelectEvent &&
      !isInputFocused &&
      !isFocusPrevented
    ) {
      focus(true)
    }

    if (isFocusPrevented) {
      blur()

      return
    }

    isBlurred.value = false

    onFocus?.(isTouchEvent ? 'touch' : 'mouse', ev)
  }

  // Autofocus on init
  setTimeout(() => {
    if (props.autofocus) {
      focus()
    }
  }, 300)

  onBeforeUnmount(destroyMask)

  return {
    el,
    maskedValue,
    typedValue,
    hasBeenTouched,
    isBlurred,
    wrapperProps,
    hasNoValue: isEmpty,
    hasClearableBtn,
    hasContent,
    handleBlur,
    clear,
    focus,
    select,
    blur,
    getInputElement,
    handleManualModelChange,
    handleFocusOrClick,
    handleClickWrapper,
    elMask,
  }
}
