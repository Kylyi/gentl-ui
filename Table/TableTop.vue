<script setup lang="ts">
import { config } from '~/config'

// Types
import type { ITableProps } from '~/components/Table/types/table-props.type'

// Injections
import {
  tableColumnsKey,
  tableNonHelpersColumnsKey,
  tableRefreshKey,
  tableRowsKey,
  tableSelectionKey,
  tableSlotsKey,
  tableStorageKey,
} from '~/components/Table/provide/table.provide'

// Store
import { useTableStore } from '~/components/Table/table.store'

// Components
import QueryBuilderInline from '~/components/QueryBuilder/QueryBuilderInline.vue'

const props = defineProps<
  Pick<
    ITableProps,
    | 'tableTop'
    | 'queryBuilder'
    | 'selectable'
    | 'nonSaveableSettings'
    | 'minimumColumnWidth'
    | 'subBarOnly'
    | 'noLayoutOptions'
  > & {
    search: string
  }
>()
const emits = defineEmits<{
  (e: 'update:columnsWidth'): void
}>()

// Constants
const MIN_VISIBLE_QUERY_BUILDER_ROWS = 1
const MAX_VISIBLE_QUERY_BUILDER_ROWS = 3
const QUERY_BUILDER_INLINE_PADDING = 8

// Store
const { setTableState } = useTableStore()

// Injections
const selection = injectStrict(tableSelectionKey)
const columns = injectStrict(tableColumnsKey)
const nonHelperColumns = injectStrict(tableNonHelpersColumnsKey)
const storageKey = injectStrict(tableStorageKey)
const tableRows = injectStrict(tableRowsKey)
const tableRefresh = injectStrict(tableRefreshKey)
const tableSlots = injectStrict(tableSlotsKey)

// Layout
const queryBuilder = useVModel(props, 'queryBuilder')
const queryBuilderInlineEl = ref<InstanceType<typeof QueryBuilderInline>>()
const search = useVModel(props, 'search')

const queryBuilderHeight = computed(() => {
  return {
    minHeight: `${
      MIN_VISIBLE_QUERY_BUILDER_ROWS * 32 + QUERY_BUILDER_INLINE_PADDING
    }px`,
    maxHeight: `${
      MAX_VISIBLE_QUERY_BUILDER_ROWS * 32 + QUERY_BUILDER_INLINE_PADDING
    }px`,
  }
})

const selectionCount = computed(() => {
  if (!selection.value) {
    return 0
  }

  return Array.isArray(selection.value)
    ? selection.value.length
    : Object.keys(selection.value).length
})

/**
 * Creates readable sorting string
 */
const tableSorting = computed(() => {
  return columns.value
    .filter(col => col.sort)
    .map(col => {
      return {
        label: col.label,
        field: col.field,
        direction: col.sort,
        sortOrder: col.sortOrder,
      }
    })
    .sort((a, b) => {
      return (a!.sortOrder || 0) - (b!.sortOrder || 0)
    })
    .map(
      col =>
        `${col.label} (<span>${
          col.direction === 'asc' ? '&#8593;' : '&#8595;'
        }</span>)`
    )
    .join(', ')
})

function handleFilterClear(filters?: 'queryBuilder' | 'columns') {
  if (filters === 'columns') {
    columns.value.forEach(col => {
      col.clearFilters()
    })

    tableRefresh()
  } else if (filters === 'queryBuilder') {
    queryBuilderInlineEl.value?.clearFilter()
  } else {
    columns.value.forEach(col => {
      col.clearFilters()
    })
    queryBuilderInlineEl.value?.clearFilter()
  }
}

function handleClearSorting() {
  columns.value.forEach(col => {
    col.sort = undefined
    col.sortOrder = undefined
  })
}

function handleFitColumns() {
  const fittableColumns = columns.value.filter(
    col => col.resizable && !col.hidden && !col.isHelperCol
  )

  // We unfreeze any frozen column
  const frozenColumn = fittableColumns.find(col => col.frozen)
  frozenColumn?.freeze(fittableColumns)

  setTimeout(async () => {
    // We autofit the columns
    for await (const col of fittableColumns) {
      const slotRenderFnc = tableSlots[col.field]
      await col.autoFit(
        tableRows.value,
        slotRenderFnc,
        props.minimumColumnWidth
      )
    }

    // We freeze the column again
    frozenColumn?.freeze(fittableColumns)

    setTableState(storageKey.value, { columns: columns.value })
    emits('update:columnsWidth')
  }, 0)
}
</script>

<template>
  <div class="table-top">
    <template v-if="!subBarOnly">
      <!-- Toolbar -->
      <div class="table-top__toolbar">
        <!-- Query builder button -->
        <div
          flex="~ gap-1 items-center"
          grow
        >
          <slot name="left-prepend" />

          <TableQueryBuilderBtn
            v-if="queryBuilder"
            v-model:query-builder="queryBuilder"
          />

          <slot name="left-append" />
        </div>

        <slot name="right-prepend" />

        <!-- Exports -->
        <ExportBtn />

        <slot name="right-append" />
      </div>

      <Separator />

      <!-- Query builder -->
      <div
        v-if="queryBuilder"
        class="table-top__qb"
      >
        <VerticalScroller
          grow
          :style="queryBuilderHeight"
        >
          <div
            p="1"
            bg="white dark:darker"
            rounded="custom"
            min-h="10"
          >
            <QueryBuilderInline
              ref="queryBuilderInlineEl"
              v-model:items="queryBuilder"
              :columns="nonHelperColumns"
            />
          </div>
        </VerticalScroller>

        <Separator
          vertical
          h="full"
        />

        <!-- Remove filters -->
        <Btn
          no-upeprcase
          shrink-0
          size="xs"
          :label="$t('table.removeQueryBuilderFilters')"
          no-uppercase
          w="20"
          no-truncate
          stacked
          h="full"
          p="!y-0"
          bg="dark:darker"
          color="ca hover:negative"
          border="2 transparent hover:negative"
          data-cy="remove-filters"
        >
          <Menu
            placement="left"
            hide-header
            :no-arrow="false"
            content-class="gap-1"
          >
            <Btn
              :label="$t('table.removeQueryBuilderFilter')"
              size="sm"
              no-uppercase
              data-cy="remove-advanced-filter"
              @click="handleFilterClear('queryBuilder')"
            />
            <Btn
              :label="$t('table.removeColumnsFilter')"
              size="sm"
              no-uppercase
              data-cy="remove-columns-filter"
              @click="handleFilterClear('columns')"
            />

            <Separator />

            <Btn
              :label="$t('table.removeAllFilters')"
              size="sm"
              no-uppercase
              color="negative"
              data-cy="remove-all-filters"
              @click="handleFilterClear"
            />
          </Menu>
        </Btn>
      </div>

      <!-- Chips - filter columns or search -->
      <TableSearch
        v-else
        v-model:search="search"
        :columns="columns"
        class="table-top__qb"
      />

      <Separator m="b-1" />
    </template>

    <!-- Subbar -->
    <div class="table-top__subbar">
      <!-- Selection & Sorting -->
      <div
        grow
        flex="~ gap-2"
        items-center
        display="lt-md:none"
      >
        <!-- Selection info -->
        <div
          v-if="selectable"
          flex="~ gap-1"
          items-center
          text="caption xs"
        >
          <div fluent:select-all-on-20-regular />
          <span m="l-1">{{ $t('general.selected') }}</span>
          <span font="bold">{{ selectionCount }}</span>
        </div>

        <!-- Selection actions -->
        <Btn
          v-if="selectable && $slots['bulk-actions']"
          size="sm"
          no-uppercase
          :label="$t('table.groupEdit')"
          icon="line-md:chevron-small-right rotate-90 order-2"
        >
          <MenuProxy
            hide-header
            dense
            p="1"
            :no-arrow="false"
          >
            <slot
              name="bulk-actions"
              :selection="selection"
            />
          </MenuProxy>
        </Btn>

        <!-- Sorting -->
        <div
          v-if="tableSorting"
          flex="~ gap-1"
          items-center
        >
          <span
            text="caption xs"
            font="bold"
          >
            {{ $t('table.sortBy') }}:
          </span>
          <span
            text="caption"
            data-cy="sort-active-fields"
            v-html="tableSorting"
          />

          <Btn
            preset="TRASH"
            size="xs"
            :label="$t('sorting.clear')"
            data-cy="clear-sorting"
            @click="handleClearSorting"
          />
        </div>
      </div>

      <!-- Layout -->
      <div
        flex="~ gap-2"
        items-center
        grow
        justify="end"
      >
        <span
          text="caption xs"
          font="bold"
          display="lt-md:none"
        >
          {{ $t('table.layoutState') }}:
        </span>

        <!-- Columns btn -->
        <TableColumnsBtn
          v-if="!tableTop?.noColumnSelection"
          v-model:columns="columns"
        />

        <!-- Autofit btn -->
        <Btn
          v-if="!tableTop?.noAutoFit"
          size="sm"
          no-uppercase
          icon="material-symbols:fit-width"
          color="ca"
          :label="$t('table.fitColumns')"
          @click="handleFitColumns"
        />

        <template
          v-if="
            config.table.useServerState &&
            !noLayoutOptions &&
            !tableTop?.noLayout
          "
        >
          <!-- Layout selector -->
          <TableLayoutSelector v-model:query-builder="queryBuilder" />

          <!-- Layout settings -->
          <TableLayoutSettingsBtn
            :non-saveable-settings="nonSaveableSettings"
          />
        </template>
      </div>

      <slot name="subbar-right" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.table-top {
  --apply: flex flex-col border-b-1 border-ca;

  &__toolbar {
    --apply: flex flex-wrap gap-2 items-center p-x-2 p-y-1;
  }

  &__qb {
    --apply: flex gap-1 items-start p-x-2 p-y-1;
  }

  &__subbar {
    --apply: flex gap-2 items-center justify-between p-x-2 p-y-1;
  }
}
</style>
