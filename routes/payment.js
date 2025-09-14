const express = require('express');
const {
  createPayment,
  testPaymentGateway
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/create-payment').post(protect, createPayment);
router.route('/test-connection').get(protect, testPaymentGateway);

module.exports = router;