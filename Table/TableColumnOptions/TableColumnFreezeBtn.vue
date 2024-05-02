<script setup lang="ts">
// Types
import type { TableColumn } from '~/components/Table/models/table-column.model'

// Injections
import { tableStorageKey } from '~/components/Table/provide/table.provide'

// Store
import { useTableStore } from '~/components/Table/table.store'

type IProps = {
  column: TableColumn
  columns: TableColumn[]
}

const props = defineProps<IProps>()

// Store
const { setTableState } = useTableStore()

// Injections
const storageKey = injectStrict(tableStorageKey)

// Layout
const column = toRef(props, 'column')
const columns = toRef(props, 'columns')

const btnProps = computed(() => {
  return column.value.frozen
    ? { class: 'color-primary', icon: 'i-basil:lock-solid' }
    : { class: 'color-ca', icon: 'i-basil:unlock-outline' }
})

function handleFreezeColumn() {
  column.value.freeze(columns.value)
  setTableState(storageKey.value, { columns: columns.value })
}
</script>

<template>
  <Btn
    v-bind="btnProps"
    size="sm"
    class="column-lock"
    @click="handleFreezeColumn"
  />
</template>
