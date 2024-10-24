// Types
import type { IFieldProps } from '~/components/Field/types/field-props.type'

// Store
import { useAppStore } from '~/libs/App/app.store'

export function useFieldUtils(options?: {
  props?: IFieldProps
  menuElRef?: MaybeRefOrGetter
}) {
  const { menuElRef } = options || {}

  // Store
  const appStore = useAppStore()

  // Utils
  const instance = getCurrentInstance()

  // Layout
  const el = ref<HTMLDivElement>()
  const inputId = options?.props?.id ?? useId()
  const isBlurred = ref(true)
  const menuEl = computed(() => toValue(menuElRef))

  const inputElement = computed(() => {
    return unrefElement(el.value as any) as HTMLInputElement | undefined
  })

  // In some cases, we click into the wrapper but not directly in the `.control`
  // element, so the `focus` does not get triggered. We need to handle this case manually
  function handleClickWrapper(ev: MouseEvent) {
    const target = ev.target as HTMLElement
    const isFocusable
      = target.classList.contains('input-wrapper__focusable')
      || !!target.closest('.input-wrapper__focusable')

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

    if (!options?.props?.disabled && !options?.props?.readonly) {
      const shouldHideFloating = !options?.props?.noHideFloating

      if (shouldHideFloating && (isFocusEvent || isSelectEvent)) {
        const inputMenu = inputElement.value?.closest('.floating-element')

        $hide({ all: true, ignoreUntilEl: options?.props?.hideUntilEl ?? inputMenu })
      }

      nextTick(() => {
        menuEl.value?.show()
      })
    }

    // When event is not a `FocusEvent`, we focus it and align the cursor
    const isInputFocused = appStore.activeElement === inputElement.value

    // We need to manually focus the input when necessary, ie. when the event
    // would not focus the input automatically
    if (
      !isFocusEvent
      && !isSelectEvent
      && !isInputFocused
    ) {
      focus()
    }

    isBlurred.value = false

    instance?.emit('focus')
  }

  function getFieldProps(props: IFieldProps) {
    return reactivePick(props, [
      'controlClass',
      'inputClass',
      'inputStyle',
      'cursor',
      'disabled',
      'errorTakesSpace',
      'errorVisible',
      'hint',
      'label',
      'layout',
      'loading',
      'noBorder',
      'noContent',
      'placeholder',
      'readonly',
      'required',
      'size',
      'stackLabel',
      'validation',
      'ui',
    ])
  }

  provide('inputId', inputId)

  return {
    el,
    inputId,
    getFieldProps,
    handleClickWrapper,
    handleFocusOrClick,
  }
}
