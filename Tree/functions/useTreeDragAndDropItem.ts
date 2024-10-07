// Types
import type { ITreeNode } from '~/components/Tree/types/tree-node.type'

// Store
import { useTreeStore } from '~/components/Tree/tree.store'

export function useTreeDragAndDropItem(nodeRef: MaybeRefOrGetter<ITreeNode>) {
  // Store
  const {
    draggedItem,
    dndOptions,
    nodes,
    containerEl,
  } = storeToRefs(useTreeStore())

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
    if (!dndOptions.value.enabled) {
      return
    }

    const { clientX, clientY } = event
    const els = document.elementsFromPoint(clientX, clientY)
    const isDraggableEl = els.find(el => el.classList.contains(dndOptions.value.dragClass)) as HTMLElement

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
    if (!dndOptions.value.enabled) {
      return
    }

    const target = event.target as HTMLElement
    const isDraggableEl = target.classList.contains(dndOptions.value.dragClass)

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
      clonedElement.remove()
      clonedElement = null
    }

    // Handle the drag result
    if (draggedItem.value) {
      const { currentPath, newPath, dropDirection, item } = draggedItem.value

      if (newPath && dropDirection) {
        // Get current row info
        const currentParentPath = currentPath?.split('.').slice(0, -2).join('.')
        const currentParent = item.parent ?? get(toValue(nodes), currentParentPath ?? '') as ITreeNode
        const target = get(toValue(nodes), newPath ?? '') as ITreeNode

        // Remove the item from the structure
        if (currentParent) {
          currentParent.children = currentParent.children!.filter(child => child.id !== item.id)
        } else {
          nodes.value = nodes.value!.filter(child => child.id !== item.id)
        }

        // If we're dropping the item below the target, we put it on the first index of the children
        if (dropDirection === 'below') {
          if (!target.children) {
            target.children = []
          }

          target.children = target.children!.toSpliced(0, 0, item)
        }

        // If we're dropping the item above the target, we put it on the last index of the children
        // of the previous parent
        else {
          const targetParentPath = newPath?.split('.').slice(0, -2).join('.')
          const targetIdx = +newPath?.split('.').slice(-1)
          const targetParent = get(toValue(nodes), targetParentPath) as ITreeNode

          if (!targetParent?.children) {
            nodes.value = nodes.value!.toSpliced(targetIdx, 0, item)
          } else {
            targetParent.children = targetParent.children!.toSpliced(targetIdx, 0, item)
          }
        }

        // We reset the dragged item
        draggedItem.value = undefined
      }
    }

    // Reset scrolling
    // console.log('Log ~ handleDragEnd ~ nodes.value:', nodes.value)
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

      clonedElement.style.listStyleType = 'none'
      clonedElement.style.position = 'absolute'
      clonedElement.style.left = `${clientX + mouseOffset.x}px`
      clonedElement.style.top = `${clientY + mouseOffset.y}px`
      clonedElement.style.width = `${draggableElement.value!.offsetWidth}px`
      clonedElement.style.height = `${draggableElement.value!.offsetHeight}px`
      clonedElement.style.zIndex = '9999'
      clonedElement.style.opacity = '0.5'
      clonedElement.style.pointerEvents = 'none'
      clonedElement.style.backgroundColor = '#ccc'
      clonedElement.style.borderRadius = '12px'
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
