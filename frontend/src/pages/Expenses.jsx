import { useEffect, useState } from 'react'
import { addExpense, deleteExpense, getExpenses } from '../api.js'

function Expenses() {
  // State: form values and UI feedback states.
  const [form, setForm] = useState({
    amount: '',
    category: '',
    date: '',
    note: '',
  })
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Effect: load expenses once when this page mounts.
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        setError('')
        const data = await getExpenses()
        const fetchedExpenses = Array.isArray(data) ? data : data?.expenses || []
        setExpenses(fetchedExpenses)
      } catch (err) {
        setError(err.message || 'Failed to load expenses.')
      } finally {
        setLoading(false)
      }
    }

    loadExpenses()
  }, [])

  // Handler: reusable change handler for all form fields.
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Handler: submit a new expense.
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (adding) {
      return
    }

    try {
      setAdding(true)
      setError('')
      setSuccessMessage('')

      const payload = {
        ...form,
        amount: Number(form.amount),
      }

      const data = await addExpense(payload)
      const newExpense = data?.expense ?? data

      setExpenses([newExpense, ...expenses])
      setForm({
        amount: '',
        category: '',
        date: '',
        note: '',
      })
      setSuccessMessage('Expense added!')
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
    } catch (err) {
      setError(err.message || 'Failed to add expense.')
    } finally {
      setAdding(false)
    }
  }

  // Handler: delete one expense by id.
  const handleDelete = async (id) => {
    try {
      setError('')
      await deleteExpense(id)
      setExpenses(expenses.filter((e) => e.id !== id))
    } catch (err) {
      setError(err.message || 'Failed to delete expense.')
    }
  }

  // Render: loading, then page content.
  if (loading) {
    return (
      <div className="bg-gray-950 min-h-screen -m-6 p-6">
        <div className="max-w-2xl mx-auto pt-8 text-gray-400">Loading...</div>
      </div>
    )
  }

  const inputClasses =
    'w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="bg-gray-950 min-h-screen -m-6 p-6">
      <div className="max-w-2xl mx-auto pt-8 space-y-6 animate-fade-in-up">
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h1 className="text-xl font-bold text-white mb-4">Add Expense</h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-semibold text-gray-400 mb-1"
              >
                Amount ($)
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                required
                value={form.amount}
                onChange={handleChange}
                className={inputClasses}
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-semibold text-gray-400 mb-1"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                required
                value={form.category}
                onChange={handleChange}
                className={inputClasses}
              >
                <option value="" disabled>
                  Select a category
                </option>
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Shopping">Shopping</option>
                <option value="Health">Health</option>
                <option value="Education">Education</option>
                <option value="Bills">Bills</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-sm font-semibold text-gray-400 mb-1"
              >
                Date
              </label>
              <input
                id="date"
                name="date"
                type="date"
                required
                value={form.date}
                onChange={handleChange}
                className={inputClasses}
              />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label
                htmlFor="note"
                className="block text-sm font-semibold text-gray-400 mb-1"
              >
                Note (optional)
              </label>
              <input
                id="note"
                name="note"
                type="text"
                placeholder="Brief description"
                value={form.note}
                onChange={handleChange}
                className={inputClasses}
              />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <button
                type="submit"
                disabled={adding}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? 'Adding...' : 'Add Expense'}
              </button>
            </div>
          </form>

          {successMessage && (
            <p className="text-teal-400 font-medium mt-4 text-center">
              {successMessage}
            </p>
          )}

          {error && (
            <p className="text-red-400 font-medium mt-4 text-center">{error}</p>
          )}
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Your Expenses</h2>

          {expenses.length === 0 ? (
            <p className="text-gray-400">No expenses yet.</p>
          ) : (
            <div>
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0"
                >
                  <div>
                    <p className="text-sm text-gray-400">{expense.date}</p>
                    <p className="font-semibold text-white">{expense.category}</p>
                    <p className="text-sm text-gray-500">{expense.note || 'No note'}</p>
                  </div>

                  <div className="flex items-center">
                    <p className="text-teal-400 font-semibold">
                      ${Number(expense.amount).toFixed(2)}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDelete(expense.id)}
                      className="text-red-400 hover:text-red-300 text-sm font-medium transition ml-4"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Expenses
