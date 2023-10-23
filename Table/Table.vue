<script setup lang="ts">
// Virtual scroller
import {
  DynamicScroller,
  DynamicScrollerItem,
  RecycleScroller,
  // @ts-expect-error - no types
} from 'vue-virtual-scroller'
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

const props = withDefaults(defineProps<ITableProps>(), {
  breakpoint: 'md',
  columns: () => [],
  filters: () => [],
  groupExpandWidth: 36,
  groups: () => [],
  minimumColumnWidth: 80,
  mobileRowHeight: 32,
  rowHeight: 40,
  rowKey: 'id',
  separator: 'cell',
  sizeField: 'size',
  totalRows: 0,
  useServer: true,
  useChips: config.table.useChips,
  useUrl: true,
  infiniteScroll: config.table.infiniteScroll,
  useDynamicRowHeight: config.table.useDynamicRowHeight,
})

defineEmits<{
  (e: 'update:rows', rows: any[]): void
  (e: 'update:totalRows', count: number): void
  (e: 'update:queryBuilder', rows: IQueryBuilderRow[]): void
  (e: 'row-click', payload: { row: any; el: Element }): void
  (e: 'update:loading', loading: boolean): void
}>()

defineSlots<{
  [key: string]: any
  rowInside: { columns: any[]; row: any; index: number }
  dataRow: { columns: any[]; row: any; index: number }
  inner: { columns: any[]; row: any; index: number }
  top: {}
  topLeftPrepend: {}
  topLeftAppend: {}
  topRightPrepend: {}
  topRightAppend: {}
  subbarRight: {}
  topBulkActions: { selection: any[] }
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
})

// Utils
const { getTableTopProps } = useTableTopUtils()

// Layout
const tableTopProps = getTableTopProps(props)
const queryBuilderOriginal = useVModel(props, 'queryBuilder')
const { cloned: queryBuilder } = useCloned(queryBuilderOriginal, {
  clone: klona,
})

const [DefineTemplate, ReuseTemplate] = createReusableTemplate<{
  item: any
  index: number
  active?: boolean
}>()

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
  tableRowHeight,
  rowKey,
  TableRowComponent,
  handleScrollLeft,
  handleRowClick,
  throttledHandleResize,
  recreateColumns,
  handleResize,
} = useTableLayout(props, columns, layout)

const {
  isLoading,
  rows,
  refreshData,
  search,

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

useTableExporting(rows)
useTableSelection(props)

onMounted(() => {
  scrollerEl.value.$el.focus()
})
</script>

<template>
  <div
    ref="tableEl"
    class="table-container"
  >
    <DefineTemplate v-slot="{ item, index }">
      <Component
        :is="TableRowComponent"
        :row="item"
        :columns="internalColumns"
        :to="to"
        :class="{ 'is-clickable': rowClickable, 'odd': index % 2 !== 0 }"
        :row-height="rowHeight"
        :index="index"
        @click="handleRowClick(item, $event)"
      >
        <template #row-inside>
          <slot
            name="row-inside"
            :columns="columns"
            :row="item"
            :index="index"
          />
        </template>

        <template #default>
          <slot
            name="data-row"
            :columns="columns"
            :row="item"
            :index="index"
          />
        </template>

        <template #inner>
          <slot
            name="inner"
            :columns="columns"
            :row="item"
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
            :row="item"
            :index="index"
            :refresh-data-fnc="refreshData"
          />
        </template>
      </Component>
    </DefineTemplate>

    <!-- Top -->
    <slot
      v-if="!noTop"
      name="top"
    >
      <TableTop
        v-model:query-builder="queryBuilder"
        v-model:search="search"
        v-bind="tableTopProps"
        @update:columns-width="handleResize()"
      >
        <template #left-prepend>
          <slot name="top-left-prepend" />
        </template>

        <template #left-append>
          <slot name="top-left-append" />
        </template>

        <template #right-prepend>
          <slot name="top-right-prepend" />
        </template>

        <template #right-append>
          <slot name="top-right-append" />
        </template>

        <template #subbar-right>
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

    <Component
      :is="useDynamicRowHeight ? DynamicScroller : RecycleScroller"
      v-show="hasVisibleColumn"
      ref="scrollerEl"
      :items="rows"
      :key-field="rowKey"
      class="scroller"
      tabindex="0"
      :item-size="useDynamicRowHeight ? undefined : tableRowHeight"
      :min-item-size="rowHeight"
      :emit-update="infiniteScroll"
      :buffer="1000"
      @resize="autoResize && throttledHandleResize()"
      @update="handleInfiniteScroll"
    >
      <template #default="{ item, index, active }">
        <DynamicScrollerItem
          v-if="useDynamicRowHeight"
          :key="index"
          :item="item"
          :active="active"
        >
          <ReuseTemplate
            :item="item"
            :index="index"
          />
        </DynamicScrollerItem>

        <ReuseTemplate
          v-else
          :item="item"
          :index="index"
        />
      </template>
    </Component>

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
    --apply: max-h-full bg-$Table-container-bg outline-none;
  }
}

.non-searchable-info {
  --apply: m-t-2 p-x-2 p-y-3 text-caption text-center border-ca border-2
    rounded-custom;
}

:global(
    .vue-recycle-scroller__item-wrapper
      .vue-recycle-scroller__item-view.hover
      .cell
  ) {
  --apply: '!md:bg-blue/10';
}

:global(
    .vue-recycle-scroller__item-wrapper
      .vue-recycle-scroller__item-view.hover
      .cell.is-semi-frozen
  ) {
  --apply: '!bg-blue-100 color-blue-800';
  --apply: 'dark:(!bg-blue-900 color-blue-200)';
}
</style>
