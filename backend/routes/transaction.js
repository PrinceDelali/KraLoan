const express = require('express');
const router = express.Router();
const { createTransaction, listTransactions, getGroupTransactions, getAllGroupTransactions } = require('../controllers/transactionController');
const auth = require('../middleware/authMiddleware');

// Create a transaction (contribution or withdrawal)
router.post('/', auth, createTransaction);
// List user's transactions
router.get('/', auth, listTransactions);
// Get transactions for a specific group
router.get('/group/:groupId', auth, getGroupTransactions);
// Get all transactions for a specific group (for admin/group view)
router.get('/group/:groupId/all', auth, getAllGroupTransactions);

module.exports = router;
