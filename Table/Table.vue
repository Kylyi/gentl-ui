<script setup lang="ts">
import { klona } from 'klona/full'

// Types
import type { ITableProps } from '~/components/Table/types/table-props.type'
import type { ITableSelection } from '~/components/Table/types/table-selection.type'
import type { IQueryBuilderRow } from '~/components/QueryBuilder/types/query-builder-row-props.type'

// Injections
import { tableIdKey, tableSlotsKey } from '~/components/Table/provide/table.provide'

// Models
import type { TableColumn } from '~/components/Table/models/table-column.model'

// Functions
import { useTableUtils } from '~/components/Table/functions/useTableUtils'
import { getComponentProps } from '~/components/__helpers/get-config-props'
import { useTableData } from '~/components/Table/functions/useTableData'
import { useTableLayout } from '~/components/Table/functions/useTableLayout'
import { useTableSelection } from '~/components/Table/functions/useTableSelection'
import { useTableMetaData } from '~/components/Table/functions/useTableMetaData'
import { useTableExporting } from '~/components/Table/functions/useTableExporting'
import { useTableTopUtils } from '~/components/Table/functions/useTableTopUtils'
import { useTableEditing } from '~/components/Table/functions/useTableEditing'

const props = withDefaults(defineProps<ITableProps>(), {
  ...getComponentProps('table'),
})

defineEmits<{
  (e: 'update:rows', rows: any[]): void
  (e: 'update:totalRows', count: number): void
  (e: 'update:queryBuilder', rows: IQueryBuilderRow[]): void
  (e: 'row-click', payload: { row: any, el: Element, ev: PointerEvent }): void
  (e: 'update:loading', loading: boolean): void
  (e: 'update:selected', selection: any): void
}>()

defineSlots<{
  [key: string]: any
  dataRow: { columns: any[], row: any, index: number }
  inner: { columns: any[], row: any, index: number }
  paginationAppend: { customData: IItem }
  default: IItem
  rowInside: { columns: any[], row: any, index: number }
  top: IItem
  topLeftPrepend: IItem
  topLeftAppend: IItem
  topRightPrepend: IItem
  topRightAppend: IItem
  subbarRight: IItem
  topBulkActions: { selection: any[] }
  topBulkActionsMenu: { selection: any[] }
  belowTop: { rows: any[] }
  topBarMiddleStart: IItem
  topBarMiddleEnd: IItem
}>()

const slots = useSlots()

provide(tableSlotsKey, slots)

defineExpose({
  rerender: (noEmit?: boolean) => scrollerEl.value?.rerender(noEmit),
  refreshData: () => refreshData(true),
  refreshSelection: (selection?: ITableSelection) => refreshSelection(selection),
  resizeColumns: (force?: boolean) => handleResize(force),
  adjustColumns: (fnc: (columns: TableColumn[]) => void) => fnc(internalColumns.value),
  scrollToTop: () => scrollerEl.value?.scrollToTop(),
  getDbQuery: () => dbQuery.value,
  selectRow: (
    row: any,
    options?: { val?: boolean, clearSelection?: boolean },
  ) => handleSelectRow(row, options),
  clearSelection: () => clearSelection(),
  handleCancelEditRow: () => handleCancelEditRow(),
  getRows: () => rows,
  customFnc: (
    fnc: (options: {
      columns: TableColumn[]
      rowsRef: Ref<any[]>
      totalRowsRef: Ref<number | undefined>
      tableRowHeight: typeof tableRowHeight.value
      scrollerEl: typeof scrollerEl.value
      refreshData: () => void
    }) => void,
  ) => {
    fnc({
      columns: internalColumns.value,
      rowsRef: rows,
      totalRowsRef: totalRows,
      tableRowHeight: tableRowHeight.value,
      scrollerEl: scrollerEl.value,
      refreshData: () => refreshData(true),
    })
  },
})

// Utils
const { getStorageKey } = useTableUtils(props)
const { getTableTopProps } = useTableTopUtils()

// Init store
provideLocal(tableIdKey, getStorageKey())

// Layout
const tableTopProps = getTableTopProps(props)
const queryBuilderOriginal = useVModel(props, 'queryBuilder')
const { cloned: queryBuilder } = useCloned(
  queryBuilderOriginal,
  { clone: klona },
)

const { columns, layout, metadataRefetch } = await useTableMetaData(props)

const {
  // Element refs
  scrollerEl,
  headerEl,
  scrollbarWidth,
  scrollerElBounds,
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
  handleRowClick,
  recreateColumns,
  handleResize,
} = useTableLayout(props, columns, layout)

const {
  isLoading,
  rows,
  search,
  dbQuery,
  customData,
  rowsSplit,
  refreshData,
  fetchMore,

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
  handleResize,
)

const { handleSelectRow, clearSelection, refreshSelection } = useTableSelection(props, rows)
useTableExporting(rows)
const { handleCancelEditRow } = useTableEditing(props)

const overscan = computed(() => {
  return isBreakpoint.value
    ? { top: 2800, bottom: 3600 }
    : { top: 600, bottom: 600 }
})

function handleColumnsWidthChange() {
  handleResize()

  nextTick(() => {
    scrollerEl.value?.rerender()
  })
}

onMounted(() => {
  if (!props.noFocusOnInit) {
    scrollerEl.value?.focus()
  }
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
        @update:columns-width="handleColumnsWidthChange"
        @resized="scrollerEl?.rerender"
      >
        <template
          v-if="$slots['middle-center']"
          #left
        >
          <slot name="middle-center" />
        </template>

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
          v-if="$slots['subbar-left']"
          #subbar-left
        >
          <slot name="subbar-left" />
        </template>

        <template
          v-if="$slots['subbar-right']"
          #subbar-right
        >
          <slot name="subbar-right" />
        </template>

        <template
          v-if="$slots['topbar-middle-start']"
          #middle-start
        >
          <slot name="topbar-middle-start" />
        </template>

        <template
          v-if="$slots['topbar-middle-end']"
          #middle-end
        >
          <slot name="topbar-middle-end" />
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

        <template
          v-if="$slots['top-bulk-actions-menu']"
          #bulk-actions-menu="{ selection }"
        >
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
      :rows="rows"
      :minimum-column-width="minimumColumnWidth"
      :small-screen="!isBreakpoint"
      :no-lock="noLock"
      :no-autofit="noAutofit"
      :class="{ 'shadow-lg shadow-ca': isScrolled }"
      :selection-options="selectionOptions"
      @resized="scrollerEl?.rerender(true)"
    >
      <template #default="{ col }">
        <slot :name="`header-${col.name}`" />
      </template>
    </TableHeader>

    <VirtualScroller
      v-show="hasVisibleColumn"
      ref="scrollerEl"
      :rows="rowsSplit"
      :row-key
      :row-height="tableRowHeight.current"
      :no-scroll-emit="!infiniteScroll"
      :overscan="overscan"
      :fetch-more="fetchMore"
      class="scroller"
      @virtual-scroll="handleInfiniteScroll"
    >
      <template #default="{ row, index }">
        <Component
          :is="TableRowComponent"
          :rows="row.data"
          :columns="internalColumns"
          :to="to"
          :class="{ 'is-clickable': rowClickable, 'odd': index % 2 !== 0 }"
          :row-height="tableRowHeight.current"
          :editable="editable"
          :index="index"
          :split-row="splitRow"
          :row-class="rowClass"
          :selection-options="selectionOptions"
          @click="handleRowClick(row.data, $event)"
        >
          <template #row-inside="{ mode, row }">
            <slot
              name="row-inside"
              :columns="columns"
              :row="row"
              :index="index"
              :mode="mode"
              :bounds="scrollerElBounds"
              :scrollbar-width="scrollbarWidth"
            />
          </template>

          <template #default="{ row }">
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
            #[col.name]="{ row }"
          >
            <slot
              :name="col.name"
              :width="col.adjustedWidthPx"
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
      :rows-per-page-options="rowsPerPageOptions"
      :current-rows="rows.length"
      :limit-rows="getData?.limitRows"
      :prev="prev"
      :next="next"
    >
      <template
        v-if="$slots['pagination-append']"
        #pagination-append
      >
        <slot
          name="pagination-append"
          :custom-data="customData"
        />
      </template>
    </TablePagination>

    <slot />
  </div>
</template>

<style lang="scss" scoped>
.table-container {
  @apply relative flex flex-col overflow-auto max-h-full max-w-full
    rounded-custom;

  @apply m-$Table-content-margin;

  &__top {
    @apply flex flex-col shrink-0 gap-1 border-b-1 border-ca p-2 p-l-1
      overflow-auto;
  }

  .is-clickable {
    @apply cursor-pointer;
  }

  .scroller {
    @apply max-h-full bg-$Table-container-bg;
  }
}

.non-searchable-info {
  @apply m-t-2 p-x-2 p-y-3 text-caption text-center border-ca border-2
    rounded-custom;
}

:deep(.virtual-scroll__content) {
  @apply font-size-13px;
}
</style>
