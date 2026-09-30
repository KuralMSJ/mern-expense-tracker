const Transaction = require('../models/Transaction');
const { ALL_CATEGORIES } = require('../constants/categories');
const { roundMoney } = require('../utils/money');

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseDateParam = (value, name) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { error: `${name} must be a valid date in YYYY-MM-DD format` };
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return { error: `${name} must be a valid date in YYYY-MM-DD format` };
  }

  return { date };
};

const parsePositiveInteger = (value, name, max = Number.MAX_SAFE_INTEGER) => {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    return { error: `${name} must be a positive integer` };
  }

  const number = Number(value);
  if (!Number.isSafeInteger(number) || number > max) {
    return { error: `${name} must be between 1 and ${max}` };
  }

  return { number };
};

const createTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.create(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const {
      search = '',
      type,
      category,
      from,
      to,
      page = '1',
      limit = '10',
    } = req.query;

    if (typeof search !== 'string') {
      return res.status(400).json({ message: 'search must be a string' });
    }

    if (type !== undefined && type !== '' && !['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'type must be either income or expense' });
    }

    if (category !== undefined && category !== '' && !ALL_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'category is invalid' });
    }

    const parsedPage = parsePositiveInteger(page, 'page');
    if (parsedPage.error) {
      return res.status(400).json({ message: parsedPage.error });
    }

    const parsedLimit = parsePositiveInteger(limit, 'limit', 100);
    if (parsedLimit.error) {
      return res.status(400).json({ message: parsedLimit.error });
    }

    let fromDate;
    let toDate;
    if (from) {
      const parsed = parseDateParam(from, 'from');
      if (parsed.error) return res.status(400).json({ message: parsed.error });
      fromDate = parsed.date;
    } else if (from !== undefined && from !== '') {
      return res.status(400).json({ message: 'from must be a valid date in YYYY-MM-DD format' });
    }

    if (to) {
      const parsed = parseDateParam(to, 'to');
      if (parsed.error) return res.status(400).json({ message: parsed.error });
      toDate = parsed.date;
    } else if (to !== undefined && to !== '') {
      return res.status(400).json({ message: 'to must be a valid date in YYYY-MM-DD format' });
    }

    if (fromDate && toDate && fromDate > toDate) {
      return res.status(400).json({ message: 'from must be on or before to' });
    }

    const query = {};

    if (search.trim()) {
      query.note = { $regex: escapeRegex(search.trim()), $options: 'i' };
    }

    if (type && type !== '') {
      query.type = type;
    }

    if (category && category !== '') {
      query.category = category;
    }

    if (from || to) {
      query.date = {};

      if (from) {
        query.date.$gte = fromDate;
      }

      if (to) {
        toDate.setUTCHours(23, 59, 59, 999);
        query.date.$lte = toDate;
      }
    }

    const currentPage = parsedPage.number;
    const pageSize = parsedLimit.number;
    const skip = (currentPage - 1) * pageSize;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      Transaction.countDocuments(query),
    ]);

    res.status(200).json({
      transactions,
      pagination: {
        page: currentPage,
        limit: pageSize,
        totalItems: total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    Object.assign(transaction, req.body);
    const updatedTransaction = await transaction.save();

    res.status(200).json(updatedTransaction);
  } catch (error) {
    next(error);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json({
      message: 'Transaction deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
};
