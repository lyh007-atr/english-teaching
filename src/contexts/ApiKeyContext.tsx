import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface ApiKeyContextType {
  apiKey: string
  setApiKey: (key: string) => void
  clearApiKey: () => void
  hasKey: boolean
}

function loadApiKey(): string {
  try {
    return localStorage.getItem('english-teaching-api-key') || ''
  } catch {
    return ''
  }
}

const ApiKeyContext = createContext<ApiKeyContextType | null>(null)

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState(loadApiKey)

  const setApiKey = useCallback((key: string) => {
    localStorage.setItem('english-teaching-api-key', key)
    setApiKeyState(key)
  }, [])

  const clearApiKey = useCallback(() => {
    localStorage.removeItem('english-teaching-api-key')
    setApiKeyState('')
  }, [])

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey, clearApiKey, hasKey: !!apiKey }}>
      {children}
    </ApiKeyContext.Provider>
  )
}

export function useApiKey() {
  const ctx = useContext(ApiKeyContext)
  if (!ctx) throw new Error('useApiKey must be used within ApiKeyProvider')
  return ctx
}
