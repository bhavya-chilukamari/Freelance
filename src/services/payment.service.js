import api from './api';

export const paymentService = {
  async getPayments(params = {}) {
    const response = await api.get('/payments', { params });
    return response.data;
  },

  async getPaymentById(id) {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  async createPayment(data) {
    const response = await api.post('/payments', data);
    return response.data;
  },

  async updatePayment(id, data) {
    const response = await api.put(`/payments/${id}`, data);
    return response.data;
  },

  async updateStatus(id, status) {
    const response = await api.patch(`/payments/${id}/status`, { status });
    return response.data;
  },

  async deletePayment(id) {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
  },
};

export default paymentService;

