// Types
import type { IFieldProps } from '~/components/Field/types/field-props.type'

export function useFieldUtils(options?: {
  props?: IFieldProps
  menuElRef?: MaybeRefOrGetter
}) {
  const currentInstance = getCurrentInstance()
  const { props, menuElRef } = options || {}

  // Layout
  const menuEl = computed(() => toValue(menuElRef))

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

    currentInstance?.proxy?.$el.querySelector('.control').focus()

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

    if (!props?.disabled && !props?.readonly) {
      menuEl.value?.show()
    }
  }

  function getFieldProps(props: IFieldProps) {
    return reactivePick(props, [
      'contentStyle',
      'contentClass',
      'controlClass',
      'inputClass',
      'inputStyle',
      'cursor',
      'disabled',
      'errorTakesSpace',
      'errorVisible',
      'hint',
      'label',
      'labelClass',
      'labelStyle',
      'layout',
      'loading',
      'noContent',
      'placeholder',
      'readonly',
      'required',
      'size',
      'stackLabel',
      'validation',
    ])
  }

  return {
    getFieldProps,
    handleClickWrapper,
    handleFocusOrClick,
  }
}
