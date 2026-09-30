// These category arrays must be kept identical to backend/constants/categories.js.
export const EXPENSE_CATEGORIES = [
  'Food',
  'Rent',
  'Utilities',
  'Transport',
  'Entertainment',
  'Health',
  'Shopping',
  'Other',
]

export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Other']

export const getCategoriesByType = (type) => {
  if (type === 'income') return INCOME_CATEGORIES
  if (type === 'expense') return EXPENSE_CATEGORIES
  return [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]
}
