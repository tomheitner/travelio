import { useEffect, useRef } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import styles from './ActivityCard.module.css'

export default function ActivityCard({ index, item, row, onUpdate, onRemove, isHighlighted, onHighlight }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.rowId })

  const cardRef = useRef(null)

  function mergedRef(el) {
    cardRef.current = el
    setNodeRef(el)
  }

  useEffect(() => {
    if (isHighlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [isHighlighted])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={mergedRef}
      style={style}
      className={`${styles.card} ${isHighlighted ? styles.highlighted : ''}`}
      onClick={onHighlight}
    >
      <div className={styles.drag} {...attributes} {...listeners}>
        <span className={styles.index}>{index}</span>
        <span className={styles.handle}>⠿</span>
      </div>
      <div className={styles.content}>
        <div className={styles.top}>
          <span className={styles.title}>{row.title}</span>
          <button className={styles.removeBtn} onClick={e => { e.stopPropagation(); onRemove() }} title="Remove">✕</button>
        </div>
        <div className={styles.meta}>
          <span className={styles.city}>{row.city}</span>
          <span className={styles.time}>{row.time}</span>
        </div>
        <div className={styles.fields}>
          <input
            className={styles.dateInput}
            type="date"
            value={item.date || ''}
            onClick={e => e.stopPropagation()}
            onChange={e => onUpdate({ date: e.target.value })}
          />
          <select
            className={styles.slotSelect}
            value={item.slot || ''}
            onClick={e => e.stopPropagation()}
            onChange={e => onUpdate({ slot: e.target.value })}
          >
            <option value="">No slot</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
          </select>
        </div>
        <textarea
          className={styles.notes}
          placeholder="Notes…"
          rows={2}
          value={item.notes || ''}
          onClick={e => e.stopPropagation()}
          onChange={e => onUpdate({ notes: e.target.value })}
        />
      </div>
    </div>
  )
}
