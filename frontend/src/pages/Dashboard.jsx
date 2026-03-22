import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js'
import { getDashboard, getExpenses } from '../api.js'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
)

function Dashboard() {
  // State: page data, UI states, and chart carousel index.
  const [dashboard, setDashboard] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [chartIndex, setChartIndex] = useState(0)

  // Helper: currency formatter.
  const fmt = (n) => `$${Number(n || 0).toFixed(2)}`

  // Helper: days left in current month.
  const getDaysLeftInMonth = () => {
    const today = new Date()
    const daysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    ).getDate()
    return daysInMonth - today.getDate()
  }

  // Helper: status badge style based on dashboard status.
  const getStatusClasses = (status) => {
    if (status === 'On Track') return 'bg-green-400 text-green-900'
    if (status === 'Close to Limit') return 'bg-yellow-400 text-yellow-900'
    return 'bg-red-400 text-red-900'
  }

  // Effect: load dashboard summary + expenses in parallel.
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setError('')
        const [dashboardData, expensesData] = await Promise.all([
          getDashboard(),
          getExpenses(),
        ])

        setDashboard(dashboardData?.dashboard ?? dashboardData)
        setExpenses(
          Array.isArray(expensesData?.expenses)
            ? expensesData.expenses
            : Array.isArray(expensesData)
              ? expensesData
              : [],
        )
      } catch (err) {
        setError(err.message || 'Failed to load dashboard.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="bg-gray-950 min-h-screen -m-6 p-6">
        <div className="max-w-4xl mx-auto px-4 py-8 text-gray-200">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-950 min-h-screen -m-6 p-6">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-gray-800 rounded-2xl p-6 text-red-400">{error}</div>
        </div>
      </div>
    )
  }

  // No-budget state: guide user to setup page first.
  if (!dashboard || Number(dashboard.monthly_income) === 0) {
    return (
      <div className="bg-gray-950 min-h-screen -m-6 p-6">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-gray-800 rounded-2xl p-8 text-center">
            <p className="text-gray-200 text-lg mb-4">No budget set up yet.</p>
            <Link
              to="/setup"
              className="inline-block bg-teal-500 hover:bg-teal-600 text-white font-semibold px-5 py-2 rounded-lg transition"
            >
              Go to Setup
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const daysLeft = getDaysLeftInMonth()
  const categoryLabels = Object.keys(dashboard.category_breakdown || {})
  const categoryData = Object.values(dashboard.category_breakdown || {})

  const doughnutData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryData,
        backgroundColor: [
          '#14b8a6',
          '#3b82f6',
          '#f97316',
          '#a855f7',
          '#ec4899',
          '#eab308',
          '#10b981',
          '#6b7280',
        ],
        borderWidth: 0,
      },
    ],
  }

  const doughnutOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#e5e7eb',
        },
      },
    },
    maintainAspectRatio: false,
    cutout: '65%',
  }

  const barData = {
    labels: ['Income', 'After Savings', 'After Bills', 'Spent'],
    datasets: [
      {
        data: [
          dashboard.monthly_income,
          dashboard.money_after_savings,
          dashboard.money_after_bills,
          dashboard.total_spent,
        ],
        backgroundColor: ['#14b8a6', '#3b82f6', '#f97316', '#a855f7'],
      },
    ],
  }

  const barOptions = {
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: '#374151',
        },
      },
      y: {
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: '#374151',
        },
      },
    },
    maintainAspectRatio: false,
  }

  const recentExpenses = expenses.slice(0, 5)

  return (
    <div className="bg-gray-950 min-h-screen -m-6 p-6">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Section 1: Hero banner */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl p-8">
          <p className="text-sm text-white/80">Available to Spend</p>
          <h1 className="text-5xl font-bold text-white mt-2">
            {fmt(dashboard.remaining_safe_to_spend)}
          </h1>

          <div className="mt-3 flex items-center text-white/90 text-sm">
            <span>Resets in {daysLeft} days</span>
            <span
              className={`text-xs font-bold px-2 py-1 rounded-full ml-2 ${getStatusClasses(dashboard.status)}`}
            >
              {dashboard.status}
            </span>
          </div>

          <p className="text-sm text-white/80 mt-3">
            Safe to spend today: {fmt(dashboard.safe_daily_spend)}/day
          </p>
        </div>

        {/* Section 2: Summary cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-2xl p-5">
            <p className="text-gray-400 text-sm">Monthly Income</p>
            <p className="text-2xl font-bold text-white mt-1">
              {fmt(dashboard.monthly_income)}
            </p>
          </div>

          <div className="bg-gray-800 rounded-2xl p-5">
            <p className="text-gray-400 text-sm">Savings Target</p>
            <p className="text-2xl font-bold text-teal-400 mt-1">
              {fmt(dashboard.savings_target)}
            </p>
          </div>

          <div className="bg-gray-800 rounded-2xl p-5">
            <p className="text-gray-400 text-sm">Total Spent</p>
            <p className="text-2xl font-bold text-orange-400 mt-1">
              {fmt(dashboard.total_spent)}
            </p>
          </div>

          <div className="bg-gray-800 rounded-2xl p-5">
            <p className="text-gray-400 text-sm">Safe Daily Spend</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">
              {fmt(dashboard.safe_daily_spend)}/day
            </p>
          </div>
        </div>

        {/* Section 3: Chart carousel */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold">Spending Overview</h2>
            <p className="text-white font-bold">{chartIndex + 1}/2</p>
          </div>

          <div style={{ height: '280px' }}>
            {chartIndex === 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <Bar data={barData} options={barOptions} />
            )}
          </div>

          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setChartIndex((chartIndex - 1 + 2) % 2)}
              className="text-white text-xl px-3 py-1 hover:text-teal-400 transition"
            >
              ←
            </button>

            <button
              type="button"
              onClick={() => setChartIndex(0)}
              className={`w-3 h-3 rounded-full ${chartIndex === 0 ? 'bg-white' : 'bg-gray-600'}`}
              aria-label="Show first chart"
            />
            <button
              type="button"
              onClick={() => setChartIndex(1)}
              className={`w-3 h-3 rounded-full ${chartIndex === 1 ? 'bg-white' : 'bg-gray-600'}`}
              aria-label="Show second chart"
            />

            <button
              type="button"
              onClick={() => setChartIndex((chartIndex + 1) % 2)}
              className="text-white text-xl px-3 py-1 hover:text-teal-400 transition"
            >
              →
            </button>
          </div>
        </div>

        {/* Section 4: Recent activity */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-4">Recent Activity</h2>

          {recentExpenses.length === 0 ? (
            <p className="text-gray-400">No expenses yet.</p>
          ) : (
            recentExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex justify-between items-center py-3 border-b border-gray-700 last:border-0"
              >
                <div>
                  <p className="text-white font-semibold">{expense.category}</p>
                  <p className="text-gray-400 text-sm">{expense.date}</p>
                </div>

                <div className="text-right">
                  <p className="text-orange-400 font-semibold">
                    -{fmt(expense.amount)}
                  </p>
                  {expense.note ? (
                    <p className="text-gray-500 text-xs">{expense.note}</p>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
