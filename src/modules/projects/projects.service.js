import prisma from '../../config/db.js';

export class ProjectsService {
  static async getProjects(userId, filters = {}) {
    const { status, priority, clientId, search } = filters;

    const where = {
      userId,
      ...(status && status !== 'ALL' && { status }),
      ...(priority && priority !== 'ALL' && { priority }),
      ...(clientId && clientId !== 'ALL' && { clientId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
        milestones: {
          select: {
            id: true,
            status: true,
          },
        },
        tasks: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    // Compute progress percentage dynamically
    return projects.map((project) => {
      let progress = 0;
      const totalMilestones = project.milestones.length;

      if (totalMilestones > 0) {
        const completedMilestones = project.milestones.filter(
          (m) => m.status === 'COMPLETED'
        ).length;
        progress = Math.round((completedMilestones / totalMilestones) * 100);
      } else {
        const totalTasks = project.tasks.length;
        if (totalTasks > 0) {
          const completedTasks = project.tasks.filter((t) => t.status === 'DONE').length;
          progress = Math.round((completedTasks / totalTasks) * 100);
        } else if (project.status === 'COMPLETED') {
          progress = 100;
        }
      }

      return {
        ...project,
        progress,
        taskCount: project.tasks.length,
        milestoneCount: project.milestones.length,
      };
    });
  }

  static async getProjectById(userId, projectId) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
      include: {
        client: true,
        milestones: {
          orderBy: { orderIndex: 'asc' },
          include: {
            tasks: true,
          },
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
        payments: {
          orderBy: { issueDate: 'desc' },
        },
      },
    });

    if (!project) {
      throw { statusCode: 404, message: 'Project not found.' };
    }

    // Dynamic progress computation
    let progress = 0;
    const totalMilestones = project.milestones.length;
    if (totalMilestones > 0) {
      const completedMilestones = project.milestones.filter(
        (m) => m.status === 'COMPLETED'
      ).length;
      progress = Math.round((completedMilestones / totalMilestones) * 100);
    } else {
      const totalTasks = project.tasks.length;
      if (totalTasks > 0) {
        const completedTasks = project.tasks.filter((t) => t.status === 'DONE').length;
        progress = Math.round((completedTasks / totalTasks) * 100);
      } else if (project.status === 'COMPLETED') {
        progress = 100;
      }
    }

    return {
      ...project,
      progress,
    };
  }

  static async createProject(userId, data) {
    const { title, description, clientId, status, priority, budget, currency, startDate, deadline } = data;

    if (!title || !clientId) {
      throw { statusCode: 400, message: 'Project title and client selection are required.' };
    }

    // Verify client belongs to this freelancer
    const client = await prisma.client.findFirst({
      where: { id: clientId, userId },
    });

    if (!client) {
      throw { statusCode: 400, message: 'Invalid client selected.' };
    }

    const project = await prisma.project.create({
      data: {
        userId,
        clientId,
        title: title.trim(),
        description: description?.trim() || null,
        status: status || 'PLANNING',
        priority: priority || 'MEDIUM',
        budget: budget ? parseFloat(budget) : 0,
        currency: currency || client.currency || 'USD',
        startDate: startDate ? new Date(startDate) : null,
        deadline: deadline ? new Date(deadline) : null,
      },
      include: {
        client: true,
      },
    });

    return project;
  }

  static async updateProject(userId, projectId, data) {
    const { title, description, clientId, status, priority, budget, currency, startDate, deadline, completedAt } = data;

    const existing = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!existing) {
      throw { statusCode: 404, message: 'Project not found.' };
    }

    if (clientId && clientId !== existing.clientId) {
      const client = await prisma.client.findFirst({
        where: { id: clientId, userId },
      });
      if (!client) {
        throw { statusCode: 400, message: 'Invalid client selected.' };
      }
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(clientId && { clientId }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(budget !== undefined && { budget: parseFloat(budget || 0) }),
        ...(currency && { currency }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
        ...(completedAt !== undefined && { completedAt: completedAt ? new Date(completedAt) : null }),
      },
      include: {
        client: true,
      },
    });

    return updated;
  }

  static async deleteProject(userId, projectId) {
    const existing = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!existing) {
      throw { statusCode: 404, message: 'Project not found.' };
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return { message: 'Project deleted successfully.' };
  }
}

