import sharedCategories from '../../../shared/categories.json'

export const EXPENSE_CATEGORIES = sharedCategories.expense
export const INCOME_CATEGORIES = sharedCategories.income

export const getCategoriesByType = (type) => {
  if (type === 'income') return INCOME_CATEGORIES
  if (type === 'expense') return EXPENSE_CATEGORIES
  return [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]
}
