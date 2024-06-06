export function useContextMenuUtils() {
  // Event coordinates
  const { x, y } = useMouse()

  /** Get X and Y coordinates depending on `ContextMenu` open trigger position */
  function getCoordsForMenu(list: HTMLUListElement, rootDiv?: HTMLDivElement) {
    const { width: listWidth, height: listHeight } =
      list.getBoundingClientRect()

    const { innerWidth, innerHeight } = window

    // Calculations for the main context menu by event coordinates
    if (!rootDiv) {
      return {
        x: listWidth + x.value > innerWidth ? x.value - listWidth : x.value,
        y: listHeight + y.value > innerHeight ? y.value - listHeight : y.value,
      }
    }

    // Calculations for sub-menus
    const {
      x: rootX,
      y: rootY,
      width: rootWidth,
      height: rootHeight,
    } = rootDiv.getBoundingClientRect()

    // Check if there is one more list in parents
    const rootUl = rootDiv.closest('.context-menu-list')
    const rootUlParent = rootUl?.parentElement

    // If there is one more list in parents, then check if it's shifted by axes
    const isShiftedParentX =
      Number(rootUlParent?.getBoundingClientRect()?.x) > rootX
    const isShiftedParentY =
      Number(rootUlParent?.getBoundingClientRect()?.y) > rootY

    // Coordinates to shift by axes
    const leftSide = rootX - listWidth
    const bottomSide = rootY - listHeight + rootHeight

    // Conditions for shifting by axes
    const needShiftByX =
      rootWidth + listWidth + rootX > innerWidth || isShiftedParentX
    const needShiftByY =
      rootHeight + listHeight + rootY > innerHeight || isShiftedParentY

    return {
      x: needShiftByX ? leftSide : rootX + rootWidth,
      y: needShiftByY ? bottomSide : rootY,
    }
  }

  return {
    getCoordsForMenu,
  }
}
