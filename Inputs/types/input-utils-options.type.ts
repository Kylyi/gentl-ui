// eslint-disable-next-line import/named
import { AnyMaskedOptions } from 'imask'
import { IMaskOptions } from '~/components/Inputs/types/mask-options.type'

// TYPES
import type { IInputProps } from '~/components/Inputs/types/input-props.type'
import { IInputWrapperEventHandlers } from '~/components/Inputs/types/input-wrapper-event-handlers.type'

export interface IInputUtilsOptions {
  props: Omit<IInputProps, 'mask' | 'name'>
  maskRef: Ref<AnyMaskedOptions>
  menuElRef?: MaybeRefOrGetter
  preventFocusOnTouch?: boolean

  eventHandlers?: IInputWrapperEventHandlers

  maskEventHandlers?: {
    onAccept?: () => void
    onCompleted?: (val: any) => void
  }

  /**
   * Refer to {@link IMaskOptions.setModel}
   */
  setModel?: IMaskOptions['setModel']
}
