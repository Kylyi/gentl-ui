<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)
const { node } = props

// Layout
const alt = ref(node.attrs.alt)

// Menu
const isMenuActive = ref(false)

watch(
  () => props.node.attrs.alt,
  _alt => alt.value = _alt,
)
</script>

<template>
  <NodeViewWrapper
    as="img"
    draggable="true"
    :src="node.attrs.src"
    :alt="node.attrs.alt"
    :data-id="node.attrs.id"
    :style
    data-drag-handle
    class="wysiwyg-img"
    :class="{ 'has-open-menu': isMenuActive }"
  />
</template>

<style lang="scss" scoped>
.wysiwyg-img {
  @apply relative cursor-move;

  &.has-open-menu {
    @apply outline-1 outline-ca outline-solid;
  }

  &:hover {
    background-color: var(--hoverBg) !important;
    color: var(--hoverColor) !important;
  }
}
</style>
