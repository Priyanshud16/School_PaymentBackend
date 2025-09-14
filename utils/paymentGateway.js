const axios = require('axios');

/**
 * Payment Gateway Utility for Edviron API
 */
class PaymentGateway {
  constructor() {
    this.baseURL = process.env.PAYMENT_BASE_URL;
    this.apiKey = process.env.PAYMENT_API_KEY;
    this.pgKey = process.env.PG_KEY;
    this.schoolId = process.env.SCHOOL_ID;
  }

  /**
   * Create payment collect request using Bearer token authentication
   */
  async createCollectRequest(paymentData) {
    try {
      // Prepare the request payload according to API documentation
      const payload = {
        pg_key: this.pgKey,
        school_id: this.schoolId,
        order_id: paymentData.order_id,
        amount: paymentData.amount,
        student_info: paymentData.student_info,
        // Add any other required fields based on API documentation
        timestamp: new Date().toISOString()
      };

      console.log('Sending payload to payment gateway:', JSON.stringify(payload, null, 2));

      // Make API request to payment gateway with Bearer token authentication
      const response = await axios.post(
        `${this.baseURL}/create-collect-request`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      console.log('Payment gateway response:', JSON.stringify(response.data, null, 2));

      // Process response
      if (!response.data) {
        throw new Error('Empty response from payment gateway');
      }

      // The API might return different response structures
      // Adjust this based on the actual API response format
      return {
        success: true,
        payment_url: response.data.payment_url || response.data.url,
        transaction_id: response.data.transaction_id || response.data.txn_id,
        order_id: response.data.order_id,
        // Include other relevant fields from the response
        ...response.data
      };

    } catch (error) {
      console.error('Payment gateway error details:');
      
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);
        console.error('Response data:', error.response.data);
        
        throw new Error(
          `Payment gateway responded with error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
        );
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Request made but no response received:', error.request);
        throw new Error('No response received from payment gateway. Please check your network connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', error.message);
        throw new Error(`Error setting up payment request: ${error.message}`);
      }
    }
  }

  /**
   * Test function to verify API connection
   */
  async testConnection() {
    try {
      const response = await axios.get(
        `${this.baseURL}/health`, // Adjust endpoint if different
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          },
          timeout: 10000
        }
      );
      
      return {
        connected: true,
        status: response.status,
        data: response.data
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const paymentGateway = new PaymentGateway();

module.exports = paymentGateway;