import { ProjectsService } from './projects.service.js';
import { sendSuccess } from '../../utils/response.js';

export class ProjectsController {
  static async getProjects(req, res, next) {
    try {
      const { status, priority, clientId, search } = req.query;
      const projects = await ProjectsService.getProjects(req.user.id, {
        status,
        priority,
        clientId,
        search,
      });
      return sendSuccess(res, { projects }, 'Projects retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getProjectById(req, res, next) {
    try {
      const project = await ProjectsService.getProjectById(req.user.id, req.params.id);
      return sendSuccess(res, { project }, 'Project retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createProject(req, res, next) {
    try {
      const project = await ProjectsService.createProject(req.user.id, req.body);
      return sendSuccess(res, { project }, 'Project created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateProject(req, res, next) {
    try {
      const project = await ProjectsService.updateProject(req.user.id, req.params.id, req.body);
      return sendSuccess(res, { project }, 'Project updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteProject(req, res, next) {
    try {
      const result = await ProjectsService.deleteProject(req.user.id, req.params.id);
      return sendSuccess(res, result, 'Project deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

