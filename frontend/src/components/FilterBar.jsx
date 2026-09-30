import { getCategoriesByType } from '../constants/categories'

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getPresetRange = (preset) => {
  const today = new Date()
  const to = formatDate(today)

  if (preset === 'this-month') {
    return { from: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)), to }
  }

  if (preset === 'last-30-days') {
    const start = new Date(today)
    start.setDate(start.getDate() - 29)
    return { from: formatDate(start), to }
  }

  return { from: '', to: '' }
}

function FilterBar({ filters, onChange }) {
  const categories = getCategoriesByType(filters.type || 'all')
  const hasFilters = Boolean(
    filters.search || filters.type || filters.category || filters.from || filters.to
  )

  const handlePresetChange = (event) => {
    const datePreset = event.target.value
    const range = datePreset === 'custom' ? {} : getPresetRange(datePreset)
    onChange({ datePreset, ...range })
  }

  return (
    <div className="space-y-4 border-b border-slate-200 pb-5">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm font-medium text-slate-700">
          Search notes
          <input
            type="search"
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder="Search transactions"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal text-slate-800 outline-none focus:border-slate-500"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Type
          <select
            value={filters.type}
            onChange={(event) => onChange({ type: event.target.value, category: '' })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal text-slate-800 outline-none focus:border-slate-500"
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Category
          <select
            value={filters.category}
            onChange={(event) => onChange({ category: event.target.value })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal text-slate-800 outline-none focus:border-slate-500"
          >
            <option value="">All categories</option>
            {categories.map((category, index) => (
              <option key={`${category}-${index}`} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Date range
          <select
            value={filters.datePreset}
            onChange={handlePresetChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal text-slate-800 outline-none focus:border-slate-500"
          >
            <option value="all">All time</option>
            <option value="this-month">This month</option>
            <option value="last-30-days">Last 30 days</option>
            <option value="custom">Custom range</option>
          </select>
        </label>
      </div>

      {filters.datePreset === 'custom' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            From
            <input
              type="date"
              value={filters.from}
              onChange={(event) => onChange({ from: event.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal text-slate-800 outline-none focus:border-slate-500"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            To
            <input
              type="date"
              value={filters.to}
              onChange={(event) => onChange({ to: event.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal text-slate-800 outline-none focus:border-slate-500"
            />
          </label>
        </div>
      )}

      {filters.from && filters.to && filters.from > filters.to && (
        <p role="alert" className="text-sm text-red-700">
          From date must be on or before To date.
        </p>
      )}

      {hasFilters && (
        <button
          type="button"
          onClick={() => onChange({
            search: '',
            type: '',
            category: '',
            datePreset: 'all',
            from: '',
            to: '',
          })}
          className="text-sm font-medium text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-slate-900"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}

export default FilterBar
