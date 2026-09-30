import { useState } from 'react'
import { getCategoriesByType } from '../constants/categories'
import { getLocalDateString } from '../utils/date'

const formatDateForInput = (value) => {
  const dateString = typeof value === 'string' ? value.slice(0, 10) : ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString

  return getLocalDateString()
}

const getDefaultFormValues = (initialValues = null) => {
  const today = getLocalDateString()

  if (!initialValues) {
    return {
      amount: '',
      type: 'expense',
      category: 'Food',
      date: today,
      note: '',
    }
  }

  return {
    amount: initialValues.amount ?? '',
    type: initialValues.type ?? 'expense',
    category: initialValues.category ?? 'Food',
    date: formatDateForInput(initialValues.date ?? today),
    note: initialValues.note ?? '',
  }
}

function TransactionForm({ initialValues = null, onSubmit, onCancel, loading, serverError }) {
  const [formValues, setFormValues] = useState(() => getDefaultFormValues(initialValues))
  const categories = getCategoriesByType(formValues.type)

  const handleChange = (event) => {
    const { name, value } = event.target

    if (name === 'type') {
      const nextCategories = getCategoriesByType(value)
      setFormValues((current) => ({
        ...current,
        type: value,
        category: nextCategories.includes(current.category) ? current.category : nextCategories[0],
      }))
      return
    }

    setFormValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const payload = {
      amount: Number(formValues.amount),
      type: formValues.type,
      category: formValues.category,
      date: formValues.date,
      note: formValues.note.trim(),
    }

    await onSubmit(payload)
  }

  const submitButtonLabel = initialValues ? 'Save changes' : 'Add transaction'

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-800">
          {initialValues ? 'Edit transaction' : 'Add transaction'}
        </h3>
        {initialValues && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Cancel
          </button>
        )}
      </div>

      {serverError && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Amount
          <input
            type="number"
            name="amount"
            min="0.01"
            step="0.01"
            value={formValues.amount}
            onChange={handleChange}
            placeholder="₹500"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 outline-none ring-0 focus:border-slate-500"
            required
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Type
          <select
            name="type"
            value={formValues.type}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-slate-500"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Category
          <select
            name="category"
            value={formValues.category}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-slate-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Date
          <input
            type="date"
            name="date"
            value={formValues.date}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-slate-500"
            required
          />
        </label>
      </div>

      <label className="mt-4 block text-sm font-medium text-slate-700">
        Note (optional)
        <textarea
          name="note"
          value={formValues.note}
          onChange={handleChange}
          rows="3"
          maxLength="200"
          placeholder="Optional description"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-slate-500"
        />
      </label>

      <div className="mt-5 flex justify-end gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? 'Saving...' : submitButtonLabel}
        </button>
      </div>
    </form>
  )
}

export default TransactionForm
