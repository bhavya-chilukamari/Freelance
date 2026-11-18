import { DashboardService } from './dashboard.service.js';
import { sendSuccess } from '../../utils/response.js';

export class DashboardController {
  static async getDashboard(req, res, next) {
    try {
      const data = await DashboardService.getDashboardData(req.user.id);
      return sendSuccess(res, data, 'Dashboard overview data retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

