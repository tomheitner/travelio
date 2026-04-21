import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PlannerProvider } from './context/PlannerContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PlannerProvider>
      <App />
    </PlannerProvider>
  </StrictMode>
)
