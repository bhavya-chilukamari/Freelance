import prisma from '../../config/db.js';

export class ClientsService {
  static async getClients(userId, filters = {}) {
    const { search, status } = filters;

    const where = {
      userId,
      ...(status && status !== 'ALL' && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const clients = await prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            projects: true,
            payments: true,
          },
        },
        payments: {
          where: { status: 'PAID' },
          select: { amount: true },
        },
      },
    });

    // Compute total revenue generated per client
    return clients.map((client) => {
      const totalRevenue = client.payments.reduce(
        (sum, p) => sum + parseFloat(p.amount || 0),
        0
      );
      const { payments, ...rest } = client;
      return {
        ...rest,
        totalRevenue,
      };
    });
  }

  static async getClientById(userId, clientId) {
    const client = await prisma.client.findFirst({
      where: { id: clientId, userId },
      include: {
        projects: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { tasks: true, milestones: true },
            },
          },
        },
        payments: {
          orderBy: { issueDate: 'desc' },
        },
      },
    });

    if (!client) {
      throw { statusCode: 404, message: 'Client not found.' };
    }

    return client;
  }

  static async createClient(userId, data) {
    const { name, email, company, phone, address, status, notes } = data;

    if (!name || !email) {
      throw { statusCode: 400, message: 'Client name and email are required.' };
    }

    const client = await prisma.client.create({
      data: {
        userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        company: company?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        status: status || 'ACTIVE',
        notes: notes?.trim() || null,
      },
    });

    return client;
  }

  static async updateClient(userId, clientId, data) {
    const { name, email, company, phone, address, status, notes } = data;

    // Verify ownership
    const existing = await prisma.client.findFirst({
      where: { id: clientId, userId },
    });

    if (!existing) {
      throw { statusCode: 404, message: 'Client not found or unauthorized.' };
    }

    const updated = await prisma.client.update({
      where: { id: clientId },
      data: {
        ...(name && { name: name.trim() }),
        ...(email && { email: email.toLowerCase().trim() }),
        ...(company !== undefined && { company: company?.trim() || null }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
        ...(address !== undefined && { address: address?.trim() || null }),
        ...(status && { status }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
      },
    });

    return updated;
  }

  static async deleteClient(userId, clientId) {
    const existing = await prisma.client.findFirst({
      where: { id: clientId, userId },
      include: {
        _count: {
          select: {
            projects: true,
            payments: true,
          },
        },
      },
    });

    if (!existing) {
      throw { statusCode: 404, message: 'Client not found.' };
    }

    const projectCount = existing._count?.projects || 0;
    const paymentCount = existing._count?.payments || 0;

    if (projectCount > 0 && paymentCount > 0) {
      throw {
        statusCode: 400,
        message: 'Cannot delete client with associated projects and payments. Please delete or reassign associated records first.',
      };
    }

    if (projectCount > 0) {
      throw {
        statusCode: 400,
        message: 'Cannot delete client with associated projects. Please delete or reassign associated projects first.',
      };
    }

    if (paymentCount > 0) {
      throw {
        statusCode: 400,
        message: 'Cannot delete client with associated payments. Please delete or reassign associated records first.',
      };
    }

    await prisma.client.delete({
      where: { id: clientId },
    });

    return { message: 'Client deleted successfully.' };
  }
}

