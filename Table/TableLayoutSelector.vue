<script setup lang="ts">
import { klona } from 'klona/full'
import { config } from '~/components/config/components-config'

// Types
import type { IQueryBuilderItem } from '~/components/QueryBuilder/types/query-builder-item-props.type'
import type { ITableLayout } from '~/components/Table/types/table-layout.type'
import type { ITableProps } from '~/components/Table/types/table-props.type'

// Models
import { FilterItem } from '~/libs/Shared/models/filter-item'

// Injections
import {
  getTableStorageKey,
  tableColumnsKey,
  tableLayoutKey,
  tableLayoutsKey,
  tableRefreshKey,
} from '~/components/Table/provide/table.provide'

// Functions
import { useTableUtils } from '~/components/Table/functions/useTableUtils'
import { useTableColumnResizing } from '~/components/Table/functions/useTableColumnResizing'

// Store
import { useTableStore } from '~/components/Table/table.store'

// Components
import Selector from '~/components/Selector/Selector.vue'

// Constants
import { queryBuilderDefault } from '~/components/QueryBuilder/constants/query-builder-default.constant'

const props = defineProps<Pick<ITableProps, 'queryBuilder' | 'nonSavableSettings'>>()

// Injections
const columns = injectStrict(tableColumnsKey)
const layouts = injectStrict(tableLayoutsKey)
const layout = injectStrict(tableLayoutKey)
const _getTableStorageKey = injectStrict(getTableStorageKey)
const tableRefresh = injectStrict(tableRefreshKey)

// Utils
const { parseUrlParams } = useTableUtils()
const { handleFitColumns } = useTableColumnResizing({ columns })

// Store
const { getTableState } = useTableStore()

// Layout
const layoutSelectorEl = ref<InstanceType<typeof Selector>>()
const queryBuilder = useVModel(props, 'queryBuilder')
const search = ref('')

function handleLayoutSelect(
  _layout?: ITableLayout,
  resetColumnWidths?: boolean,
) {
  const storageKey = _getTableStorageKey()
  const tableState = getTableState(storageKey)
  const defaultFilter = get(
    tableState.value.meta,
    config.table.defaultLayoutKey,
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
        defaultFilter?.schema
        || `select=${columns.value
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
    fromSchema: true,
  })

  const schemaHasAnyFilters
    = !!schemaFilters?.length || !!schemaQueryBuilder?.length

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
  } else if (isReset && props.queryBuilder !== undefined) {
    queryBuilder.value = klona(queryBuilderDefault)
  } else if (
    schemaHasAnyFilters
    && !schemaQueryBuilder?.length
    && props.queryBuilder !== undefined
  ) {
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
          format: column.format,
          dataType: column.dataType,
        }),
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

  layout.value = {
    ..._layout,
    preventLayoutReset: true,
  }

  // Refresh
  setTimeout(() => {
    handleFitColumns()

    // When only filter columns are part of the schema, we manually trigger the
    // table refresh as they are not watched
    const isOnlyColFilters
      = schemaFilters.length
      && !schemaColumns.length
      && !schemaSort.length
      && !schemaQueryBuilder.length

    if (isOnlyColFilters) {
      tableRefresh(true)
    }
  }, 0)

  layoutSelectorEl.value?.blur()
}

// Dialogs
const isSettingsDialogOpen = ref(false)
const isOptionsDialogOpen = ref(false)

function handleOpenDialog(dialogName: string) {
  if (dialogName === 'layoutSettings') {
    $hide({ all: true })
    isSettingsDialogOpen.value = true
  } else if (dialogName === 'tableOptions') {
    $hide({ all: true })
    isOptionsDialogOpen.value = true
  }
}
</script>

<template>
  <Selector
    ref="layoutSelectorEl"
    v-model:search="search"
    :model-value="layout?.id === 0 ? undefined : layout"
    :options="layouts"
    option-label="name"
    size="sm"
    w="70"
    layout="regular"
    no-menu-match-width
    :menu-props="{ placement: 'bottom-end', class: 'w-120' }"
    :placeholder="$t('table.layoutState')"
    data-cy="scheme-search"
    @update:model-value="handleLayoutSelect"
    @picker-hide="search = ''"
  >
    <template #prepend>
      <div class="i-solar:eye-linear m-l-2 color-ca" />

      <TableLayoutSettingsDialog
        v-model="isSettingsDialogOpen"
        :search="search"
        manual
      />

      <TableOptionsDialog
        v-model="isOptionsDialogOpen"
        manual
      />
    </template>

    <template #above-options>
      <div
        relative
        flex="~ gap-2 justify-between shrink-0"
        overflow="hidden"
        p="t-1 x-2"
      >
        <!-- Save -->
        <Btn
          icon="i-material-symbols:save"
          size="xs"
          color="positive"
          no-uppercase
          :label="$t('general.save')"
          data-cy="settings"
          @click="handleOpenDialog('layoutSettings')"
        />

        <div flex="~ gap-2">
          <!-- Layout settings -->
          <Btn
            icon="i-solar:settings-linear"
            size="xs"
            color="ca"
            no-uppercase
            :label="$t('general.option', 2)"
            @click="handleOpenDialog('tableOptions')"
          />

          <!-- Reset -->
          <Btn
            size="xs"
            color="negative"
            no-uppercase
            icon="i-carbon:reset"
            :label="$t('table.layoutStateReset')"
            @click="handleLayoutSelect(undefined, true)"
          />
        </div>
      </div>

      <Separator spaced />
    </template>

    <template #item="{ item }">
      <div
        flex="~ items-center"
        p="y-2"
        w="full"
        class="x"
      >
        <span grow>
          {{ item.name }}
        </span>

        <TableLayoutSelectorSavedOptions :layout="item" />
      </div>
    </template>
  </Selector>
</template>
