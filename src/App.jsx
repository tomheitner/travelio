import { usePlanner } from './context/PlannerContext'
import PhaseNav from './components/layout/PhaseNav'
import ResearchPhase from './components/phase1/ResearchPhase'
import MapPhase from './components/phase2/MapPhase'
import Phase3Placeholder from './components/phase3/Phase3Placeholder'
import styles from './App.module.css'

export default function App() {
  const { state } = usePlanner()

  return (
    <div className={styles.app}>
      <PhaseNav />
      <main className={styles.main}>
        {state.phase === 1 && <ResearchPhase />}
        {state.phase === 2 && <MapPhase />}
        {state.phase === 3 && <Phase3Placeholder />}
      </main>
    </div>
  )
}
