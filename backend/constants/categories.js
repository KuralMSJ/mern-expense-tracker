const sharedCategories = require('../../shared/categories.json');
const EXPENSE_CATEGORIES = sharedCategories.expense;
const INCOME_CATEGORIES = sharedCategories.income;
const ALL_CATEGORIES = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];

const getCategoriesByType = (type) => {
  if (type === 'income') return INCOME_CATEGORIES;
  if (type === 'expense') return EXPENSE_CATEGORIES;
  return ALL_CATEGORIES;
};

module.exports = {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  ALL_CATEGORIES,
  getCategoriesByType,
};
