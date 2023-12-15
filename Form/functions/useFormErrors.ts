export type IErrorExtended = {
  errorText: string
  count: number
  idx: number
}

export function useFormErrors(
  errorsRef: MaybeRefOrGetter<string[]>,
  emits: any
) {
  const errorsExtended = computed(() => {
    const errors = toValue(errorsRef)

    if (!errors) {
      return []
    }

    const numberOfErrorsByErrorText: Record<string, any> = {}

    return errors.reduce<IErrorExtended[]>((agg, err, idx) => {
      if (numberOfErrorsByErrorText[err] === undefined) {
        const errObj = { errorText: err, count: 1, idx }

        numberOfErrorsByErrorText[err] = errObj

        agg.push(errObj)
      } else {
        numberOfErrorsByErrorText[err].count++
      }

      return agg
    }, [])
  })

  const handleDismissError = (error: IErrorExtended) => {
    const errors = toValue(errorsRef)

    emits(
      'update:errors',
      errors.filter(err => err !== error.errorText)
    )
  }

  return {
    errorsExtended,
    handleDismissError,
  }
}
