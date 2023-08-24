<script setup lang="ts">
// Types
import type {
  IQueryBuilderItem,
  IQueryBuilderItemProps,
} from '~/components/QueryBuilder/types/query-builder-item-props.type'

// Models
import { ComparatorEnum } from '~/libs/App/data/enums/comparator.enum'

// Injections
import {
  qbColumnsKey,
  qbItemsKey,
} from '~/components/QueryBuilder/provide/query-builder.provide'
import { tableRefreshKey } from '~/components/Table/provide/table.provide'

// Components
import Menu from '~/components/Menu/Menu.vue'
import QueryBuilderItem from '~/components/QueryBuilder/QueryBuilderItem.vue'

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
const tableRefresh = injectStrict(tableRefreshKey, () => {})

// Layout
const itemEditMenuEl = ref<InstanceType<typeof Menu>>()
const itemEditEl = ref<InstanceType<typeof QueryBuilderItem>>()
const item = toRef(props, 'item')
const items = injectStrict(qbItemsKey)

const cols = computed(() => toValue(columns))
const colSelected = computed(() => {
  return cols.value.find(col => col.field === item.value.field)
})

const isNonValueComparator = computedEager(() => {
  return NON_VALUE_COMPARATORS.includes(item.value.comparator)
})

const levelColor = computed(() => {
  const color = COLORS[props.level % COLORS.length]

  return getColor(color)
})

function getDataType(): DataType {
  const col = colSelected.value

  if (!col) {
    return 'string'
  }

  switch (item.value.comparator) {
    case ComparatorEnum.AGO:
    case ComparatorEnum.NOT_AGO:
    case ComparatorEnum.UNTIL:
    case ComparatorEnum.NOT_UNTIL:
      return 'string'

    default:
      return col.dataType
  }
}

function handleRemoveCondition() {
  const idx = item.value.path.split('.').pop()
  const parentPath = props.item.path.split('.').slice(0, -2).join('.')
  const parent = get(toValue(items), parentPath)

  parent.children.splice(idx, 1)

  parent.children = [...parent.children]

  emits('delete:row', item.value)
  tableRefresh()
}

async function applyChanges() {
  const isValid = await $v.value.$validate()

  if (isValid) {
    itemEditMenuEl.value?.hide(true)
    tableRefresh()
  }
}

function handleItemEditMenuBeforeHide() {
  if (
    !item.value.comparator ||
    (item.value.value === undefined && !isNonValueComparator.value)
  ) {
    handleRemoveCondition()
  } else {
    applyChanges()
  }
}

const $v = useVuelidate({ $scope: 'qb' })
</script>

<template>
  <li
    class="qb-row qb-item"
    :class="{ 'is-first-child': isFirstChild }"
    :style="{ '--bracketColor': levelColor }"
    v-bind="$attrs"
    :data-path="item.path"
  >
    <!-- Field -->
    <span
      font="bold"
      text="caption xs"
      color="black dark:white"
    >
      {{ colSelected?.label }}
    </span>

    <!-- Comparator -->
    <span
      p="x-1"
      text="caption xs"
    >
      {{
        $t(
          `comparator.${item.comparator?.replaceAll('.', '|')}`
        ).toLocaleLowerCase()
      }}
    </span>

    <!-- Value -->
    <ValueFormatter
      v-if="!isNonValueComparator"
      :value="item.value"
      :data-type="getDataType()"
      :format="colSelected?.format"
      bg="white dark:darker rounded-custom"
      leading="none"
      p="x-1 y-1"
      color="black dark:white"
      rounded="custom"
      min-w="5"
      min-h="5"
      text="xs center"
      font="bold"
    />

    <Btn
      size="xs"
      preset="TRASH"
      @click.stop.prevent="handleRemoveCondition"
      @mousedown.stop.prevent
    />

    <!-- Item edit menu -->
    <Menu
      ref="itemEditMenuEl"
      hide-header
      :no-arrow="false"
      :no-overlay="false"
      dense
      @before-hide="handleItemEditMenuBeforeHide"
      @show="itemEditEl?.focusInput()"
    >
      <Form
        no-controls
        p="b-1"
        @submit="applyChanges"
      >
        <QueryBuilderItem
          ref="itemEditEl"
          :item="item"
          :level="level"
          :parent="parent"
          no-draggable
          m="!l-0"
          @delete:row="tableRefresh"
        />
      </Form>
    </Menu>
  </li>

  <!-- Add -->
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
