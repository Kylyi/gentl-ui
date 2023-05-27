export function useTableExporting() {
  const isExporting = ref(false)

  async function handleExportData(
    exportFormat: 'xlsx' | 'csv' = 'xlsx',
    useServer = true
  ) {
    // TODO: Implement exporting data
  }

  return {
    isExporting,
    handleExportData,
  }
}
