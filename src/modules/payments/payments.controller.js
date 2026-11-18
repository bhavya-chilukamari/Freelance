import { PaymentsService } from './payments.service.js';
import { sendSuccess } from '../../utils/response.js';

export class PaymentsController {
  static async getPayments(req, res, next) {
    try {
      const { status, clientId, projectId, search } = req.query;
      const payments = await PaymentsService.getPayments(req.user.id, {
        status,
        clientId,
        projectId,
        search,
      });
      return sendSuccess(res, { payments }, 'Payments retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getPaymentById(req, res, next) {
    try {
      const payment = await PaymentsService.getPaymentById(req.user.id, req.params.id);
      return sendSuccess(res, { payment }, 'Payment retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createPayment(req, res, next) {
    try {
      const payment = await PaymentsService.createPayment(req.user.id, req.body);
      return sendSuccess(res, { payment }, 'Invoice created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updatePayment(req, res, next) {
    try {
      const payment = await PaymentsService.updatePayment(req.user.id, req.params.id, req.body);
      return sendSuccess(res, { payment }, 'Payment updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const payment = await PaymentsService.updatePaymentStatus(req.user.id, req.params.id, status);
      return sendSuccess(res, { payment }, 'Payment status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deletePayment(req, res, next) {
    try {
      const result = await PaymentsService.deletePayment(req.user.id, req.params.id);
      return sendSuccess(res, result, 'Payment deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

