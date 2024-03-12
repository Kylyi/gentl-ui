import type { FactoryOpts } from 'imask'

// Types
import type { IInputProps } from '~/components/Inputs/types/input-props.type'
import { type IInputWrapperEventHandlers } from '~/components/Inputs/types/input-wrapper-event-handlers.type'

export type IInputUtilsOptions = {
  props: Omit<IInputProps, 'mask' | 'name'>
  maskRef: Ref<FactoryOpts>
  menuElRef?: MaybeRefOrGetter
  preventFocusOnTouch?: boolean

  eventHandlers?: IInputWrapperEventHandlers

  maskEventHandlers?: {
    onAccept?: (val: any, ev?: InputEvent) => void
    onCompleted?: (val: any, ev?: InputEvent) => void
  }
}
