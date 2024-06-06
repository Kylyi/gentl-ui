<script setup lang="ts">
// Types
import type { IContextMenuProps } from '~/components/ContextMenu/types/context-menu-props.type'

withDefaults(defineProps<IContextMenuProps>(), {
  teleport: () => ({
    to: 'body',
    disabled: false,
  }),
})

const emits = defineEmits<{
  (e: 'openMenu'): void
  (e: 'closeMenu'): void
}>()

// Layout
const list = ref<HTMLUListElement>()
const isOpen = ref(false)
const coords = reactive({
  x: 0,
  y: 0,
})

watch(isOpen, value => {
  if (value) {
    emits('openMenu')
  } else {
    emits('closeMenu')
  }
})

// Functions
function closeMenu() {
  const { innerWidth, innerHeight } = window

  isOpen.value = false

  coords.x = innerWidth
  coords.y = innerHeight
}

// Binding event listeners
onMounted(() => {
  document.addEventListener('mouseup', closeMenu)
})

onUnmounted(() => {
  document.removeEventListener('mouseup', closeMenu)
})
</script>

<template>
  <ContextMenuRoot
    v-model="isOpen"
    v-model:x="coords.x"
    v-model:y="coords.y"
    :is-sub="isSub"
    :list="list"
  >
    <Teleport
      v-if="teleport && !teleport.disabled"
      :to="teleport.to"
    >
      <ul
        ref="list"
        class="context-menu-list bg-dark light:bg-gray-100"
        :class="[
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none',
          menuClasses,
        ]"
        :style="`top: ${coords.y}px; left: ${coords.x}px;`"
        @mouseenter="isOpen = true"
      >
        <slot />
      </ul>
    </Teleport>

    <template v-else>
      <ul
        ref="list"
        class="context-menu-list bg-dark light:bg-gray-100"
        :class="[
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none',
          menuClasses,
        ]"
        :style="`top: ${coords.y}px; left: ${coords.x}px;`"
        @mouseenter="isOpen = true"
      >
        <slot />
      </ul>
    </template>
  </ContextMenuRoot>
</template>

<style lang="scss" scoped>
.context-menu-list {
  --apply: fixed h-max min-w-max p-1 rounded text-xs flex flex-col gap-2
    shadow-lg z-9999;
}
</style>
