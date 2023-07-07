import { utils, writeFile, writeFileXLSX } from 'xlsx'

export function useTableExporting() {
  // UTILS
  const { formatDate } = useDateUtils()

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
        let val = get(row, col.field)

        val = col.format?.(row, val) ?? val

        const label = col.label || col.name

        rowData[label] = val
      })

      return rowData
    })

    const fileName = `data-${formatDate(Date.now(), 'long')}`

    if (exportFormat === 'xlsx') {
      const wb = utils.book_new()
      const ws = utils.json_to_sheet(data)
      utils.book_append_sheet(wb, ws, 'Generated')

      writeFileXLSX(wb, `${fileName}.xlsx`)
    } else {
      const wb = utils.book_new()
      const ws = utils.json_to_sheet(data)
      utils.book_append_sheet(wb, ws, 'Generated')

      writeFile(wb, `${fileName}.csv`)
    }

    isExporting.value = false
  }

  return {
    isExporting,
    handleExportData,
  }
}
