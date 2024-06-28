import type { FactoryOpts } from 'imask'

// Types
import type { IInputProps } from '~/components/Inputs/types/input-props.type'
import type { IInputWrapperEventHandlers } from '~/components/Inputs/types/input-wrapper-event-handlers.type'

type MaskRefs = {
  typed: Ref<any>
  unmasked: Ref<any>
  masked: Ref<any>
}

export type IInputUtilsOptions = {
  props: Omit<IInputProps, 'mask' | 'name'>
  maskRef: Ref<FactoryOpts>
  menuElRef?: MaybeRefOrGetter
  preventFocusOnTouch?: boolean

  eventHandlers?: IInputWrapperEventHandlers

  maskEventHandlers?: {
    /**
     * In case this function returns some value, it will be used to set the model
     *
     * NOTE: This should return the `typed` value
     */
    onAccept?: (val: any, ev?: InputEvent, refs?: MaskRefs) => void | any
    onCompleted?: (val: any, ev?: InputEvent) => void
  }
}
