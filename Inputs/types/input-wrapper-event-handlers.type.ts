export type IInputWrapperEventHandlers = {
  preClick?: (
    clickType: PointerEvent['pointerType'],
    ev?: PointerEvent | MouseEvent
  ) => boolean | void

  onBlur?: (ev?: Event) => void

  onFocus?: (
    clickType: PointerEvent['pointerType'],
    ev?: Event
  ) => boolean | void
}
