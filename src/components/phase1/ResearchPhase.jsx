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
  const [filterRegion, setFilterRegion] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [search, setSearch] = useState('')

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
        r.city.toLowerCase().includes(q)
    }
    return true
  })

  async function handleImport(e) {
    const file = e.target.files[0]
    if (!file) return
    const rows = await importCsv(file)
    dispatch({ type: 'SET_ROWS', rows })
    e.target.value = ''
  }

  function handleAddRow() {
    const row = makeRow()
    dispatch({ type: 'ADD_ROW', row })
    setEditingRow(row)
  }

  function handleSelectAll(ids) {
    const merged = [...new Set([...state.selectedIds, ...ids])]
    dispatch({ type: 'SET_SELECTED_IDS', ids: merged })
  }

  function handleDeselectAll(ids) {
    dispatch({ type: 'SET_SELECTED_IDS', ids: state.selectedIds.filter(id => !ids.includes(id)) })
  }

  const selectedCount = state.selectedIds.length

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
        </div>
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

      <ResearchTable
        rows={filtered}
        selectedIds={state.selectedIds}
        onToggle={id => dispatch({ type: 'TOGGLE_SELECTED', id })}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onEdit={row => setEditingRow(row)}
        onDelete={id => dispatch({ type: 'DELETE_ROW', id })}
      />

      {editingRow && (
        <RowEditor
          row={editingRow}
          onSave={row => {
            dispatch({ type: 'UPDATE_ROW', row })
            setEditingRow(null)
          }}
          onClose={() => setEditingRow(null)}
        />
      )}
    </div>
  )
}
