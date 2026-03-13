import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import GreenwashingDetector from './GreenwashingDetector.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GreenwashingDetector />
  </StrictMode>,
)
