import { useState } from 'react'
import { usePlanner } from '../../context/PlannerContext'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import DayGroup from './DayGroup'
import ActivityCard from './ActivityCard'
import styles from './ItineraryPanel.module.css'

function formatDateRange(dates) {
  const valid = dates.filter(Boolean).sort()
  if (valid.length === 0) return null
  const fmt = d => {
    const [y, m, day] = d.split('-').map(Number)
    return new Date(y, m - 1, day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }
  if (valid[0] === valid[valid.length - 1]) return fmt(valid[0])
  return `${fmt(valid[0])} – ${fmt(valid[valid.length - 1])}`
}

export default function ItineraryPanel({ rows, failedIds = new Set(), highlightedRowId, onHighlight }) {
  const { state, dispatch } = usePlanner()

  const sensors = useSensors(useSensor(PointerSensor))

  const itinerary = state.itinerary
  const rowMap = Object.fromEntries(rows.map(r => [r.id, r]))

  // Rows selected but not yet in itinerary
  const unplanned = rows.filter(r => !itinerary.find(i => i.rowId === r.id))

  // Group itinerary items by date for DayGroup rendering
  const grouped = itinerary.reduce((acc, item) => {
    const key = item.date || ''
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  // Sort groups: dated ones first (ascending), then undated
  const groupKeys = Object.keys(grouped).sort((a, b) => {
    if (!a && b) return 1
    if (a && !b) return -1
    return a < b ? -1 : a > b ? 1 : 0
  })

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = itinerary.findIndex(i => i.rowId === active.id)
    const newIndex = itinerary.findIndex(i => i.rowId === over.id)
    dispatch({ type: 'SET_ITINERARY', itinerary: arrayMove(itinerary, oldIndex, newIndex) })
  }

  function handleUpdate(rowId, updates) {
    dispatch({ type: 'UPDATE_ITINERARY_ITEM', rowId, updates })
  }

  function handleRemove(rowId) {
    dispatch({ type: 'REMOVE_FROM_ITINERARY', rowId })
  }

  // Summary bar data
  const allDates = itinerary.map(i => i.date)
  const dateRange = formatDateRange(allDates)

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>Itinerary</span>
        <div className={styles.headerRight}>
          {itinerary.length > 0 && (
            <span className={styles.summary}>
              {itinerary.length} stop{itinerary.length !== 1 ? 's' : ''}
              {dateRange && <> · {dateRange}</>}
            </span>
          )}
        </div>
      </div>

      <div className={styles.body}>
        {itinerary.length === 0 && unplanned.length === 0 && (
          <p className={styles.hint}>No destinations selected. Go back to Research and check some rows.</p>
        )}

        {itinerary.length > 0 && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={itinerary.map(i => i.rowId)} strategy={verticalListSortingStrategy}>
              {groupKeys.map(dateKey => {
                const items = grouped[dateKey]
                // Compute the global index offset for this group so numbers are continuous
                const offset = itinerary.findIndex(i => i.rowId === items[0].rowId)
                return (
                  <DayGroup
                    key={dateKey}
                    dateKey={dateKey}
                    items={items}
                    rowMap={rowMap}
                    globalIndexOffset={offset}
                    onUpdate={handleUpdate}
                    onRemove={handleRemove}
                    highlightedRowId={highlightedRowId}
                    onHighlight={onHighlight}
                  />
                )
              })}
            </SortableContext>
          </DndContext>
        )}

        {unplanned.length > 0 && (
          <div className={styles.unplannedSection}>
            <div className={styles.unplannedHeader}>
              <p className={styles.sectionLabel}>Not in itinerary</p>
              <button
                className={styles.addAllBtn}
                onClick={() => unplanned.forEach(r => dispatch({ type: 'ADD_TO_ITINERARY', rowId: r.id }))}
              >
                Add all
              </button>
            </div>
            {unplanned.map(row => {
              const failed = failedIds.has(row.id)
              return (
                <div key={row.id} className={`${styles.unplannedRow} ${failed ? styles.unplannedFailed : ''}`}>
                  <span className={styles.unplannedTitle}>{row.title}</span>
                  <span className={styles.unplannedCity}>{row.city}</span>
                  {failed
                    ? <ManualCoordEntry rowId={row.id} />
                    : <button
                        className={styles.addBtn}
                        onClick={() => dispatch({ type: 'ADD_TO_ITINERARY', rowId: row.id })}
                      >
                        + Add
                      </button>
                  }
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function ManualCoordEntry({ rowId }) {
  const { dispatch } = usePlanner()
  const [open, setOpen] = useState(false)
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')

  function handleApply() {
    const la = parseFloat(lat)
    const lo = parseFloat(lng)
    if (isNaN(la) || isNaN(lo)) return
    dispatch({ type: 'SET_GEOCODE', id: rowId, lat: la, lng: lo })
    setOpen(false)
  }

  if (!open) {
    return (
      <button className={styles.failedBadge} onClick={() => setOpen(true)} title="Set coordinates manually">
        not found — fix
      </button>
    )
  }

  return (
    <div className={styles.coordEntry}>
      <input
        className={styles.coordInput}
        placeholder="lat"
        value={lat}
        onChange={e => setLat(e.target.value)}
      />
      <input
        className={styles.coordInput}
        placeholder="lng"
        value={lng}
        onChange={e => setLng(e.target.value)}
      />
      <button className={styles.coordApply} onClick={handleApply}>✓</button>
      <button className={styles.coordCancel} onClick={() => setOpen(false)}>✕</button>
    </div>
  )
}
