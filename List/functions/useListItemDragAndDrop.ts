// Types
import type { IListItem } from '~/components/List/types/list-item.type'

// Injections
import { listContainerKey, listDraggedItemKey, listItemsKey } from '~/components/List/provide/list.provide'

// Constants
const ITEM_ROW_LEFT_MARGIN = 0

export function useListItemDragAndDrop(item: MaybeRefOrGetter<IListItem>) {
  // Injections
  const scrollContainer = injectStrict(listContainerKey)
  const draggedItem = injectStrict(listDraggedItemKey)
  const items = injectStrict(listItemsKey)

    // D'n'D
  const draggableEl = ref<HTMLElement>()
  let clonedElement: HTMLElement | null = null
  let mouseOffset = { x: 0, y: 0 }

  const draggableElement = computed(() => unrefElement(draggableEl) as HTMLElement)

  // Mouse
  function handleMouseDown(event: MouseEvent) {
    const target = event.target as HTMLElement
    const isDraggableEl =
      target.classList.contains('list-move-handler') ||
      target.classList.contains('list-move-handler__icon')

    if (!isDraggableEl) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    const rect = draggableElement.value!.getBoundingClientRect()

    mouseOffset = {
      x: rect.left - event.clientX - ITEM_ROW_LEFT_MARGIN,
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
      newLeft = Math.min(
        newLeft,
        window.innerWidth - clonedElement.offsetWidth - ITEM_ROW_LEFT_MARGIN
      )
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
    const isDraggableEl =
      target.classList.contains('list-move-handler') ||
      target.classList.contains('list-move-handler__icon')

    if (!isDraggableEl) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    const rect = draggableElement.value!.getBoundingClientRect()

    mouseOffset = {
      x: rect.left - event.touches[0].clientX - ITEM_ROW_LEFT_MARGIN,
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
      newLeft = Math.min(
        newLeft,
        window.innerWidth - clonedElement.offsetWidth - ITEM_ROW_LEFT_MARGIN
      )
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
      const { newPath, dropDirection, newPathIsGroup } = draggedItem.value

      if (newPath && dropDirection) {
        const _items = toValue(items)
        const _item = toValue(item)

        // Get current row info
        const currentPath = draggedItem.value.path
        // const currentParentPath = currentPath.split('.').slice(0, -2).join('.')

        // SECTION: Temporary solution
        const currentIndex = +currentPath.slice(-1)
        const newIndex = +newPath.slice(-1)

        const splicedItem = _items.splice(currentIndex, 1, { path: '_moved' } as any)[0]
        _items.splice(dropDirection === 'below' ? newIndex + 1 : newIndex, 0, splicedItem)

        // @ts-expect-error Fuck
        const _tempItemIdx = _items.findIndex(item => item.path === '_moved')
        if (_tempItemIdx > -1) {
          _items.splice(_tempItemIdx, 1)
        }

        _items.forEach((item, idx) => {
          // @ts-expect-error Fuck
          item.path = `${idx}`
        })
        // !SECTION



        // const currentParent =
        //   props.parent ?? get(toValue(items), currentParentPath)
        // const currentIndex = +currentPath.slice(-1)

        // // Get the new location info
        // const parentPath = newPathIsGroup
        //   ? newPath
        //   : newPath.split('.').slice(0, -2).join('.')
        // const parent = get(toValue(items), parentPath) as IListGro
        // const index = newPathIsGroup
        //   ? dropDirection === 'below'
        //     ? parent.children.length
        //     : 0
        //   : +newPath.slice(-1)

        // // In case we're moving the item within its parent
        // if (parent === currentParent) {
        //   if (dropDirection === 'below') {
        //     parent.children.splice(index + 1, 0, {
        //       ...props.item,
        //       path: '_moved',
        //     })
        //   } else {
        //     parent.children.splice(index, 0, { ...props.item, path: '_moved' })
        //   }

        //   // We remove the original row
        //   const idx = parent.children.findIndex(
        //     child => child.path === currentPath
        //   )
        //   parent.children.splice(idx, 1)
        // }

        // // In case we're moving the item to another parent
        // else {
        //   const itemExtracted = currentParent.children.splice(currentIndex, 1)[0]

        //   if (dropDirection === 'below') {
        //     parent.children.splice(index + 1, 0, itemExtracted)
        //   } else {
        //     parent.children.splice(index, 0, itemExtracted)
        //   }
        // }

        // // We update the paths for the structure
        // updatePaths()

        // We reset the dragged item
        draggedItem.value = undefined
      }
    }

    // Reset scrolling
    // scrollBy.value = { speedX: 0, speedY: 0 }
    // pause()
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

      clonedElement.style.position = 'absolute'
      clonedElement.style.left = `${clientX + mouseOffset.x}px`
      clonedElement.style.top = `${clientY + mouseOffset.y}px`
      clonedElement.style.width = `${draggableElement.value!.offsetWidth}px`
      clonedElement.style.height = `${draggableElement.value!.offsetHeight}px`
      clonedElement.style.zIndex = '9999'
      clonedElement.style.opacity = '0.5'
      clonedElement.style.pointerEvents = 'none'
      document.body.appendChild(clonedElement)

      draggedItem.value = {
        path: toValue(item).path,
        row: toValue(item).ref,
        pos: { x: clientX, y: clientY },
      }
    }
  }

  /**
   * Handles scrolling when dragging an item
   */
  function calculateScroll(event: MouseEvent | TouchEvent) {
    if (!scrollContainer.value || !clonedElement) {
      return
    }

    const containerRect = scrollContainer.value.getBoundingClientRect()
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

    // scrollBy.value = { speedX, speedY }
    // if (speedX === 0 && speedY === 0) {
    //   pause()
    // } else if (!isActive.value) {
    //   resume()
    // }
  }

  /**
   * Update paths of the items structure, when no `parent` is provided, it updates
   * the paths of the whole structure
   */
  // function updatePaths(parent?: IQueryBuilderGroup) {
  //   const _parent = parent ?? (toValue(items)[0] as IQueryBuilderGroup)

  //   _parent.children.forEach((child, idx) => {
  //     child.path = `${_parent.path}.children.${idx}`

  //     if ('isGroup' in child) {
  //       updatePaths(child)
  //     }
  //   })
  // }

  return {
    draggableEl,
    handleMouseDown,
    handleTouchStart,
  }
}