import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-gray-900 px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        {/* Left section: app name / home link */}
        <Link to="/" className="text-lg font-bold text-white">
          Safe-to-Spend
        </Link>

        {/* Right section: main navigation links */}
        <div className="flex items-center gap-6">
          {/* Setup page link */}
          <Link to="/setup" className="text-gray-300 transition hover:text-white">
            Setup
          </Link>
          {/* Expenses page link */}
          <Link
            to="/expenses"
            className="text-gray-300 transition hover:text-white"
          >
            Expenses
          </Link>
          {/* Dashboard page link */}
          <Link
            to="/dashboard"
            className="text-gray-300 transition hover:text-white"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
