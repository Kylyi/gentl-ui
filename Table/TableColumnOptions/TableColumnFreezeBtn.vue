<script setup lang="ts">
// Types
import type { TableColumn } from 'components/Table/models/table-column.model'

type IProps = {
  column: TableColumn
  columns: TableColumn[]
}

const props = defineProps<IProps>()

// Layout
const column = toRef(props, 'column')
const columns = toRef(props, 'columns')

const btnProps = computed(() => {
  return column.value.frozen
    ? { class: 'color-primary', icon: 'basil:lock-solid' }
    : { class: 'color-ca', icon: 'basil:unlock-outline' }
})

function handleFreezeColumn() {
  const isFrozen = props.column.frozen

  // We unfreeze any other frozen column
  columns.value.forEach(col => {
    col.frozen = false
    col.semiFrozen = false
    col.headerStyle = {
      ...column.value.headerStyle,
      left: 'unset',
      position: 'unset',
      backgroundColor: 'unset',
      zIndex: 'unset',
    }
    col.style = {
      ...column.value.style,
      left: 'unset',
      position: 'unset',
      backgroundColor: 'unset',
      zIndex: 'unset',
    }
  })

  if (!isFrozen) {
    // And we freeze the current column
    const colIdx = columns.value.findIndex(
      col => col.field === column.value.field
    )

    let left = 0
    columns.value.slice(0, colIdx + 1).forEach(col => {
      col.semiFrozen = true
      col.headerStyle = {
        ...col.headerStyle,
        left: `${left}px`,
        position: 'sticky',
        backgroundColor: 'var(--color-theme)',
        zIndex: 1,
      }
      col.style = {
        ...col.style,
        left: `${left}px`,
        position: 'sticky',
        backgroundColor: 'var(--color-theme)',
        zIndex: 1,
      }

      left += col.adjustedWidth
    })

    column.value.frozen = true
  }
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
