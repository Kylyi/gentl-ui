<script setup lang="ts">
import { DragHandle, SlickItem, SlickList } from 'vue-slicksort'
import { config } from '~/config'

// Types
import type { IBtnProps } from '~/components/Button/types/btn-props.type'
import type { IGroupRow } from '~/libs/App/data/functions/useGrouping'
import type { IItem } from '~/libs/App/types/item.type'

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

// Components
import Dialog from '~/components/Dialog/Dialog.vue'

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
const dialogEl = ref<InstanceType<typeof Dialog>>()
const columns = useVModel(props, 'columns', emits)

const { cloned: clonedColumns } = useCloned(columns, {
  clone: cols => cols.map((col: TableColumn) => new TableColumn(col)),
})

const nonHelperCols = computed({
  get() {
    return clonedColumns.value.filter(
      col => !col.isHelperCol && !!col.selectable
    )
  },
  set(columns: TableColumn[]) {
    const helpersCols = clonedColumns.value.filter(col => col.isHelperCol)

    clonedColumns.value = [...helpersCols, ...columns]
    setTableState(storageKey.value, { columns: clonedColumns.value })
  },
})

const filteredCols = computed({
  get() {
    return nonHelperCols.value.filter(col => !col.hidden)
  },
  set(columns: TableColumn[]) {
    nonHelperCols.value = [
      ...columns,
      ...clonedColumns.value.filter(col => col.hidden),
    ]
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
function handleColumnVisibilityChange(
  val: boolean | undefined,
  col: TableColumn
) {
  col.hidden = val
}

function handleColumnVisibilityForAll(
  val: boolean,
  colsFiltered: Array<IGroupRow | IItem>
) {
  colsFiltered.forEach(col => {
    if (!('isGroup' in col)) {
      col.ref.hidden = val ? !!col.ref.nonInteractive : true
    }
  })
}

function handleMoveUp(col: TableColumn) {
  const idx = filteredCols.value.findIndex(c => c.field === col.field)

  if (idx > 0) {
    const splicedCol = filteredCols.value.splice(idx, 1)?.[0]

    if (splicedCol) {
      filteredCols.value = [splicedCol, ...filteredCols.value]
    }
  }
}

// Apply changes
async function handleApplyChanges() {
  columns.value = clonedColumns.value.map(col => new TableColumn(col))
  await nextTick()

  handleTableResize()
  setTableState(storageKey.value, { columns: clonedColumns.value })
  dialogEl.value?.hide()
}
</script>

<template>
  <Btn
    icon="tabler:columns-2"
    color="ca"
    self-center
    no-uppercase
    size="sm"
    p="!x-2"
    label-class="hidden sm:block"
    v-bind="btnProps"
    data-cy="columns-button"
  >
    <span text="xs">
      {{ $t('columns') }}
    </span>

    <span font="rem-10">
      ({{ filteredCols.length }}/{{ nonHelperCols.length }})
    </span>

    <Dialog
      ref="dialogEl"
      w="screen-md"
      dense
      min-h="1/2"
      max-h="6/10"
      h="auto"
      header-class="p-l-3 p-r-1 h-auto"
    >
      <template #title>
        <div
          flex="~ col gap-1"
          grow
          p="y-2"
        >
          <h6
            p="r-2"
            text="h6"
          >
            {{ $t('table.customizeColumns') }}
          </h6>
        </div>

        <DocumentationBtn
          v-if="config.table.hasHelpButtons"
          path="columnSelection"
        />
      </template>

      <Form
        grid="~ cols-2"
        bg="dark:darker white"
        p="2"
        :label="$t('table.applyColumns')"
        :submit-disabled="!filteredCols.length"
        :submit-confirmation="false"
        @submit="handleApplyChanges"
      >
        <!-- Left side -->
        <div
          flex="~ col gap-2"
          overflow="auto"
          p="r-2"
          border="r-1 ca"
        >
          <div flex="~ col">
            <div flex="~ gap-2 items-center">
              <h6 font="bold">{{ $t('table.availableMetrics') }}</h6>
              <span text="caption">({{ nonHelperCols.length }})</span>
            </div>
            <span text="caption">{{ $t('table.selectVisibleColumns') }}</span>
          </div>

          <List
            :items="nonHelperCols"
            row-tag="label"
            :fuse-options="{ shouldSort: true }"
          >
            <template #above="{ itemsFiltered }">
              <div
                flex="~ gap-1 items-center"
                justify-between
                p="y-1 x-2"
              >
                <span text="caption xs">
                  {{ itemsFiltered.length }}
                  {{ $t('columns').toLowerCase() }}
                </span>

                <div flex="~ gap-1">
                  <Btn
                    size="xs"
                    :label="
                      itemsFiltered.length === nonHelperCols.length
                        ? $t('general.selectAll')
                        : $t('general.selectFiltered')
                    "
                    data-cy="choose-all-columns"
                    @click="handleColumnVisibilityForAll(true, itemsFiltered)"
                  />
                  <Btn
                    size="xs"
                    color="negative"
                    :label="
                      itemsFiltered.length === nonHelperCols.length
                        ? $t('general.clearAll')
                        : $t('general.clearFiltered')
                    "
                    data-cy="choose-none-columns"
                    @click="handleColumnVisibilityForAll(false, itemsFiltered)"
                  />
                </div>
              </div>
            </template>

            <template #option="{ item, highlighted }">
              <Checkbox
                :model-value="item.hidden"
                :check-value="false"
                :uncheck-value="true"
                :editable="!item.nonInteractive"
                @update:model-value="handleColumnVisibilityChange($event, item)"
              />

              <div
                text="sm"
                v-html="highlighted"
              />
            </template>
          </List>
        </div>

        <!-- Right side -->
        <div
          flex="~ col gap-2"
          overflow="auto"
          p="l-2"
        >
          <div flex="~ col">
            <div flex="~ gap-2 items-center">
              <h6 font="bold">{{ $t('table.columnsSelected') }}</h6>
              <span text="caption">({{ filteredCols.length }})</span>
            </div>

            <div flex="~ items-center gap-1">
              <span text="caption">{{ $t('general.dragToReorder') }}</span>
            </div>
          </div>

          <SlickList
            v-model:list="filteredCols"
            axis="y"
            use-drag-handle
            @sort-start="handleSortStart"
            @sort-end="handleSortEnd"
          >
            <SlickItem
              v-for="(col, idx) in filteredCols"
              :key="col.field"
              :index="idx"
              :disabled="!col.reorderable || col.isHelperCol"
              z="$zMenu"
              data-cy="dragable-row"
            >
              <Item
                cursor="!default"
                flex="gap-x-0"
                :class="{ 'color-ca': !col.reorderable }"
              >
                <DragHandle
                  v-if="col.reorderable && !col.isHelperCol"
                  class="handle icon-park-outline:drag"
                  data-cy="dragable-item"
                />

                <span
                  grow
                  p="y-1.5 x-2"
                  text="sm"
                  truncate
                >
                  {{ col._label }}
                </span>

                <Btn
                  v-if="idx > 0"
                  icon="mingcute:arrow-to-up-line"
                  m="r-1"
                  size="xs"
                  color="ca"
                  data-cy="arrow-pin-to-top"
                  @click="handleMoveUp(col)"
                />

                <Btn
                  size="xs"
                  preset="TRASH"
                  m="r-1"
                  data-cy="trash-icon"
                  @click="handleColumnVisibilityChange(true, col)"
                />
              </Item>
            </SlickItem>
          </SlickList>
        </div>
      </Form>
    </Dialog>
  </Btn>
</template>

<style lang="scss" scoped>
.handle {
  --apply: color-ca cursor-move;
}
</style>
