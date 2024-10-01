// Store
import { useTreeStore } from '~/components/Tree/tree.store'

export function useTreeDragAndDrop() {
  // Store
  const { containerEl, draggedItem } = storeToRefs(useTreeStore())

  const containerElRect = ref<DOMRect>()

  const { y: scrollY } = useScroll(containerEl, {
    onScroll: () => handleDragging(),
  })

  function handleDragging() {
    const pos = draggedItem.value?.pos

    if (!pos) {
      return
    }

    // Define positions for later use
    const posX = pos.x ?? 0
    const posY = pos.y ?? 0

    // Get all elements from the point where we are dragging the item
    // and get the dragged-over query builder row
    const els = document.elementsFromPoint(posX, posY)
    const treeItem = els.find(el => el.classList.contains('tree-node-item')) as HTMLElement
    const treeItemPath = treeItem?.dataset.path

    // When no item is found, we don't really do anything
    // We also do nothing when we're dragging over the same row
    // We also do nothing when we're dragging over descendants of the dragged item (only if nested)
    if (
      !treeItem
      || treeItem.classList.contains('no-dragover')
      || treeItemPath === draggedItem.value?.currentPath
      || (treeItemPath?.includes('.') && treeItemPath?.startsWith(draggedItem.value?.currentPath || ''))
    ) {
      return
    }

    // When hovering over parent, we need to adjust the position of drop
    // indicator a bit because the parent also has controls elements
    const isParent = treeItem?.classList.contains('has-children')

    const {
      x: rowX,
      y: rowY,
      height: rowHeight,
      width: rowWidth,
    } = treeItem.getBoundingClientRect()

    // const relativePositionX = (posX - rowX) / rowWidth
    const relativePositionY = (posY - rowY) / rowHeight

    // When we hover in top side of the item, we indicate that we want to
    // drop the dragged item before the hovered item
    if (relativePositionY < 0.5) {
      const offset = {
        x: 0,
        y: 0,
        // y: isParent ? GROUP_ROW_TITLE_HEIGHT : 0,
      }

      draggedItem.value!.dropIndicatorPos = {
        x: rowX + offset.x - (containerElRect.value?.x ?? 0),
        y: rowY + offset.y + scrollY.value - (containerElRect.value?.y ?? 0),
        width: rowWidth,
      }

      draggedItem.value!.dropDirection = 'above'
    }

    // When we hover in bottom side of the item, we indicate that we want to
    // drop the dragged item below the hovered item
    else {
      const offset = {
        x: 0,
        y: 0,
        // y: isParent ? GROUP_ROW_CONTROLS_HEIGHT : 0,
      }

      draggedItem.value!.dropIndicatorPos = {
        x: rowX + offset.x - (containerElRect.value?.x ?? 0),
        y: rowY
          + offset.y
          + scrollY.value
          + rowHeight
          - (containerElRect.value?.y ?? 0),
        width: rowWidth,
      }

      draggedItem.value!.dropDirection = 'below'
    }

    draggedItem.value!.newPath = treeItemPath
  }

  whenever(
    () => draggedItem.value?.pos,
    () => handleDragging(),
  )

  return {
    containerEl,
    containerElRect,
  }
}
