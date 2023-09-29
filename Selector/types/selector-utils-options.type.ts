import { IInputWrapperEventHandlers } from '~/components/Inputs/types/input-wrapper-event-handlers.type'
import { ISelectorProps } from '~/components/Selector/types/selector-props.type'

export interface ISelectorUtilsOptions {
  props: ISelectorProps
  menuElRef?: MaybeRefOrGetter

  eventHandlers?: IInputWrapperEventHandlers
}
