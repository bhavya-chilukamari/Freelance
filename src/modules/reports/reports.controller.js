import { ReportsService } from './reports.service.js';
import { sendSuccess } from '../../utils/response.js';

export class ReportsController {
  static async getReports(req, res, next) {
    try {
      const data = await ReportsService.getReports(req.user.id);
      return sendSuccess(res, data, 'Analytics and report data retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

