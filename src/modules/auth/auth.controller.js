import { AuthService } from './auth.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      const { email, password, fullName, businessName, professionalTitle, currency } = req.body;
      const result = await AuthService.register({
        email,
        password,
        fullName,
        businessName,
        professionalTitle,
        currency,
      });

      return sendSuccess(res, result, 'Registration successful', 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      return sendSuccess(res, result, 'Login successful', 200);
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req, res, next) {
    try {
      const user = await AuthService.getMe(req.user.id);
      return sendSuccess(res, { user }, 'User profile retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}

