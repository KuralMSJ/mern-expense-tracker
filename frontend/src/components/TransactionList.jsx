import { formatRupees } from '../utils/currency'
import { formatDateOnly } from '../utils/date'

const formatMoney = (amount, type) => {
  return `${type === 'income' ? '+' : '-'} ${formatRupees(amount)}`
}

function TransactionList({
  transactions,
  onEdit,
  onDelete,
  loading,
  error,
  emptyMessage = 'No transactions yet',
}) {
  if (loading) {
    return <p className="text-slate-600">Loading transactions...</p>
  }

  return (
    <div className="space-y-3">
      {error && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {!transactions.length ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          {emptyMessage}
        </p>
      ) : (
        transactions.map((transaction) => (
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

            <div className="flex items-center gap-3">
              <span
                className={`text-lg font-semibold ${
                  transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {formatMoney(transaction.amount, transaction.type)}
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(transaction)}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(transaction._id)}
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default TransactionList
