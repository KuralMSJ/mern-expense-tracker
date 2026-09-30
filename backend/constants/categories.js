// These category arrays must be kept identical to frontend/src/constants/categories.js.
const EXPENSE_CATEGORIES = [
  'Food',
  'Rent',
  'Utilities',
  'Transport',
  'Entertainment',
  'Health',
  'Shopping',
  'Other',
];

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Other'];
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
