import { MilestonesService } from './milestones.service.js';
import { sendSuccess } from '../../utils/response.js';

export class MilestonesController {
  static async getByProject(req, res, next) {
    try {
      const milestones = await MilestonesService.getMilestonesByProject(
        req.user.id,
        req.params.projectId
      );
      return sendSuccess(res, { milestones }, 'Milestones retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const milestone = await MilestonesService.createMilestone(
        req.user.id,
        req.params.projectId,
        req.body
      );
      return sendSuccess(res, { milestone }, 'Milestone created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const milestone = await MilestonesService.updateMilestone(
        req.user.id,
        req.params.id,
        req.body
      );
      return sendSuccess(res, { milestone }, 'Milestone updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async toggleStatus(req, res, next) {
    try {
      const milestone = await MilestonesService.toggleMilestoneStatus(req.user.id, req.params.id);
      return sendSuccess(res, { milestone }, 'Milestone status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const result = await MilestonesService.deleteMilestone(req.user.id, req.params.id);
      return sendSuccess(res, result, 'Milestone deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

