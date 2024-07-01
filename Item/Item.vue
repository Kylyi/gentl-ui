<script setup lang="ts">
import type { IItemProps } from '~/components/Item/types/item-props.type'

withDefaults(defineProps<IItemProps>(), {
  tag: 'div',
})
</script>

<template>
  <Component
    :is="tag"
    flex="gap-x-1"
    class="item"
    :class="{ 'is-readonly': readonly, 'is-disabled': disabled }"
  >
    <slot />

    <!-- HOVER FOCUS HELPER -->
    <span
      v-if="!noHoverEffect && !readonly && !disabled"
      class="focus-helper"
      tabindex="-1"
    />
  </Component>
</template>

<style lang="scss" scoped>
.item {
  @apply flex relative rounded-custom items-center cursor-pointer;

  &.is-disabled {
    @apply cursor-not-allowed disabled;
  }
}

.focus-helper {
  @apply absolute fit z-3 rounded-inherit inset-0 pointer-events-none;
}

.item:hover .focus-helper {
  @apply bg-current opacity-10;
}

.is-outlined {
  .focus-helper {
    @apply -top-2px -left-2px w-[calc(100%+4px)] h-[calc(100%+4px)];
  }
}
</style>
