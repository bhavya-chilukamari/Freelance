import { NotificationsService } from './notifications.service.js';
import { sendSuccess } from '../../utils/response.js';

export class NotificationsController {
  static async getNotifications(req, res, next) {
    try {
      const data = await NotificationsService.getNotifications(req.user.id);
      return sendSuccess(res, data, 'Notifications retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      await NotificationsService.markAsRead(req.user.id, req.params.id);
      return sendSuccess(res, null, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req, res, next) {
    try {
      await NotificationsService.markAllAsRead(req.user.id);
      return sendSuccess(res, null, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }

  static async checkTriggers(req, res, next) {
    try {
      await NotificationsService.evaluateTriggers(req.user.id);
      return sendSuccess(res, null, 'Triggers evaluated successfully');
    } catch (error) {
      next(error);
    }
  }
}

