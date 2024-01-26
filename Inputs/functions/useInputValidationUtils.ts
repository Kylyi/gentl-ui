// Types
import type { IInputWrapperProps } from '~/components/Inputs/types/input-wrapper-props.type'

export function useInputValidationUtils(props: IInputWrapperProps) {
  const isRequired = computed(() => {
    return Array.isArray(props.validation)
      ? props.validation.some(item => item?.required)
      : props.validation?.required
  })

  const path = computed(() => {
    return Array.isArray(props.validation)
      ? props.validation.map(item => item?.path).join('.')
      : props.validation?.path
  })

  const issues = computed(() => {
    return Array.isArray(props.validation)
      ? (props.validation.flatMap(v => v?.messages).filter(Boolean) as string[])
      : props.validation?.messages || []
  })

  return { isRequired, issues, path }
}
