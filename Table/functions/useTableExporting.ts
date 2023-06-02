import { utils, writeFile, writeFileXLSX } from 'xlsx'

export function useTableExporting() {
  const isExporting = ref(false)

  function handleExportData(
    rows: any[],
    columns: any[],
    exportFormat: 'xlsx' | 'csv' = 'xlsx'
  ) {
    isExporting.value = true

    const data = rows.map(row => {
      const rowData: Record<string, any> = {}

      columns.forEach(col => {
        const val = col.format
          ? col.format(row)
          : col.field
          ? get(row, col.field)
          : get(row, col.name)

        const label = col.label || col.name

        rowData[label] = val
      })

      return rowData
    })

    if (exportFormat === 'xlsx') {
      const wb = utils.book_new()
      const ws = utils.json_to_sheet(data)
      utils.book_append_sheet(wb, ws, 'Generated')

      writeFileXLSX(wb, 'data.xlsx')
    } else {
      const wb = utils.book_new()
      const ws = utils.json_to_sheet(data)
      utils.book_append_sheet(wb, ws, 'Generated')

      writeFile(wb, 'data.csv')
    }

    isExporting.value = false
  }

  return {
    isExporting,
    handleExportData,
  }
}
