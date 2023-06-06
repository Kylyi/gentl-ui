<script setup lang="ts">
// TYPES
// import { DistinctData } from '~/components/Table/types/distinct-data.type'

// MODELS
import { TableColumn } from '~/components/Table/models/table-column.model'

// INJECTION KEYS
import { refreshTableDataKey } from '~/components/Table/provide/table.provide'

type IProps = {
  rows: any[]
  column: TableColumn<any>
  useChips?: boolean
  useServer?: boolean
}

const props = defineProps<IProps>()

// INJECTIONS
const refreshData = injectStrict(refreshTableDataKey)

// LAYOUT
const column = toRef(props, 'column')
// const isLoading = ref(false)
// const items = ref<DistinctData[]>(await getDistinctData())

// const keysByFieldValue = computed<Record<string, Array<string | number>>>(
//   () => {
//     const col = props.column

//     return props.rows.reduce((agg, row) => {
//       const val = get(row, col.field)

//       if (agg[val] === undefined) {
//         agg[val] = []
//       }

//       agg[val].push(row.id)

//       return agg
//     }, {} as Record<string, Array<string | number>>)
//   }
// )

// function getFormattedValue(row: DistinctData) {
//   return (
//     row._label ??
//     column.value.filterFormat?.(row) ??
//     column.value.format?.(row) ??
//     get(row, column.value.field)
//   )
// }

// function handleAddFilterItem(item: DistinctData) {
//   const { _value } = item

//   column.value.compareValue = [...(column.value.compareValue ?? []), _value]

//   // While not using server side filtering
//   if (!props.useServer) {
//     const keys = keysByFieldValue.value[_value]
//     const filteredKeys = (keys ?? []).reduce((agg, key) => {
//       agg[key] = true

//       return agg
//     }, {} as Record<string, boolean>)

//     Object.assign(column.value.filteredKeys, filteredKeys)
//   }
// }

// function handleRemoveFilterItem(item: DistinctData) {
//   const { _value } = item

//   column.value.compareValue = (column.value.compareValue ?? []).filter(
//     (value: any) => value !== _value
//   )

//   // While not using server side filtering
//   if (!props.useServer) {
//     const keys = keysByFieldValue.value[_value]

//     keys.forEach(key => {
//       delete column.value.filteredKeys[key]
//     })
//   }
// }

function handleClearFilter() {
  column.value.filters = []
  refreshData()
}

// DATA
// async function getDistinctData(): Promise<DistinctData[]> {
//   const col = props.column

//   // When we have a custom `getDistinctData` function, use it
//   if (col.getDistinctData) {
//     isLoading.value = true

//     try {
//       const distinctData = await col.getDistinctData(props.column)

//       // When using custom `getDistinctData` function, map the column field to the values
//       distinctData.forEach(row => set(row, col.field, row._value))

//       isLoading.value = false

//       return distinctData
//     } catch (error) {
//       // handleGqlErrors(error, true)
//     }

//     isLoading.value = false
//   }

//   // When using client-side filtering
//   const rowFormattedValues = props.rows.map<DistinctData>((row, id) => {
//     return {
//       id,
//       _value: get(row, col.field),
//       _label:
//         col.filterFormat?.(row) ?? col.format?.(row) ?? get(row, col.field),
//     }
//   })

//   return uniqBy(rowFormattedValues, '_label')
// }
</script>

<template>
  <div class="filter-container">
    <!-- TITLE -->
    <div class="flex flex-gap-x-2 p-x-3 h-11 items-center">
      <span class="filter-container-title">
        {{ $t('filtering') }}
      </span>

      <Btn
        :label="$t('clearFilter')"
        color="red"
        size="xs"
        @click="handleClearFilter"
      />
    </div>

    <TableColumnFilteringSetup
      v-if="useChips"
      :column="column"
    />

    <!-- LIST -->
    <!-- <List
      v-else
      :items="items"
      :loading="isLoading"
      :selected="column.compareValue"
      :item-label="item => getFormattedValue(item)"
      item-key="_value"
      :fuse-options="{ threshold: 0.1 }"
      @added="handleAddFilterItem"
      @removed="handleRemoveFilterItem"
    /> -->
  </div>
</template>

<style lang="scss" scoped>
.filter-container {
  --apply: flex flex-col grow overflow-auto;

  &-title {
    --apply: font-bold text-caption grow;
  }
}
</style>
