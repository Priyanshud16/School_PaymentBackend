const axios = require("axios");
const jwt = require("jsonwebtoken");

class PaymentGateway {
  constructor() {
    this.baseURL = process.env.PAYMENT_BASE_URL;
    this.apiKey = process.env.PAYMENT_API_KEY;
    this.pgKey = process.env.PG_KEY;
    this.schoolId = process.env.SCHOOL_ID;
    this.callbackUrl = process.env.PAYMENT_CALLBACK_URL;
    this.PAYMENT_BASE_URL=process.env.PAYMENT_BASE_URL;
  }

  generateJWT(payload) {
    return jwt.sign(payload, this.apiKey, { algorithm: "HS256" });
  }

  async createCollectRequest(orderId, amount, studentInfo = {}) {
    const payload = {
      pg_key: this.pgKey,
      school_id: this.schoolId,
      order_id: orderId,
      amount,
      callback_url: this.callbackUrl,
      student_info: studentInfo,
      timestamp: new Date().toISOString(),
    };

    const token = this.generateJWT(payload);

    const res = await axios.post(`${this.PAYMENT_BASE_URL}/create-collect-request`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return res.data;
  }
}

// ✅ export instance directly
module.exports = new PaymentGateway();
