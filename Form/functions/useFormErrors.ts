export type IErrorExtended = {
  errorText: string
  count: number
  idx: number
}

export function useFormErrors(
  errorsRef: MaybeRefOrGetter<Array<string | ErrorObject>>,
  emits: any
) {
  const errorsExtended = computed(() => {
    const errors = toValue(errorsRef)

    if (!errors) {
      return []
    }

    const numberOfErrorsByErrorText: Record<string, any> = {}

    return errors.reduce<IErrorExtended[]>((agg, err, idx) => {
      const errMessage = toValue(typeof err === 'object' ? err.$message : err)

      if (numberOfErrorsByErrorText[errMessage] === undefined) {
        const errObj = { errorText: errMessage, count: 1, idx }

        numberOfErrorsByErrorText[errMessage] = errObj

        agg.push(errObj)
      } else {
        numberOfErrorsByErrorText[errMessage].count++
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
