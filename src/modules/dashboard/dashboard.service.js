import prisma from '../../config/db.js';

export class DashboardService {
  static async getDashboardData(userId) {
    const now = new Date();
    const sevenDaysAhead = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [
      totalClients,
      projects,
      tasks,
      payments,
      upcomingProjects,
      upcomingTasks,
      recentPayments,
    ] = await Promise.all([
      // Total Clients
      prisma.client.count({ where: { userId } }),

      // All Projects for stats
      prisma.project.findMany({
        where: { userId },
        select: { id: true, status: true, budget: true, title: true, client: { select: { name: true } } },
      }),

      // All Tasks for stats
      prisma.task.findMany({
        where: { userId },
        select: { id: true, status: true, priority: true },
      }),

      // All Payments for financial KPIs
      prisma.payment.findMany({
        where: { userId },
        select: { id: true, status: true, amount: true, currency: true },
      }),

      // Upcoming Project Deadlines (next 7 days)
      prisma.project.findMany({
        where: {
          userId,
          status: { in: ['PLANNING', 'IN_PROGRESS'] },
          deadline: {
            gte: now,
            lte: sevenDaysAhead,
          },
        },
        orderBy: { deadline: 'asc' },
        take: 5,
        include: {
          client: { select: { name: true } },
        },
      }),

      // Upcoming Task Deadlines (next 7 days)
      prisma.task.findMany({
        where: {
          userId,
          status: { not: 'DONE' },
          dueDate: {
            gte: now,
            lte: sevenDaysAhead,
          },
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
        include: {
          project: { select: { title: true } },
        },
      }),

      // Recent Payments
      prisma.payment.findMany({
        where: { userId },
        orderBy: { issueDate: 'desc' },
        take: 5,
        include: {
          client: { select: { name: true } },
        },
      }),
    ]);

    // Financial calculations
    const totalCollected = payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    const pendingReceivables = payments
      .filter((p) => p.status === 'SENT')
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    const overdueBalance = payments
      .filter((p) => p.status === 'OVERDUE')
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    // Project counts
    const activeProjectsCount = projects.filter((p) => p.status === 'IN_PROGRESS').length;
    const completedProjectsCount = projects.filter((p) => p.status === 'COMPLETED').length;

    // Task counts
    const pendingTasksCount = tasks.filter((t) => t.status !== 'DONE').length;
    const inProgressTasksCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;

    return {
      metrics: {
        totalCollected,
        pendingReceivables,
        overdueBalance,
        totalClients,
        totalProjects: projects.length,
        activeProjects: activeProjectsCount,
        completedProjects: completedProjectsCount,
        totalTasks: tasks.length,
        pendingTasks: pendingTasksCount,
        inProgressTasks: inProgressTasksCount,
      },
      upcomingDeadlines: {
        projects: upcomingProjects,
        tasks: upcomingTasks,
      },
      recentPayments,
      recentProjects: projects.slice(0, 5),
    };
  }
}

