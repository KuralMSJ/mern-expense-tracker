const Transaction = require('../models/Transaction');

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

const getDateMatch = (query) => {
  const dateFilter = {};
  let fromDate;
  let toDate;

  if (query.from) {
    const parsed = parseDateParam(query.from, 'from');
    if (parsed.error) return { error: parsed.error };
    fromDate = parsed.date;
    dateFilter.$gte = fromDate;
  } else if (query.from !== undefined && query.from !== '') {
    return { error: 'from must be a valid date in YYYY-MM-DD format' };
  }

  if (query.to) {
    const parsed = parseDateParam(query.to, 'to');
    if (parsed.error) return { error: parsed.error };
    toDate = parsed.date;
    toDate.setUTCHours(23, 59, 59, 999);
    dateFilter.$lte = toDate;
  } else if (query.to !== undefined && query.to !== '') {
    return { error: 'to must be a valid date in YYYY-MM-DD format' };
  }

  if (fromDate && toDate && fromDate > toDate) {
    return { error: 'from must be on or before to' };
  }

  return { match: Object.keys(dateFilter).length ? { date: dateFilter } : {} };
};

const sendDateError = (res, error) =>
  res.status(400).json({ message: error });

const getSummary = async (req, res, next) => {
  const { match, error } = getDateMatch(req.query);
  if (error) return sendDateError(res, error);

  try {
    const [summary] = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
          },
          totalExpenses: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalIncome: { $round: ['$totalIncome', 2] },
          totalExpenses: { $round: ['$totalExpenses', 2] },
          netBalance: {
            $round: [{ $subtract: ['$totalIncome', '$totalExpenses'] }, 2],
          },
        },
      },
    ]);

    res.status(200).json(summary || { totalIncome: 0, totalExpenses: 0, netBalance: 0 });
  } catch (error) {
    next(error);
  }
};

const getByCategory = async (req, res, next) => {
  const { match, error } = getDateMatch(req.query);
  if (error) return sendDateError(res, error);

  try {
    const categories = await Transaction.aggregate([
      { $match: { ...match, type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1, _id: 1 } },
      { $project: { _id: 0, category: '$_id', total: { $round: ['$total', 2] } } },
    ]);

    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

const getTrend = async (req, res, next) => {
  const { match, error } = getDateMatch(req.query);
  if (error) return sendDateError(res, error);

  const groupBy = req.query.groupBy || 'day';
  if (typeof groupBy !== 'string' || !['day', 'month'].includes(groupBy)) {
    return res.status(400).json({ message: 'groupBy must be either day or month' });
  }

  const dateFormat = groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d';

  try {
    const trend = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$date' } },
          income: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
          },
          expenses: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          income: { $round: ['$income', 2] },
          expenses: { $round: ['$expenses', 2] },
        },
      },
    ]);

    res.status(200).json(trend);
  } catch (error) {
    next(error);
  }
};

module.exports = { getSummary, getByCategory, getTrend };
