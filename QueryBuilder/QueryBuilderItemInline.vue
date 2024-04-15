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
  qbIsActivelyModifyingValuesKey,
  qbItemsKey,
} from '~/components/QueryBuilder/provide/query-builder.provide'
import { tableRefreshKey } from '~/components/Table/provide/table.provide'

// Constants
import { COLORS } from '~/libs/App/constants/colors.constant'
import { NON_VALUE_COMPARATORS } from '~/components/Table/constants/comparator-categories.const'

// Components
import Menu from '~/components/Menu/Menu.vue'
import QueryBuilderItem from '~/components/QueryBuilder/QueryBuilderItem.vue'

defineOptions({
  inheritAttrs: false,
})
const props = withDefaults(defineProps<IQueryBuilderItemProps>(), {
  noAdd: undefined,
})
const emits = defineEmits<{
  (e: 'add:row'): void
  (e: 'delete:row', item: IQueryBuilderItem): void
}>()

// Injections
const columns = injectStrict(qbColumnsKey)
const isActivelyModifyingValues = injectStrict(
  qbIsActivelyModifyingValuesKey,
  ref(false)
)
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

function getDataType(): ExtendedDataType {
  const col = colSelected.value

  if (!col) {
    return 'string'
  }

  if (DATE_TYPES.includes(col.dataType)) {
    return 'date'
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
  if (props.removeFnc) {
    props.removeFnc(item.value)
    tableRefresh()

    return
  }

  const idx = item.value.path.split('.').pop()
  const parentPath = props.item.path.split('.').slice(0, -2).join('.')
  const parent = get(toValue(items), parentPath)

  parent.children.splice(idx, 1)

  parent.children = [...parent.children]

  emits('delete:row', item.value)
  tableRefresh()
}

async function applyChanges() {
  const isValid = await $z.value.$validate()

  if (isValid) {
    itemEditMenuEl.value?.hide(true)
    tableRefresh()
  }
}

async function handleItemEditMenuBeforeHide() {
  isActivelyModifyingValues.value = false

  await nextTick()

  if (
    !item.value.comparator ||
    (Array.isArray(item.value.value) && !item.value.value.length) ||
    (item.value.value === undefined && !isNonValueComparator.value)
  ) {
    handleRemoveCondition()
  } else {
    applyChanges()
  }
}

const $z = useZod({ scope: 'qb' })
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
      truncate
    >
      {{ colSelected?.label }}
    </span>

    <!-- Comparator -->
    <span
      p="x-1"
      text="caption xs"
      shrink-0
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
      class="qb-item__value"
    />

    <Btn
      v-if="editable"
      size="xs"
      preset="TRASH"
      @click.stop.prevent="handleRemoveCondition"
      @mousedown.stop.prevent
    />

    <!-- Item edit menu -->
    <Menu
      v-if="editable"
      ref="itemEditMenuEl"
      :no-arrow="false"
      :no-overlay="false"
      :fit="false"
      min-w="min"
      @before-show="isActivelyModifyingValues = true"
      @show="itemEditEl?.focusInput()"
      @before-hide="handleItemEditMenuBeforeHide"
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
          :editable="editable"
          no-draggable
          no-remove
          m="!0"
          p="!x-1"
          min-w="70"
          @delete:row="tableRefresh"
          @update:comparator="itemEditMenuEl?.recomputePosition"
        />
      </Form>
    </Menu>
  </li>

  <!-- Add -->
  <Btn
    v-if="isLastChild && !noAdd && editable"
    size="xs"
    preset="ADD"
    class="close-bracket"
    :class="{ 'is-last-child': isLastChild }"
    :style="{ '--bracketColor': levelColor, 'color': levelColor }"
    @click="$emit('add:row')"
  />

  <!-- Close bracket (When no add buttom is present) -->
  <div
    v-else-if="isLastChild"
    class="close-bracket"
    :class="{ 'is-last-child': isLastChild }"
    :style="{ '--bracketColor': levelColor, 'color': levelColor }"
  >
    &ZeroWidthSpace;
  </div>
</template>

<style scoped lang="scss">
.qb-item {
  --apply: relative flex gap-1 bg-ca border-1 border-dashed border-ca
    rounded-custom p-l-1.5 items-center cursor-pointer;

  --apply: min-h-26px; // Arbitrary number that looks good...

  &:hover {
    --apply: shadow-consistent-xs shadow-ca;
  }

  &.is-first-child {
    --apply: m-l-3;
  }

  &.is-last-child {
    --apply: m-r-3;
  }

}

:deep(.qb-item__value) {
--apply: rounded-custom p-1 leading-none min-w-5 min-h-5 text-xs text-center font-bold
  bg-white dark:bg-darker color-black dark:color-white max-w-70 truncate;
}

.qb-item.is-first-child {
  &::before {
    --apply: absolute -left-2.5 text-6 leading-none;

    content: '\2772';
    color: var(--bracketColor);
  }
}

.is-last-child {
  --apply: relative;

  &::after {
    --apply: absolute -right-2 text-6 leading-none font-normal;

    content: '\2773';
    color: var(--bracketColor);
  }
}

.close-bracket {
  --apply: m-r-2 self-center;
}
</style>
