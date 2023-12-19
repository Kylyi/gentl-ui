import type { MaskedOptions } from 'imask'
import { type IMaskOptions } from '~/components/Inputs/types/mask-options.type'

// Types
import type { IInputProps } from '~/components/Inputs/types/input-props.type'
import { type IInputWrapperEventHandlers } from '~/components/Inputs/types/input-wrapper-event-handlers.type'

export type IInputUtilsOptions = {
  props: Omit<IInputProps, 'mask' | 'name'>
  maskRef: Ref<MaskedOptions>
  menuElRef?: MaybeRefOrGetter
  preventFocusOnTouch?: boolean

  eventHandlers?: IInputWrapperEventHandlers

  maskEventHandlers?: {
    onAccept?: (val: any) => void
    onCompleted?: (val: any) => void
  }

  /**
   * Refer to {@link IMaskOptions.setModel}
   */
  setModel?: IMaskOptions['setModel']
}
