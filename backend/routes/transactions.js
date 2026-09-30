const express = require('express');
const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');
const { validateTransactionInput, validateObjectId } = require('../middleware/validation');

const router = express.Router();

router.post('/', validateTransactionInput, createTransaction);
router.get('/', getTransactions);
router.put('/:id', validateObjectId, validateTransactionInput, updateTransaction);
router.delete('/:id', validateObjectId, deleteTransaction);

module.exports = router;
