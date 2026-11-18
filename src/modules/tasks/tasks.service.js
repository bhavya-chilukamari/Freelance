import prisma from '../../config/db.js';

export class TasksService {
  static async getTasks(userId, filters = {}) {
    const { projectId, status, priority, search } = filters;

    const where = {
      userId,
      ...(projectId && projectId !== 'ALL' && { projectId }),
      ...(status && status !== 'ALL' && { status }),
      ...(priority && priority !== 'ALL' && { priority }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    return await prisma.task.findMany({
      where,
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
      include: {
        project: {
          select: {
            id: true,
            title: true,
            client: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        milestone: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  static async getTaskById(userId, taskId) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId },
      include: {
        project: true,
        milestone: true,
      },
    });

    if (!task) {
      throw { statusCode: 404, message: 'Task not found.' };
    }

    return task;
  }

  static async createTask(userId, data) {
    const { projectId, milestoneId, title, description, status, priority, dueDate, estimatedHours, actualHours } = data;

    if (!title || !projectId) {
      throw { statusCode: 400, message: 'Task title and project are required.' };
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw { statusCode: 400, message: 'Invalid project selected or project does not belong to user.' };
    }

    // If milestone provided, verify it belongs to project and user
    if (milestoneId) {
      const milestone = await prisma.milestone.findFirst({
        where: { id: milestoneId, projectId },
        include: { project: true },
      });
      if (!milestone || milestone.project.userId !== userId) {
        throw { statusCode: 400, message: 'Invalid milestone for selected project or milestone does not belong to user.' };
      }
    }

    return await prisma.task.create({
      data: {
        userId,
        projectId,
        milestoneId: milestoneId || null,
        title: title.trim(),
        description: description?.trim() || null,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
        actualHours: actualHours ? parseFloat(actualHours) : null,
      },
      include: {
        project: {
          select: { id: true, title: true },
        },
        milestone: {
          select: { id: true, title: true },
        },
      },
    });
  }

  static async updateTask(userId, taskId, data) {
    const { projectId, milestoneId, title, description, status, priority, dueDate, estimatedHours, actualHours } = data;

    const existing = await prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!existing) {
      throw { statusCode: 404, message: 'Task not found.' };
    }

    // Determine target project
    const targetProjectId = projectId || existing.projectId;

    // 1. If projectId changed, verify new project belongs to authenticated user
    if (projectId && projectId !== existing.projectId) {
      const project = await prisma.project.findFirst({
        where: { id: projectId, userId },
      });
      if (!project) {
        throw { statusCode: 400, message: 'Invalid project selected or project does not belong to user.' };
      }
    }

    // 2. If milestoneId is provided/updated, verify it belongs to targetProjectId and to user
    if (milestoneId) {
      const milestone = await prisma.milestone.findFirst({
        where: { id: milestoneId, projectId: targetProjectId },
        include: { project: true },
      });
      if (!milestone || milestone.project.userId !== userId) {
        throw { statusCode: 400, message: 'Invalid milestone for selected project or milestone does not belong to user.' };
      }
    } else if (projectId && projectId !== existing.projectId && existing.milestoneId && milestoneId === undefined) {
      // If project changed and task was previously linked to a milestone of the old project,
      // verify old milestone is compatible with new project
      const milestone = await prisma.milestone.findFirst({
        where: { id: existing.milestoneId, projectId: targetProjectId },
      });
      if (!milestone) {
        throw { statusCode: 400, message: 'Existing milestone is incompatible with the newly selected project. Please reassign or clear milestone.' };
      }
    }

    return await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(projectId && { projectId }),
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(milestoneId !== undefined && { milestoneId: milestoneId || null }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(estimatedHours !== undefined && { estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null }),
        ...(actualHours !== undefined && { actualHours: actualHours ? parseFloat(actualHours) : null }),
      },
      include: {
        project: {
          select: { id: true, title: true },
        },
        milestone: {
          select: { id: true, title: true },
        },
      },
    });
  }

  static async updateTaskStatus(userId, taskId, status) {
    const existing = await prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!existing) {
      throw { statusCode: 404, message: 'Task not found.' };
    }

    return await prisma.task.update({
      where: { id: taskId },
      data: { status },
      include: {
        project: {
          select: { id: true, title: true },
        },
        milestone: {
          select: { id: true, title: true },
        },
      },
    });
  }

  static async deleteTask(userId, taskId) {
    const existing = await prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!existing) {
      throw { statusCode: 404, message: 'Task not found.' };
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return { message: 'Task deleted successfully.' };
  }
}

