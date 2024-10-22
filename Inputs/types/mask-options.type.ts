import type { FactoryOpts } from 'imask'

export type IMaskOptions = {
  modelValue?: Ref<any>
  maskOptions: Ref<FactoryOpts>
  immediateUpdateValueFnc?: (val: any) => void
  updateValueFnc?: (val: any) => void
  emptyValue?: MaybeRefOrGetter<any>

  eventHandlers?: {
    onAccept?: (val: any) => void
    onCompleted?: (val: any) => void
  }

  /**
   * When set to true, input's blur state will not erase the value and will keep the last typed value with the mask
   */
  allowIncompleteMaskValue?: boolean
}
