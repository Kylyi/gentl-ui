<script setup lang="ts">
// Types
import type { IQueryBuilderItem } from '~/components/QueryBuilder/types/query-builder-item-props.type'
import type { ITableLayout } from '~/components/Table/types/table-layout.type'
import type { ITableProps } from '~/components/Table/types/table-props.type'

// Models
import { FilterItem } from '~/libs/App/data/models/filter-item'

// Injections
import {
  tableColumnsKey,
  tableLayoutKey,
  tableLayoutsKey,
  tableResizeKey,
} from '~/components/Table/provide/table.provide'

// Functions
import { useTableUtils } from '~/components/Table/functions/useTableUtils'

// Components
import Selector from '~/components/Selector/Selector.vue'

const props = defineProps<Pick<ITableProps, 'queryBuilder'>>()

// Utils
const { parseUrlParams } = useTableUtils()

// Injections
const columns = injectStrict(tableColumnsKey)
const layouts = injectStrict(tableLayoutsKey)
const layout = injectStrict(tableLayoutKey)
const tableResize = injectStrict(tableResizeKey)

// Layout
const layoutSelectorEl = ref<InstanceType<typeof Selector>>()
const queryBuilder = useVModel(props, 'queryBuilder')

function handleLayoutSelect(_layout?: ITableLayout) {
  if (!_layout) {
    _layout = {
      id: 0,
      name: $t('table.layoutStateNoLayout'),
      schema: `select=${columns.value
        .filter(col => !col.isHelperCol)
        .map(col => col.field)
        .join(',')}`,
    }

    layout.value = _layout
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

  // We reset the visibility, sorting, order and filters of all columns
  columns.value.forEach(col => {
    col.hidden = !!schemaColumns?.length
    col._internalSort = undefined
    col.filters = []
    col.sort = undefined
    col.sortOrder = undefined
  })

  // We only show the columns that are in the URL and set their _internalSort for
  // sorting it later
  schemaColumns?.forEach((col, idx) => {
    const column = columns.value.find(c => c.field === col)

    if (column) {
      column.hidden = false
      column._internalSort = idx
    }
  })

  // Set the query builder with the parsed query builder or reset it
  queryBuilder.value = schemaQueryBuilder?.length
    ? schemaQueryBuilder
    : [
        {
          id: generateUUID(),
          isGroup: true,
          children: [],
          condition: 'AND',
          path: '0',
        },
      ]

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
    @update:model-value="handleLayoutSelect"
  >
    <template #prepend>
      <div class="solar:eye-linear m-l-2 color-ca" />
    </template>

    <template #above-options>
      <Btn
        size="sm"
        m="x-1 y-.5"
        color="negative"
        no-uppercase
        :label="$t('table.layoutStateReset')"
        @click="handleLayoutSelect()"
      />

      <Separator spaced />
    </template>
  </Selector>
</template>
