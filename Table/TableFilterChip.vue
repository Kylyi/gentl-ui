<script setup lang="ts">
// Models
import { TableColumn } from '~/components/Table/models/table-column.model'
import { FilterItem } from '~/libs/App/data/models/filter-item'

type IProps = {
  columns: TableColumn<any>[]
  filter: FilterItem<any>
}

const props = defineProps<IProps>()

// LAYOUT
const filter = toRef(props, 'filter')

const column = computed(() => {
  return props.columns.find(column => column.field === filter.value.field)!
})

function removeChip() {
  column.value.filters = column.value.filters.filter(
    filterItem => filterItem.comparator !== filter.value.comparator
  )
}

function getLabel(_: any, value: any) {
  if (Array.isArray(value)) {
    return value.map(val => val._label).join(', ')
  }
}
</script>

<template>
  <div class="table-filter-chip">
    <!-- Column label -->
    <span class="filter-field">
      {{ column.label }}
    </span>

    <!-- Comparator -->
    <span
      text="caption"
      whitespace="nowrap"
      lowercase
    >
      {{ $t(`comparator.${filter.comparator}`) }}
    </span>

    <!-- Compare value -->
    <ValueFormatter
      :data-type="filter.dataType === 'datetime' ? 'date' : filter.dataType"
      :value="filter.value"
      :format="
        column.format ?? Array.isArray(filter.value) ? getLabel : undefined
      "
    >
      <template #default="{ val }">
        <span class="filter-value">
          {{ val }}
        </span>
      </template>
    </ValueFormatter>

    <!-- REMOVE BTN -->
    <Btn
      size="xs"
      preset="CLOSE"
      m="l-1"
      @click.stop.prevent="removeChip"
    />

    <Menu hide-header>
      <TableColumnFilteringItem
        :filter="filter"
        :column="column"
        no-delete
      />
    </Menu>
  </div>
</template>

<style lang="scss" scoped>
.table-filter-chip {
  --apply: flex relative flex-gap-x-1 p-l-3 p-r-1 p-y-1 items-center cursor-pointer
    rounded-custom border-custom border-ca dark:bg-darker bg-white
  shadow-ca hover:shadow-consistent-sm;

  &::before {
    --apply: content-empty absolute inset-block-0 left-0 w-1 bg-primary
      rounded-l-custom;
  }
}

.filter-field,
.filter-value {
  --apply: whitespace-nowrap text-caption font-bold color-black dark:color-white;
}
</style>
