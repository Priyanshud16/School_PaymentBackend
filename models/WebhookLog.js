const mongoose = require('mongoose');

const webhookLogSchema = new mongoose.Schema({
  payload: {
    type: Object,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  processed: {
    type: Boolean,
    default: false
  },
  error: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WebhookLog', webhookLogSchema);