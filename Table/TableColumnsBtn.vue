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
import {
  recalculateTableColumnsKey,
  updateTableStateKey,
} from '~/components/Table/provide/table.provide'

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
const recalculateColumns = injectStrict(recalculateTableColumnsKey)
const updateTableState = injectStrict(updateTableStateKey)

// UTILS
const { getBtnProps } = useBtnUtils()
const { extractColumnsStateData } = useTableUtils()

// LAYOUT
const columns = useVModel(props, 'columns', emits)

const btnProps = computed(() => getBtnProps(props))

function handleRecalculateColumns() {
  recalculateColumns(true)

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
        v-model:list="columns"
        axis="y"
        use-drag-handle
        @update:list="handleRecalculateColumns"
      >
        <SlickItem
          v-for="(col, idx) in columns"
          :key="col.field"
          :index="idx"
          :disabled="!col.reorderable"
          z="$zMenu"
        >
          <Item
            cursor="!default"
            flex="gap-x-0"
            :class="{ 'color-ca': !col.reorderable }"
          >
            <DragHandle class="handle icon-park-outline:drag" />

            <span
              grow
              p="y-1.5 x-2"
            >
              {{ col.label }}
            </span>

            <TableColumnFilterBtn
              v-if="!col.hideFilters"
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
