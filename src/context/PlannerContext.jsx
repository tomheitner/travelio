import { createContext, useContext, useReducer, useEffect } from 'react'

const STORAGE_KEY = 'travelio_state'

const initialState = {
  rows: [],
  selectedIds: [],   // array for serialization; treated as a set
  itinerary: [],     // [{ rowId, date, notes }]
  phase: 1,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ROWS':
      return { ...state, rows: action.rows }

    case 'ADD_ROW':
      return { ...state, rows: [...state.rows, action.row] }

    case 'UPDATE_ROW':
      return {
        ...state,
        rows: state.rows.map(r => r.id === action.row.id ? action.row : r),
      }

    case 'DELETE_ROW': {
      const id = action.id
      return {
        ...state,
        rows: state.rows.filter(r => r.id !== id),
        selectedIds: state.selectedIds.filter(s => s !== id),
        itinerary: state.itinerary.filter(i => i.rowId !== id),
      }
    }

    case 'TOGGLE_SELECTED': {
      const id = action.id
      const already = state.selectedIds.includes(id)
      return {
        ...state,
        selectedIds: already
          ? state.selectedIds.filter(s => s !== id)
          : [...state.selectedIds, id],
      }
    }

    case 'SET_SELECTED_IDS':
      return { ...state, selectedIds: action.ids }

    case 'SET_GEOCODE': {
      const { id, lat, lng } = action
      return {
        ...state,
        rows: state.rows.map(r => r.id === id ? { ...r, lat, lng } : r),
      }
    }

    case 'SET_ITINERARY':
      return { ...state, itinerary: action.itinerary }

    case 'ADD_TO_ITINERARY': {
      const already = state.itinerary.find(i => i.rowId === action.rowId)
      if (already) return state
      return {
        ...state,
        itinerary: [...state.itinerary, { rowId: action.rowId, date: '', slot: '', notes: '' }],
      }
    }

    case 'REMOVE_FROM_ITINERARY':
      return {
        ...state,
        itinerary: state.itinerary.filter(i => i.rowId !== action.rowId),
      }

    case 'UPDATE_ITINERARY_ITEM':
      return {
        ...state,
        itinerary: state.itinerary.map(i =>
          i.rowId === action.rowId ? { ...i, ...action.updates } : i
        ),
      }

    case 'SET_PHASE':
      return { ...state, phase: action.phase }

    default:
      return state
  }
}

const PlannerContext = createContext(null)

export function PlannerProvider({ children }) {
  const persisted = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? { ...initialState, ...JSON.parse(raw) } : initialState
    } catch {
      return initialState
    }
  })()

  const [state, dispatch] = useReducer(reducer, persisted)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  return (
    <PlannerContext.Provider value={{ state, dispatch }}>
      {children}
    </PlannerContext.Provider>
  )
}

export function usePlanner() {
  return useContext(PlannerContext)
}
