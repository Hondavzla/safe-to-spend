import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Setup from './pages/Setup.jsx'
import Expenses from './pages/Expenses.jsx'
import Dashboard from './pages/Dashboard.jsx'

function App() {
  return (
    <BrowserRouter>
      {/* Shared top navigation */}
      <Navbar />

      {/* Page content area */}
      <main className="p-6">
        <Routes>
          {/* Default route: send users to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* Placeholder routes for upcoming pages */}
          <Route path="/setup" element={<Setup />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
