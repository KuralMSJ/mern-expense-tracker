import { formatRupees } from '../utils/currency'
import { formatDateOnly } from '../utils/date'

const formatAmount = (amount, type) => {
  return `${type === 'income' ? '+' : '-'} ${formatRupees(amount)}`
}

const sortAndLimitTransactions = (transactions) =>
  [...transactions]
    .sort((left, right) => {
      const dateDifference = new Date(right.date) - new Date(left.date)
      if (dateDifference) return dateDifference
      return new Date(right.createdAt) - new Date(left.createdAt)
    })
    .slice(0, 5)

function RecentTransactions({ transactions, loading, error }) {
  const recentTransactions = sortAndLimitTransactions(transactions)

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-800">Recent transactions</h3>

      {error && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-slate-600">Loading recent transactions...</p>
      ) : error ? null : recentTransactions.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          No transactions yet
        </p>
      ) : (
        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <div
              key={transaction._id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>{formatDateOnly(transaction.date)}</span>
                  <span>•</span>
                  <span>{transaction.category}</span>
                </div>
                <p className="text-slate-700">{transaction.note || 'No note provided'}</p>
              </div>

              <span
                className={`text-lg font-semibold ${
                  transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {formatAmount(transaction.amount, transaction.type)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default RecentTransactions
