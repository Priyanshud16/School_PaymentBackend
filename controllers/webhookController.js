const paymentGateway = require('../utils/paymentGateway');

// Handle webhook
exports.handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-payment-signature'];
    const webhookData = req.body;

    // Verify signature (optional based on payment gateway requirements)
    if (signature && !paymentGateway.verifyWebhookSignature(webhookData, signature)) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    // Process webhook data
    const processedData = paymentGateway.processWebhook(webhookData);

    // Update database
    const order = await Order.findOne({ custom_order_id: processedData.order_id });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await OrderStatus.findOneAndUpdate(
      { collect_id: order._id },
      {
        order_amount: processedData.order_amount,
        transaction_amount: processedData.transaction_amount,
        payment_mode: processedData.payment_mode,
        bank_reference: processedData.bank_reference,
        payment_message: processedData.payment_message,
        status: processedData.status,
        error_message: processedData.error_message,
        payment_time: processedData.payment_time
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ message: error.message });
  }
};