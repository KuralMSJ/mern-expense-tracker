const mongoose = require('mongoose');
const { EXPENSE_CATEGORIES, INCOME_CATEGORIES } = require('../constants/categories');
const { MAX_MONEY, roundMoney } = require('../utils/money');

const transactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: [0.01, 'Amount must be greater than 0'],
      max: [MAX_MONEY, 'Amount is too large'],
      set: roundMoney,
    },
    type: {
      type: String,
      required: true,
      enum: ['income', 'expense'],
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ date: -1 });

transactionSchema.pre('validate', function validateCategoryForType(next) {
  const validCategories = this.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  if (!validCategories.includes(this.category)) {
    next(new Error(`Category "${this.category}" is invalid for type "${this.type}"`));
    return;
  }

  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
