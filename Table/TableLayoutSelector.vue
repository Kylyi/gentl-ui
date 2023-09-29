<script setup lang="ts">
import { klona } from 'klona'
import { config } from '~/config'

// Types
import type { IQueryBuilderItem } from '~/components/QueryBuilder/types/query-builder-item-props.type'
import type { ITableLayout } from '~/components/Table/types/table-layout.type'
import type { ITableProps } from '~/components/Table/types/table-props.type'

// Models
import { FilterItem } from '~/libs/App/data/models/filter-item'

// Injections
import {
  getTableStorageKey,
  tableColumnsKey,
  tableLayoutKey,
  tableLayoutsKey,
  tableResizeKey,
} from '~/components/Table/provide/table.provide'

// Functions
import { useTableUtils } from '~/components/Table/functions/useTableUtils'

// Store
import { useTableStore } from '~/components/Table/table.store'

// Components
import Selector from '~/components/Selector/Selector.vue'

// Constants
import { queryBuilderDefault } from '~/components/QueryBuilder/constants/query-builder-default.constant'

const props = defineProps<Pick<ITableProps, 'queryBuilder'>>()

// Utils
const { parseUrlParams } = useTableUtils()

// Injections
const columns = injectStrict(tableColumnsKey)
const layouts = injectStrict(tableLayoutsKey)
const layout = injectStrict(tableLayoutKey)
const _getTableStorageKey = injectStrict(getTableStorageKey)
const tableResize = injectStrict(tableResizeKey)

// Store
const { getTableState } = useTableStore()

// Layout
const layoutSelectorEl = ref<InstanceType<typeof Selector>>()
const queryBuilder = useVModel(props, 'queryBuilder')
const isResetConfirmationActive = ref(false)

function handleLayoutSelect(
  _layout?: ITableLayout,
  resetColumnWidths?: boolean
) {
  const storageKey = _getTableStorageKey()
  const tableState = getTableState(storageKey)
  const defaultFilter = get(
    tableState.value.meta,
    config.table.layoutKey
  ) as any

  // NOTE: We unfreeze any frozen column
  const frozenCol = columns.value.find(col => col.frozen)
  if (frozenCol) {
    frozenCol.freeze(columns.value)
  }

  const isReset = !_layout
  if (!_layout) {
    _layout = {
      id: 0,
      name: '',
      schema:
        defaultFilter?.schema ||
        `select=${columns.value
          .filter(col => !col.isHelperCol)
          .map(col => col.field)
          .join(',')}`,
    }

    layout.value = undefined
  }

  // The query params
  const searchParams = new URLSearchParams(_layout.schema)

  // The actual parsed values
  const {
    columns: schemaColumns,
    filters: schemaFilters,
    queryBuilder: schemaQueryBuilder,
    schemaSort,
  } = parseUrlParams({
    columnsRef: columns,
    searchParams,
  })

  const schemaHasAnyFilters =
    !!schemaFilters?.length || !!schemaQueryBuilder?.length

  // We reset the width, visibility, sorting, order and filters of all columns
  columns.value.forEach(col => {
    if (!col.isHelperCol) {
      if (schemaColumns?.length) {
        col.hidden = !!schemaColumns?.length
        col._internalSort = undefined
      }

      if (schemaHasAnyFilters || isReset) {
        col.clearFilters()
      }

      if (schemaSort?.length || isReset) {
        col.sort = undefined
        col.sortOrder = undefined
      }

      if (resetColumnWidths) {
        col.width = col.originalWidth
      }
    }
  })

  // We only show the columns that are in the URL and set their _internalSort for
  // sorting it later
  schemaColumns?.forEach((col, idx) => {
    const foundColumn = columns.value.find(c => c.field === col)

    if (foundColumn) {
      foundColumn.hidden = false
      foundColumn._internalSort = idx
    }
  })

  // Set the query builder with the parsed query builder or reset it
  // we don't want to set the query builder if it's undefined
  if (schemaQueryBuilder?.length) {
    queryBuilder.value = schemaQueryBuilder
  } else if (isReset) {
    queryBuilder.value = klona(queryBuilderDefault)
  } else if (props.queryBuilder !== undefined) {
    queryBuilder.value = props.queryBuilder
  }

  // Set the column filters with the parsed filters
  ;(schemaFilters as IQueryBuilderItem[]).forEach(filter => {
    const column = columns.value.find(c => c.field === filter.field)

    if (column) {
      column.filters.push(
        new FilterItem({
          field: filter.field,
          value: filter.value,
          comparator: filter.comparator,
        })
      )
    }
  })

  // Set the column sorting with the parsed sorting
  schemaSort.forEach(sort => {
    const column = columns.value.find(c => c.field === sort.field)

    if (column) {
      column.sort = sort.sort
      column.sortOrder = sort.sortOrder
    }
  })

  // Sort the columns based on the `_internalSort`
  columns.value.sort((a, b) => {
    if (a._internalSort === undefined) {
      return 1
    }

    if (b._internalSort === undefined) {
      return -1
    }

    return a._internalSort - b._internalSort
  })

  // Refresh
  setTimeout(() => {
    tableResize()
  }, 0)

  layoutSelectorEl.value?.blur()
}
</script>

<template>
  <Selector
    ref="layoutSelectorEl"
    v-model="layout"
    :options="layouts"
    option-label="name"
    size="sm"
    w="50"
    :placeholder="$t('table.layoutState')"
    @picker-hide="isResetConfirmationActive = false"
    @update:model-value="handleLayoutSelect"
  >
    <template #prepend>
      <div class="solar:eye-linear m-l-2 color-ca" />
    </template>

    <template #above-options>
      <div
        relative
        flex="~ col"
        overflow="hidden"
      >
        <Btn
          size="sm"
          m="x-1 y-0.5"
          color="negative"
          no-uppercase
          :label="$t('table.layoutStateReset')"
          @click="isResetConfirmationActive = true"
        />

        <div
          class="reset-confirmation"
          :class="{ 'is-active': isResetConfirmationActive }"
        >
          <span
            grow
            text="caption xs center"
          >
            {{ $t('table.resetColumnWidthsPrompt') }}
          </span>

          <div flex="~ gap-1">
            <Btn
              size="xs"
              label="N"
              color="red-500"
              @click="handleLayoutSelect(undefined, false)"
            />
            <Btn
              size="xs"
              label="Y"
              color="green-500"
              @click="handleLayoutSelect(undefined, true)"
            />
          </div>
        </div>
      </div>

      <Separator spaced />
    </template>
  </Selector>
</template>

<style lang="scss" scoped>
.reset-confirmation {
  --apply: absolute flex items-center gap-2 items-center translate-x-100%
    transition-transform inset-x-1 inset-y-0.5 bg-white dark:bg-darker;

  &.is-active {
    --apply: translate-x-0;
  }
}
</style>
