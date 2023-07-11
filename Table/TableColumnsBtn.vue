<script setup lang="ts">
import { DragHandle, SlickItem, SlickList } from 'vue-slicksort'

// TYPES
import { IBtnProps } from '~/components/Button/types/btn-props.type'

// MODELS
import { TableColumn } from '~/components/Table/models/table-column.model'

// COMPOSITION FUNCTIONS
import { useBtnUtils } from '~/components/Button/functions/useBtnUtils'
import { useTableUtils } from '~/components/Table/functions/useTableUtils'

// INJECTION KEYS
import { updateTableStateKey } from '~/components/Table/provide/table.provide'

type IProps = {
  columns: TableColumn[]
  useServer?: boolean
  useChips?: boolean
  rows: any[]
} & IBtnProps

const props = defineProps<IProps>()
const emits = defineEmits<{
  (e: 'update:columns', columns: TableColumn[]): void
}>()

// INJECTIONS
const updateTableState = injectStrict(updateTableStateKey)

// UTILS
const { getBtnProps } = useBtnUtils()
const { extractColumnsStateData } = useTableUtils()

// LAYOUT
const columns = useVModel(props, 'columns', emits)

const nonHelperCols = computed({
  get() {
    return columns.value.filter(col => !col.isHelperCol)
  },
  set(val: TableColumn[]) {
    const helpersCols = columns.value.filter(col => col.isHelperCol)

    columns.value = [...helpersCols, ...val]
  },
})

const btnProps = computed(() => getBtnProps(props))

function handleRecalculateColumns() {
  nextTick(() =>
    updateTableState({ columns: extractColumnsStateData(columns.value) })
  )
}
</script>

<template>
  <Btn
    icon="fluent:table-freeze-column-24-filled"
    color="ca"
    v-bind="btnProps"
  >
    <Menu
      placement="bottom-end"
      :title="$t('columns')"
    >
      <SlickList
        v-model:list="nonHelperCols"
        axis="y"
        use-drag-handle
        @update:list="handleRecalculateColumns"
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
            >
              {{ col._label }}
            </span>

            <TableColumnFilterBtn
              v-if="!col.hideFilters && !col.isHelperCol"
              :column="col"
              :rows="rows"
              :columns="columns"
              :use-server="useServer"
              :use-chips="useChips"
            />

            <Checkbox
              v-model="col.hidden"
              :check-value="false"
              :uncheck-value="true"
              @update:model-value="handleRecalculateColumns"
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
