import { useEffect, useState } from 'react'
import { getBudget, saveBudget } from '../api.js'

function Setup() {
  // State: form values and UI feedback states.
  const [form, setForm] = useState({
    paycheck_amount: '',
    pay_frequency: 'biweekly',
    savings_percent: '',
    fixed_bills: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Effect: load existing budget data once on mount.
  useEffect(() => {
    const loadBudget = async () => {
      try {
        setError('')
        const data = await getBudget()
        const budget = data?.budget ?? data

        if (budget) {
          setForm({
            paycheck_amount:
              budget.paycheck_amount !== undefined
                ? String(budget.paycheck_amount)
                : '',
            pay_frequency: budget.pay_frequency || 'biweekly',
            savings_percent:
              budget.savings_percent !== undefined
                ? String(budget.savings_percent)
                : '',
            fixed_bills:
              budget.fixed_bills !== undefined ? String(budget.fixed_bills) : '',
          })
        }
      } catch (err) {
        setError(err.message || 'Failed to load budget.')
      } finally {
        setLoading(false)
      }
    }

    loadBudget()
  }, [])

  // Effect: clear success feedback after 3 seconds.
  useEffect(() => {
    if (!successMessage) {
      return undefined
    }

    const timer = setTimeout(() => {
      setSuccessMessage('')
    }, 3000)

    return () => clearTimeout(timer)
  }, [successMessage])

  // Handler: reusable change handler for all form fields.
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Handler: submit budget data to the backend.
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (saving) {
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccessMessage('')

      const payload = {
        ...form,
        paycheck_amount: Number(form.paycheck_amount),
        savings_percent: Number(form.savings_percent),
        fixed_bills: form.fixed_bills === '' ? 0 : Number(form.fixed_bills),
      }

      await saveBudget(payload)
      setSuccessMessage('Budget saved successfully!')
    } catch (err) {
      setError(err.message || 'Failed to save budget.')
    } finally {
      setSaving(false)
    }
  }

  // Render: loading, then setup form UI.
  if (loading) {
    return <div className="max-w-lg mx-auto mt-10">Loading...</div>
  }

  const inputClasses =
    'w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800'

  return (
    <div className="max-w-lg mx-auto mt-10">
      <div className="bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Setup Budget</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label
              htmlFor="paycheck_amount"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Paycheck Amount ($)
            </label>
            <input
              id="paycheck_amount"
              name="paycheck_amount"
              type="number"
              min="0"
              step="0.01"
              required
              value={form.paycheck_amount}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          <div className="mb-5">
            <label
              htmlFor="pay_frequency"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Pay Frequency
            </label>
            <select
              id="pay_frequency"
              name="pay_frequency"
              required
              value={form.pay_frequency}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Every Two Weeks (Bi-weekly)</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="mb-5">
            <label
              htmlFor="savings_percent"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Savings Goal (%)
            </label>
            <input
              id="savings_percent"
              name="savings_percent"
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="e.g. 20 for 20%"
              required
              value={form.savings_percent}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          <div className="mb-5">
            <label
              htmlFor="fixed_bills"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Fixed Monthly Bills ($)
            </label>
            <input
              id="fixed_bills"
              name="fixed_bills"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. rent, subscriptions, utilities"
              value={form.fixed_bills}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Budget'}
          </button>
        </form>

        {successMessage && (
          <p className="text-green-600 font-medium mt-4 text-center">
            {successMessage}
          </p>
        )}

        {error && <p className="text-red-500 font-medium mt-4 text-center">{error}</p>}
      </div>
    </div>
  )
}

export default Setup
