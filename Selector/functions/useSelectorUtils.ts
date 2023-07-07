import { ISelectorUtilsOptions } from '~~/components/Selector/types/selector-utils-options.type'

export function useSelectorUtils(options: ISelectorUtilsOptions) {
  const { props, menuElRef } = options
  const instance = getCurrentInstance()

  // LAYOUT
  const el = ref<any>()
  const model = useVModel(props, 'modelValue')
  const menuEl = computed(() => toValue(menuElRef))

  // INPUT METHODS
  const clear = () => {
    instance?.emit('update:modelValue', props.emptyValue)
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

  function handleFocusOrClick(ev: MouseEvent | FocusEvent) {
    if (focusedProgramatically.value) {
      return
    }

    focusedProgramatically.value = true

    blurAnyFocusedInput()

    const hasClickedInsideFloatingElement = !!(
      ev.target as HTMLElement
    ).closest('.floating-element')

    if (!hasClickedInsideFloatingElement) {
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

  return {
    el,
    model,
    wrapperProps,

    handleFocusOrClick,
    handleClickWrapper,
    clear,
  }
}
