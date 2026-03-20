const API_BASE_URL = 'http://127.0.0.1:5000/api'

// Fetches the current budget from the backend.
export async function getBudget() {
  const response = await fetch(`${API_BASE_URL}/budget`)

  if (!response.ok) {
    throw new Error('Failed to fetch budget data.')
  }

  return response.json()
}

// Saves or updates the budget in the backend.
export async function saveBudget(data) {
  const response = await fetch(`${API_BASE_URL}/budget`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Failed to save budget data.')
  }

  return response.json()
}

// Fetches all saved expenses from the backend.
export async function getExpenses() {
  const response = await fetch(`${API_BASE_URL}/expenses`)

  if (!response.ok) {
    throw new Error('Failed to fetch expenses.')
  }

  return response.json()
}

// Adds a new expense to the backend.
export async function addExpense(data) {
  const response = await fetch(`${API_BASE_URL}/expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Failed to add expense.')
  }

  return response.json()
}

// Deletes one expense by ID from the backend.
export async function deleteExpense(id) {
  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to delete expense.')
  }

  return response.json()
}

// Fetches dashboard summary data from the backend.
export async function getDashboard() {
  const response = await fetch(`${API_BASE_URL}/dashboard`)

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data.')
  }

  return response.json()
}
