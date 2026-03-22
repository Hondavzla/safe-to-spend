import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        {/* Left section: app name / home link */}
        <Link to="/" className="flex items-center text-xl font-bold text-white">
          <span className="text-teal-400 mr-1 text-xl">⬡</span>
          Safe-to-Spend
        </Link>

        {/* Right section: main navigation links */}
        <div className="flex items-center gap-6">
          {/* Setup page link */}
          <Link
            to="/setup"
            className="text-gray-300 transition hover:text-teal-400"
          >
            Setup
          </Link>
          {/* Expenses page link */}
          <Link
            to="/expenses"
            className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full transition"
          >
            Expenses
          </Link>
          {/* Dashboard page link */}
          <Link
            to="/dashboard"
            className="text-gray-300 transition hover:text-teal-400"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
