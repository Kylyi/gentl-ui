<script setup lang="ts">
// Utils
import { useContextMenuUtils } from '~/components/ContextMenu/functions/useContextMenuUtils'

const props = defineProps<{
  isSub?: boolean
  list?: HTMLUListElement
}>()

// Utils
const { getCoordsForMenu } = useContextMenuUtils()

// Layout
const rootEl = ref<HTMLDivElement | null>(null)

const model = defineModel<boolean>({ required: true })
const coordinateX = defineModel<number>('x', { required: true })
const coordinateY = defineModel<number>('y', { required: true })

// Functions
async function openMenu() {
  const { x, y } = getCoordsForMenu(props.list!)

  coordinateX.value = x
  coordinateY.value = y

  model.value = true
}

async function openMenuOnHover() {
  if (props.isSub && rootEl.value) {
    const { x, y } = getCoordsForMenu(props.list!, rootEl.value!)

    coordinateX.value = x
    coordinateY.value = y - 4

    model.value = true
  }
}

function closeMenuAfterHover() {
  if (props.isSub) {
    const { innerWidth, innerHeight } = window

    model.value = false

    coordinateX.value = innerWidth
    coordinateY.value = innerHeight
  }
}
</script>

<template>
  <div
    ref="rootEl"
    class="absolute top-0 left-0 h-full w-full"
    @contextmenu.prevent="openMenu"
    @mouseup.prevent="model = false"
    @mouseenter="openMenuOnHover"
    @mouseleave="closeMenuAfterHover"
  >
    <slot />
  </div>
</template>
