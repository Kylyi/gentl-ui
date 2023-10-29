<script setup lang="ts">
import { config } from '~/config'

// Types
import { type ITableProps } from '~/components/Table/types/table-props.type'

// Injections
import {
  tableQueryKey,
  tableRowsKey,
} from '~/components/Table/provide/table.provide'

// Models
import { TableColumn } from '~/components/Table/models/table-column.model'

type IProps = {
  column: TableColumn<any>
  getTotalsData: ITableProps['getTotalsData']
}

const props = defineProps<IProps>()

// Utils
const { handleRequest } = useRequest()

// Injections
const dbQuery = injectStrict(tableQueryKey)
const tableRows = injectStrict(tableRowsKey)

// Layout
const total = ref<number>()

async function fetchAndSetTotals() {
  const payloadKey = props.getTotalsData?.payloadKey || config.table.payloadKey

  total.value = await handleRequest(
    () => props.getTotalsData?.fnc(dbQuery.value, props.column),
    { payloadKey }
  )
}

if (props.getTotalsData?.immediate) {
  await fetchAndSetTotals()

  watch(tableRows, () => {
    fetchAndSetTotals()
  })
}
</script>

<template>
  <div
    class="th"
    :class="[
      column.totalsClasses,
      `column-${column.name}`,
      {
        'has-data': !column.isHelperCol,
        'is-frozen': column.frozen,
        'is-semi-frozen': column.semiFrozen,
      },
    ]"
    :style="{ ...column.totalsStyle, [`--colWidth`]: column.adjustedWidthPx }"
  >
    <ValueFormatter
      :value="total"
      data-type="number"
      font="!bold"
    />
  </div>
</template>

<style lang="scss" scoped>
.thead {
  --apply: flex shrink-0 relative
    bg-white dark:bg-darker min-h-$headerHeight;
}

.th {
  --apply: relative flex shrink-0 items-center text-xs tracking-wide
    border-ca sm:w-$colWidth border-l-1 p-x-2 border-b-1;

  &:last-of-type {
    --apply: border-r-1;
  }

  &::before {
    --apply: absolute content-empty top-0 left-0 h-2px w-full
      bg-darker dark:bg-white;
  }
}
</style>
