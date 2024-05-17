// Types
import type { IListDraggedItem } from '~/components/List/types/list-dragged-item.type'

// Injections
import {
  listDraggedItemKey, listEmitDragEndEventKey, listEmitDragStartEventKey } from '~/components/List/provide/list.provide'

// Constants
const GROUP_ROW_TITLE_HEIGHT = 38
const GROUP_ROW_CONTROLS_HEIGHT = -38

export function useListDragAndDrop(
  listEl: Ref<HTMLDivElement>
) {
  const self = getCurrentInstance()!
  const draggedItem = ref<IListDraggedItem>()
  const listElRect = ref<DOMRect>()


  provide(listDraggedItemKey, draggedItem)
  provide(listEmitDragStartEventKey, payload => self.emit('drag:start', payload))
  provide(listEmitDragEndEventKey, payload => self.emit('drag:end', payload))

  const { y: scrollY } = useScroll(listEl, {
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
    // and get the dragged-over list row
    const els = document.elementsFromPoint(posX, posY)
    const listRow = els.find(el => el.classList.contains('list-row')) as HTMLElement
    const listRowPath = listRow?.dataset.path
    // When no list row is found, we don't really do anything
    // We also do nothing when we're dragging over the same row
    // We also do nothing when we're dragging over descendants of the dragged item
    if (
      !listRow ||
      listRow.classList.contains('no-dragover') ||
      listRowPath === draggedItem.value?.row.path ||
      listRowPath?.startsWith(draggedItem.value?.path || '')
    ) {
      return
    }

    // When hovering over group, we need to adjust the position of drop
    // indicator a bit because the group also has a controls row and the title row
    const isGroup = listRow?.classList.contains('list-group')

    // @ts-expect-error - TS doesn't know about our custom functions
    const draggedOverItem = listRow?.getItem()
    draggedItem.value!.target = draggedOverItem

    const {
      x: rowX,
      y: rowY,
      height: rowHeight,
      width: rowWidth,
    } = listRow.getBoundingClientRect()

    const relativePositionY = (posY - rowY) / rowHeight

    // When we hover in top side of the item, we indicate that we want to
    // drop the dragged item before the hovered item
    if (relativePositionY < 0.5) {
      const offset = {
        x: 0,
        y: isGroup ? GROUP_ROW_TITLE_HEIGHT : 0,
      }

      draggedItem.value!.dropIndicatorPos = {
        x: rowX + offset.x - (listElRect.value?.x ?? 0),
        y: rowY + offset.y + scrollY.value - (listElRect.value?.y ?? 0),
        width: rowWidth,
      }

      draggedItem.value!.dropDirection = 'above'
    }

    // When we hover in bottom side of the item, we indicate that we want to
    // drop the dragged item below the hovered item
    else {
      const offset = {
        x: 0,
        y: isGroup ? GROUP_ROW_CONTROLS_HEIGHT : 0,
      }

      draggedItem.value!.dropIndicatorPos = {
        x: rowX + offset.x - (listElRect.value?.x ?? 0),
        y:
          rowY +
          offset.y +
          scrollY.value +
          rowHeight -
          (listElRect.value?.y ?? 0),
        width: rowWidth,
      }

      draggedItem.value!.dropDirection = 'below'
    }

    draggedItem.value!.newPathIsGroup = isGroup
    draggedItem.value!.newPath = listRowPath
  }

  whenever(
    () => draggedItem.value?.pos,
    () => handleDragging()
  )

  return {
    listEl,
    listElRect,
    draggedItem
  }
}