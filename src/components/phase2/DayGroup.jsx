import ActivityCard from './ActivityCard'
import styles from './DayGroup.module.css'

function formatDate(dateStr) {
  if (!dateStr) return 'Unscheduled'
  // Parse as local date (avoid UTC shift from new Date(dateStr))
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  })
}

// Purely visual — the parent's single SortableContext wraps all cards across all groups.
export default function DayGroup({ dateKey, items, rowMap, globalIndexOffset, onUpdate, onRemove, highlightedRowId, onHighlight }) {
  return (
    <div className={styles.group}>
      <div className={styles.dateHeader}>
        <span className={styles.dateLabel}>{formatDate(dateKey)}</span>
        <span className={styles.itemCount}>{items.length} stop{items.length !== 1 ? 's' : ''}</span>
      </div>
      {items.map((item, i) => {
        const row = rowMap[item.rowId]
        if (!row) return null
        return (
          <ActivityCard
            key={item.rowId}
            index={globalIndexOffset + i + 1}
            item={item}
            row={row}
            onUpdate={updates => onUpdate(item.rowId, updates)}
            onRemove={() => onRemove(item.rowId)}
            isHighlighted={highlightedRowId === item.rowId}
            onHighlight={() => onHighlight?.(item.rowId)}
          />
        )
      })}
    </div>
  )
}
