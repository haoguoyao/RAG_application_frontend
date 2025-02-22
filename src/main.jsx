import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import RAGApp from './main_page.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RAGApp />
  </StrictMode>,
)
