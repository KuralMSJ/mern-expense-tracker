const express = require('express');
const { getBudgets, upsertBudget, deleteBudget } = require('../controllers/budgetController');
const { validateObjectId } = require('../middleware/validation');

const router = express.Router();

router.get('/', getBudgets);
router.put('/', upsertBudget);
router.delete('/:id', validateObjectId, deleteBudget);

module.exports = router;
