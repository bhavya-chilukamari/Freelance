import { UsersService } from './users.service.js';
import { sendSuccess } from '../../utils/response.js';

export class UsersController {
  static async updateProfile(req, res, next) {
    try {
      const updatedUser = await UsersService.updateProfile(req.user.id, req.body);
      return sendSuccess(res, { user: updatedUser }, 'Profile updated successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async updatePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await UsersService.updatePassword(req.user.id, currentPassword, newPassword);
      return sendSuccess(res, result, 'Password updated successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}

