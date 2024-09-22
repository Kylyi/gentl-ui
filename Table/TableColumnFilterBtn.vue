<script setup lang="ts">
import { type Placement } from '@floating-ui/dom'
import { config } from '~/components/config/components-config'

// Models
import { TableColumn } from '~/components/Table/models/table-column.model'

// Injections
import { tableFocusKey } from '~/components/Table/provide/table.provide'

// Constants
import { NON_VALUE_COMPARATORS } from '~/components/Table/constants/comparator-categories.const'

// Components
import MenuProxy from '~/components/MenuProxy/MenuProxy.vue'
import TableColumnSorting from '~/components/Table/TableColumnOptions/TableColumnSorting.vue'

type IProps = {
  column: TableColumn<any>
  columns: TableColumn<any>[]
  placement?: Placement
  offset?: number
  referenceTarget?: any
}

const props = defineProps<IProps>()

// Injections
const tableFocus = injectStrict(tableFocusKey)

// Layout
const isMenuShown = ref(false)
const sortingEl = ref<InstanceType<typeof TableColumnSorting>>()
const emptyValue = config.table.emptyValue
const column = toRef(props, 'column')

function handleSort(sortValue?: 'asc' | 'desc') {
  column.value.sort = sortValue || undefined

  if (!sortValue) {
    // These are the columns that have higher sortOrder than the current column
    // We need to adjust their number accordingly, so that the order is not broken
    const sortedColumnsAfter = props.columns.filter(
      col =>
        col.sortOrder !== undefined && col.sortOrder > column.value.sortOrder!
    )

    sortedColumnsAfter.forEach(col => {
      col.sortOrder! -= 1
    })
    column.value.sortOrder = undefined
  } else if (!column.value.sortOrder) {
    column.value.sortOrder =
      props.columns.filter(col => col.sortOrder !== undefined).length + 1
  }
}

function handleMenuShow(ev: PointerEvent) {
  const isShiftKey = ev.shiftKey

  if (!isShiftKey) {
    isMenuShown.value = true
  } else {
    let sort: TableColumn['sort']

    switch (column.value.sort) {
      case 'asc':
        sort = 'desc'

        break

      case 'desc':
        sort = undefined

        break

      default:
        sort = 'asc'
    }

    handleSort(sort)
  }
}

// We remove any undefined filters on menu hide
function handleMenuBeforeHide() {
  column.value.filters = column.value.filters.filter(filter => {
    const isNonValueComparator = NON_VALUE_COMPARATORS.includes(
      filter.comparator
    )

    const isUndefinedValue = filter.value === undefined
    const isEmptyArray = Array.isArray(filter.value) && !filter.value.length

    return (
      (!isUndefinedValue && !isEmptyArray) ||
      isNonValueComparator ||
      filter.nonInteractive
    )
  })

  tableFocus()
}
</script>

<template>
  <Btn
    class="filter-btn"
    size="sm"
    :class="{ 'is-filtered': column.filterDbQuery, 'is-sorted': column.sort }"
    @click="handleMenuShow"
  >
    <template #icon>
      <div class="w-7 h-7 relative">
        <div
          class="icon top-.25 left-.25 i-ic:round-filter-alt"
          :class="{ 'color-white': column.filterDbQuery }"
        />
        <div
          class="icon bottom-.25 right-.25 i-basil:sort-outline"
          :class="{ 'color-white': column.sort }"
          z-1
          data-cy="sort-outline"
        />

        <div
          v-if="column.sortOrder"
          class="icon-badge"
        >
          {{ column.sortOrder }}
        </div>
      </div>
    </template>

    <Tooltip
      v-if="!isMenuShown && (column.filterDbQuery || column.sort)"
      :offset="8"
    >
      <div
        flex="~ gap-2 col"
        w="70"
        p="y-2"
      >
        <!-- Column label -->
        <div flex="~ col">
          <span
            text="caption"
            font="bold"
          >
            {{ column.label }}
          </span>

          <Separator />
        </div>

        <!-- Sorting -->
        <div
          v-if="column.sort"
          flex="~ gap-1 items-center"
          p="x-2 y-1"
          border="ca dashed 1"
          rounded="custom"
        >
          <div
            :class="[
              column.sort === 'asc'
                ? 'i-ph:sort-descending-bold'
                : 'i-ph:sort-ascending-bold',
            ]"
          />
          <span text="xs">
            {{ $t(`sorting.${column.sort}`) }}
          </span>
        </div>

        <!-- Filters -->
        <template v-if="column.filterDbQuery">
          <div
            v-for="filter in column.filters"
            :key="filter.id"
            flex="~ col gap-1"
            p="x-2 y-1"
            border="ca dashed 1"
            rounded="custom"
          >
            <!-- Comparator -->
            <span text="caption xs">
              {{ $t(`comparator.${filter.comparator.replaceAll('.', '|')}`) }}
            </span>

            <!-- Filter value -->
            <ValueFormatter
              :value="filter.value"
              :data-type="column.dataType"
              :empty-value="emptyValue"
              :format="column.format"
              :empty-value-string="$t('general.empty')"
              text="sm"
            />

            <span
              v-if="filter.nonInteractive"
              text="xs caption right"
              border="t-1 ca"
              general.emptyng="6"
            >
              {{ $t('table.nonInteractiveFilter') }}
            </span>
          </div>
        </template>
      </div>
    </Tooltip>

    <MenuProxy
      v-model="isMenuShown"
      manual
      w="90"
      position="top"
      :placement="placement"
      :offset="offset"
      :no-arrow="false"
      :reference-target="referenceTarget"
      h="!auto"
      max-h="!2/3"
      :ui="{ contentClass: 'p-y-2' }"
      @before-hide="handleMenuBeforeHide"
    >
      <TableColumnSorting
        v-if="column.sortable"
        ref="sortingEl"
        :column="column"
        :columns="columns"
      />

      <TableColumnFiltering
        v-if="column.filterable"
        :column="column"
      />

      <Banner
        v-else-if="column.filters?.length"
        :label="$t('table.nonInteractiveFilter')"
        icon-center
        type="info"
        outlined
        m="x-2 b-2"
      />
    </MenuProxy>
  </Btn>
</template>

<style lang="scss" scoped>
.icon {
  @applyw-4 h-4 absolute;

  &-badge {
    @applyflex flex-center absolute -bottom-.5 -right-.5 w-3 h-3 bg-white
      color-black text-9px rounded-full leading-none z-1;
  }
}

.filter-btn {
  @applyoverflow-hidden;

  &.is-filtered::before {
    @applyabsolute content-empty rotate-45 bg-primary -top-24.5px -left-24.5px
      w-1 h-3/2 w-3/2;
  }

  &.is-sorted::after {
    @applyabsolute content-empty rotate-45 bg-secondary -bottom-24.5px -right-24.5px
      w-1 h-3/2 w-3/2;
  }
}
</style>
