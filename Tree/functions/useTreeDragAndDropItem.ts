// Types
import type { ITreeNode } from '~/components/Tree/types/tree-node.type'

// Store
import { useTreeStore } from '~/components/Tree/tree.store'

// Constants
const ITEM_LEFT_MARGIN = 20

export function useTreeDragAndDropItem(nodeRef: MaybeRefOrGetter<ITreeNode>) {
  // Store
  const { draggedItem, nodes, containerEl } = storeToRefs(useTreeStore())

  // Layout
  const draggableEl = ref<HTMLDivElement>()

  // Scrolling
  const scrollBy = ref({ speedX: 0, speedY: 0 })

  const { pause, resume, isActive } = useIntervalFn(
    () => {
      const { speedX, speedY } = scrollBy.value
      const containerElDom = unrefElement(containerEl.value)
      containerElDom?.scrollBy(speedX, speedY)
    },
    5,
    { immediate: false },
  )

  // D'n'D
  let clonedElement: HTMLElement | null = null
  let mouseOffset = { x: 0, y: 0 }

  const draggableElement = computed(
    () => unrefElement(draggableEl as any) as unknown as HTMLElement,
  )

  // Mouse
  function handleMouseDown(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement
    const isDraggableEl = target.classList.contains('tree-node-item')

    if (!isDraggableEl) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    const rect = draggableElement.value!.getBoundingClientRect()

    mouseOffset = {
      x: rect.left - event.clientX,
      y: rect.top - event.clientY,
    }

    cloneElement(event)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleDragEnd)
  }

  function handleMouseMove(event: MouseEvent) {
    if (clonedElement) {
      let newLeft = event.clientX + mouseOffset.x
      let newTop = event.clientY + mouseOffset.y

      // Constrain to viewport
      newLeft = Math.min(newLeft, window.innerWidth - clonedElement.offsetWidth)
      newTop = Math.min(newTop, window.innerHeight - clonedElement.offsetHeight)
      newLeft = Math.max(newLeft, 0)
      newTop = Math.max(newTop, 0)

      clonedElement.style.left = `${newLeft}px`
      clonedElement.style.top = `${newTop}px`

      draggedItem.value!.pos = {
        x: event.clientX,
        y: event.clientY,
      }
    }

    calculateScroll(event)
  }

  // Touch
  function handleTouchStart(event: TouchEvent) {
    const target = event.target as HTMLElement
    const isDraggableEl = target.classList.contains('tree-node-item')

    if (!isDraggableEl) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    const rect = draggableElement.value!.getBoundingClientRect()

    mouseOffset = {
      x: rect.left - event.touches[0].clientX,
      y: rect.top - event.touches[0].clientY,
    }

    cloneElement(event)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleDragEnd)
  }

  function handleTouchMove(event: TouchEvent) {
    event.preventDefault()

    if (clonedElement) {
      let newLeft = event.touches[0].clientX + mouseOffset.x
      let newTop = event.touches[0].clientY + mouseOffset.y

      // Constrain to viewport
      newLeft = Math.min(newLeft, window.innerWidth - clonedElement.offsetWidth)
      newTop = Math.min(newTop, window.innerHeight - clonedElement.offsetHeight)
      newLeft = Math.max(newLeft, 0)
      newTop = Math.max(newTop, 0)

      clonedElement.style.left = `${newLeft}px`
      clonedElement.style.top = `${newTop}px`

      draggedItem.value!.pos = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      }
    }

    calculateScroll(event)
  }

  // Shared
  function handleDragEnd() {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleDragEnd)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleDragEnd)

    if (clonedElement) {
      // clonedElement.remove()
      // clonedElement = null
    }

    // Handle the drag result
    if (draggedItem.value) {
      const { currentPath, newPath, dropDirection, item } = draggedItem.value
      const isNewPathParent = (get(toValue(nodes), newPath ?? '') as ITreeNode)?.hasChildren

      if (newPath && dropDirection) {
      // Get current row info
        const currentParentPath = currentPath?.split('.').slice(0, -2).join('.')
        const currentParent = item.parent ?? get(toValue(nodes), currentParentPath ?? '')
        const currentIndex = +(currentPath ?? '').slice(-1)

        // Get the new location info
        const parentPath = isNewPathParent
          ? newPath
          : newPath.split('.').slice(0, -2).join('.')

        const parent = get(toValue(nodes), parentPath) as ITreeNode

        const index = isNewPathParent
          ? dropDirection === 'below'
            ? parent.children?.length ?? 0
            : 0
          : +newPath.slice(-1)

        // In case we're moving the item within its parent
        if (parent === currentParent) {
          moveItem(parent.children!, currentIndex, index)
        }

        // In case we're moving the item to another parent
        else {
          const itemExtracted = currentParent.children.splice(currentIndex, 1)[0]

          if (dropDirection === 'below') {
            parent.children?.splice(index + 1, 0, itemExtracted)
          } else {
            parent.children?.splice(index, 0, itemExtracted)
          }
        }

        // We update the paths for the structure
        // updatePaths()

        // We reset the dragged item
        draggedItem.value = undefined
      }
    }

    // Reset scrolling
    scrollBy.value = { speedX: 0, speedY: 0 }
    pause()
  }

  /**
   * Clones an element and positions it on the mouse cursor
   */
  function cloneElement(event: MouseEvent | TouchEvent) {
    clonedElement = draggableElement.value?.cloneNode(true) as HTMLElement

    if (clonedElement) {
      let clientX: number, clientY: number

      if (event instanceof MouseEvent) {
        clientX = event.clientX
        clientY = event.clientY
      } else {
        clientX = event.touches[0].clientX
        clientY = event.touches[0].clientY
      }

      clonedElement.style.display = 'flex'
      clonedElement.style.alignItems = 'center'
      clonedElement.style.listStyleType = 'none'
      clonedElement.style.position = 'absolute'
      clonedElement.style.backgroundColor = 'red'
      clonedElement.style.left = `${clientX + mouseOffset.x}px`
      clonedElement.style.top = `${clientY + mouseOffset.y}px`
      clonedElement.style.width = `${draggableElement.value!.offsetWidth}px`
      clonedElement.style.height = `${draggableElement.value!.offsetHeight}px`
      clonedElement.style.zIndex = '9999'
      clonedElement.style.opacity = '0.5'
      clonedElement.style.pointerEvents = 'none'
      document.body.appendChild(clonedElement)

      draggedItem.value = {
        item: toValue(nodeRef),
        pos: { x: clientX, y: clientY },
        currentPath: clonedElement.dataset.path,
      }
    }
  }

  /**
   * Handles scrolling when dragging an item
   */
  function calculateScroll(event: MouseEvent | TouchEvent) {
    if (!containerEl.value || !clonedElement) {
      return
    }

    const containerRect = containerEl.value.getBoundingClientRect()
    const threshold = 40 // Distance from edge of container in px
    let speedX = 0
    let speedY = 0

    let clientX: number, clientY: number
    if (event instanceof MouseEvent) {
      clientX = event.clientX
      clientY = event.clientY
    } else {
      clientX = event.touches[0].clientX
      clientY = event.touches[0].clientY
    }

    if (clientX < containerRect.left + threshold) {
    // Scroll left
      speedX = -Math.max(1, (threshold - (clientX - containerRect.left)) / 10)
    } else if (clientX > containerRect.right - threshold) {
    // Scroll right
      speedX = Math.max(1, (threshold - (containerRect.right - clientX)) / 10)
    }

    if (clientY < containerRect.top + threshold) {
    // Scroll up
      speedY = -Math.max(1, (threshold - (clientY - containerRect.top)) / 10)
    } else if (clientY > containerRect.bottom - threshold) {
    // Scroll down
      speedY = Math.max(1, (threshold - (containerRect.bottom - clientY)) / 10)
    }

    scrollBy.value = { speedX, speedY }
    if (speedX === 0 && speedY === 0) {
      pause()
    } else if (!isActive.value) {
      resume()
    }
  }

  return {
    draggableEl,
    handleMouseDown,
    handleTouchStart,
    handleMouseMove,
    handleTouchMove,
  }
}
