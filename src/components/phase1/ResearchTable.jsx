import { useRef, useEffect } from 'react'
import styles from './ResearchTable.module.css'

const SORT_COLS = [
  { key: 'region', label: 'Region' },
  { key: 'city',   label: 'City' },
  { key: 'title',  label: 'Title' },
  { key: 'description', label: 'Description' },
  { key: 'time',   label: 'Time' },
]

export default function ResearchTable({ rows, selectedIds, onToggle, onSelectAll, onDeselectAll, onEdit, onDelete, hasData, sortKey, sortDir, onSort, groups }) {
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
        {hasData
          ? 'No destinations match your filters.'
          : 'No destinations yet. Import a CSV or add a row to get started.'}
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
            {SORT_COLS.map(col => (
              <th
                key={col.key}
                className={styles.sortable}
                onClick={() => onSort(col.key)}
              >
                {col.label}
                {sortKey === col.key
                  ? <span className={styles.sortArrow}>{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
                  : <span className={styles.sortArrowInactive}> ↕</span>
                }
              </th>
            ))}
            <th className={styles.actionsCol}></th>
          </tr>
        </thead>
        <tbody>
          {groups
            ? groups.map(group => {
                const groupIds = group.rows.map(r => r.id)
                const groupSelected = groupIds.filter(id => selectedIds.includes(id))
                const allGroupSelected = groupIds.length > 0 && groupSelected.length === groupIds.length
                const someGroupSelected = groupSelected.length > 0 && !allGroupSelected
                return (
                  <GroupRows
                    key={group.key}
                    group={group}
                    selectedIds={selectedIds}
                    allGroupSelected={allGroupSelected}
                    someGroupSelected={someGroupSelected}
                    onSelectAll={onSelectAll}
                    onDeselectAll={onDeselectAll}
                    onToggle={onToggle}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                )
              })
            : rows.map(row => (
                <DataRow
                  key={row.id}
                  row={row}
                  selected={selectedIds.includes(row.id)}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
          }
        </tbody>
      </table>
    </div>
  )
}

function DataRow({ row, selected, onToggle, onEdit, onDelete }) {
  return (
    <tr className={selected ? styles.selected : ''}>
      <td className={styles.checkCol}>
        <input type="checkbox" checked={selected} onChange={() => onToggle(row.id)} />
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
}

function GroupRows({ group, selectedIds, allGroupSelected, someGroupSelected, onSelectAll, onDeselectAll, onToggle, onEdit, onDelete }) {
  const groupHeaderRef = useRef(null)
  const groupIds = group.rows.map(r => r.id)

  useEffect(() => {
    if (groupHeaderRef.current) {
      groupHeaderRef.current.indeterminate = someGroupSelected
    }
  }, [someGroupSelected])

  return (
    <>
      <tr className={styles.groupHeader}>
        <td className={styles.checkCol}>
          <input
            ref={groupHeaderRef}
            type="checkbox"
            checked={allGroupSelected}
            onChange={() => allGroupSelected ? onDeselectAll(groupIds) : onSelectAll(groupIds)}
            title={allGroupSelected ? 'Deselect group' : 'Select group'}
          />
        </td>
        <td colSpan={6} className={styles.groupLabel}>
          {group.key}
          <span className={styles.groupCount}>{group.rows.length} row{group.rows.length !== 1 ? 's' : ''}</span>
        </td>
      </tr>
      {group.rows.map(row => (
        <DataRow
          key={row.id}
          row={row}
          selected={selectedIds.includes(row.id)}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </>
  )
}
