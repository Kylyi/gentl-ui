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
import TableExportBtn from '~/components/Table/TableExportBtn.vue'

const props = defineProps<
  Pick<
    ITableProps,
    | 'tableTopFunctionality'
    | 'queryBuilder'
    | 'selectable'
    | 'nonSavableSettings'
    | 'minimumColumnWidth'
    | 'exportProps'
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
const { isMobile } = useMobile()

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

const ExportBtn = computed(() => {
  if ('exportComponent' in config.table && config.table.exportComponent) {
    return config.table.exportComponent
  }

  return TableExportBtn
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
    <!-- Action bar -->
    <div class="table-top__actionbar">
      <!-- Query builder button -->
      <div
        flex="~ gap-1 items-center"
        grow
      >
        <slot name="left-prepend" />

        <slot name="left-append" />
      </div>

      <slot name="right-prepend" />

      <slot name="right-append" />
    </div>

    <!-- Toolbar -->
    <template v-if="!tableTopFunctionality?.noToolbar">
      <Separator />

      <!-- Query builder -->
      <div
        v-if="queryBuilder"
        class="table-top__qb"
      >
        <TableQueryBuilderBtn
          v-if="queryBuilder"
          v-model:query-builder="queryBuilder"
          self-start
          m="t-1"
        />

        <VerticalScroller
          grow
          :style="queryBuilderHeight"
          display="md:flex! none!"
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
              editable
            />
          </div>
        </VerticalScroller>
        <div flex-grow />

        <!-- Layout selector -->
        <TableLayoutSelector
          v-model:query-builder="queryBuilder"
          m="t-1 auto"
          display="md:none"
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
          display="none! md:flex!"
          bg="dark:darker"
          color="ca hover:negative"
          border="2 transparent hover:negative"
          data-cy="remove-filters"
        >
          <Menu
            :placement="isMobile ? 'bottom' : 'left'"
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

        <slot name="export">
          <Component
            :is="ExportBtn"
            v-bind="exportProps"
            shrink-0
            self-start
            m="t-1"
          />
        </slot>
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
    <div
      v-if="!tableTopFunctionality?.noSubbar"
      class="table-top__subbar"
    >
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
          v-if="tableSorting && !tableTopFunctionality?.noSort"
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

      <!-- More actions btn (mobile) -->
      <Btn
        v-if="isMobile"
        :label="$t('general.moreActions')"
        icon="ri:more-2-fill color-white"
        label-class="color-white lowercase first-letter:capitalize"
        bg-blue-500
        w-full
      >
        <Menu hide-header>
          <span
            v-if="!tableTopFunctionality?.noLayout"
            text="caption xs"
            font="bold"
            display="lt-md:none"
          >
            {{ $t('table.layoutState') }}:
          </span>

          <!-- Columns btn -->
          <TableColumnsBtn
            v-if="!tableTopFunctionality?.noColumnSelection"
            v-model:columns="columns"
          />

          <!-- Autofit btn -->
          <Btn
            v-if="!tableTopFunctionality?.noAutoFit"
            size="sm"
            no-uppercase
            icon="material-symbols:fit-width"
            color="ca"
            :label="$t('table.fitColumns')"
            @click="handleFitColumns"
          />

          <!-- Remove filters -->
          <Btn
            no-upeprcase
            shrink-0
            size="sm"
            :label="$t('table.removeQueryBuilderFilters')"
            no-uppercase
            no-truncate
            stacked
            p="!y-0"
            m="auto"
            w="full"
            h="8"
            bg="dark:darker"
            color="ca hover:negative"
            border="2 transparent hover:negative"
            data-cy="remove-filters"
          >
            <Menu
              :placement="isMobile ? 'bottom' : 'left'"
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

          <!-- Layout settings -->
          <TableLayoutSettingsBtn
            v-if="
              config.table.useServerState && !tableTopFunctionality?.noLayout
            "
            :non-saveable-settings="nonSavableSettings"
          />

          <slot name="subbar-right" />
        </Menu>
      </Btn>
      <!-- Layout -->
      <div
        v-else
        flex="~ gap-2 md:row col"
        items="md:center start"
        grow
        justify="end"
      >
        <div
          flex
          items-center
        >
          <span
            v-if="!tableTopFunctionality?.noLayout"
            text="caption xs"
            font="bold"
            display="lt-md:none"
          >
            {{ $t('table.layoutState') }}:
          </span>

          <!-- Columns btn -->
          <TableColumnsBtn
            v-if="!tableTopFunctionality?.noColumnSelection"
            v-model:columns="columns"
          />
          <!-- Autofit btn -->
          <Btn
            v-if="!tableTopFunctionality?.noAutoFit"
            size="sm"
            no-uppercase
            icon="material-symbols:fit-width"
            color="ca"
            :label="$t('table.fitColumns')"
            @click="handleFitColumns"
          />
        </div>
        <div flex="~ items-center">
          <template
            v-if="
              config.table.useServerState && !tableTopFunctionality?.noLayout
            "
          >
            <!-- Layout selector -->
            <TableLayoutSelector v-model:query-builder="queryBuilder" />

            <!-- Layout settings -->
            <TableLayoutSettingsBtn
              :non-saveable-settings="nonSavableSettings"
            />
          </template>

          <slot name="subbar-right" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.table-top {
  --apply: flex flex-col;

  &__actionbar {
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
