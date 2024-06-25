// Types
import type { DragEndFnc } from '~/components/DragAndDrop/types/drag-end-fnc.type'
import type { DragStartFnc } from '~/components/DragAndDrop/types/drag-start-fnc.type'
import type { IDraggedItem } from '~/components/DragAndDrop/types/dragged-item.type'

const draggedItemKey = Symbol('draggedItem')
const onDragStartKey = Symbol('onDragStart')
const onDragEndKey = Symbol('onDragEnd')
const dndStateKey = Symbol('dndState')

type IDndState = {
  isDragging?: boolean
  draggedEl?: HTMLElement | null
  draggedElInitialIdx?: number
  draggedContainerEl?: HTMLElement | null
  targetContainerEl?: HTMLElement | null
  toIdx?: number
}

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
    preventDragFnc?: (payload: { el: HTMLElement, item: T }) => boolean

    onDragEndFnc?: DragEndFnc<T>
  },
) {
  const {
    direction = 'vertical',
    onDragStartFnc = () => {},
    onDragEndFnc = () => {},
  } = options ?? {}

  // Provide/Inject
  const draggedItem = injectStrict<Ref<IDraggedItem<T> | undefined>>(draggedItemKey, ref(undefined))
  const dndState = injectStrict<IDndState>(dndStateKey, reactive({}))
  const onDragStart = injectStrict<DragStartFnc<T>>(onDragStartKey, onDragStartFnc)
  const onDragEnd = injectStrict<DragEndFnc<T>>(onDragEndKey, onDragEndFnc)

  provide(draggedItemKey, draggedItem)
  provide(dndStateKey, dndState)

  // We only want to provide if we get the values from the options
  if (options?.onDragStartFnc) {
    provide(onDragStartKey, onDragStart)
  }

  if (options?.onDragEndFnc) {
    provide(onDragEndKey, onDragEnd)
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

    const shouldPrevent = onDragStart({ el: dndState.draggedEl!, item })

    if (shouldPrevent === true) {
      return
    }

    dndState.draggedElInitialIdx = Array.from(dndState.draggedContainerEl.children).indexOf(dndState.draggedEl)

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
    hasMoved = hasMoved
    || Math.abs(event.clientX - startMousePosition.x) > 2
    || Math.abs(event.clientY - startMousePosition.y) > 2

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

    if (!dndState.draggedEl) {
      return
    }

    // @ts-expect-error DOM functions
    const item: T = dndState.draggedEl?.['get-item']?.()

    const shouldPrevent = onDragStart({ el: dndState.draggedEl!, item })

    if (shouldPrevent === true) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    const rect = dndState.draggedEl.getBoundingClientRect()

    mouseOffset = {
      x: rect.left - event.touches[0].clientX,
      y: rect.top - event.touches[0].clientY,
    }

    cloneElement(event)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleDragEnd)

    lastEv = event
  }

  function handleTouchMove(event: TouchEvent) {
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

    lastEv = event
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

    hasMoved = hasMoved && !isSamePosition

    if (clonedElement) {
      clonedElement.remove()
      clonedElement = null
    }

    // Handle the drag result
    if (draggedItem.value && hasMoved) {
      dndState.toIdx = Array.from(dndState.targetContainerEl!.children).indexOf(dndState.draggedEl!)

      const previousItemEl = dndState.targetContainerEl?.children[dndState.toIdx - 1] as HTMLElement | undefined
      // @ts-expect-error ...
      const previousItem = previousItemEl?.['get-item']?.()

      const nextItemEl = dndState.targetContainerEl?.children[dndState.toIdx + 1] as HTMLElement | undefined
      // @ts-expect-error ...
      const nextItem = nextItemEl?.['get-item']?.()

      const continueDrag = await onDragEnd({
        siblingItem: previousItem ?? nextItem,
        item: draggedItem.value,
        toIdx: dndState.toIdx,

        // @ts-expect-error ...
        from: dndState.draggedContainerEl?.['get-parent']?.() ?? undefined,

        // @ts-expect-error ...
        to: dndState.targetContainerEl?.['get-parent']?.() ?? undefined,

        moveDirection: previousItem ? 'down' : 'up',

        cancelDrag,
      })

      if (continueDrag === false) {
        return
      }

      commitDrag()
    }

    // Reset
    dndState.draggedEl?.classList.remove('is-dragged')
    document.documentElement.style.overflowX = ''
    lastEv = null
    hasMoved = false
    startMousePosition = { x: 0, y: 0 }
    scrollBy.value = { speedX: 0, speedY: 0 }
    pause()
    pauseRaf()
  }

  function handleDrag() {
    const target = lastEv?.target as HTMLElement
    const _draggedItem = toValue(draggedItem)

    if (!_draggedItem) {
      return
    }

    // const targetDraggableEl = getDraggableEl(target)
    dndState.targetContainerEl = getDraggableContainerEl(target) ?? dndState.targetContainerEl

    handleDragOverContainer(_draggedItem)
    // if (targetDraggableEl && dndState.targetContainerEl) {
    //   // handleDragOverItem(_draggedItem, targetDraggableEl)
    // } else if (dndState.targetContainerEl) {
    //   handleDragOverContainer(_draggedItem)
    // }
  }

  function handleDragOverContainer(
    draggedItem: IDraggedItem<T>,
  ) {
    if (
      !dndState.targetContainerEl
      || !dndState.draggedContainerEl
    ) {
      return
    }

    // IMMEDIATE
    // // @ts-expect-error - TS doesn't know about our custom functions
    // const items = dndState.targetContainerEl?.['get-items']?.() ?? []
    // const isItemAlreadyInContainer = items.includes(draggedItem.ref)

    // if (isItemAlreadyInContainer) {
    //   return
    // }

    // DOM manipulation
    const children = Array.from(dndState.targetContainerEl.children).map(el => {
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
          dndState.targetContainerEl.append(dndState.draggedEl)
        } else {
          dndState.targetContainerEl.insertBefore(dndState.draggedEl, children[idx].el)
        }
      }
    }

    // IMMEDIATE
    // Remove from old container
    // draggedContainerEl?.['remove-item'](draggedItem.ref)

    // Add to new container
    // dndState.targetContainerEl?.['insert-item'](items.length, draggedItem.ref)

    // draggedContainerEl = dndState.targetContainerEl
  }

  function commitDrag() {
    if (draggedItem.value) {
      // @ts-expect-error ...
      dndState.draggedContainerEl?.['remove-item'](draggedItem.value.ref)

      // @ts-expect-error ...
      dndState.targetContainerEl?.['insert-item'](dndState.toIdx, draggedItem.value.ref)
    }

    draggedItem.value = undefined
  }

  function cancelDrag() {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleDragEnd)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleDragEnd)
    document.removeEventListener('keyup', handleKeyPress)

    const { draggedEl, draggedElInitialIdx = 0, draggedContainerEl } = dndState

    if (draggedItem.value && draggedEl) {
      if (draggedElInitialIdx === 0) {
        draggedContainerEl?.append(draggedEl)
      } else {
        draggedContainerEl?.insertBefore(draggedEl, draggedContainerEl.children[draggedElInitialIdx])
      }

      clonedElement?.remove()
    }

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

      clonedElement.style.position = 'absolute'
      clonedElement.style.left = `${clientX + mouseOffset.x}px`
      clonedElement.style.top = `${clientY + mouseOffset.y}px`
      clonedElement.style.width = `${dndState.draggedEl!.offsetWidth}px`
      clonedElement.style.height = `${dndState.draggedEl!.offsetHeight}px`
      clonedElement.style.zIndex = '9999'
      clonedElement.style.opacity = '0.8'
      clonedElement.style.pointerEvents = 'none'
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
      const threshold = 250 // Distance from edge of container in px
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
