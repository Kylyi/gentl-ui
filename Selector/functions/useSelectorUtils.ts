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
  const model = useVModel(props, 'modelValue')
  const menuEl = computed(() => toValue(menuElRef))

  // Input methods
  const clear = () => {
    instance?.emit('update:modelValue', props.emptyValue)
  }

  // Wrapper
  const wrapperProps = getInputWrapperProps(props)

  // Click & focus handler
  const focusedProgramatically = refAutoReset(false, 50)

  // In some cases, we click into the `margin` of the `.wrapper-body__input`
  // which doesn't trigger the focus event on the input. We need to handle
  // this case manually.
  function handleClickWrapper(ev: MouseEvent) {
    const target = ev.target as HTMLElement
    const clickedInput = target.classList.contains('wrapper-body__input')
    const clickedPrepend = target.classList.contains('prepend')
    const clickedAppend = target.classList.contains('append')

    if (clickedInput || clickedPrepend || clickedAppend) {
      handleFocusOrClick(ev)
    }
  }

  function handleFocusOrClick(ev?: MouseEvent | FocusEvent, noHide?: boolean) {
    if (focusedProgramatically.value || appStore.hasUserLeftPage) {
      return
    }

    if (ev instanceof FocusEvent && props.noAutoShowMenuOnFocus) {
      return
    }

    // When clicked self and menu is already open, don't do anything
    const currentMenuDom = menuEl.value?.getFloatingEl()

    if (currentMenuDom) {
      return
    }

    focusedProgramatically.value = true
    blurAnyFocusedInput()

    const hasClickedInsideFloatingElement = !!(
      ev?.target as HTMLElement
    )?.closest('.floating-element')

    if (!hasClickedInsideFloatingElement && !noHide) {
      document.querySelectorAll('.floating-element').forEach(el => {
        const currentMenuDom = menuEl.value?.getFloatingEl()

        if (el !== currentMenuDom) {
          el.setAttribute('hide-trigger', '')
        }
      })
    }

    if (!props.disabled && !props.readonly) {
      menuEl.value?.show()
    }
  }

  // Autofocus on init
  setTimeout(() => {
    if (props.autofocus) {
      handleFocusOrClick(undefined, true)
    }
  }, 300)

  return {
    el,
    model,
    wrapperProps,
    focusedProgramatically,

    handleFocusOrClick,
    handleClickWrapper,
    clear,
  }
}
