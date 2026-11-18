import prisma from '../../config/db.js';

export class ReportsService {
  static async getReports(userId) {
    const [payments, projects, clients] = await Promise.all([
      // All paid payments
      prisma.payment.findMany({
        where: { userId },
        include: {
          client: { select: { id: true, name: true, company: true } },
        },
      }),

      // All projects
      prisma.project.findMany({
        where: { userId },
        select: { id: true, status: true, budget: true, title: true },
      }),

      // All clients
      prisma.client.findMany({
        where: { userId },
        select: { id: true, name: true, company: true },
      }),
    ]);

    // 1. Monthly Revenue Trends (Past 6 Months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = {};

    // Initialize past 6 calendar months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthlyMap[key] = { month: key, revenue: 0, invoices: 0 };
    }

    payments.forEach((p) => {
      if (p.status === 'PAID' && p.paidAt) {
        const d = new Date(p.paidAt);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        if (monthlyMap[key]) {
          monthlyMap[key].revenue += parseFloat(p.amount || 0);
          monthlyMap[key].invoices += 1;
        }
      }
    });

    const revenueTrends = Object.values(monthlyMap);

    // 2. Project Status Distribution
    const statusCounts = {
      PLANNING: 0,
      IN_PROGRESS: 0,
      ON_HOLD: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    projects.forEach((p) => {
      if (statusCounts[p.status] !== undefined) {
        statusCounts[p.status] += 1;
      }
    });

    const projectDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace('_', ' '),
      count,
    }));

    // 3. Client Revenue Breakdown (Top 5 clients)
    const clientRevenueMap = {};
    clients.forEach((c) => {
      clientRevenueMap[c.id] = {
        name: c.name,
        company: c.company || 'Direct',
        totalRevenue: 0,
      };
    });

    payments.forEach((p) => {
      if (p.status === 'PAID' && clientRevenueMap[p.clientId]) {
        clientRevenueMap[p.clientId].totalRevenue += parseFloat(p.amount || 0);
      }
    });

    const topClients = Object.values(clientRevenueMap)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    // 4. Executive Metrics
    const totalEarnings = payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    const avgProjectBudget =
      projects.length > 0
        ? Math.round(
            projects.reduce((sum, p) => sum + parseFloat(p.budget || 0), 0) / projects.length
          )
        : 0;

    return {
      revenueTrends,
      projectDistribution,
      topClients,
      summary: {
        totalEarnings,
        avgProjectBudget,
        totalProjects: projects.length,
        totalClients: clients.length,
      },
    };
  }
}

