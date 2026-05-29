import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { LanguageProvider } from './i18n/LanguageContext'
import AppErrorBoundary from './components/AppErrorBoundary'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </AppErrorBoundary>
  </React.StrictMode>,
)
