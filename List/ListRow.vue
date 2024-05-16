<script setup lang="ts">
// Types
import type { IListRowProps } from '~/components/List/types/list-row-props.type'

// Functions
import { useListItemDragAndDrop } from './functions/useListItemDragAndDrop'

const props = withDefaults(defineProps<IListRowProps>(), {
  basePadding: 12,
  paddingByLevel: 8,
  tag: 'div',
})

const DEFAULT_ROW_HEIGHT = 40

const item = toRef(props, 'item')
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

// D'n'D
const {
  draggableEl,
  handleMouseDown,
  handleTouchStart
} = useListItemDragAndDrop(item)

</script>

<template>
  <Component
    ref="draggableEl"
    :is="tag"
    :style="rowInfo._style"
    class="item"
    :data-path="item.path"
    data-cy="item-selectable"
    :class="[
      rowClass,
      rowInfo.isGroup ? 'list-group' : 'list-row',
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
    @mousedown="handleMouseDown"
    @touchstart="handleTouchStart"
  >
    <ListMoveHandler
      v-if="reorderable"
      class="self-start m-t-2.5"
    />

    <slot :option="item">
      <div
        flex="~ col grow"
        p="y-1"
      >
        <span v-html="item._highlighted" />

        <div
          v-if="'_isNew' in item.ref"
          flex="~ gap-1 items-center"
          text="caption xs"
        >
          <div class="i-eva:plus-fill inline-block" />

          <span>
            {{
              rowInfo.isNew
                ? $t('general.addNewItem')
                : $t('general.autoCreateItem')
            }}
          </span>
        </div>
      </div>
    </slot>
  </Component>
</template>

<style lang="scss" scoped>
.item {
  --apply: relative flex gap-x-2 cursor-default select-none items-center p-r-1;

  &--group {
    --apply: uppercase color-true-gray text-sm items-end p-b-0.5;
  }

  &--selectable {
    --apply: cursor-pointer;
  }

  &--active {
    &::before {
      --apply: absolute content-empty left-0 inset-block-.5 w-1 bg-primary
        rounded-l-custom;
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
