import type { AnyMaskedOptions } from 'imask'

export interface IMaskOptions {
  modelValue?: Ref<any>
  maskOptions: Ref<AnyMaskedOptions>
  immediateUpdateValueFnc?: (val: any) => void
  updateValueFnc?: (val: any) => void
  emptyValue?: MaybeRefOrGetter<any>

  eventHandlers?: {
    onAccept?: (val: any) => void
    onCompleted?: (val: any) => void
  }

  /**
   * In case we set the model value NOT via `update:model-value`, we can use this function
   *
   * Example
   * 1. We use `defineModel` in the actual input with { local: true }
   * 2. We don't provide any `modelValue` to the input
   *
   * In this case, we should change the model via this function as
   * (val: any) => model.value = 'new value'
   */
  setModel?: (value: any) => void

  /**
   * When set to true, input's blur state will not erase the value and will keep the last typed value with the mask
   */
  allowIncompleteMaskValue?: boolean
}
