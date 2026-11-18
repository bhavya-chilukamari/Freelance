import api from './api';

export const milestoneService = {
  async getMilestones(projectId) {
    const response = await api.get(`/projects/${projectId}/milestones`);
    return response.data;
  },

  async createMilestone(projectId, data) {
    const response = await api.post(`/projects/${projectId}/milestones`, data);
    return response.data;
  },

  async updateMilestone(id, data) {
    const response = await api.put(`/milestones/${id}`, data);
    return response.data;
  },

  async toggleMilestone(id) {
    const response = await api.patch(`/milestones/${id}/toggle`);
    return response.data;
  },

  async deleteMilestone(id) {
    const response = await api.delete(`/milestones/${id}`);
    return response.data;
  },
};

export default milestoneService;

