import ProgressBar from './ProgressBar'
import { formatRupees } from '../utils/currency'

function BudgetCard({ budget, onEdit, onDelete }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">{budget.category}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {formatRupees(budget.spent)} spent of {formatRupees(budget.limit)}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => onEdit(budget)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(budget._id)}
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="mt-4">
        <ProgressBar percentage={budget.percentUsed} />
      </div>
    </article>
  )
}

export default BudgetCard
