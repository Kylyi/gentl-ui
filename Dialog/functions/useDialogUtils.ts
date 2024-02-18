// Types
import type { IDialogProps } from '~/components/Dialog/types/dialog-props.type'

// Functions
import { useFloatingUIUtils } from '~/components/FloatingUI/functions/useFloatingUIUtils'

export function useDialogUtils() {
  const { getElement } = useFloatingUIUtils()

  function getMenuProps(props: IDialogProps) {
    return reactivePick(props, [
      'beforeHideFnc',
      'manual',
      'maxHeight',
      'modelValue',
      'noOverlay',
      'persistent',
      'position',
      'title',
      'transitionDuration',
      'target',
      'ui',
    ])
  }

  return {
    getMenuProps,
    getElement,
  }
}
