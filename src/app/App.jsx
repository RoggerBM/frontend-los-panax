import { BrowserRouter } from 'react-router-dom'
import { FatigueResultsProvider } from '@/features/cognitive'
import AppRoutes from './AppRoutes'

export default function App() {
  return (
    <BrowserRouter>
      <FatigueResultsProvider>
        <AppRoutes />
      </FatigueResultsProvider>
    </BrowserRouter>
  )
}
