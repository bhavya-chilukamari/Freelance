import { TasksService } from './tasks.service.js';
import { sendSuccess } from '../../utils/response.js';

export class TasksController {
  static async getTasks(req, res, next) {
    try {
      const { projectId, status, priority, search } = req.query;
      const tasks = await TasksService.getTasks(req.user.id, {
        projectId,
        status,
        priority,
        search,
      });
      return sendSuccess(res, { tasks }, 'Tasks retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getTaskById(req, res, next) {
    try {
      const task = await TasksService.getTaskById(req.user.id, req.params.id);
      return sendSuccess(res, { task }, 'Task retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createTask(req, res, next) {
    try {
      const task = await TasksService.createTask(req.user.id, req.body);
      return sendSuccess(res, { task }, 'Task created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateTask(req, res, next) {
    try {
      const task = await TasksService.updateTask(req.user.id, req.params.id, req.body);
      return sendSuccess(res, { task }, 'Task updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const task = await TasksService.updateTaskStatus(req.user.id, req.params.id, status);
      return sendSuccess(res, { task }, 'Task status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteTask(req, res, next) {
    try {
      const result = await TasksService.deleteTask(req.user.id, req.params.id);
      return sendSuccess(res, result, 'Task deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

