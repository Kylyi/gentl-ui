<script setup lang="ts">
import { DragHandle, SlickItem, SlickList } from 'vue-slicksort'

// Types
import type { IBtnProps } from '~/components/Button/types/btn-props.type'

// Models
import { TableColumn } from '~/components/Table/models/table-column.model'

// Injections
import {
  tableResizeKey,
  tableStorageKey,
} from '~/components/Table/provide/table.provide'

// Functions
import { useBtnUtils } from '~/components/Button/functions/useBtnUtils'

// Store
import { useTableStore } from '~/components/Table/table.store'

type IProps = {
  columns: TableColumn[]
} & IBtnProps

const props = defineProps<IProps>()
const emits = defineEmits<{
  (e: 'update:columns', columns: TableColumn[]): void
}>()

// Injections
const storageKey = injectStrict(tableStorageKey)
const handleTableResize = injectStrict(tableResizeKey)

// Store
const { setTableState } = useTableStore()

// Utils
const { getBtnProps } = useBtnUtils()

// Layout
const columns = useVModel(props, 'columns', emits)

const nonHelperCols = computed({
  get() {
    return columns.value.filter(col => !col.isHelperCol)
  },
  set(val: TableColumn[]) {
    const helpersCols = columns.value.filter(col => col.isHelperCol)

    columns.value = [...helpersCols, ...val]
    setTableState(storageKey.value, { columns: columns.value })
  },
})

const btnProps = computed(() => getBtnProps(props))

// Sorting events
function handleSortStart() {
  document.documentElement.classList.add('select-none')
}

function handleSortEnd() {
  document.documentElement.classList.remove('select-none')
}

// Column visibility
async function handleColumnVisibilityChange(
  val: boolean | undefined,
  col: TableColumn
) {
  col.hidden = val

  await nextTick()

  handleTableResize()
  setTableState(storageKey.value, { columns: columns.value })
}
</script>

<template>
  <Btn
    icon="tabler:columns-2"
    :label="$t('columns')"
    color="ca"
    self-center
    no-uppercase
    size="sm"
    label-class="hidden sm:block"
    v-bind="btnProps"
  >
    <Menu
      placement="bottom-end"
      :no-arrow="false"
      hide-header
      w="80"
    >
      <SlickList
        v-model:list="nonHelperCols"
        axis="y"
        use-drag-handle
        @sort-start="handleSortStart"
        @sort-end="handleSortEnd"
      >
        <SlickItem
          v-for="(col, idx) in nonHelperCols"
          :key="col.field"
          :index="idx"
          :disabled="!col.reorderable || col.isHelperCol"
          z="$zMenu"
        >
          <Item
            cursor="!default"
            flex="gap-x-0"
            :class="{ 'color-ca': !col.reorderable }"
          >
            <DragHandle
              v-if="col.reorderable && !col.isHelperCol"
              class="handle icon-park-outline:drag"
            />

            <span
              grow
              p="y-1.5 x-2"
              truncate
            >
              {{ col._label }}
            </span>

            <Checkbox
              :model-value="col.hidden"
              :check-value="false"
              :uncheck-value="true"
              @update:model-value="handleColumnVisibilityChange($event, col)"
            />
          </Item>
        </SlickItem>
      </SlickList>
    </Menu>
  </Btn>
</template>

<style lang="scss" scoped>
.handle {
  --apply: color-ca cursor-move;
}
</style>
