// eslint-disable-next-line import/named
import { type AnyMaskedOptions } from 'imask'

export interface IMaskOptions {
  modelValue?: Ref<any>
  maskOptions: Ref<AnyMaskedOptions>
  immediateUpdateValueFnc?: (val: any) => void
  updateValueFnc?: (val: any) => void
  emptyValue?: MaybeRefOrGetter<any>

  eventHandlers?: {
    onAccept?: () => void
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
}
