import { formatRupees } from '../utils/currency'

function SummaryCards({ summary, loading, error }) {
  const totalIncome = Number(summary?.totalIncome) || 0
  const totalExpenses = Number(summary?.totalExpenses) || 0
  const netBalance = Number(summary?.netBalance) || 0
  const cards = [
    { label: 'Total Income', value: totalIncome, color: 'text-emerald-600' },
    { label: 'Total Expenses', value: totalExpenses, color: 'text-red-600' },
    {
      label: 'Net Balance',
      value: netBalance,
      color: netBalance < 0 ? 'text-red-600' : 'text-emerald-600',
    },
  ]

  return (
    <div className="space-y-3">
      {error && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className={`mt-2 text-2xl font-semibold ${color}`}>
              {loading ? 'Loading...' : error ? 'Unavailable' : formatRupees(value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SummaryCards
