<script setup lang="ts">
// Injections
import {
  tableExportKey,
  tableIsExportingKey,
  tableNonHelperColumnsKey,
} from '~/components/Table/provide/table.provide'

type IProps = {
  loading?: boolean
  formatName?: () => string
}

const props = defineProps<IProps>()

// Injections
const tableColumns = injectStrict(tableNonHelperColumnsKey)
const handleTableExport = injectStrict(tableExportKey)
const isExporting = injectStrict(tableIsExportingKey)

// Layout
async function handleExport(exportFormat: 'xlsx' | 'csv') {
  await handleTableExport({
    exportFormat,
    columns: toValue(tableColumns),
    formatName: props.formatName,
  })
}
</script>

<template>
  <Btn
    icon="i-material-symbols:download"
    color="ca"
    no-uppercase
    size="sm"
    p="!l-1"
    outlined
    :loading="isExporting"
  >
    <div class="export-btn__label">
      {{ $t('table.export', 1) }}

      <div class="i-flowbite:chevron-right-outline rotate-90" />
    </div>

    <Menu>
      <!-- XLSX -->
      <Btn
        :label="$t('export.excel')"
        icon="i-bi:filetype-xlsx"
        :loading="loading || isExporting"
        align="left"
        no-uppercase
        @click="handleExport('xlsx')"
      />

      <!-- CSV -->
      <Btn
        :label="$t('export.csv')"
        icon="i-bi:filetype-csv"
        :loading="loading || isExporting"
        align="left"
        no-uppercase
        @click="handleExport('csv')"
      />
    </Menu>
  </Btn>
</template>

<style scoped lang="scss">
.export-btn {
  &__label {
    @apply flex flex-gap-2 p-r-2 font-normal text-sm items-center;
  }
}
</style>
