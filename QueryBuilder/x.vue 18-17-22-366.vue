<script lang="ts" setup>
const scrollContainer = ref<HTMLElement>()
const draggableElement = ref<HTMLElement>()
let clonedElement: HTMLElement | null = null

let mouseOffset = { x: 0, y: 0 }

onMounted(() => {
  const self = getCurrentInstance()
  scrollContainer.value = (self?.proxy?.$el as HTMLElement)
    .parentNode as HTMLElement
})

function handleMouseDown(event: MouseEvent) {
  // const target = event.target as HTMLElement
  // const isDraggableEl = target.classList.contains('draggable-icon')

  // if (!isDraggableEl) {
  //   return
  // }

  const rect = draggableElement.value!.getBoundingClientRect()

  mouseOffset = {
    x: rect.left - event.clientX,
    y: rect.top - event.clientY,
  }

  cloneElement(event)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
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
  }

  calculateScroll(event)
}

function handleMouseUp() {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)

  if (clonedElement) {
    clonedElement.remove()
    clonedElement = null
  }
}

function handleTouchStart(event: TouchEvent) {
  event.preventDefault()

  const rect = draggableElement.value!.getBoundingClientRect()

  mouseOffset = {
    x: rect.left - event.touches[0].clientX,
    y: rect.top - event.touches[0].clientY,
  }

  cloneElement(event)

  document.addEventListener('touchmove', handleTouchMove)
  document.addEventListener('touchend', handleTouchEnd)
  document.addEventListener('touchend', handleTouchEnd)
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
  }

  calculateScroll(event)
}

function handleTouchEnd() {
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)

  if (clonedElement) {
    clonedElement.remove()
    clonedElement = null
  }
}

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
    document.body.appendChild(clonedElement)
  }
}

function calculateScroll(event: MouseEvent | TouchEvent) {
  if (!scrollContainer.value || !clonedElement) {
    return
  }

  const containerRect = scrollContainer.value.getBoundingClientRect()
  const threshold = 50 // Distance from edge of container in px
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

  scrollContainer.value.scrollBy(speedX, speedY)
}
</script>

<template>
  <div
    ref="draggableElement"
    class="draggable"
    @mousedown="handleMouseDown"
    @touchstart.prevent="handleTouchStart"
  >
    <div
      class="draggable-icon cursor-move"
      p="1"
    >
      <div class="akar-icons:drag-vertical w-5 h-5 pointer-events-none" />
    </div>
  </div>
</template>

<style scoped>
.draggable {
  --apply: h-50 w-50;
  /* Styling for the draggable item goes here */
}
</style>
