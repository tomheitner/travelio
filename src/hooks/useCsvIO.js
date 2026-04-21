import Papa from 'papaparse'
import { rowFromCsvRecord, rowToCsvRecord, CSV_COLUMNS } from '../utils/csvSchema'

export function useCsvIO() {
  function importCsv(file) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const rows = result.data.map(rowFromCsvRecord)
          resolve(rows)
        },
        error: reject,
      })
    })
  }

  function exportCsv(rows, filename = 'destinations.csv') {
    const records = rows.map(rowToCsvRecord)
    const csv = Papa.unparse(records, { columns: CSV_COLUMNS })
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return { importCsv, exportCsv }
}
