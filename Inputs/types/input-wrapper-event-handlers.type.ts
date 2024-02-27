export type IInputWrapperEventHandlers = {
  onBlur?: (ev?: Event) => void

  onFocus?: (
    clickType: PointerEvent['pointerType'],
    ev?: Event
  ) => boolean | void
}
