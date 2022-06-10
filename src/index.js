import { render } from 'react-dom'
import { Suspense } from 'react'
import './styles.css'
import App from './App'

render(
  <Suspense fallback={null}>
    <App />
  </Suspense>,
  document.getElementById('root')
)
