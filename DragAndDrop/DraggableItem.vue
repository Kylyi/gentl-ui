<script setup lang="ts" generic="T extends IItem">
type IProps = {
  item: T
  tag?: string
}

const props = defineProps<IProps>()

// Layout
const componentTag = computed(() => {
  return props.tag || 'div'
})

function getItem() {
  return props.item
}
</script>

<template>
  <Component
    :is="componentTag"
    .get-item="getItem"
    data-draggable-item
  >
    <slot />
  </Component>
</template>

<style lang="scss" scoped>
.is-dragged[data-draggable-item] {
  @apply relative;

  &::after {
    @apply content-empty absolute inset-0 rounded-custom
      bg-primary;
  }
}
</style>
