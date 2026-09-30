const mongoose = require('mongoose');
const { getCategoriesByType } = require('../constants/categories');
const { MAX_MONEY, roundMoney } = require('../utils/money');

const isValidTransactionDate = (value) => {
  if (typeof value !== 'string') return false;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }

  return !Number.isNaN(Date.parse(value));
};

const validateTransactionInput = (req, res, next) => {
  const { amount, type, category, note, date } = req.body;

  if (amount === undefined || amount === null || amount === '') {
    return res.status(400).json({ message: 'Amount is required' });
  }

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ message: 'Amount must be a valid number greater than 0' });
  }

  if (parsedAmount > MAX_MONEY) {
    return res.status(400).json({ message: `Amount cannot exceed ${MAX_MONEY}` });
  }

  const roundedAmount = roundMoney(parsedAmount);
  if (roundedAmount <= 0) {
    return res.status(400).json({ message: 'Amount must be at least 0.01' });
  }

  const normalizedType = typeof type === 'string' ? type.trim().toLowerCase() : '';
  if (!['income', 'expense'].includes(normalizedType)) {
    return res.status(400).json({ message: 'Type must be either income or expense' });
  }

  const normalizedCategory = typeof category === 'string' ? category.trim() : '';
  const allowedCategories = getCategoriesByType(normalizedType);

  if (!normalizedCategory || !allowedCategories.includes(normalizedCategory)) {
    return res.status(400).json({
      message: `Category must be one of: ${allowedCategories.join(', ')}`,
    });
  }

  if (note !== undefined && note !== null && typeof note !== 'string') {
    return res.status(400).json({ message: 'Note must be a string when provided' });
  }

  if (note && note.length > 200) {
    return res.status(400).json({ message: 'Note cannot be longer than 200 characters' });
  }

  if (date !== undefined && !isValidTransactionDate(date)) {
    return res.status(400).json({ message: 'Date is invalid' });
  }

  req.body.amount = roundedAmount;
  req.body.type = normalizedType;
  req.body.category = normalizedCategory;
  req.body.note = note ? note.trim() : '';

  next();
};

const validateObjectId = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid transaction id' });
  }

  next();
};

module.exports = {
  validateTransactionInput,
  validateObjectId,
};
