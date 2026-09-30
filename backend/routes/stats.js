const express = require('express');
const { getSummary, getByCategory, getTrend } = require('../controllers/statsController');

const router = express.Router();

router.get('/summary', getSummary);
router.get('/by-category', getByCategory);
router.get('/trend', getTrend);

module.exports = router;
