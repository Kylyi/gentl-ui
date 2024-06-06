<script setup lang="ts">
// Types
import type { IContextMenuItemProps } from '~/components/ContextMenu/types/context-menu-props.type'

const props = withDefaults(defineProps<IContextMenuItemProps>(), {
  hoverBgColor: 'gray.700',
  hoverTextColor: 'light.500',
})

// Utils
const { getColor } = useColors()

// Layout
const hoverBgColorComputed = computed(() => getColor(props.hoverBgColor))
const hoverTextColorComputed = computed(() => getColor(props.hoverTextColor))
</script>

<template>
  <li
    class="context-menu-item"
    :class="{ 'disabled-item': disabled }"
    @click.stop
  >
    <!-- Label -->
    <slot name="label">
      <span>
        {{ label }}
      </span>
    </slot>

    <div flex="~ gap-2 items-center">
      <!-- Shortcut -->
      <slot name="shortcut">
        <KeyboardShortcut
          v-if="shortcut"
          :char="shortcut?.char"
          v-bind="shortcut"
        />
      </slot>

      <!-- Icon -->
      <slot name="icon">
        <div :class="icon"></div>
      </slot>
    </div>

    <!-- Sub menu -->
    <slot name="sub" />
  </li>
</template>

<style lang="scss" scoped>
.context-menu-item {
  --apply: text-white light:(text-black bg-transparent) p-y-1 p-l-3 p-r-2 w-full flex items-center justify-between gap-4
    cursor-pointer rounded transition-colors;

  &.disabled-item {
    --apply: text-gray bg-transparent pointer-events-none;
  }

  &:hover {
    background-color: v-bind(hoverBgColorComputed);
    color: v-bind(hoverTextColorComputed);
  }
}
</style>
