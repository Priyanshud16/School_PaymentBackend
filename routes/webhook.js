const express = require('express');
const { handleWebhook } = require('../controllers/webhookController');

const router = express.Router();

router.route('/').post(handleWebhook);

module.exports = router;