import { usePlanner } from '../../context/PlannerContext'
import styles from './PhaseNav.module.css'

const PHASES = [
  { id: 1, label: '1 · Research' },
  { id: 2, label: '2 · Plan' },
  { id: 3, label: '3 · Pack' },
]

export default function PhaseNav() {
  const { state, dispatch } = usePlanner()

  return (
    <header className={styles.header}>
      <span className={styles.logo}>Travelio</span>
      <nav className={styles.nav}>
        {PHASES.map(p => (
          <button
            key={p.id}
            className={`${styles.tab} ${state.phase === p.id ? styles.active : ''}`}
            onClick={() => dispatch({ type: 'SET_PHASE', phase: p.id })}
          >
            {p.label}
          </button>
        ))}
      </nav>
      <div className={styles.spacer} />
    </header>
  )
}
