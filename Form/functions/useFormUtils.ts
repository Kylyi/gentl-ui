import type { IFormProps } from '~/components/Form/types/form-props.type'

export function useFormUtils() {
  function getFormProps(props: IFormProps) {
    return reactivePick(props, [
      'editControls',
      'errors',
      'focusFirstInput',
      'hasControls',
      'label',
      'loading',
      'noSubmit',
      'noGrow',
      'noControls',
      'preventSubmitOnEnter',
      'reset',
      'submitConfirmation',
      'submitDisabled',
      'ui',
    ])
  }

  return { getFormProps }
}
