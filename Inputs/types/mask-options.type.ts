// eslint-disable-next-line import/named
import { AnyMaskedOptions } from 'imask'

export interface IMaskOptions {
  modelValue?: Ref<any>
  maskOptions: Ref<AnyMaskedOptions>
  updateValueFnc?: (val: any) => void
  emptyValue?: MaybeRefOrGetter<any>

  eventHandlers?: {
    onAccept?: () => void
    onCompleted?: (val: any) => void
  }
}
