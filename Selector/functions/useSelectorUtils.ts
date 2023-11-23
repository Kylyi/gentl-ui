import { type ISelectorUtilsOptions } from '~/components/Selector/types/selector-utils-options.type'

export function useSelectorUtils(options: ISelectorUtilsOptions) {
  const { props, menuElRef } = options
  const instance = getCurrentInstance()

  // Layout
  const el = ref<any>()
  const model = useVModel(props, 'modelValue')
  const menuEl = computed(() => toValue(menuElRef))

  // Input methods
  const clear = () => {
    instance?.emit('update:modelValue', props.emptyValue)
  }

  // Wrapper
  const wrapperProps = reactivePick(
    props,
    'contentClass',
    'disabled',
    'emptyValue',
    'validation',
    'errorTakesSpace',
    'errorVisible',
    'hint',
    'inline',
    'label',
    'labelClass',
    'labelInside',
    'modelValue',
    'loading',
    'originalValue',
    'placeholder',
    'readonly',
    'required',
    'size',
    'stackLabel',
    'noBorder',
    'inputContainerClass',
    'inputContainerStyle'
  )

  // Click & focus handler
  const focusedProgramatically = refAutoReset(false, 50)

  // In some cases, we click into the `margin` of the `.wrapper-body__input`
  // which doesn't trigger the focus event on the input. We need to handle
  // this case manually.
  function handleClickWrapper(ev: MouseEvent) {
    if ((ev.target as HTMLElement).classList.contains('wrapper-body__input')) {
      handleFocusOrClick(ev)
    }
  }

  function handleFocusOrClick(ev?: MouseEvent | FocusEvent, noHide?: boolean) {
    if (focusedProgramatically.value) {
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

    handleFocusOrClick,
    handleClickWrapper,
    clear,
  }
}
