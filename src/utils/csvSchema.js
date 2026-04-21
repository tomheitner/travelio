// Canonical CSV column names and row factory
export const CSV_COLUMNS = ['Region', 'City/Destination', 'Title', 'Description', 'Time']

export function makeRow(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    region: '',
    city: '',
    title: '',
    description: '',
    time: '',
    lat: null,
    lng: null,
    ...overrides,
  }
}

export function rowFromCsvRecord(record) {
  return makeRow({
    region: record['Region'] ?? '',
    city: record['City/Destination'] ?? '',
    title: record['Title'] ?? '',
    description: record['Description'] ?? '',
    time: record['Time'] ?? '',
  })
}

export function rowToCsvRecord(row) {
  return {
    Region: row.region,
    'City/Destination': row.city,
    Title: row.title,
    Description: row.description,
    Time: row.time,
  }
}
