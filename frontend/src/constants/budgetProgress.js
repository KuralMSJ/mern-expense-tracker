export const BUDGET_PROGRESS_THRESHOLDS = Object.freeze({
  warning: 70,
  overLimit: 100,
})

export const getBudgetProgressColor = (percentage) => {
  if (percentage >= BUDGET_PROGRESS_THRESHOLDS.overLimit) return 'bg-red-600'
  if (percentage >= BUDGET_PROGRESS_THRESHOLDS.warning) return 'bg-amber-400'
  return 'bg-emerald-600'
}
