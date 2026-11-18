import api from './api';

export const reportService = {
  async getReports() {
    const response = await api.get('/reports');
    return response.data;
  },
};

export default reportService;

