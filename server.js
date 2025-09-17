const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load env vars
dotenv.config();
// Ensure critical env vars
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not defined in environment');
  process.exit(1);
}
// Ensure payment env vars
const requiredPaymentVars = ['PAYMENT_BASE_URL', 'PAYMENT_API_KEY', 'PG_KEY', 'SCHOOL_ID'];
for (const key of requiredPaymentVars) {
  if (!process.env[key]) {
    console.error(`FATAL: ${key} is not defined in environment`);
    process.exit(1);
  }
}

// Connect to database
connectDB();

// Route files
const auth = require('./routes/auth');
const payment = require('./routes/payment');
const transactions = require('./routes/transactions');
const webhook = require('./routes/webhook');

// Create Express app
const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/auth', auth);
app.use('/api/payment', payment);
app.use('/api/transactions', transactions);
app.use('/api/webhook', webhook);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'School Payment API is running' });
});

// Handle 404 errors (fixed - removed '*')
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
