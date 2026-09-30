const mongoose = require('mongoose');
const { EXPENSE_CATEGORIES } = require('../constants/categories');
const { MAX_MONEY, roundMoney } = require('../utils/money');

const budgetSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: EXPENSE_CATEGORIES,
    },
    month: {
      type: String,
      required: true,
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must use YYYY-MM format'],
    },
    limit: {
      type: Number,
      required: true,
      min: [0.01, 'Limit must be greater than 0'],
      max: [MAX_MONEY, 'Limit is too large'],
      set: roundMoney,
    },
  },
  { timestamps: true }
);

budgetSchema.index({ category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
