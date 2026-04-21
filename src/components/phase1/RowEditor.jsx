import { useState } from 'react'
import styles from './RowEditor.module.css'

export default function RowEditor({ row, onSave, onClose }) {
  const [draft, setDraft] = useState({ ...row })

  function set(field, value) {
    setDraft(d => ({ ...d, [field]: value }))
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Edit destination</h2>
        <div className={styles.fields}>
          <label>Region
            <input value={draft.region} onChange={e => set('region', e.target.value)} />
          </label>
          <label>City
            <input value={draft.city} onChange={e => set('city', e.target.value)} />
          </label>
          <label>Title
            <input value={draft.title} onChange={e => set('title', e.target.value)} />
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
          <button className={styles.btnSave} onClick={() => onSave(draft)}>Save</button>
        </div>
      </div>
    </div>
  )
}
