const Order = require('../models/Order');
const OrderStatus = require('../models/OrderStatus');
const paymentGateway = require('../utils/paymentGateway');

// Create payment and redirect to payment page
exports.createPayment = async (req, res) => {
  try {
    const { school_id, trustee_id, student_info, gateway_name, order_amount } = req.body;
    
    // Validate required fields
    if (!school_id || !student_info || !order_amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: school_id, student_info, or order_amount'
      });
    }

    // Create order
    const order = await Order.create({
      school_id,
      trustee_id,
      student_info,
      gateway_name
    });

    // Create order status (seed with pending values until webhook updates)
    const orderStatus = await OrderStatus.create({
      collect_id: order._id,
      order_amount,
      transaction_amount: order_amount,
      status: 'pending',
      payment_mode: 'pending',
      payment_message: 'initiated'
    });

    // Prepare payment data for gateway
    const paymentData = {
      order_id: order.custom_order_id,
      amount: order_amount,
      student_info: {
        name: student_info.name,
        email: student_info.email,
        id: student_info.id
      }
    };

    // Call payment gateway
    const paymentResponse = await paymentGateway.createCollectRequest(paymentData);

    // Return payment URL to redirect user
    res.status(200).json({
      success: true,
      message: 'Payment initiated successfully',
      data: {
        payment_url: paymentResponse.payment_url,
        order_id: order.custom_order_id,
        transaction_id: paymentResponse.transaction_id
      }
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    
    // Specific error handling
    if (error.message.includes('401') || error.message.includes('403')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Please check your API credentials.'
      });
    }
    
    if (error.message.includes('network')) {
      return res.status(503).json({
        success: false,
        message: 'Payment service temporarily unavailable. Please try again later.'
      });
    }

    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error while creating payment'
    });
  }
};

// Test payment gateway connection
exports.testPaymentGateway = async (req, res) => {
  try {
    const connectionTest = await paymentGateway.testConnection();
    
    res.status(200).json({
      success: connectionTest.connected,
      message: connectionTest.connected ? 
        'Payment gateway connection successful' : 
        'Payment gateway connection failed',
      data: connectionTest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error testing payment gateway connection',
      error: error.message
    });
  }
};