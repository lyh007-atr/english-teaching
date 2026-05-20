import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ProgressProvider } from './contexts/ProgressContext'
import { ApiKeyProvider } from './contexts/ApiKeyContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ApiKeyProvider>
        <ProgressProvider>
          <App />
        </ProgressProvider>
      </ApiKeyProvider>
    </BrowserRouter>
  </React.StrictMode>
)
