<script setup lang="ts">
import { TableColumn } from '~/components/Table/models/table-column.model'
import { IGroupRow } from '~/libs/App/data/functions/useGrouping'

type IProps = {
  row: IGroupRow
  columns: TableColumn[]
  groupExpandWidth: number
  collapsed: Record<string, boolean>
  rowHeight: number
}

const props = defineProps<IProps>()
const emits = defineEmits<{
  (e: 'update:collapsed', payload: Record<string, boolean>): void
}>()

const collapsed = useVModel(props, 'collapsed', emits)

const cols = computed(() => {
  const firstGroupColIdx = props.columns.findIndex(col =>
    col.name.startsWith('_group')
  )

  const firstDataColIdx =
    props.columns.slice(1).findIndex(col => !col.name.startsWith('_group')) + 1

  const groupColsWidth = props.columns
    .slice(firstGroupColIdx)
    .reduce((agg, col) => (agg += col.adjustedWidth), 0)

  return [
    ...props.columns
      .slice(0, firstDataColIdx)
      .filter(col => !col.name.startsWith('_group')),

    new TableColumn({
      ...props.columns[firstDataColIdx],
      name: `_group_${props.row.name}`,
      width: `${groupColsWidth}px`,
      adjustedWidth: groupColsWidth,
    }),
  ]
})

const collapsedBtnInfo = computed(() => {
  return {
    icon: collapsed.value[props.row.id]
      ? 'majesticons:chevron-right transition-transform'
      : 'majesticons:chevron-right rotate-90 transition-transform',
    style: `${(props.row.groupIdx / 2) * props.groupExpandWidth}px`,
  }
})

function handleCollapse() {
  const index = props.row.id

  collapsed.value = {
    ...collapsed.value,
    [index]: !collapsed.value[index],
  }
}
</script>

<template>
  <div
    class="tr tr-group"
    :style="{ height: `${rowHeight}px` }"
  >
    <div
      v-for="(col, idx) in cols"
      :key="idx"
      class="cell"
      :class="[`col-${col.name}`, { 'data-col': !col.isHelperCol }]"
      :style="{ width: col.adjustedWidthPx }"
    >
      <slot :name="col.name">
        <template v-if="col.name.startsWith('_group')">
          <div
            flex="~ center"
            :style="{ width: `${groupExpandWidth}px` }"
          >
            <Btn
              size="xs"
              p="1"
              :icon="collapsedBtnInfo.icon"
              :style="collapsedBtnInfo.style"
              @click="handleCollapse"
            />
          </div>

          <slot
            name="group-label"
            :row="row"
            :col-name="col.name"
          >
            <span
              truncate
              text="caption"
              font="bold"
            >
              {{ row.label }}
            </span>
          </slot>
        </template>
      </slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cell {
  --apply: flex shrink-0 h-full items-center border-ca border-b-1 flex-gap-x-2;
}

.tr {
  --apply: flex;

  &-group {
    --apply: dark:bg-darker/50 bg-light/50 lt-md:overflow-hidden z-1;
    backdrop-filter: blur(5px);
  }
}
</style>
