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
      <div className="w-full max-w-screen-2xl mx-auto px-4 py-8 space-y-6">
        {/* Section 1: Hero banner */}
        <div
          className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl p-8 animate-fade-in-up"
          style={{ animationDelay: '0ms' }}
        >
          <p className="text-base text-white/90">Available to Spend</p>
          <h1
            className="text-6xl font-extrabold text-white mt-2"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.25)' }}
          >
            {fmt(dashboard.remaining_safe_to_spend)}
          </h1>

          <div className="border-t border-white/20 mt-4 pt-3">
            <div className="flex items-center text-white/90 text-sm">
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
        </div>

        {/* Section 2: Two-column chart + summary layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            className="bg-gray-800 rounded-2xl p-6 border border-gray-700 animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            <h2 className="text-white font-bold mb-4">Spending by Category</h2>
            <div className="rounded-xl bg-gray-900 p-4" style={{ height: '280px' }}>
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>

          <div
            className="bg-gray-800 rounded-2xl p-6 border border-gray-700 animate-fade-in-up"
            style={{ animationDelay: '150ms' }}
          >
            <h2 className="text-white font-bold mb-4">Budget Breakdown</h2>
            <div className="rounded-xl bg-gray-900 p-4" style={{ height: '180px' }}>
              <Bar data={barData} options={barOptions} />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-gray-900 rounded-xl p-3">
                <p className="text-gray-400 text-xs">Monthly Income</p>
                <p className="text-lg font-bold text-white mt-1">
                  {fmt(dashboard.monthly_income)}
                </p>
              </div>
              <div className="bg-gray-900 rounded-xl p-3">
                <p className="text-gray-400 text-xs">Savings Target</p>
                <p className="text-lg font-bold text-teal-400 mt-1">
                  {fmt(dashboard.savings_target)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Recent activity + budget status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            className="bg-gray-800 rounded-2xl p-6 lg:col-span-2 animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
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

          <div
            className="bg-gray-800 rounded-2xl p-6 animate-fade-in-up"
            style={{ animationDelay: '250ms' }}
          >
            <h2 className="text-white font-bold text-lg mb-4">Budget Status</h2>

            <div className="bg-gray-900 rounded-xl p-3 mb-4">
              <p className="text-gray-400 text-xs">Total Spent This Month</p>
              <p className="text-2xl font-bold text-orange-400 mt-1">
                {fmt(dashboard.total_spent)}
              </p>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <p className="text-gray-300 text-sm">Savings Goal</p>
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                ON TRACK
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <p className="text-gray-300 text-sm">Overall Spending</p>
              <span
                className={`text-white text-xs font-bold px-2 py-1 rounded-full ${
                  dashboard.status === 'On Track'
                    ? 'bg-green-500'
                    : dashboard.status === 'Close to Limit'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
              >
                {dashboard.status === 'On Track'
                  ? 'AHEAD'
                  : dashboard.status === 'Close to Limit'
                    ? 'CAUTION'
                    : 'ALERT'}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
              <p className="text-gray-300 text-sm">Daily Budget</p>
              <p className="text-teal-400 font-semibold text-sm">
                {fmt(dashboard.safe_daily_spend)}/day remaining
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-gray-400 text-xs">Money After Bills</p>
              <p className="text-lg font-bold text-white mt-1">
                {fmt(dashboard.money_after_bills)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
