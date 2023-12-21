<script setup lang="ts">
import { klona } from 'klona'

import { config } from '~/config'

// Types
import type { ITableProps } from '~/components/Table/types/table-props.type'
import type { IQueryBuilderRow } from '~/components/QueryBuilder/types/query-builder-row-props.type'

// Injections
import { tableSlotsKey } from '~/components/Table/provide/table.provide'

// Models
import { TableColumn } from '~/components/Table/models/table-column.model'

// Functions
import { useTableData } from '~/components/Table/functions/useTableData'
import { useTableLayout } from '~/components/Table/functions/useTableLayout'
import { useTableSelection } from '~/components/Table/functions/useTableSelection'
import { useTableMetaData } from '~/components/Table/functions/useTableMetaData'
import { useTableExporting } from '~/components/Table/functions/useTableExporting'
import { useTableTopUtils } from '~/components/Table/functions/useTableTopUtils'
import { useTableEditing } from '~/components/Table/functions/useTableEditing'

const props = withDefaults(defineProps<ITableProps>(), {
  breakpoint: 'md',
  columns: () => [],
  groupExpandWidth: 36,
  minimumColumnWidth: 80,
  mobileRowHeight: 32,
  rowHeight: 40,
  rowKey: 'id',
  separator: 'cell',
  totalRows: 0,
  useUrl: true,
  infiniteScroll: config.table.props.infiniteScroll,
  noSearch: config.table.props.noSearch,
})

defineEmits<{
  (e: 'update:rows', rows: any[]): void
  (e: 'update:totalRows', count: number): void
  (e: 'update:queryBuilder', rows: IQueryBuilderRow[]): void
  (e: 'row-click', payload: { row: any; el: Element; ev: PointerEvent }): void
  (e: 'update:loading', loading: boolean): void
  (e: 'update:selected', selection: any): void
}>()

defineSlots<{
  [key: string]: any
  rowInside: { columns: any[]; row: any; index: number }
  dataRow: { columns: any[]; row: any; index: number }
  inner: { columns: any[]; row: any; index: number }
  top: IItem
  topLeftPrepend: IItem
  topLeftAppend: IItem
  topRightPrepend: IItem
  topRightAppend: IItem
  subbarRight: IItem
  topBulkActions: { selection: any[] }
  topBulkActionsMenu: { selection: any[] }
  belowTop: { rows: any[] }
}>()

const slots = useSlots()

provide(tableSlotsKey, slots)

defineExpose({
  refreshData: () => refreshData(true),
  resizeColumns: (force?: boolean) => handleResize(force),
  adjustColumns: (fnc: (columns: TableColumn[]) => void) => {
    fnc(internalColumns.value)
  },
  getDbQuery: () => dbQuery.value,
  selectRow: (
    row: any,
    options?: { val?: boolean; clearSelection?: boolean }
  ) => handleSelectRow(row, options),
  customFnc: (
    fnc: (options: { columns: TableColumn[]; rows: any[] }) => void
  ) => {
    fnc({ columns: internalColumns.value, rows: rows.value })
  },
})

// Utils
const { getTableTopProps } = useTableTopUtils()

// Layout
const tableTopProps = getTableTopProps(props)
const queryBuilderOriginal = useVModel(props, 'queryBuilder')
const { cloned: queryBuilder } = useCloned(queryBuilderOriginal, {
  clone: klona,
})

const { columns, layout, metadataRefetch } = await useTableMetaData(props)

const {
  // Element refs
  scrollerEl,
  headerEl,
  totalsEl,
  tableEl,

  // Columns
  internalColumns,
  hasVisibleColumn,

  // General
  isScrolled,
  isBreakpoint,
  tableRowHeight,
  rowKey,
  TableRowComponent,
  handleScrollLeft,
  handleRowClick,
  recreateColumns,
  handleResize,
} = useTableLayout(props, columns, layout)

const {
  isLoading,
  rows,
  refreshData,
  search,
  dbQuery,

  // Pagination
  currentPage,
  currentPageSize,
  isFirstPage,
  isLastPage,
  pageCount,
  totalRows,
  prev,
  next,

  // Infinite scroll
  handleInfiniteScroll,
} = useTableData(
  props,
  internalColumns,
  layout,
  queryBuilder,
  scrollerEl,
  metadataRefetch,
  recreateColumns,
  handleResize
)

const { handleSelectRow } = useTableSelection(props)
useTableExporting(rows)
useTableEditing(props)

onMounted(() => {
  scrollerEl.value?.focus()
})
</script>

<template>
  <div
    ref="tableEl"
    class="table-container"
  >
    <!-- Top -->
    <slot
      v-if="!noTop"
      name="top"
    >
      <TableTop
        v-model:query-builder="queryBuilder"
        v-model:search="search"
        v-bind="tableTopProps"
        :small-screen="!isBreakpoint"
        @update:columns-width="handleResize()"
      >
        <template
          v-if="$slots['top-left-prepend']"
          #left-prepend
        >
          <slot name="top-left-prepend" />
        </template>

        <template
          v-if="$slots['top-left-append']"
          #left-append
        >
          <slot name="top-left-append" />
        </template>

        <template
          v-if="$slots['top-right-prepend']"
          #right-prepend
        >
          <slot name="top-right-prepend" />
        </template>

        <template
          v-if="$slots['top-right-append']"
          #right-append
        >
          <slot name="top-right-append" />
        </template>

        <template
          v-if="$slots['subbar-right']"
          #subbar-right
        >
          <slot name="subbar-right" />
        </template>

        <template
          v-if="$slots['top-bulk-actions']"
          #bulk-actions="{ selection }"
        >
          <slot
            name="top-bulk-actions"
            :selection="selection"
          />
        </template>

        <template #bulk-actions-menu="{ selection }">
          <slot
            name="top-bulk-actions-menu"
            :selection="selection"
          />
        </template>
      </TableTop>
    </slot>

    <!-- Below top -->
    <slot
      name="below-top"
      :rows="rows"
    />

    <TableTooManyRowsInfo v-if="rows.length > 1e5" />

    <TableHeader
      v-if="!noHeader"
      ref="headerEl"
      class="table-header"
      :columns="internalColumns"
      :rows="rows"
      :minimum-column-width="minimumColumnWidth"
      :small-screen="!isBreakpoint"
      :class="{ 'shadow-lg shadow-ca': isScrolled }"
      @scrolled="handleScrollLeft"
    >
      <template #default="{ col }">
        <slot :name="`header-${col.name}`" />
      </template>
    </TableHeader>

    <VirtualScroller
      v-show="hasVisibleColumn"
      ref="scrollerEl"
      :rows="rows"
      :row-key="rowKey"
      :row-height="tableRowHeight"
      :no-scroll-emit="!infiniteScroll"
      :overscan="isBreakpoint ? 100 : 10"
      class="scroller"
      @virtual-scroll="handleInfiniteScroll"
    >
      <template #default="{ row, index }">
        <Component
          :is="TableRowComponent"
          :row="row"
          :columns="internalColumns"
          :to="to"
          :class="{ 'is-clickable': rowClickable, 'odd': index % 2 !== 0 }"
          :row-height="rowHeight"
          :editable="editable"
          :index="index"
          :selectable="selectable"
          @click="handleRowClick(row, $event)"
        >
          <template #row-inside="{ mode }">
            <slot
              name="row-inside"
              :columns="columns"
              :row="row"
              :index="index"
              :mode="mode"
            />
          </template>

          <template #default>
            <slot
              name="data-row"
              :columns="columns"
              :row="row"
              :index="index"
            />
          </template>

          <template #inner>
            <slot
              name="inner"
              :columns="columns"
              :row="row"
              :index="index"
            />
          </template>

          <template
            v-for="col in columns"
            :key="col.name"
            #[col.name]
          >
            <slot
              :name="col.name"
              :row="row"
              :index="index"
              :refresh-data-fnc="refreshData"
            />
          </template>
        </Component>
      </template>
    </VirtualScroller>

    <TableNoData
      :has-no-data="!rows.length && !isLoading"
      :is-visible="!isLoading"
      data-cy="no-data"
    />

    <TableLoadingData
      v-if="isLoading"
      :rows="rows"
    />

    <TableTotals
      v-if="!noTotals && !!getTotalsData"
      ref="totalsEl"
      class="table-totals"
      :columns="internalColumns"
      :get-totals-data="getTotalsData"
      @scrolled="handleScrollLeft"
    />

    <TablePagination
      v-if="noPagination !== null"
      v-model:current-page="currentPage"
      v-model:current-page-size="currentPageSize"
      :is-first-page="isFirstPage"
      :is-last-page="isLastPage"
      :page-count="pageCount"
      :total-rows="totalRows"
      :infinite-scroll="infiniteScroll"
      :no-pagination="noPagination || infiniteScroll"
      :current-rows="rows.length"
      :prev="prev"
      :next="next"
    />
  </div>
</template>

<style lang="scss" scoped>
.table-container {
  --apply: relative flex flex-col overflow-auto max-h-full max-w-full
    rounded-custom;

  &__top {
    --apply: flex flex-col shrink-0 gap-1 border-b-1 border-ca p-2 p-l-1
      overflow-auto;
  }

  .is-clickable {
    --apply: cursor-pointer;
  }

  .scroller {
    --apply: max-h-full bg-$Table-container-bg;
  }
}

.non-searchable-info {
  --apply: m-t-2 p-x-2 p-y-3 text-caption text-center border-ca border-2
    rounded-custom;
}

:deep(.virtual-scroll__content) {
  --apply: font-size-13px;
}

.table-header,
.table-totals,
.scroller {
  --apply: m-$Table-content-margin;
}
</style>
