import { useState, useEffect } from 'react'
import styles from './RowEditor.module.css'

export default function RowEditor({ row, allRegions = [], allCities = [], onSave, onClose }) {
  const [draft, setDraft] = useState({ ...row })
  const [titleError, setTitleError] = useState(false)

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function set(field, value) {
    setDraft(d => ({ ...d, [field]: value }))
    if (field === 'title') setTitleError(false)
  }

  function handleSave() {
    if (!draft.title.trim()) {
      setTitleError(true)
      return
    }
    onSave(draft)
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Edit destination</h2>
        <div className={styles.fields}>
          <label>Region
            <input
              list="region-list"
              value={draft.region}
              onChange={e => set('region', e.target.value)}
            />
            <datalist id="region-list">
              {allRegions.map(r => <option key={r} value={r} />)}
            </datalist>
          </label>
          <label>City
            <input
              list="city-list"
              value={draft.city}
              onChange={e => set('city', e.target.value)}
            />
            <datalist id="city-list">
              {allCities.map(c => <option key={c} value={c} />)}
            </datalist>
          </label>
          <label>
            Title{titleError && <span className={styles.errorHint}>required</span>}
            <input
              value={draft.title}
              className={titleError ? styles.inputError : ''}
              onChange={e => set('title', e.target.value)}
            />
          </label>
          <label>Description
            <textarea rows={3} value={draft.description} onChange={e => set('description', e.target.value)} />
          </label>
          <label>Time
            <input value={draft.time} onChange={e => set('time', e.target.value)} />
          </label>
        </div>
        <div className={styles.footer}>
          <button className={styles.btnCancel} onClick={onClose}>Cancel</button>
          <button className={styles.btnSave} onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  )
}
