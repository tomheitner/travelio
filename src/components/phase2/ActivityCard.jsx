import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import styles from './ActivityCard.module.css'

export default function ActivityCard({ index, item, row, onUpdate, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.rowId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className={styles.card}>
      <div className={styles.drag} {...attributes} {...listeners}>
        <span className={styles.index}>{index}</span>
        <span className={styles.handle}>⠿</span>
      </div>
      <div className={styles.content}>
        <div className={styles.top}>
          <span className={styles.title}>{row.title}</span>
          <button className={styles.removeBtn} onClick={onRemove} title="Remove">✕</button>
        </div>
        <div className={styles.meta}>
          <span className={styles.city}>{row.city}</span>
          <span className={styles.time}>{row.time}</span>
        </div>
        <input
          className={styles.dateInput}
          type="date"
          value={item.date || ''}
          onChange={e => onUpdate({ date: e.target.value })}
        />
        <textarea
          className={styles.notes}
          placeholder="Notes…"
          rows={2}
          value={item.notes || ''}
          onChange={e => onUpdate({ notes: e.target.value })}
        />
      </div>
    </div>
  )
}
