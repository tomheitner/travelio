import { useRef, useEffect } from 'react'
import styles from './ResearchTable.module.css'

export default function ResearchTable({ rows, selectedIds, onToggle, onSelectAll, onDeselectAll, onEdit, onDelete }) {
  const headerCheckRef = useRef(null)

  const visibleSelected = rows.filter(r => selectedIds.includes(r.id))
  const allSelected = rows.length > 0 && visibleSelected.length === rows.length
  const someSelected = visibleSelected.length > 0 && !allSelected

  useEffect(() => {
    if (headerCheckRef.current) {
      headerCheckRef.current.indeterminate = someSelected
    }
  }, [someSelected])

  function handleHeaderCheck() {
    if (allSelected) {
      onDeselectAll(rows.map(r => r.id))
    } else {
      onSelectAll(rows.map(r => r.id))
    }
  }

  if (rows.length === 0) {
    return (
      <div className={styles.empty}>
        No destinations yet. Import a CSV or add a row to get started.
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.checkCol}>
              <input
                ref={headerCheckRef}
                type="checkbox"
                checked={allSelected}
                onChange={handleHeaderCheck}
                title={allSelected ? 'Deselect all' : 'Select all'}
              />
            </th>
            <th>Region</th>
            <th>City</th>
            <th>Title</th>
            <th>Description</th>
            <th>Time</th>
            <th className={styles.actionsCol}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const selected = selectedIds.includes(row.id)
            return (
              <tr key={row.id} className={selected ? styles.selected : ''}>
                <td className={styles.checkCol}>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggle(row.id)}
                  />
                </td>
                <td className={styles.regionCell}>{row.region}</td>
                <td>{row.city}</td>
                <td className={styles.titleCell}>{row.title}</td>
                <td className={styles.descCell}>{row.description}</td>
                <td className={styles.timeCell}>{row.time}</td>
                <td className={styles.actionsCol}>
                  <button className={styles.iconBtn} onClick={() => onEdit(row)} title="Edit">✏️</button>
                  <button className={styles.iconBtn} onClick={() => onDelete(row.id)} title="Delete">🗑️</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
