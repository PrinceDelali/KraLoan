const express = require('express');
const router = express.Router();
const { createTransaction, listTransactions } = require('../controllers/transactionController');
const auth = require('../middleware/authMiddleware');

// Create a transaction (contribution or withdrawal)
router.post('/', auth, createTransaction);
// List user's transactions
router.get('/', auth, listTransactions);

module.exports = router;
