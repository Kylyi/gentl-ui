<script setup lang="ts">
// Types
import type {
  IQueryBuilderItem,
  IQueryBuilderItemProps,
} from '~/components/QueryBuilder/types/query-builder-item-props.type'

// Injections
import {
  qbColumnsKey,
  qbItemsKey,
} from '~/components/QueryBuilder/provide/query-builder.provide'

defineOptions({
  inheritAttrs: false,
})
const props = defineProps<IQueryBuilderItemProps>()
const emits = defineEmits<{
  (e: 'add:row'): void
  (e: 'delete:row', item: IQueryBuilderItem): void
}>()

// Injections
const columns = injectStrict(qbColumnsKey)

// Layout
const item = toRef(props, 'item')
const items = injectStrict(qbItemsKey)

const cols = computed(() => toValue(columns))
const colSelected = computed(() => {
  return cols.value.find(col => col.field === item.value.field)
})

const levelColor = computed(() => {
  const color = COLORS[props.level % COLORS.length]

  return getColor(color)
})

function handleRemoveCondition() {
  const idx = item.value.path.split('.').pop()
  const parentPath = props.item.path.split('.').slice(0, -2).join('.')
  const parent = get(toValue(items), parentPath)

  parent.children.splice(idx, 1)

  parent.children = [...parent.children]

  emits('delete:row', item.value)
}
</script>

<template>
  <li
    class="qb-row qb-item"
    :class="{ 'is-first-child': isFirstChild }"
    :style="{ '--bracketColor': levelColor }"
    v-bind="$attrs"
  >
    <!-- Field -->
    <span font="bold"> {{ colSelected?.label }} </span>

    <!-- Comparator -->
    <span
      border="y-1 ca dashed"
      p="x-1"
    >
      {{ $t(`comparator.${item.comparator}`).toLocaleLowerCase() }}
    </span>

    <!-- Value -->
    <ValueFormatter
      v-if="item.value"
      :value="item.value"
      :data-type="colSelected?.dataType"
      bg="dark:darker rounded-custom"
      leading="none"
      p="x-1 y-.5"
      rounded="custom"
    />

    <Btn
      size="xs"
      preset="TRASH"
      @click.stop.prevent="handleRemoveCondition"
      @mousedown.stop.prevent
    />

    <Menu
      hide-header
      :no-arrow="false"
    >
      <QueryBuilderItem
        :item="item"
        :level="level"
        :parent="parent"
        no-draggable
        m="!l-0"
      />
    </Menu>
  </li>

  <Btn
    v-if="isLastChild"
    size="xs"
    preset="ADD"
    self-center
    m="t-1 r-2"
    :class="{ 'is-last-child': isLastChild }"
    :style="{ '--bracketColor': levelColor, 'color': levelColor }"
    @click="$emit('add:row')"
  />
</template>

<style scoped lang="scss">
.qb-item {
  --apply: relative flex gap-1 bg-ca border-1 border-dashed border-ca
    rounded-custom p-l-1.5 m-r-1 m-t-1 items-center cursor-pointer;

  &:hover {
    --apply: shadow-consistent shadow-ca;
  }

  &.is-first-child {
    --apply: m-l-3;
  }

  &.is-last-child {
    --apply: m-r-3;
  }
}

.qb-item.is-first-child {
  &::before {
    --apply: absolute -top-1.5 -left-2 text-8 leading-none;
    content: '[';
    color: var(--bracketColor);
  }
}

.is-last-child {
  &::after {
    --apply: absolute bottom-0 -right-2 text-8 leading-none font-normal;
    content: ']';
    color: var(--bracketColor);
  }
}
</style>
