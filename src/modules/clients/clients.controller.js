import { ClientsService } from './clients.service.js';
import { sendSuccess } from '../../utils/response.js';

export class ClientsController {
  static async getClients(req, res, next) {
    try {
      const { search, status } = req.query;
      const clients = await ClientsService.getClients(req.user.id, { search, status });
      return sendSuccess(res, { clients }, 'Clients retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getClientById(req, res, next) {
    try {
      const client = await ClientsService.getClientById(req.user.id, req.params.id);
      return sendSuccess(res, { client }, 'Client details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createClient(req, res, next) {
    try {
      const client = await ClientsService.createClient(req.user.id, req.body);
      return sendSuccess(res, { client }, 'Client created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateClient(req, res, next) {
    try {
      const client = await ClientsService.updateClient(req.user.id, req.params.id, req.body);
      return sendSuccess(res, { client }, 'Client updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteClient(req, res, next) {
    try {
      const result = await ClientsService.deleteClient(req.user.id, req.params.id);
      return sendSuccess(res, result, 'Client deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

