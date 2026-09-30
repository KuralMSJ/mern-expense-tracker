import { useState } from 'react'
import BudgetCard from '../components/BudgetCard'
import { EXPENSE_CATEGORIES } from '../constants/categories'
import { formatRupees } from '../utils/currency'
import { useBudgets } from '../hooks/useBudgets'
import { getLocalMonthString } from '../utils/date'

const getCurrentMonth = () => getLocalMonthString()

function BudgetsPage() {
  const [month, setMonth] = useState(getCurrentMonth)
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0])
  const [limit, setLimit] = useState('')
  const [editingBudget, setEditingBudget] = useState(null)
  const [formError, setFormError] = useState('')
  const {
    budgets,
    unbudgetedSpending,
    loading,
    saving,
    error,
    spendingError,
    save,
    remove,
  } = useBudgets(month)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    const numericLimit = Number(limit)

    if (!Number.isFinite(numericLimit) || numericLimit <= 0) {
      setFormError('Enter a limit greater than 0.')
      return
    }

    const success = await save({ category, month, limit: numericLimit })
    if (success) {
      setEditingBudget(null)
      setLimit('')
    }
  }

  const handleEdit = (budget) => {
    setEditingBudget(budget)
    setCategory(budget.category)
    setLimit(String(budget.limit))
  }

  const handleCancelEdit = () => {
    setEditingBudget(null)
    setCategory(EXPENSE_CATEGORIES[0])
    setLimit('')
    setFormError('')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this monthly budget?')) return
    await remove(id)
    if (editingBudget?._id === id) handleCancelEdit()
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Planning
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">Budgets</h2>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="text-sm text-slate-600">Monthly category limits and spending</p>
        <label className="block text-sm font-medium text-slate-700">
          Month
          <input
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            disabled={Boolean(editingBudget)}
            className="mt-1 block rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none focus:border-slate-500 disabled:bg-slate-100"
          />
        </label>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-800">
            {editingBudget ? 'Edit monthly limit' : 'Set a category limit'}
          </h3>
          {editingBudget && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          )}
        </div>

        {(formError || error) && (
          <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError || error}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
          <label className="block text-sm font-medium text-slate-700">
            Expense category
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              disabled={Boolean(editingBudget)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none focus:border-slate-500 disabled:bg-slate-100"
            >
              {EXPENSE_CATEGORIES.map((expenseCategory) => (
                <option key={expenseCategory} value={expenseCategory}>{expenseCategory}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Monthly limit
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={limit}
              onChange={(event) => setLimit(event.target.value)}
              placeholder="₹10,000"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-slate-500"
            />
          </label>

          <button
            type="submit"
            disabled={saving || !month}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {saving ? 'Saving...' : editingBudget ? 'Save changes' : 'Set limit'}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-slate-600">Loading budgets...</p>
      ) : error ? null : budgets.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          No budgets set for this month
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget._id}
              budget={budget}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {spendingError && (
        <p role="alert" className="text-sm text-red-700">{spendingError}</p>
      )}

      {!loading && !spendingError && unbudgetedSpending.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-800">Spending without a budget</h3>
          <ul className="divide-y divide-slate-200 border-y border-slate-200">
            {unbudgetedSpending.map((item) => (
              <li key={item.category} className="flex items-center justify-between gap-4 py-3 text-sm">
                <span className="text-slate-700">{item.category}</span>
                <span className="font-medium text-slate-900">{formatRupees(item.total)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  )
}

export default BudgetsPage
