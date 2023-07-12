<script setup lang="ts">
// VIRTUAL SCROLLER
// @ts-expect-error - no types
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { config } from '~/config'

// TYPES
import type { ITableProps } from '~/components/Table/types/table-props.type'

// COMPOSITION FUNCTIONS
import { useTableData } from '~/components/Table/functions/useTableData'
import { useTableExporting } from '~/components/Table/functions/useTableExporting'
import { useTableLayout } from '~/components/Table/functions/useTableLayout'
import { useTableSelection } from '~/components/Table/functions/useTableSelection'
import { useTableUtils } from '~/components/Table/functions/useTableUtils'
import { getTableStateDefault } from '~/components/Table/constants/table-state.default'

const props = withDefaults(defineProps<ITableProps>(), {
  breakpoint: 'md',
  columns: () => [],
  filters: () => [],
  groupExpandWidth: 36,
  groups: () => [],
  minimumColumnWidth: 64,
  mobileRowHeight: 32,
  rowHeight: 40,
  rowKey: 'id',
  separator: 'cell',
  sizeField: 'size',
  totalRows: 0,
  useServer: true,
  useChips: config.table.useChips,
  useUrl: true,
})

defineEmits<{
  (e: 'update:rows', rows: any[]): void
  (e: 'update:totalRows', count: number): void
  (e: 'row-click', payload: { row: any; el: Element }): void
}>()

defineExpose({
  refreshData: () => refreshData(),
})

// Utils
const { getTableState, getStorageKey } = useTableUtils()

const tableState =
  (await getTableState()) ??
  useLocalStorage(getStorageKey()!, getTableStateDefault())

const {
  scrollerEl,
  headerEl,
  tableEl,
  columns,
  TableRowComponent,
  internalColumns,
  hasVisibleColumn,
  isScrolled,
  rowKey,
  handleScrollLeft,
  handleRowClick,
  throttledHandleResize,
  searchableColumnLabels,
} = useTableLayout(props, tableState)

const {
  isLoading,
  rows,
  search,
  storageKey,
  refreshData,

  // PAGINATION
  currentPage,
  currentPageSize,
  isFirstPage,
  isLastPage,
  pageCount,
  totalRows,
  prev,
  next,
} = await useTableData(props, internalColumns, tableState)

const { isExporting, handleExportData } = useTableExporting()

useTableSelection(props)
</script>

<template>
  <div
    ref="tableEl"
    class="table-container"
  >
    <!-- TOP -->
    <slot
      v-if="!noTop"
      name="top"
    >
      <div class="table-container__top">
        <slot
          name="search"
          :rows="rows"
        >
          <TableSearch
            v-model:search="search"
            :columns="internalColumns"
            :no-search="noSearch"
            :use-chips="useChips"
            :searchable-column-labels="searchableColumnLabels"
          />
        </slot>

        <slot name="prepend-actions" />

        <TableColumnsBtn
          v-model:columns="internalColumns"
          :rows="rows"
          :use-chips="useChips"
          :minimum-column-width="minimumColumnWidth"
          :use-server="useServer"
        />

        <ExportBtn
          v-if="!noExport"
          self-center
          :loading="isExporting"
          @export="handleExportData(rows, columns, $event)"
        />

        <TableActionsBtn
          v-if="!noActions"
          v-model:include-deleted="tableState.includeDeleted"
          :use-include-deleted="useIncludeDeleted"
          :storage-key="storageKey"
        />

        <slot name="top-right" />
      </div>
    </slot>

    <!-- BELOW TOP -->
    <slot
      name="below-top"
      :rows="rows"
    />

    <TableTooManyRowsInfo v-if="rows.length > 1e5" />

    <TableHeader
      v-if="!hideHeader"
      ref="headerEl"
      class="lt-md:display-none"
      :columns="internalColumns"
      :rows="rows"
      :use-server="useServer"
      :use-chips="useChips"
      :minimum-column-width="minimumColumnWidth"
      :class="{ 'shadow-lg shadow-ca': isScrolled }"
      @scrolled="handleScrollLeft"
    >
      <template #default="{ col }">
        <slot :name="`header-${col.name}`" />
      </template>
    </TableHeader>

    <DynamicScroller
      v-show="hasVisibleColumn"
      ref="scrollerEl"
      :items="rows"
      :key-field="rowKey"
      class="scroller"
      :min-item-size="rowHeight"
      @resize="autoResize && throttledHandleResize()"
    >
      <template #default="{ item, index, active }">
        <DynamicScrollerItem
          :item="item"
          :active="active"
          :data-index="index"
        >
          <Component
            :is="TableRowComponent"
            :row="item"
            :columns="internalColumns"
            :class="{ 'is-clickable': rowClickable }"
            :row-height="rowHeight"
            @click="handleRowClick(item, $event)"
          >
            <template #default>
              <slot
                name="data-row"
                :columns="columns"
                :row="item"
              />
            </template>

            <template #inner>
              <slot
                name="inner"
                :columns="columns"
                :row="item"
              />
            </template>

            <template
              v-for="col in columns"
              :key="col.name"
              #[col.name]
            >
              <slot
                :name="col.name"
                :row="item"
                :refresh-data-fnc="refreshData"
              />
            </template>
          </Component>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>

    <TableCalculatingData v-if="isLoading" />

    <TableNoData
      :has-no-data="!rows.length && !isLoading"
      :is-visible="!isLoading"
    />

    <TableTotals
      v-if="!noTotals && !!getTotalsData"
      :columns="internalColumns"
      :get-totals-data="getTotalsData"
    />

    <TablePagination
      v-if="!noPagination"
      v-model:current-page="currentPage"
      v-model:current-page-size="currentPageSize"
      :is-first-page="isFirstPage"
      :is-last-page="isLastPage"
      :page-count="pageCount"
      :total-rows="totalRows"
      :prev="prev"
      :next="next"
    />
  </div>
</template>

<style lang="scss" scoped>
.table-container {
  --apply: relative flex flex-col overflow-auto max-h-full max-w-full bg-ca;

  &__top {
    --apply: flex shrink-0 gap-x-1 border-b-1 border-ca p-2 p-l-1 overflow-auto;
  }

  .is-clickable {
    --apply: cursor-pointer;
  }

  .scroller {
    --apply: max-h-full;
  }
}

.non-searchable-info {
  --apply: m-t-2 p-x-2 p-y-3 text-caption text-center border-ca border-2
    rounded-custom;
}
:global(
    .vue-recycle-scroller__item-wrapper
      .vue-recycle-scroller__item-view:nth-child(even)  .cell
  ) {
  --apply: md:bg-white;
}

:global(
    .dark
      .vue-recycle-scroller__item-wrapper
      .vue-recycle-scroller__item-view:nth-child(even) .cell
  ) {
  --apply: md:bg-darker;
}

:global(
    .vue-recycle-scroller__item-wrapper .vue-recycle-scroller__item-view.hover .cell
  ) {
  --apply: md:bg-primary/30;
}

:global(
    .dark
      .vue-recycle-scroller__item-wrapper
      .vue-recycle-scroller__item-view.hover .cell
  ) {
  --apply: md:bg-primary/50;
}
</style>
