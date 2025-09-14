const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  school_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'School'
  },
  trustee_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  student_info: {
    name: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  gateway_name: {
    type: String,
    required: true
  },
  custom_order_id: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Generate custom order ID before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.custom_order_id) {
    const count = await mongoose.model('Order').countDocuments();
    this.custom_order_id = `ORD${Date.now()}${count}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);