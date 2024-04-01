// Types
import type { IInputWrapperProps } from '~/components/Inputs/types/input-wrapper-props.type'

export function useInputValidationUtils(props: IInputWrapperProps) {
  const $z = useZod(
    typeof props.zod === 'string'
      ? { watchOnly: true }
      : { ...props.zod?.options, watchOnly: true }
  )

  const validation = computed(() => {
    if (props.validation) {
      return props.validation
    }

    if (props.zod) {
      return $z.value.$getValidationForField(
        typeof props.zod === 'string' ? props.zod : props.zod?.key
      )
    }
  })

  const isRequired = computed(() => {
    if (props.zod) {
      return $z.value.$isFieldRequired(
        typeof props.zod === 'string' ? props.zod : props.zod?.key
      )
    }

    return Array.isArray(validation.value)
      ? validation.value.some(item => item?.$required)
      : validation.value?.$required
  })

  const path = computed(() => {
    return Array.isArray(validation.value)
      ? validation.value.map(item => item?.$path).join('.')
      : validation.value?.$path
  })

  const issues = computed(() => {
    return Array.isArray(validation.value)
      ? (validation.value
          .flatMap(v => v?.$messages)
          .filter(Boolean) as string[])
      : validation.value?.$messages || []
  })

  return {
    isRequired,
    issues,
    path,
    validation,
  }
}
