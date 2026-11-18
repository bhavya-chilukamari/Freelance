import prisma from '../../config/db.js';

export class NotificationsService {
  static async getNotifications(userId) {
    // Automatically evaluate deadline and overdue triggers on fetch
    await this.evaluateTriggers(userId);

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return { notifications, unreadCount };
  }

  static async markAsRead(userId, notificationId) {
    return await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(userId) {
    return await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  static async evaluateTriggers(userId) {
    try {
      const now = new Date();
      const threeDaysAhead = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

      // 1. Check upcoming project deadlines
      const upcomingProjects = await prisma.project.findMany({
        where: {
          userId,
          status: { in: ['PLANNING', 'IN_PROGRESS'] },
          deadline: {
            gte: now,
            lte: threeDaysAhead,
          },
        },
      });

      for (const project of upcomingProjects) {
        const title = `Deadline Approaching: ${project.title}`;
        const existing = await prisma.notification.findFirst({
          where: {
            userId,
            title,
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        });

        if (!existing) {
          const daysLeft = Math.ceil((new Date(project.deadline) - now) / (1000 * 60 * 60 * 24));
          await prisma.notification.create({
            data: {
              userId,
              title,
              message: `Project "${project.title}" is due in ${daysLeft} day${daysLeft > 1 ? 's' : ''}.`,
              type: 'DEADLINE_WARNING',
              linkUrl: `/projects`,
            },
          });
        }
      }

      // 2. Check overdue invoices and mark them OVERDUE
      const overduePayments = await prisma.payment.findMany({
        where: {
          userId,
          status: 'SENT',
          dueDate: { lt: now },
        },
        include: { client: true },
      });

      for (const payment of overduePayments) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'OVERDUE' },
        });

        const title = `Payment Overdue: Invoice ${payment.invoiceNumber}`;
        const existing = await prisma.notification.findFirst({
          where: {
            userId,
            title,
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        });

        if (!existing) {
          await prisma.notification.create({
            data: {
              userId,
              title,
              message: `Invoice ${payment.invoiceNumber} for ${payment.client.name} (${payment.currency} ${payment.amount}) is overdue.`,
              type: 'PAYMENT_DUE',
              linkUrl: `/payments`,
            },
          });
        }
      }

      // 3. Check upcoming task deadlines
      const upcomingTasks = await prisma.task.findMany({
        where: {
          userId,
          status: { not: 'DONE' },
          dueDate: {
            not: null,
            gte: now,
            lte: threeDaysAhead,
          },
        },
        include: {
          project: {
            select: { id: true, title: true },
          },
        },
      });

      for (const task of upcomingTasks) {
        const title = `Task Deadline: ${task.title}`;
        const existing = await prisma.notification.findFirst({
          where: {
            userId,
            title,
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        });

        if (!existing) {
          const daysLeft = Math.ceil((new Date(task.dueDate) - now) / (1000 * 60 * 60 * 24));
          const timeText = daysLeft <= 0 ? 'today' : `in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`;
          const projectName = task.project?.title ? ` for project "${task.project.title}"` : '';
          const formattedDate = new Date(task.dueDate).toLocaleDateString();

          await prisma.notification.create({
            data: {
              userId,
              title,
              message: `Task "${task.title}"${projectName} is due ${timeText} (${formattedDate}).`,
              type: 'DEADLINE_WARNING',
              linkUrl: `/tasks`,
            },
          });
        }
      }
    } catch (err) {
      console.error('Trigger evaluation error:', err);
    }
  }
}

