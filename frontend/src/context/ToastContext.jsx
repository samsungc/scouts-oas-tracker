import { createContext, useContext, useReducer, useCallback } from 'react'
import ToastContainer from '../components/ui/ToastContainer'

const ToastContext = createContext(null)

let _nextId = 1

function reducer(state, action) {
  switch (action.type) {
    case 'ADD':    return [...state, action.toast]
    case 'REMOVE': return state.filter((t) => t.id !== action.id)
    default:       return state
  }
}

export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(reducer, [])

  const addToast = useCallback(({ message, variant = 'success', duration = 4000 }) => {
    const id = _nextId++
    dispatch({ type: 'ADD', toast: { id, message, variant } })
    setTimeout(() => dispatch({ type: 'REMOVE', id }), duration)
  }, [])

  const removeToast = useCallback((id) => dispatch({ type: 'REMOVE', id }), [])

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const addToast = useContext(ToastContext)
  if (!addToast) throw new Error('useToast must be used within ToastProvider')
  return addToast
}
