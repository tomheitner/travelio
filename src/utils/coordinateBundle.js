// Pre-resolved coordinates for all known destinations in the sample CSV.
// Keyed by the exact "City/Destination" column value.
// Used as the primary (zero-latency, zero-network) geocode source.
// Nominatim is only used as a fallback for cities not in this table.
export const COORDINATE_BUNDLE = {
  'Venice':        { lat: 45.4408,  lng: 12.3155 },
  'Burano Island': { lat: 45.4853,  lng: 12.4189 },
  'Florence':      { lat: 43.7696,  lng: 11.2558 },
  'Genoa':         { lat: 44.4056,  lng: 8.9463  },
  'Turin':         { lat: 45.0703,  lng: 7.6869  },
  'Milan':         { lat: 45.4654,  lng: 9.1859  },
  'Bellagio':      { lat: 45.9841,  lng: 9.2574  },
  'Varenna':       { lat: 46.0093,  lng: 9.2831  },
  'Lenno':         { lat: 45.9566,  lng: 9.1892  },
  'Lake Como':     { lat: 46.0160,  lng: 9.2555  },
  'Rome':          { lat: 41.9028,  lng: 12.4964 },
  'Vatican City':  { lat: 41.9029,  lng: 12.4534 },
  'Verona':        { lat: 45.4384,  lng: 10.9916 },
  'Sirmione':      { lat: 45.4960,  lng: 10.6069 },
  'Bologna':       { lat: 44.4949,  lng: 11.3426 },
  'Modena':        { lat: 44.6471,  lng: 10.9252 },
  'Siena':         { lat: 43.3188,  lng: 11.3308 },
  'San Gimignano': { lat: 43.4677,  lng: 11.0427 },
  'Lucca':         { lat: 43.8429,  lng: 10.5027 },
  'Pisa':          { lat: 43.7228,  lng: 10.4017 },
  'Padua':         { lat: 45.4064,  lng: 11.8768 },
  'Vicenza':       { lat: 45.5455,  lng: 11.5354 },
  'Parma':         { lat: 44.8015,  lng: 10.3279 },
}
