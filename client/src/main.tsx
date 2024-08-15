import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import PlaylistProvider from './context/PlaylistContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PlaylistProvider>
      <App />
    </PlaylistProvider>
  </StrictMode>,
)
