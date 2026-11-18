import prisma from '../../config/db.js';

export class MilestonesService {
  static async getMilestonesByProject(userId, projectId) {
    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw { statusCode: 404, message: 'Project not found.' };
    }

    return await prisma.milestone.findMany({
      where: { projectId },
      orderBy: { orderIndex: 'asc' },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
      },
    });
  }

  static async createMilestone(userId, projectId, data) {
    const { title, description, dueDate, amount, status, orderIndex } = data;

    if (!title) {
      throw { statusCode: 400, message: 'Milestone title is required.' };
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw { statusCode: 404, message: 'Project not found.' };
    }

    return await prisma.milestone.create({
      data: {
        projectId,
        title: title.trim(),
        description: description?.trim() || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        amount: amount ? parseFloat(amount) : 0,
        status: status || 'PENDING',
        orderIndex: orderIndex !== undefined ? parseInt(orderIndex) : 0,
      },
    });
  }

  static async updateMilestone(userId, milestoneId, data) {
    const { title, description, dueDate, amount, status, orderIndex } = data;

    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { project: true },
    });

    if (!milestone || milestone.project.userId !== userId) {
      throw { statusCode: 404, message: 'Milestone not found or unauthorized.' };
    }

    return await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(amount !== undefined && { amount: parseFloat(amount || 0) }),
        ...(status && { status }),
        ...(orderIndex !== undefined && { orderIndex: parseInt(orderIndex) }),
      },
    });
  }

  static async toggleMilestoneStatus(userId, milestoneId) {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { project: true },
    });

    if (!milestone || milestone.project.userId !== userId) {
      throw { statusCode: 404, message: 'Milestone not found or unauthorized.' };
    }

    const nextStatus = milestone.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    return await prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: nextStatus },
    });
  }

  static async deleteMilestone(userId, milestoneId) {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { project: true },
    });

    if (!milestone || milestone.project.userId !== userId) {
      throw { statusCode: 404, message: 'Milestone not found or unauthorized.' };
    }

    await prisma.milestone.delete({
      where: { id: milestoneId },
    });

    return { message: 'Milestone deleted successfully.' };
  }
}

