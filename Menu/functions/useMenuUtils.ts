// TYPES
import type { IMenuProps } from '~/components/Menu/types/menu-props.type'

export function useMenuUtils() {
  function getMenuProps(props: IMenuProps) {
    return reactivePick(props, [
      'contentClass',
      'cover',
      'dense',
      'fallbackPlacements',
      'fit',
      'headerClass',
      'hideHeader',
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
    ])
  }

  return {
    getMenuProps,
  }
}
