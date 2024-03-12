// Types
import { type ISelectorUtilsOptions } from '~/components/Selector/types/selector-utils-options.type'

// Functions
import { useInputWrapperUtils } from '~/components/Inputs/functions/useInputWrapperUtils'

// Store
import { useAppStore } from '~/libs/App/app.store'

export function useSelectorUtils(options: ISelectorUtilsOptions) {
  const { props, menuElRef } = options
  const instance = getCurrentInstance()

  // Utils
  const { getInputWrapperProps } = useInputWrapperUtils()

  // Store
  const appStore = useAppStore()

  // Layout
  const el = ref<any>()
  const inputId = props.id ?? useId()
  const model = useVModel(props, 'modelValue')
  const menuEl = computed(() => toValue(menuElRef))

  // Input methods
  const clear = () => {
    instance?.emit('update:modelValue', props.emptyValue)
  }

  // Wrapper
  const wrapperProps = getInputWrapperProps(props)

  // Click & focus handler
  const preventNextFocus = refAutoReset(false, 50)

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

  function handleFocusOrClick(ev?: Event) {
    if (preventNextFocus.value || appStore.hasUserLeftPage) {
      return
    }

    const isFocusEvent = ev instanceof FocusEvent
    const isSelectEvent = ev?.type === 'select'

    if ((isFocusEvent || isSelectEvent) && props.noShowMenuOnFocus) {
      return
    }

    preventNextFocus.value = true

    if (!props.disabled && !props.readonly) {
      if (isFocusEvent || isSelectEvent) {
        const inputMenu = unrefElement(el.value)?.closest('.floating-element')

        $hide({ all: true, ignoreUntilEl: inputMenu })
      }

      setTimeout(() => {
        menuEl.value?.show()
      })
    }
  }

  // Autofocus on init
  setTimeout(() => {
    if (props.autofocus) {
      handleFocusOrClick()
    }
  }, 300)

  return {
    el,
    inputId,
    model,
    wrapperProps,
    preventNextFocus,

    handleFocusOrClick,
    handleClickWrapper,
    clear,
  }
}
