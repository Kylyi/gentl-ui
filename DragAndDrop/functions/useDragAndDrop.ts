// @unocss-include
// Types
import type { IDndState } from '~/components/DragAndDrop/types/drag-and-drop-state.type'
import type { DragEndFnc } from '~/components/DragAndDrop/types/drag-end-fnc.type'
import type { DragStartFnc } from '~/components/DragAndDrop/types/drag-start-fnc.type'
import type { IDraggedItem } from '~/components/DragAndDrop/types/dragged-item.type'

const draggedItemKey = Symbol('draggedItem')
const onDragStartKey = Symbol('onDragStart')
const onDragEndKey = Symbol('onDragEnd')
const onDragCancelKey = Symbol('onDragCancel')
const dndStateKey = Symbol('dndState')

// Constants
const TIMEOUT_TOUCH_MOVE = 250

// Helpers
function getDraggableEl(el: HTMLElement) {
  return el?.getAttribute('data-draggable-item')
    ? el
    : el?.closest('[data-draggable-item]') as HTMLElement
}

function getContainersFromPosition(pos: { x: number, y: number }) {
  const dragContainers = Array.from(document.querySelectorAll('.draggable-container'))
  const scrollers = Array.from(document.querySelectorAll('.scroller-horizontal .content'))

  const containers = [...dragContainers, ...scrollers]

  return containers.filter(container => {
    const rect = container.getBoundingClientRect()

    return (rect.x <= pos.x && rect.x + rect.width >= pos.x)
      && (rect.y <= pos.y && rect.y + rect.height >= pos.y)
  })
}

function getDraggableContainerEl(el: HTMLElement) {
  return el?.getAttribute('data-draggable-container')
    ? el
    : el?.closest('[data-draggable-container]') as HTMLElement
}

export function useDragAndDrop<T = IItem>(
  options?: {
    direction?: 'vertical' | 'horizontal'
    onDragStartFnc?: DragStartFnc<T>
    canDrop?: (item: IDraggedItem<T>) => boolean

    onDragEndFnc?: DragEndFnc<T>
    onDragCancelFnc?: () => void
  },
) {
  const {
    direction = 'vertical',
    onDragStartFnc = () => {},
    onDragEndFnc = () => {},
    onDragCancelFnc = () => {},
  } = options ?? {}

  function getDraggableContainerElFromLastEvent(lastEv: MouseEvent | TouchEvent | null) {
    if (!lastEv) {
      return
    }

    const x = lastEv instanceof MouseEvent
      ? lastEv.clientX
      : lastEv.touches[0].clientX

    const y = lastEv instanceof MouseEvent
      ? lastEv.clientY
      : lastEv.touches[0].clientY

    const els = document.elementsFromPoint(x, y)
    const draggableContainerEl = els.find(el => el.getAttribute('data-draggable-container'))

    return draggableContainerEl as HTMLElement
  }

  // Provide/Inject
  const draggedItem = injectStrict<Ref<IDraggedItem<T> | undefined>>(draggedItemKey, ref(undefined))
  const dndState = injectStrict<IDndState>(dndStateKey, reactive({}))
  const onDragStart = injectStrict<DragStartFnc<T>>(onDragStartKey, onDragStartFnc)
  const onDragEnd = injectStrict<DragEndFnc<T>>(onDragEndKey, onDragEndFnc)
  const onDragCancel = injectStrict<() => void>(onDragCancelKey, onDragCancelFnc)

  provide(draggedItemKey, draggedItem)
  provide(dndStateKey, dndState)

  // We only want to provide if we get the values from the options
  if (options?.onDragStartFnc) {
    provide(onDragStartKey, onDragStart)
  }

  if (options?.onDragEndFnc) {
    provide(onDragEndKey, onDragEnd)
  }

  if (options?.onDragCancelFnc) {
    provide(onDragCancelKey, onDragCancel)
  }

  // Layout
  let lastEv: MouseEvent | TouchEvent | null = null
  let startMousePosition = { x: 0, y: 0 }
  let hasMoved = false

  // Scrolling
  const containersToScroll = ref<{ container: HTMLElement, speedX: number, speedY: number }[]>([])
  const scrollBy = ref({ speedX: 0, speedY: 0 })

  const { pause, resume } = useIntervalFn(
    () => {
      containersToScroll.value.forEach(({ container, speedX, speedY }) => {
        container.scrollBy(speedX, speedY)
      })
    },
    5,
    { immediate: false },
  )

  const {
    pause: pauseRaf,
    resume: resumeRaf,
  } = useRafFn(handleDrag, { immediate: false })

  // D'n'D
  let mouseOffset = { x: 0, y: 0 }

  // Mouse
  function handleMouseDown(event: MouseEvent) {
    const isCtrl = event.ctrlKey || event.metaKey
    const isShift = event.shiftKey
    const isRightClick = event.button === 2

    if (isRightClick || isCtrl || isShift) {
      return
    }

    const target = event.target as HTMLElement
    dndState.draggedEl = getDraggableEl(target)
    dndState.draggedContainerEl = getDraggableContainerEl(target)

    if (!dndState.draggedEl || !dndState.draggedContainerEl) {
      return
    }

    // Remove horizontal scroll from the html
    document.documentElement.style.overflowX = 'hidden'

    // @ts-expect-error DOM functions
    const item: T = dndState.draggedEl?.['get-item']?.()

    const shouldPrevent = onDragStart({ el: dndState.draggedEl!, item, dndState })

    if (shouldPrevent === true) {
      return
    }

    dndState.draggedElInitialIdx = Array.from(dndState.draggedContainerEl.children)
      .indexOf(dndState.draggedEl)

    event.preventDefault()
    event.stopPropagation()

    startMousePosition = { x: event.clientX, y: event.clientY }

    const rect = dndState.draggedEl.getBoundingClientRect()

    mouseOffset = {
      x: rect.left - event.clientX,
      y: rect.top - event.clientY,
    }

    cloneElement(event)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleDragEnd)
    document.addEventListener('keyup', handleKeyPress)

    lastEv = event
  }

  function handleMouseMove(event: MouseEvent) {
    const diffX = Math.abs(event.clientX - startMousePosition.x)
    const diffY = Math.abs(event.clientY - startMousePosition.y)
    const pyth = Math.sqrt(diffX ** 2 + diffY ** 2)

    hasMoved = hasMoved || diffX > 3 || diffY > 3 || pyth > 3

    if (!hasMoved) {
      return
    }

    dndState.draggedEl?.classList.add('is-dragged')
    clonedElement!.style.visibility = 'visible'

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
    }

    draggedItem.value!.pos = { x: event.clientX, y: event.clientY }

    lastEv = event
    calculateScroll(event)
  }

  // Touch
  function handleTouchStart(event: TouchEvent) {
    const target = event.target as HTMLElement
    dndState.draggedEl = getDraggableEl(target)
    dndState.draggedContainerEl = getDraggableContainerEl(target)

    if (!dndState.draggedEl) {
      return
    }

    // @ts-expect-error DOM functions
    const item: T = dndState.draggedEl?.['get-item']?.()

    const shouldPrevent = onDragStart({ el: dndState.draggedEl!, item, dndState })

    if (shouldPrevent === true) {
      return
    }

    dndState.draggedElInitialIdx = Array.from(dndState.draggedContainerEl.children)
      .indexOf(dndState.draggedEl)

    event.stopPropagation()

    startMousePosition = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    }

    const rect = dndState.draggedEl.getBoundingClientRect()

    mouseOffset = {
      x: rect.left - event.touches[0].clientX,
      y: rect.top - event.touches[0].clientY,
    }

    cloneElement(event)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleDragEnd)

    lastEv = event

    setTimeout(() => {
      const ev = lastEv as TouchEvent

      if (!(ev instanceof TouchEvent)) {
        return
      }

      const diffX = Math.abs(ev.touches[0].clientX - startMousePosition.x)
      const diffY = Math.abs(ev.touches[0].clientY - startMousePosition.y)
      const pyth = Math.sqrt(diffX ** 2 + diffY ** 2)

      const isStillSamePosition = diffX < 10 && diffY < 10 && pyth < 10

      hasMoved = hasMoved || isStillSamePosition

      if (hasMoved) {
        dndState.draggedEl?.classList.add('is-dragged')
        clonedElement!.style.visibility = 'visible'
      }
    }, TIMEOUT_TOUCH_MOVE)
  }

  function handleTouchMove(event: TouchEvent) {
    lastEv = event
    if (!hasMoved) {
      return
    }

    event.preventDefault()

    dndState.draggedEl?.classList.add('is-dragged')
    clonedElement!.style.visibility = 'visible'

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
    }

    draggedItem.value!.pos = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    }

    calculateScroll(event)
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      cancelDrag()
    }
  }

  // Shared
  async function handleDragEnd() {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleDragEnd)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleDragEnd)
    document.removeEventListener('keyup', handleKeyPress)

    if (!dndState.draggedEl || !dndState.draggedContainerEl) {
      return
    }

    let isSamePosition = dndState.draggedContainerEl === dndState.targetContainerEl
    const selfIdx = Array.from(dndState.draggedContainerEl.children).indexOf(dndState.draggedEl)

    isSamePosition = isSamePosition && dndState.draggedElInitialIdx === selfIdx

    const isNoDrop = dndState.targetContainerEl?.classList.contains('no-drop')

    if (isNoDrop || isSamePosition) {
      setTimeout(() => cancelDrag())

      return
    }

    hasMoved = hasMoved && !isSamePosition

    if (clonedElement) {
      clonedElement.remove()
      clonedElement = null
    }

    // Handle the drag result
    if (draggedItem.value && hasMoved) {
      const targetChildren = Array.from(dndState.targetContainerEl!.children)
      dndState.toIdx = targetChildren.indexOf(dndState.draggedEl!)

      const previousItemEl = targetChildren[dndState.toIdx - 1] as HTMLElement | undefined
      // @ts-expect-error ...
      const previousItem = previousItemEl?.['get-item']?.()

      const nextItemEl = targetChildren[dndState.toIdx + 1] as HTMLElement | undefined
      // @ts-expect-error ...
      const nextItem = nextItemEl?.['get-item']?.()

      const continueDrag = await onDragEnd({
        siblingItem: previousItem ?? nextItem,
        item: draggedItem.value,
        toIdx: dndState.toIdx,

        // @ts-expect-error ...
        from: dndState.draggedContainerEl?.getParent?.() ?? undefined,

        // @ts-expect-error ...
        to: dndState.targetContainerEl?.getParent?.() ?? undefined,

        moveDirection: previousItem ? 'down' : 'up',

        cancelDrag,

        dndState,
      })

      if (continueDrag === false) {
        return
      }

      commitDrag()
    }

    reset()
  }

  function handleDrag() {
    const _draggedItem = toValue(draggedItem)

    if (!_draggedItem || !hasMoved) {
      return
    }

    // dndState.targetContainerEl = getDraggableContainerEl(target) ?? dndState.targetContainerEl
    dndState.targetContainerEl = getDraggableContainerElFromLastEvent(lastEv) ?? dndState.targetContainerEl
    handleDragOverContainer(_draggedItem)
  }

  function handleDragOverContainer(draggedItem: IDraggedItem<T>) {
    if (
      !dndState.targetContainerEl
      || !dndState.draggedContainerEl
    ) {
      return
    }

    const isNoDrop = dndState.targetContainerEl?.classList.contains('no-drop')

    if (isNoDrop) {
      return
    }

    // IMMEDIATE
    // // @ts-expect-error - TS doesn't know about our custom functions
    // const items = dndState.targetContainerEl?.['getItems']?.() ?? []
    // const isItemAlreadyInContainer = items.includes(draggedItem.ref)

    // if (isItemAlreadyInContainer) {
    //   return
    // }

    // DOM manipulation
    const targetContainerChildren = Array.from(dndState.targetContainerEl.children)
    const children = targetContainerChildren.map(el => {
      const rect = el.getBoundingClientRect()

      return { el, rect }
    })

    // Horizontal
    if (direction === 'horizontal') {
      // Hovering over self
      const {
        x: draggedElX = 0,
        width: draggedElWidth = 0,
        y: draggedElY = 0,
        height: draggedElHeight = 0,
      } = dndState.draggedEl?.getBoundingClientRect() ?? {}

      const isInsideSelf = draggedItem.pos.y > draggedElY && draggedItem.pos.y < draggedElY + draggedElHeight
        && draggedItem.pos.x > draggedElX && draggedItem.pos.x < draggedElX + draggedElWidth

      if (isInsideSelf) {
        return
      }

      // Find the index of the dragged item in the container
      let idx = children.findIndex(child => draggedItem.pos.x < (child.rect.x + child.rect.width / 2))
      idx = idx === -1 ? children.length - 1 : idx

      if (dndState.draggedEl) {
        const isLast = idx === children.length - 1
        const isMoreRightThanLast = children[idx].rect.x + (children[idx].rect.width / 2) < draggedItem.pos.x

        if (isLast && isMoreRightThanLast) {
          dndState.targetContainerEl.append(dndState.draggedEl)
        } else {
          dndState.targetContainerEl.insertBefore(dndState.draggedEl, children[idx].el)
        }
      }
    }

    // Vertical
    else if (direction === 'vertical') {
      // Hovering over self
      const {
        x: draggedElX = 0,
        width: draggedElWidth = 0,
        y: draggedElY = 0,
        height: draggedElHeight = 0,
      } = dndState.draggedEl?.getBoundingClientRect() ?? {}

      const isInsideSelf = draggedItem.pos.y > draggedElY && draggedItem.pos.y < draggedElY + draggedElHeight
        && draggedItem.pos.x > draggedElX && draggedItem.pos.x < draggedElX + draggedElWidth

      if (isInsideSelf) {
        return
      }

      // Find the index of the dragged item in the container
      let idx = children.findIndex(child => draggedItem.pos.y < (child.rect.y + child.rect.height / 2))
      idx = idx === -1 ? children.length - 1 : idx

      if (dndState.draggedEl) {
        const isLast = idx === children.length - 1
        const isLowerThanLast = children.length === 0 || children[idx].rect.y + (children[idx].rect.height / 2) < draggedItem.pos.y

        if (isLast && isLowerThanLast) {
          dndState.targetContainerEl.appendChild(dndState.draggedEl)
        } else {
          dndState.targetContainerEl.insertBefore(dndState.draggedEl, children[idx].el)
        }
      }
    }

    // IMMEDIATE
    // Remove from old container
    // draggedContainerEl?.['removeItem'](draggedItem.ref)

    // Add to new container
    // dndState.targetContainerEl?.['insertItem'](items.length, draggedItem.ref)

    // draggedContainerEl = dndState.targetContainerEl
  }

  function commitDrag() {
    if (draggedItem.value) {
      // Return the draged item to its original position
      const isSameContainer = dndState.draggedContainerEl === dndState.targetContainerEl

      // We need to rollback the changes to make sure we don't mess up
      // the Vue internals
      rollbackToOriginalPosition()

      // When moving within the same container, we need to `move` the item
      if (isSameContainer) {
        // @ts-expect-error
        dndState.targetContainerEl?.moveItem(
          dndState.draggedElInitialIdx,
          dndState.toIdx,
        )
      }

      // When moving to a different container, we need to `remove` the item from the old container
      // and `insert` it into the new container
      else {
        // @ts-expect-error ...
        dndState.targetContainerEl?.insertItem(dndState.toIdx, draggedItem.value.ref)

        // @ts-expect-error ...
        dndState.draggedContainerEl?.removeItem(draggedItem.value.ref)
      }
    }

    draggedItem.value = undefined
  }

  function rollbackToOriginalPosition() {
    const children = Array.from(dndState.draggedContainerEl!.children)
    const isSameContainer = dndState.draggedContainerEl === dndState.targetContainerEl

    // Make sure we have everything we neeed for the rollback
    const hasEverythingNeeded = dndState.draggedElInitialIdx !== undefined
      && dndState.draggedContainerEl !== undefined
      && dndState.targetContainerEl !== undefined
      && dndState.draggedEl !== undefined

    if (!hasEverythingNeeded) {
      return
    }

    // When items is no longer in the same container, we move it back to the original position (before the item currently on its index)
    if (!isSameContainer) {
      const el = children[dndState.draggedElInitialIdx!]

      // When there is an item on the original position, we insert the dragged item before it
      if (el) {
        dndState.draggedContainerEl?.insertBefore(dndState.draggedEl!, el)
      }

      // If there is not item on the original position, it means we removed the last item in the container
      // so we append the dragged item to the end of the container
      else {
        dndState.draggedContainerEl?.appendChild(dndState.draggedEl!)
      }
    }

    // When moving within the same container, we need to `move` the item
    else {
      dndState.toIdx = children.indexOf(dndState.draggedEl!)
      const el = children[dndState.draggedElInitialIdx!]

      // If we moved the item above the original index, we need to move 'after' the item that is on the original index
      if (dndState.toIdx < dndState.draggedElInitialIdx!) {
        el.insertAdjacentElement('afterend', dndState.draggedEl!)
      }

      // If we moved the item below the original index, we need to move 'before' the item that is on the original index
      else if (dndState.toIdx > dndState.draggedElInitialIdx!) {
        dndState.targetContainerEl?.insertBefore(dndState.draggedEl!, el)
      }
    }
  }

  function cancelDrag() {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleDragEnd)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleDragEnd)
    document.removeEventListener('keyup', handleKeyPress)

    onDragCancel?.()

    if (draggedItem.value && dndState.draggedEl) {
      rollbackToOriginalPosition()

      clonedElement?.remove()
    }

    reset()
  }

  function reset() {
    draggedItem.value = undefined
    dndState.draggedEl?.classList.remove('is-dragged')
    document.documentElement.style.overflowX = ''
    lastEv = null
    hasMoved = false
    startMousePosition = { x: 0, y: 0 }
    scrollBy.value = { speedX: 0, speedY: 0 }
    pause()
    pauseRaf()
  }

  // Cloning
  let clonedElement: HTMLElement | null = null

  function cloneElement(event: MouseEvent | TouchEvent) {
    clonedElement = dndState.draggedEl?.cloneNode(true) as HTMLElement

    // @ts-expect-error - TS doesn't know about our custom functions
    const item: T = dndState.draggedEl?.['get-item']?.()

    if (clonedElement) {
      let clientX: number, clientY: number

      if (event instanceof MouseEvent) {
        clientX = event.clientX
        clientY = event.clientY
      } else {
        clientX = event.touches[0].clientX
        clientY = event.touches[0].clientY
      }

      clonedElement.style.position = 'fixed'
      clonedElement.style.left = `${clientX + mouseOffset.x}px`
      clonedElement.style.top = `${clientY + mouseOffset.y}px`
      clonedElement.style.width = `${dndState.draggedEl!.offsetWidth}px`
      clonedElement.style.height = `${dndState.draggedEl!.offsetHeight}px`
      clonedElement.style.zIndex = '9999'
      clonedElement.style.opacity = '0.8'
      clonedElement.style.pointerEvents = 'none'
      clonedElement.style.touchAction = 'none'
      clonedElement.style.transform = 'rotate(5deg)'
      clonedElement.style.visibility = 'hidden'
      document.body.appendChild(clonedElement)

      draggedItem.value = {
        ref: item,
        pos: { x: clientX, y: clientY },
      }
    }

    resumeRaf()
  }

  // Scrolling
  function calculateScroll(event: MouseEvent | TouchEvent) {
    const x = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX
    const y = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY
    const containers = getContainersFromPosition({ x, y })

    if (!clonedElement) {
      return
    }

    containersToScroll.value = []

    containers.forEach(scrollContainerEl => {
      const containerRect = scrollContainerEl.getBoundingClientRect()
      const threshold = 150 // Distance from edge of container in px
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

      // Scroll left
      if (clientX < containerRect.left + threshold) {
        speedX = -Math.max(1, (threshold - (clientX - containerRect.left)) / 10)
      }

      // Scroll right
      else if (clientX > containerRect.right - threshold) {
        speedX = Math.max(1, (threshold - (containerRect.right - clientX)) / 10)
      }

      // Scroll up
      if (clientY < containerRect.top + threshold) {
        speedY = -Math.max(1, (threshold - (clientY - containerRect.top)) / 10)
      }

      // Scroll down
      else if (clientY > containerRect.bottom - threshold) {
        speedY = Math.max(1, (threshold - (containerRect.bottom - clientY)) / 10)
      }

      scrollBy.value = { speedX, speedY }

      if (speedX !== 0 || speedY !== 0) {
        containersToScroll.value.push({
          container: scrollContainerEl as HTMLElement,
          speedX,
          speedY,
        })
      }
    })

    if (containersToScroll.value.length) {
      resume()
    } else {
      pause()
    }
  }

  return {
    draggedItem,
    onDragStart,
    onDragEnd,
    cancelDrag,
    commitDrag,

    // Events
    handleMouseDown,
    handleTouchStart,
  }
}
