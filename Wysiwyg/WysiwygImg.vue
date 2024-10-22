<script setup lang="ts">
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)
const { node, updateAttributes } = props

// Layout
const alt = ref(node.attrs.alt)
const css = ref<string | undefined>(props.node.attrs.style)

// Menu
const isMenuActive = ref(false)

// Style
const style = computed({
  get() {
    const cssValue = toValue(css.value) ?? ''

    return cssValue.split(';').filter(Boolean).map(trim).reduce((agg, property) => {
      const [key, value] = property.trim().split(':')

      agg[key] = value.trim()

      return agg
    }, {} as Record<string, string>) ?? {}
  },
  set(val) {
    updateAttributes({
      style: Object.entries(cleanObject(val)).reduce((agg, [key, value]) => {
        return `${agg}${key}:${value};`
      }, ''),
    })
  },
})

watch(
  () => props.node.attrs.style,
  _css => css.value = _css,
)

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
    @click="isMenuActive = true"
  >
    <MenuProxy
      v-model="isMenuActive"
      manual
      w="100"
      :no-arrow="false"
      :no-overlay="false"
    >
      <WysiwygComponentCss
        v-model:css="style"
        :properties="['padding', 'colors', 'border', 'border-radius', 'float', 'size']"
      />
    </MenuProxy>
  </NodeViewWrapper>
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
