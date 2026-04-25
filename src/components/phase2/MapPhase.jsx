import { useEffect, useRef, useState } from 'react'
import { usePlanner } from '../../context/PlannerContext'
import { useGeocoding } from '../../hooks/useGeocoding'
import MapView from './MapView'
import ItineraryPanel from './ItineraryPanel'
import styles from './MapPhase.module.css'

export default function MapPhase() {
  const { state, dispatch } = usePlanner()
  const { geocodeRows, retryFailed, pendingCount, failedIds } = useGeocoding()
  const [highlightedRowId, setHighlightedRowId] = useState(null)

  const selectedRows = state.rows.filter(r => state.selectedIds.includes(r.id))

  // Re-run whenever the set of un-geocoded selected row IDs changes.
  const needsGeocode = selectedRows.filter(r => r.lat === null && r.lng === null)
  const needsKey = needsGeocode.map(r => r.id).join(',')
  const prevKey = useRef('')

  useEffect(() => {
    if (needsKey && needsKey !== prevKey.current) {
      prevKey.current = needsKey
      geocodeRows(selectedRows)
    }
  }, [needsKey]) // eslint-disable-line react-hooks/exhaustive-deps

  if (selectedRows.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyMsg}>No destinations selected.</p>
        <button
          className={styles.emptyBtn}
          onClick={() => dispatch({ type: 'SET_PHASE', phase: 1 })}
        >
          ← Go to Research
        </button>
      </div>
    )
  }

  const failedRows = selectedRows.filter(r => failedIds.has(r.id))

  return (
    <div className={styles.container}>
      <MapView
        rows={selectedRows}
        pendingCount={pendingCount}
        failedCount={failedIds.size}
        onRetry={failedRows.length > 0 ? () => retryFailed(failedRows) : null}
        highlightedRowId={highlightedRowId}
        onHighlight={setHighlightedRowId}
      />
      <ItineraryPanel
        rows={selectedRows}
        failedIds={failedIds}
        highlightedRowId={highlightedRowId}
        onHighlight={setHighlightedRowId}
      />
    </div>
  )
}
