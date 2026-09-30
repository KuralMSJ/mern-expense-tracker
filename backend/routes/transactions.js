const express = require('express');
const {
  createTransaction,
  getTransactions,
  exportTransactions,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');
const { validateTransactionInput, validateObjectId } = require('../middleware/validation');

const router = express.Router();

router.post('/', validateTransactionInput, createTransaction);
router.get('/export', exportTransactions);
router.get('/', getTransactions);
router.put('/:id', validateObjectId, validateTransactionInput, updateTransaction);
router.delete('/:id', validateObjectId, deleteTransaction);

module.exports = router;
