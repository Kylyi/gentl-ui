<script setup lang="ts">
import { config } from '~/components/config/components-config'

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
const label = ref<string>()

async function fetchAndSetTotals() {
  const payloadKey = props.getTotalsData?.payloadKey || config.table.payloadKey

  const res = await handleRequest(
    () =>
      props.getTotalsData?.fnc(dbQuery.value, props.column, tableRows.value),
    { noResolve: true }
  )

  total.value = get(res, payloadKey)

  if (props.getTotalsData?.labelKey) {
    label.value = get(res, props.getTotalsData.labelKey)
  }
}

if (props.getTotalsData?.immediate) {
  await fetchAndSetTotals()

  watch(tableRows, () => fetchAndSetTotals(), { immediate: true })
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
    <!-- Label -->
    <span
      v-if="label"
      text="caption"
    >
      {{ label }}:
    </span>

    <!-- Value -->
    <ValueFormatter
      :value="total"
      data-type="number"
      font="!bold"
    />
  </div>
</template>

<style lang="scss" scoped>
.thead {
  @applyflex shrink-0 relative
    bg-white dark:bg-darker min-h-$headerHeight;
}

.th {
  @applyrelative flex shrink-0 items-center text-xs tracking-wide
    border-ca sm:w-$colWidth border-l-1 p-x-2 border-b-1 gap-x-2;

  &:last-of-type {
    @applyborder-r-1;
  }

  &::before {
    @applyabsolute content-empty top-0 left-0 h-2px w-full
      bg-darker dark:bg-white;
  }
}
</style>
