<script setup lang="ts">
// Injections
import {
  tableExportKey,
  tableIsExportingKey,
  tableNonHelpersColumnsKey,
} from '~/components/Table/provide/table.provide'

type IProps = {
  loading?: boolean
}

defineProps<IProps>()

// Injections
const tableColumns = injectStrict(tableNonHelpersColumnsKey)
const handleTableExport = injectStrict(tableExportKey)
const isExporting = injectStrict(tableIsExportingKey)

// Layout
async function handleExport(exportFormat: 'xlsx' | 'csv') {
  await handleTableExport({
    exportFormat,
    columns: toValue(tableColumns),
  })
}
</script>

<template>
  <Btn
    icon="material-symbols:download"
    color="ca"
    no-uppercase
    size="sm"
    p="!l-1"
    outlined
    :loading="isExporting"
  >
    <div
      flex="~ gap-2"
      p="r-2"
      font="normal"
      text="sm"
      items-center
    >
      {{ $t('table.export') }}

      <div class="line-md:chevron-small-right rotate-90" />
    </div>

    <Menu
      hide-header
      dense
      p="1"
      content-class="overflow-hidden"
    >
      <!-- XLSX -->
      <Btn
        :label="$t('export.excel')"
        icon="bi:filetype-xlsx"
        :loading="loading || isExporting"
        align="left"
        no-uppercase
        @click="handleExport('xlsx')"
      />

      <!-- CSV -->
      <Btn
        :label="$t('export.csv')"
        icon="bi:filetype-csv"
        :loading="loading || isExporting"
        align="left"
        no-uppercase
        @click="handleExport('csv')"
      />
    </Menu>
  </Btn>
</template>
