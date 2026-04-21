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
import ActivityCard from './ActivityCard'
import styles from './ItineraryPanel.module.css'

export default function ItineraryPanel({ rows, failedIds = new Set() }) {
  const { state, dispatch } = usePlanner()

  const sensors = useSensors(useSensor(PointerSensor))

  const itinerary = state.itinerary
  const rowMap = Object.fromEntries(rows.map(r => [r.id, r]))

  // Rows selected but not yet in itinerary
  const unplanned = rows.filter(r => !itinerary.find(i => i.rowId === r.id))

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = itinerary.findIndex(i => i.rowId === active.id)
    const newIndex = itinerary.findIndex(i => i.rowId === over.id)
    dispatch({ type: 'SET_ITINERARY', itinerary: arrayMove(itinerary, oldIndex, newIndex) })
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>Itinerary</span>
        <span className={styles.count}>{itinerary.length} stops</span>
      </div>

      <div className={styles.body}>
        {itinerary.length === 0 && unplanned.length === 0 && (
          <p className={styles.hint}>No destinations selected. Go back to Research and check some rows.</p>
        )}

        {itinerary.length > 0 && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={itinerary.map(i => i.rowId)} strategy={verticalListSortingStrategy}>
              {itinerary.map((item, index) => {
                const row = rowMap[item.rowId]
                if (!row) return null
                return (
                  <ActivityCard
                    key={item.rowId}
                    index={index + 1}
                    item={item}
                    row={row}
                    onUpdate={updates => dispatch({ type: 'UPDATE_ITINERARY_ITEM', rowId: item.rowId, updates })}
                    onRemove={() => dispatch({ type: 'REMOVE_FROM_ITINERARY', rowId: item.rowId })}
                  />
                )
              })}
            </SortableContext>
          </DndContext>
        )}

        {unplanned.length > 0 && (
          <div className={styles.unplannedSection}>
            <p className={styles.sectionLabel}>Not yet in itinerary</p>
            {unplanned.map(row => {
              const failed = failedIds.has(row.id)
              return (
                <div key={row.id} className={`${styles.unplannedRow} ${failed ? styles.unplannedFailed : ''}`}>
                  <span className={styles.unplannedTitle}>{row.title}</span>
                  <span className={styles.unplannedCity}>{row.city}</span>
                  {failed
                    ? <span className={styles.failedBadge}>not found</span>
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
