import { useState, useCallback, useRef } from 'react'
import { usePlanner } from '../context/PlannerContext'
import { COORDINATE_BUNDLE } from '../utils/coordinateBundle'

const GEO_CACHE_KEY = 'travelio_geo_cache'
const RATE_DELAY = 1200   // ms between Nominatim requests (enforces >1 req/s)
const RETRY_BASE = 6000   // base ms to wait on 429 before retrying

function loadCache() {
  try { return JSON.parse(localStorage.getItem(GEO_CACHE_KEY) || '{}') }
  catch { return {} }
}

function saveCache(cache) {
  localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(cache))
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// Build a prioritised list of search strings to try for a city name.
// Handles tricky names like "Burano Island", "Vatican City", "Lake Como".
function buildQueries(city) {
  const variants = [`${city}, Italy`, city]
  const stripped = city.replace(/\s+(island|city|area|lake|district|village)$/i, '').trim()
  if (stripped !== city) variants.push(`${stripped}, Italy`, stripped)
  return [...new Set(variants)]
}

// Single Nominatim fetch, with accurate wall-clock rate limiting via a shared ref.
async function nominatimOnce(query, lastDoneAt) {
  const elapsed = Date.now() - lastDoneAt.current
  if (lastDoneAt.current > 0 && elapsed < RATE_DELAY) {
    await sleep(RATE_DELAY - elapsed)
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
  lastDoneAt.current = Date.now()

  if (res.status === 429) {
    const err = new Error('rate_limited')
    err.rateLimited = true
    throw err
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const data = await res.json()
  return data.length > 0
    ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    : null
}

// Try each query variant in order; on 429 retry with exponential back-off.
async function geocodeViaNetwork(city, lastDoneAt) {
  for (const query of buildQueries(city)) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await nominatimOnce(query, lastDoneAt)
        if (result) return result
        break // null means no match for this variant, try the next one
      } catch (e) {
        if (e.rateLimited) {
          await sleep(RETRY_BASE * (attempt + 1))
          // fall through to retry the same query
        } else {
          break // network / HTTP error – try next variant
        }
      }
    }
  }
  return null
}

export function useGeocoding() {
  const { dispatch } = usePlanner()
  const inFlight = useRef(new Set())
  const lastDoneAt = useRef(0) // shared wall-clock timestamp of last Nominatim response
  const [pendingCount, setPendingCount] = useState(0)
  const [failedIds, setFailedIds] = useState(new Set())

  const geocodeRows = useCallback(async (rows, { clearFailed = false } = {}) => {
    const cache = loadCache()

    // Filter to only rows that still need resolving
    const toProcess = rows.filter(r => {
      if (r.lat !== null && r.lng !== null) return false
      if (inFlight.current.has(r.id)) return false
      const cacheKey = `${r.city}, Italy`
      if (!clearFailed && cache[cacheKey]?.failed) return false
      return true
    })

    if (toProcess.length === 0) return

    let remaining = toProcess.length
    setPendingCount(remaining)

    for (const row of toProcess) {
      inFlight.current.add(row.id)
      const cacheKey = `${row.city}, Italy`

      // 1. Bundle lookup — instant, no network
      if (COORDINATE_BUNDLE[row.city]) {
        const coords = COORDINATE_BUNDLE[row.city]
        dispatch({ type: 'SET_GEOCODE', id: row.id, lat: coords.lat, lng: coords.lng })
        inFlight.current.delete(row.id)
        setPendingCount(--remaining)
        continue
      }

      // 2. localStorage cache hit
      if (cache[cacheKey] && !cache[cacheKey].failed) {
        dispatch({ type: 'SET_GEOCODE', id: row.id, lat: cache[cacheKey].lat, lng: cache[cacheKey].lng })
        inFlight.current.delete(row.id)
        setPendingCount(--remaining)
        continue
      }

      // 3. Network fallback via Nominatim
      const result = await geocodeViaNetwork(row.city, lastDoneAt)

      if (result) {
        cache[cacheKey] = result
        saveCache(cache)
        dispatch({ type: 'SET_GEOCODE', id: row.id, lat: result.lat, lng: result.lng })
        setFailedIds(prev => { const s = new Set(prev); s.delete(row.id); return s })
      } else {
        cache[cacheKey] = { failed: true }
        saveCache(cache)
        setFailedIds(prev => new Set([...prev, row.id]))
      }

      inFlight.current.delete(row.id)
      setPendingCount(--remaining)
    }
  }, [dispatch])

  const retryFailed = useCallback(async (rows) => {
    const cache = loadCache()
    for (const row of rows) {
      delete cache[`${row.city}, Italy`]
    }
    saveCache(cache)
    setFailedIds(new Set())
    await geocodeRows(rows, { clearFailed: true })
  }, [geocodeRows])

  return { geocodeRows, retryFailed, pendingCount, failedIds }
}
