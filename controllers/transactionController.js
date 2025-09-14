const Order = require('../models/Order');
const OrderStatus = require('../models/OrderStatus');

// Get all transactions with aggregation
exports.getAllTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const sortField = req.query.sort || 'createdAt';
    const sortOrder = req.query.order === 'desc' ? -1 : 1;
    
    const statusFilter = req.query.status ? { status: req.query.status } : {};
    
    const aggregation = Order.aggregate([
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'status_info'
        }
      },
      { $unwind: '$status_info' },
      { $match: { 'status_info.status': statusFilter.status || { $exists: true } } },
      {
        $project: {
          collect_id: '$_id',
          school_id: 1,
          gateway: '$gateway_name',
          order_amount: '$status_info.order_amount',
          transaction_amount: '$status_info.transaction_amount',
          status: '$status_info.status',
          custom_order_id: 1,
          payment_time: '$status_info.payment_time'
        }
      },
      { $sort: { [sortField]: sortOrder } },
      { $skip: skip },
      { $limit: limit }
    ]);
    
    const transactions = await aggregation;
    const total = await OrderStatus.countDocuments(statusFilter);
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: transactions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching transactions' });
  }
};

// Get transactions by school
exports.getTransactionsBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const aggregation = Order.aggregate([
      { $match: { school_id: mongoose.Types.ObjectId(schoolId) } },
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'status_info'
        }
      },
      { $unwind: '$status_info' },
      {
        $project: {
          collect_id: '$_id',
          school_id: 1,
          gateway: '$gateway_name',
          order_amount: '$status_info.order_amount',
          transaction_amount: '$status_info.transaction_amount',
          status: '$status_info.status',
          custom_order_id: 1,
          payment_time: '$status_info.payment_time'
        }
      },
      { $skip: skip },
      { $limit: limit }
    ]);
    
    const transactions = await aggregation;
    const total = await Order.countDocuments({ school_id: schoolId });
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: transactions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching school transactions' });
  }
};

// Check transaction status
exports.checkTransactionStatus = async (req, res) => {
  try {
    const { custom_order_id } = req.params;
    
    const order = await Order.findOne({ custom_order_id });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const orderStatus = await OrderStatus.findOne({ collect_id: order._id });
    
    if (!orderStatus) {
      return res.status(404).json({ message: 'Transaction status not found' });
    }
    
    res.status(200).json({
      success: true,
      data: {
        custom_order_id: order.custom_order_id,
        status: orderStatus.status,
        order_amount: orderStatus.order_amount,
        transaction_amount: orderStatus.transaction_amount,
        payment_time: orderStatus.payment_time
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while checking transaction status' });
  }
};