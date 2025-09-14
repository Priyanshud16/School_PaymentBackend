const express = require('express');
const { 
  getAllTransactions, 
  getTransactionsBySchool, 
  checkTransactionStatus 
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getAllTransactions);
router.route('/school/:schoolId').get(protect, getTransactionsBySchool);
router.route('/status/:custom_order_id').get(protect, checkTransactionStatus);

module.exports = router;