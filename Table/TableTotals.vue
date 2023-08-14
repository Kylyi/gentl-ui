¨
<script setup lang="ts">
// Models
import { TableColumn } from '~/components/Table/models/table-column.model'

// Components
import HorizontalScroller from '~/components/Scroller/HorizontalScroller.vue'
import { ITableProps } from '~/components/Table/types/table-props.type'

type IProps = {
  columns: TableColumn<any>[]
  getTotalsData: ITableProps['getTotalsData']
}

const props = defineProps<IProps>()
defineEmits<{
  (e: 'scrolled', left: number): void
}>()

// Utils
const { handleGqlErrors } = useGqlErrors()

// Layout
const totalsEl = ref<InstanceType<typeof HorizontalScroller>>()
const calculateAllRows = ref(false)

function handleGetTotals() {
  if (!props.getTotalsData) {
    return
  }

  try {
    // const { totals } = await props.getTotalsData.fnc(getTableQuery())
    // console.log('Log ~ handleTotals ~ totals:', totals)
  } catch (error) {
    handleGqlErrors(error, true)
  }
}
</script>

<template>
  <HorizontalScroller
    ref="totalsEl"
    class="thead"
    content-class="relative"
    border="y-1 ca"
    @scrolled="$emit('scrolled', $event)"
  >
    <!-- COLUMNS -->
    <template
      v-for="(col, idx) in columns"
      :key="idx"
    >
      <div
        class="th"
        :class="[`col-${col.name}`, { invisible: col.dataType !== 'number' }]"
        :style="{ ...col.headerStyle, [`--colWidth`]: col.adjustedWidthPx }"
      >
        <span p="x-2 y-1">
          <Btn
            size="sm"
            :label="$t('table.calculateTotals')"
          >
            <Menu
              :title="$t('summaryEnum.choose')"
              content-class="flex flex-col flex-gap-1"
            >
              <Btn
                :label="$t('summaryEnum.sum')"
                size="sm"
                @click="handleGetTotals"
              />
              <Btn
                :label="$t('summaryEnum.avg')"
                size="sm"
              />
              <Btn
                :label="$t('summaryEnum.count')"
                size="sm"
              />
              <Btn
                :label="$t('summaryEnum.min')"
                size="sm"
              />
              <Btn
                :label="$t('summaryEnum.max')"
                size="sm"
              />

              <Separator spaced />

              <Toggle
                v-model="calculateAllRows"
                :label="$t('table.calculateTotalsAll')"
              />
            </Menu>
          </Btn>
        </span>
      </div>
    </template>
  </HorizontalScroller>
</template>

<style lang="scss" scoped>
.thead {
  --apply: flex shrink-0 overflow-hidden relative
    min-h-$headerHeight;
}

.th {
  --apply: flex shrink-0 items-center font-semibold text-xs uppercase
    border-ca sm:w-$colWidth overflow-hidden;

  &:last-of-type {
    --apply: border-r-1;
  }
}
</style>
