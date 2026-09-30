const mongoose = require('mongoose');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { EXPENSE_CATEGORIES } = require('../constants/categories');
const { MAX_MONEY, roundMoney } = require('../utils/money');

const isValidMonth = (month) =>
  typeof month === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(month);

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

const getMonthRange = (month) => {
  const [year, monthNumber] = month.split('-').map(Number);
  return {
    start: new Date(Date.UTC(year, monthNumber - 1, 1)),
    end: new Date(Date.UTC(year, monthNumber, 0, 23, 59, 59, 999)),
  };
};

const getBudgets = async (req, res, next) => {
  const month = req.query.month === undefined ? getCurrentMonth() : req.query.month;
  if (!isValidMonth(month)) {
    return res.status(400).json({ message: 'month must use YYYY-MM format with a valid month' });
  }

  try {
    const { start, end } = getMonthRange(month);
    const [budgets, spending] = await Promise.all([
      Budget.find({ month }).sort({ category: 1 }).lean(),
      Transaction.aggregate([
        { $match: { type: 'expense', date: { $gte: start, $lte: end } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $project: { _id: 1, spent: { $round: ['$total', 2] } } },
      ]),
    ]);

    const spentByCategory = new Map(spending.map(({ _id, spent }) => [_id, spent]));
    const results = budgets.map((budget) => {
      const spent = spentByCategory.get(budget.category) || 0;
      return {
        ...budget,
        spent,
        percentUsed: (spent / budget.limit) * 100,
      };
    });

    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

const upsertBudget = async (req, res, next) => {
  const { category, month, limit } = req.body;

  if (typeof category !== 'string' || !EXPENSE_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: 'category must be a valid expense category' });
  }

  if (!isValidMonth(month)) {
    return res.status(400).json({ message: 'month must use YYYY-MM format with a valid month' });
  }

  if (typeof limit !== 'number' || !Number.isFinite(limit) || limit <= 0) {
    return res.status(400).json({ message: 'limit must be a number greater than 0' });
  }

  if (limit > MAX_MONEY) {
    return res.status(400).json({ message: 'limit is too large' });
  }

  const roundedLimit = roundMoney(limit);
  if (roundedLimit <= 0) {
    return res.status(400).json({ message: 'limit must be at least 0.01' });
  }

  try {
    const budget = await Budget.findOneAndUpdate(
      { category, month },
      { $set: { limit: roundedLimit } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(budget);
  } catch (error) {
    next(error);
  }
};

const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findByIdAndDelete(req.params.id);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.status(200).json({ message: 'Budget deleted successfully', id: req.params.id });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid budget id' });
    }
    next(error);
  }
};

module.exports = { getBudgets, upsertBudget, deleteBudget };
