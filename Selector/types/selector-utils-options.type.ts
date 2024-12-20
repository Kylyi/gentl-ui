// Types
import type { IInputWrapperEventHandlers } from '~/components/Inputs/types/input-wrapper-event-handlers.type'
import type { ISelectorProps } from '~/components/Selector/types/selector-props.type'

export type ISelectorUtilsOptions = {
  props: ISelectorProps
  menuElRef?: MaybeRefOrGetter

  eventHandlers?: IInputWrapperEventHandlers
}
