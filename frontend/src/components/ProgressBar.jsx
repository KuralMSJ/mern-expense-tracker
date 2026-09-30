import { getBudgetProgressColor } from '../constants/budgetProgress'

const formatPercentage = (value) =>
  Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 1 })

function ProgressBar({ percentage }) {
  const actualPercentage = Math.max(0, Number(percentage) || 0)
  const visualPercentage = Math.min(actualPercentage, 100)

  return (
    <div className="space-y-2">
      <div
        className="h-3 overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={visualPercentage}
        aria-valuetext={`${formatPercentage(actualPercentage)}% used`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${getBudgetProgressColor(actualPercentage)}`}
          style={{ width: `${visualPercentage}%` }}
        />
      </div>
      <p className="text-sm font-medium text-slate-700">
        {formatPercentage(actualPercentage)}% used
      </p>
    </div>
  )
}

export default ProgressBar
