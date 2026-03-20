import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'

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
          <Route path="/setup" element={<div>Setup Page</div>} />
          <Route path="/expenses" element={<div>Expenses Page</div>} />
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
