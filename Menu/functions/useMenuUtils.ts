// Types
import type { IMenuProps } from '~/components/Menu/types/menu-props.type'

// Functions
import { useFloatingUIUtils } from '~/components/FloatingUI/functions/useFloatingUIUtils'

export function useMenuUtils() {
  const { getElement } = useFloatingUIUtils()

  function getMenuProps(props: IMenuProps) {
    return reactivePick(props, [
      'beforeHideFnc',
      'cover',
      'fallbackPlacements',
      'fit',
      'manual',
      'matchWidth',
      'maxHeight',
      'modelValue',
      'noArrow',
      'noOverlay',
      'noUplift',
      'offset',
      'persistent',
      'placement',
      'title',
      'transitionDuration',
      'target',
      'referenceTarget',
      'ui',
    ])
  }

  return {
    getMenuProps,
    getElement,
  }
}
