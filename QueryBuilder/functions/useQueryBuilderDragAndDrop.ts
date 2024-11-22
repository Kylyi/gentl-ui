// Store
import { useQueryBuilderStore } from '~/components/QueryBuilder/query-builder.store'

// Constants
const GROUP_ROW_TITLE_HEIGHT = 38
const GROUP_ROW_CONTROLS_HEIGHT = -38

export function useQueryBuilderDragAndDrop() {
  // Store
  const {
    queryBuilderEl,
    queryBuilderElRect,
    draggedItem,
  } = storeToRefs(useQueryBuilderStore())

  // const queryBuilderElRect = computed(() =>
  //   queryBuilderEl.value?.getBoundingClientRect()
  // )

  const { y: scrollY } = useScroll(queryBuilderEl, {
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
    const qbRow = els.find(el => el.classList.contains('qb-row')) as HTMLElement
    const qbRowPath = qbRow?.dataset.path

    // When no query builder row is found, we don't really do anything
    // We also do nothing when we're dragging over the same row
    // We also do nothing when we're dragging over descendants of the dragged item (only if nested)
    if (
      !qbRow
      || qbRow.classList.contains('no-dragover')
      || qbRowPath === draggedItem.value?.row.path
      || (qbRowPath?.includes('.') && qbRowPath?.startsWith(draggedItem.value?.row.path || ''))
    ) {
      return
    }

    // When hovering over group, we need to adjust the position of drop
    // indicator a bit because the group also has a controls row and the title row
    const isGroup = qbRow?.classList.contains('qb-group')

    const {
      x: rowX,
      y: rowY,
      height: rowHeight,
      width: rowWidth,
    } = qbRow.getBoundingClientRect()

    // const relativePositionX = (posX - rowX) / rowWidth
    const relativePositionY = (posY - rowY) / rowHeight

    // When we hover in top side of the item, we indicate that we want to
    // drop the dragged item before the hovered item
    if (relativePositionY < 0.5) {
      const offset = {
        x: 0,
        y: isGroup ? GROUP_ROW_TITLE_HEIGHT : 0,
      }

      draggedItem.value!.dropIndicatorPos = {
        x: rowX + offset.x - (queryBuilderElRect.value?.x ?? 0),
        y: rowY + offset.y + scrollY.value - (queryBuilderElRect.value?.y ?? 0),
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
        x: rowX + offset.x - (queryBuilderElRect.value?.x ?? 0),
        y:
          rowY
          + offset.y
          + scrollY.value
          + rowHeight
          - (queryBuilderElRect.value?.y ?? 0),
        width: rowWidth,
      }

      draggedItem.value!.dropDirection = 'below'
    }

    draggedItem.value!.newPathIsGroup = isGroup
    draggedItem.value!.newPath = qbRow.dataset.path
  }

  whenever(
    () => draggedItem.value?.pos,
    () => handleDragging(),
  )
}
