import { useEffect } from 'react'
import { usePlanner } from '../../context/PlannerContext'
import { useGeocoding } from '../../hooks/useGeocoding'
import MapView from './MapView'
import ItineraryPanel from './ItineraryPanel'
import styles from './MapPhase.module.css'

export default function MapPhase() {
  const { state } = usePlanner()
  const { geocodeRows, retryFailed, pendingCount, failedIds } = useGeocoding()

  const selectedRows = state.rows.filter(r => state.selectedIds.includes(r.id))

  useEffect(() => {
    if (selectedRows.length > 0) {
      geocodeRows(selectedRows)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const failedRows = selectedRows.filter(r => failedIds.has(r.id))

  return (
    <div className={styles.container}>
      <MapView
        rows={selectedRows}
        pendingCount={pendingCount}
        failedCount={failedIds.size}
        onRetry={failedRows.length > 0 ? () => retryFailed(failedRows) : null}
      />
      <ItineraryPanel rows={selectedRows} failedIds={failedIds} />
    </div>
  )
}
