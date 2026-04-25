import { useState, useRef } from 'react'
import { usePlanner } from '../../context/PlannerContext'
import { useCsvIO } from '../../hooks/useCsvIO'
import { makeRow } from '../../utils/csvSchema'
import ResearchTable from './ResearchTable'
import RowEditor from './RowEditor'
import styles from './ResearchPhase.module.css'

export default function ResearchPhase() {
  const { state, dispatch } = usePlanner()
  const { importCsv, exportCsv } = useCsvIO()
  const fileInputRef = useRef(null)
  const [editingRow, setEditingRow] = useState(null)
  const [pendingImport, setPendingImport] = useState(null) // rows waiting for merge/replace decision
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [filterRegion, setFilterRegion] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState(null)   // null | 'region' | 'city' | 'title' | 'time'
  const [sortDir, setSortDir] = useState('asc')  // 'asc' | 'desc'
  const [groupBy, setGroupBy] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const regions = [...new Set(state.rows.map(r => r.region))].sort()
  const cities = [...new Set(
    state.rows.filter(r => !filterRegion || r.region === filterRegion).map(r => r.city)
  )].sort()

  const filtered = state.rows.filter(r => {
    if (filterRegion && r.region !== filterRegion) return false
    if (filterCity && r.city !== filterCity) return false
    if (search) {
      const q = search.toLowerCase()
      return r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.region.toLowerCase().includes(q)
    }
    return true
  })

  async function handleImport(e) {
    const file = e.target.files[0]
    if (!file) return
    const rows = await importCsv(file)
    e.target.value = ''
    if (state.rows.length === 0) {
      dispatch({ type: 'SET_ROWS', rows })
    } else {
      setPendingImport(rows)
    }
  }

  function handleImportReplace() {
    dispatch({ type: 'SET_ROWS', rows: pendingImport })
    setPendingImport(null)
  }

  function handleImportMerge() {
    const existingKeys = new Set(state.rows.map(r => `${r.title}||${r.city}`))
    const newRows = pendingImport.filter(r => !existingKeys.has(`${r.title}||${r.city}`))
    dispatch({ type: 'SET_ROWS', rows: [...state.rows, ...newRows] })
    setPendingImport(null)
  }

  function handleAddRow() {
    const row = makeRow()
    dispatch({ type: 'ADD_ROW', row })
    setEditingRow(row)
  }

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const av = (a[sortKey] ?? '').toLowerCase()
        const bv = (b[sortKey] ?? '').toLowerCase()
        const cmp = av < bv ? -1 : av > bv ? 1 : 0
        return sortDir === 'asc' ? cmp : -cmp
      })
    : filtered

  // Build groups for group-by mode. Groups are ordered by the groupBy key.
  const groupKey = sortKey || 'region'
  const groups = groupBy
    ? sorted.reduce((acc, row) => {
        const key = row[groupKey] || '(none)'
        if (!acc.find(g => g.key === key)) acc.push({ key, rows: [] })
        acc.find(g => g.key === key).rows.push(row)
        return acc
      }, [])
    : null

  function handleSelectAll(ids) {
    const merged = [...new Set([...state.selectedIds, ...ids])]
    dispatch({ type: 'SET_SELECTED_IDS', ids: merged })
  }

  function handleDeselectAll(ids) {
    dispatch({ type: 'SET_SELECTED_IDS', ids: state.selectedIds.filter(id => !ids.includes(id)) })
  }

  const selectedCount = state.selectedIds.length
  const hasActiveFilters = !!(filterRegion || filterCity || search)

  async function handleDrop(e) {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (!file || !file.name.endsWith('.csv')) return
    const rows = await importCsv(file)
    if (state.rows.length === 0) {
      dispatch({ type: 'SET_ROWS', rows })
    } else {
      setPendingImport(rows)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <input
            className={styles.search}
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select value={filterRegion} onChange={e => { setFilterRegion(e.target.value); setFilterCity('') }}>
            <option value="">All regions</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={filterCity} onChange={e => setFilterCity(e.target.value)}>
            <option value="">All cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {hasActiveFilters && (
            <button className={styles.btnClear} onClick={() => { setSearch(''); setFilterRegion(''); setFilterCity('') }}>
              Clear filters
            </button>
          )}
          <button
            className={`${styles.btnClear} ${groupBy ? styles.btnClearActive : ''}`}
            onClick={() => setGroupBy(g => !g)}
            title={`Group by ${groupKey}`}
          >
            {groupBy ? `Grouped by ${groupKey}` : 'Group by'}
          </button>
        </div>
        <div className={styles.countLabel}>
          {sorted.length} row{sorted.length !== 1 ? 's' : ''}
          {selectedCount > 0 && <> · <strong>{selectedCount}</strong> selected</>}
          {selectedCount > 0 && (
            <button className={styles.btnClear} onClick={() => dispatch({ type: 'SET_SELECTED_IDS', ids: [] })}>
              Clear selection
            </button>
          )}
        </div>
        <div className={styles.spacer} />
        <div className={styles.actions}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
          <button className={styles.btnSecondary} onClick={() => fileInputRef.current.click()}>
            Import CSV
          </button>
          <button className={styles.btnSecondary} onClick={() => exportCsv(state.rows)}>
            Export CSV
          </button>
          <button className={styles.btnSecondary} onClick={handleAddRow}>
            + Add row
          </button>
          <button
            className={styles.btnPrimary}
            disabled={selectedCount === 0}
            onClick={() => dispatch({ type: 'SET_PHASE', phase: 2 })}
          >
            Plan on Map {selectedCount > 0 ? `(${selectedCount})` : ''}
          </button>
        </div>
      </div>

      <div
        className={`${styles.tableArea} ${isDragOver ? styles.dragOver : ''}`}
        onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <ResearchTable
          rows={sorted}
          groups={groups}
          hasData={state.rows.length > 0}
          selectedIds={state.selectedIds}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          onToggle={id => dispatch({ type: 'TOGGLE_SELECTED', id })}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onEdit={row => setEditingRow(row)}
          onDelete={id => setConfirmDeleteId(id)}
        />
        {isDragOver && (
          <div className={styles.dropOverlay}>Drop CSV to import</div>
        )}
      </div>

      {editingRow && (
        <RowEditor
          row={editingRow}
          allRegions={regions}
          allCities={[...new Set(state.rows.map(r => r.city))].sort()}
          onSave={row => {
            dispatch({ type: 'UPDATE_ROW', row })
            setEditingRow(null)
          }}
          onClose={() => setEditingRow(null)}
        />
      )}

      {pendingImport && (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && setPendingImport(null)}>
          <div className={styles.confirmModal}>
            <h2 className={styles.confirmTitle}>Import CSV</h2>
            <p className={styles.confirmBody}>
              You already have <strong>{state.rows.length}</strong> destinations. What should happen with the <strong>{pendingImport.length}</strong> imported rows?
            </p>
            <div className={styles.confirmActions}>
              <button className={styles.btnSecondary} onClick={() => setPendingImport(null)}>Cancel</button>
              <button className={styles.btnSecondary} onClick={handleImportMerge}>Merge — add new only</button>
              <button className={styles.btnDanger} onClick={handleImportReplace}>Replace all</button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId && (() => {
        const row = state.rows.find(r => r.id === confirmDeleteId)
        return (
          <div className={styles.overlay} onClick={e => e.target === e.currentTarget && setConfirmDeleteId(null)}>
            <div className={styles.confirmModal}>
              <h2 className={styles.confirmTitle}>Delete destination?</h2>
              <p className={styles.confirmBody}>
                "<strong>{row?.title}</strong>" will be permanently removed.
              </p>
              <div className={styles.confirmActions}>
                <button className={styles.btnSecondary} onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                <button className={styles.btnDanger} onClick={() => { dispatch({ type: 'DELETE_ROW', id: confirmDeleteId }); setConfirmDeleteId(null) }}>Delete</button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
