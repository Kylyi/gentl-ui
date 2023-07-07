<script setup lang="ts">
// TYPES
import type { IListRowProps } from '~~/components/List/types/list-row-props.type'

// MODELS

// CONSTANTS
import { BUTTON_PRESET } from '@/components/Button/constants/button-preset.constant'

const props = withDefaults(defineProps<IListRowProps>(), {
  basePadding: 12,
  paddingByLevel: 8,
})

const DEFAULT_ROW_HEIGHT = 40

const rowInfo = computed(() => {
  const data = props.item
  const ref = typeof data.ref === 'object' ? data.ref || {} : {}
  const isGroup = 'isGroup' in data

  return {
    isGroup,
    isNew: '_isNew' in ref && ref._isNew,
    isCreate: '_isCreate' in ref && ref._isCreate,
    _style: {
      minHeight: `${props.rowHeight || DEFAULT_ROW_HEIGHT}px`,
      paddingLeft: isGroup
        ? `${props.basePadding + data.groupIdx * props.paddingByLevel}px`
        : `${
            props.basePadding +
            (props.groupBy || []).length * props.paddingByLevel
          }px`,
    },
  }
})
</script>

<template>
  <div
    :style="rowInfo._style"
    class="item"
    :class="[
      rowClass,
      {
        'item--selectable': !rowInfo.isGroup && !noSelect,
        'item--group': rowInfo.isGroup,
        'item--active': !rowInfo.isGroup && isSelected,
        'item--hovered': isHovered && !noHover,
        'item--new': rowInfo.isNew,
        'item--create': rowInfo.isCreate,
        'is-disabled': isDisabled,
      },
    ]"
  >
    <slot :option="item">
      <div
        v-if="rowInfo.isNew || rowInfo.isCreate"
        flex="shrink"
        w="8"
        h="8"
        p="y-2 r-3"
        :class="[
          rowInfo.isNew ? BUTTON_PRESET.ADD.icon : BUTTON_PRESET.ADD.icon,
        ]"
      />

      <div
        flex="~ 1 col"
        w="full"
        p="y-2 r-3"
      >
        <span
          :class="{ truncate }"
          v-html="rowInfo.isGroup ? item.label : item._highlighted"
        />

        <span
          v-if="rowInfo.isNew || rowInfo.isCreate"
          italic
          color="dark dark:light"
          text="sm"
        >
          {{
            rowInfo.isNew
              ? $t('general.addNewItem')
              : $t('general.autoCreateItem')
          }}
        </span>
      </div>
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.item {
  --apply: relative flex flex-gap-x-2 cursor-default select-none items-center
    rounded-custom;

  &--group {
    --apply: uppercase color-true-gray text-sm items-end p-b-0.5;
  }

  &--selectable {
    --apply: cursor-pointer;
  }

  &--active {
    &::before {
      --apply: absolute content-empty left-.5 inset-block-.5 w-1 bg-primary
        rounded-custom;
    }
  }

  &--hovered {
    --apply: bg-true-gray/10;
  }

  &--disabled {
    --apply: disabled cursor-not-allowed;
  }
}

.item--active.item--hovered:not(.item--disabled) {
  --apply: bg-primary/15;
}
</style>
