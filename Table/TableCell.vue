<script setup lang="ts">
// Models
import { TableColumn } from '~/components/Table/models/table-column.model'

// Injections
import {
  tableInlineEditKey,
  tableIsSelectedRowKey,
  tableSelectRowKey,
} from '~/components/Table/provide/table.provide'

type IProps = {
  column: TableColumn
  editable?: boolean
  row: any
}

const props = defineProps<IProps>()

// Injections
const selectRow = injectStrict(tableSelectRowKey, () => {})
const isSelectedRow = injectStrict(tableIsSelectedRowKey, () => false)
const {
  isEditing,
  editValue,
  editRow,
  handleEditRow,
  handleCancelEditRow,
  handleSaveRow,
} = injectStrict(tableInlineEditKey)

// Layout
const inputEl = ref<any>()
const col = toRef(props, 'column')

const isEditingField = computedEager(() => {
  return (
    isEditing.value &&
    editRow.value?.row === props.row &&
    (editRow.value?.column === col.value || !editRow.value?.column)
  )
})

function handleEditCell() {
  if (!props.editable) {
    return
  }

  if (isEditingField.value) {
    handleCancelEditRow()

    return
  }

  handleEditRow(props.row, props.column)
}

// Keyboard shortcuts
function handleKeyDown(e: KeyboardEvent) {
  const isControlKey = e.ctrlKey || e.metaKey

  switch (e.key) {
    // case 'Escape':
    //   handleCancelEditRow()
    //   break

    // case 'Enter':
    //   setTimeout(() => {
    //     handleSaveRow()

    //     if (isControlKey) {
    //       return
    //     }

    //     handleKeyDown({
    //       ...e,
    //       key: 'ArrowDown',
    //       ctrlKey: true,
    //     } as KeyboardEvent)
    //   })

    //   break

    // case 'ArrowDown':
    //   if (!isControlKey) {
    //     return
    //   }

    //   e.preventDefault?.()
    //   e.stopPropagation?.()

    //   resume()
    //   siblingCell.value = focusSiblingCell('next', e)

    //   break

    // case 'ArrowUp':
    //   if (!isControlKey) {
    //     return
    //   }

    //   e.preventDefault?.()
    //   e.stopPropagation?.()

    //   resume()
    //   siblingCell.value = focusSiblingCell('previous', e)

    //   break

    default:
      break
  }
}

function selectSelf(self: any) {
  nextTick(() => {
    self.component?.exposed?.select?.() ?? self.component?.exposed?.focus?.()
  })
}
</script>

<template>
  <div
    class="cell"
    :class="[
      `col-${col.name}`,
      col.classes,
      {
        'has-data': !col.isHelperCol,
        'is-frozen': col.frozen,
        'is-semi-frozen': col.semiFrozen,
        'is-editing': isEditingField,
      },
    ]"
    :style="{ ...col.style, width: col.adjustedWidthPx }"
    @click="handleEditCell"
  >
    <!-- Selection -->
    <div
      v-if="col.field === '_selectable'"
      flex="~ center"
      w="full"
      @click.stop.prevent
    >
      <Checkbox
        :model-value="isSelectedRow(row)"
        @update:model-value="selectRow(row)"
      />
    </div>

    <!-- Edit mode -->
    <div
      v-else-if="isEditingField"
      flex="~ gap-1"
    >
      <Component
        :is="col._editComponent.component"
        ref="inputEl"
        :model-value="get(editValue, col.field)"
        v-bind="col._editComponent.props"
        grow
        no-border
        size="sm"
        input-class="color-black dark:color-white !font-rem-13"
        :input-props="{ onKeydown: handleKeyDown }"
        @update:model-value="set(editValue, col.field, $event)"
        @vue:mounted="selectSelf"
      />

      <!-- <Btn
        size="sm"
        preset="SAVE"
        tabindex="-1"
        @click.stop.prevent="handleSaveRow"
      /> -->
    </div>

    <!-- Regular field -->
    <ValueFormatter
      v-else
      :value="get(row, col.field)"
      :data-type="col.dataType"
      :row="row"
      :format="col.format"
      :empty-value="{}"
    >
      <template #default="{ val }">
        <slot :value="val">
          <!-- Boolean -->
          <Checkbox
            v-if="col.dataType === 'boolean'"
            :model-value="get(row, col.field)"
            :editable="false"
            :label="val"
            m="x-2"
          />

          <!-- Link -->
          <NuxtLink
            v-else-if="col.link?.(row)"
            class="link"
            :to="col.link(row) || ''"
            p="x-2"
          >
            {{ val }}
          </NuxtLink>

          <span
            v-else
            class="p-x-2 truncate"
          >
            {{ val }}
          </span>
        </slot>
      </template>
    </ValueFormatter>
  </div>
</template>

<style scoped lang="scss">
.cell {
  --apply: relative;

  &.is-editing::after {
    --apply: absolute content-empty inset-0 pointer-events-none border-primary
      border-2;
  }
}
</style>
