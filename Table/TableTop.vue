<script setup lang="ts">
import { config } from '~/config'

// Types
import type { ITableProps } from '~/components/Table/types/table-props.type'
import type { ITableLayout } from '~/components/Table/types/table-layout.type'

// Injections
import {
  tableColumnsKey,
  tableColumnsRecreateKey,
  tableLayoutKey,
  tableLayoutsKey,
  tableNonHelpersColumnsKey,
  tableRecreateQueryBuilderKey,
  tableResizeKey,
  tableSelectionKey,
} from '~/components/Table/provide/table.provide'

// Components
import QueryBuilderInline from '~/components/QueryBuilder/QueryBuilderInline.vue'

const props = defineProps<Pick<ITableProps, 'queryBuilder' | 'selectable'>>()

// Constants
const MIN_VISIBLE_QUERY_BUILDER_ROWS = 2
const MAX_VISIBLE_QUERY_BUILDER_ROWS = 3
const QUERY_BUILDER_INLINE_PADDING = 16

// Utils
const route = useRoute()

// Injections
const selection = injectStrict(tableSelectionKey)
const columns = injectStrict(tableColumnsKey)
const nonHelperColumns = injectStrict(tableNonHelpersColumnsKey)
const layouts = injectStrict(tableLayoutsKey)
const layout = injectStrict(tableLayoutKey)
const columnsRecreate = injectStrict(tableColumnsRecreateKey)
const queryBuilderRecreate = injectStrict(tableRecreateQueryBuilderKey)
const tableResize = injectStrict(tableResizeKey)

// Layout
const queryBuilder = useVModel(props, 'queryBuilder')
const queryBuilderInlineEl = ref<InstanceType<typeof QueryBuilderInline>>()

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

function handleLayoutSelect(layout: ITableLayout) {
  const routeQueryWithoutTableParams = omit(route.query, [
    'qb',
    'filter',
    'order',
    'select',
    'search',
  ])

  const queryParams = new URLSearchParams(layout.schema)
  const qb = queryParams.get('qb')
  const filter = queryParams.get('filter')
  const order = queryParams.get('order')
  const select = queryParams.get('select')
  const search = queryParams.get('search')

  navigateTo(
    {
      query: {
        ...routeQueryWithoutTableParams,
        ...(qb && { qb }),
        ...(filter && { filter }),
        ...(order && { order: `(${order})` }),
        ...(select && { select }),
        ...(search && { search }),
        // ...(dbQuery.tableQuery.includeDeleted && {
        //   includeDeleted: dbQuery.tableQuery.includeDeleted,
        // }),
      },
    },
    { replace: true }
  )

  // Refresh
  setTimeout(() => {
    queryBuilderRecreate()
    columnsRecreate()
    tableResize()
  }, 0)
}
</script>

<template>
  <div class="table-top">
    <!-- Toolbar -->
    <div class="table-top__toolbar">
      <!-- Query builder button -->
      <div grow>
        <TableQueryBuilderBtn
          v-if="queryBuilder"
          v-model:query-builder="queryBuilder"
        />
      </div>

      <!-- Exports -->
      <ExportBtn />
    </div>

    <Separator m="t-1" />

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
          min-h="20"
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
        preset="CLOSE"
        no-upeprcase
        shrink-0
        size="xs"
        :label="$t('table.removeQueryBuilderFilters')"
        no-uppercase
        w="20"
        no-truncate
        stacked
        self="center"
        @click="queryBuilderInlineEl?.clearFilter()"
      />
    </div>

    <Separator
      v-if="queryBuilder"
      m="b-1"
    />

    <!-- Subbar -->
    <div class="table-top__subbar">
      <!-- Selection & Sorting -->
      <div
        grow
        flex="~ gap-2"
        items-center
      >
        <!-- Selection info -->
        <div
          v-if="selectable"
          flex="~ gap-1"
          items-center
          text="caption"
        >
          <div fluent:select-all-on-20-regular />
          <span m="l-1">{{ $t('general.selected') }}</span>
          <span font="bold">{{ selectionCount }}</span>
          <span>{{ $t('general.item', selectionCount) }}</span>
        </div>

        <!-- Selection actions -->
        <Btn
          v-if="selectable"
          size="sm"
          no-uppercase
          :label="$t('table.groupEdit')"
          icon="line-md:chevron-small-right rotate-90 order-2"
        />

        <!-- Sorting -->
        <div
          v-if="tableSorting"
          flex="~ gap-1"
          items-center
        >
          <span
            text="caption"
            font="bold"
          >
            {{ $t('table.sortBy') }}:
          </span>
          <span
            text="caption"
            v-html="tableSorting"
          />
        </div>
      </div>

      <!-- Layout -->
      <div
        flex="~ gap-2"
        items-center
        p="b-1"
      >
        <span
          text="caption"
          font="bold"
        >
          {{ $t('table.layoutState') }}:
        </span>

        <!-- Columns btn -->
        <TableColumnsBtn v-model:columns="columns" />

        <template v-if="config.table.useServerState">
          <!-- Layout selector -->
          <Selector
            :model-value="layout"
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
          </Selector>

          <!-- Layout settings -->
          <TableLayoutSettingsBtn />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.table-top {
  --apply: flex flex-col;

  &__toolbar {
    --apply: flex gap-2 items-center p-x-2 p-y-1;
  }

  &__qb {
    --apply: flex gap-1 items-start p-x-2 p-y-1;
  }

  &__subbar {
    --apply: flex gap-2 items-center justify-between p-x-2 p-y-1;
  }
}
</style>
