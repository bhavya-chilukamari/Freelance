import prisma from '../../config/db.js';

export class PaymentsService {
  static async getPayments(userId, filters = {}) {
    const { status, clientId, projectId, search } = filters;

    const where = {
      userId,
      ...(status && status !== 'ALL' && { status }),
      ...(clientId && clientId !== 'ALL' && { clientId }),
      ...(projectId && projectId !== 'ALL' && { projectId }),
      ...(search && {
        OR: [
          { invoiceNumber: { contains: search, mode: 'insensitive' } },
          { title: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    return await prisma.payment.findMany({
      where,
      orderBy: { issueDate: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
            address: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  static async getPaymentById(userId, paymentId) {
    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, userId },
      include: {
        client: true,
        project: true,
        user: {
          select: {
            fullName: true,
            businessName: true,
            email: true,
            phone: true,
            address: true,
            taxId: true,
          },
        },
      },
    });

    if (!payment) {
      throw { statusCode: 404, message: 'Invoice / payment record not found.' };
    }

    return payment;
  }

  static async createPayment(userId, data) {
    const {
      clientId,
      projectId,
      invoiceNumber,
      title,
      amount,
      currency,
      status,
      paymentMethod,
      issueDate,
      dueDate,
      notes,
    } = data;

    if (!clientId || !title || !amount || !dueDate) {
      throw {
        statusCode: 400,
        message: 'Client, invoice title, amount, and due date are required.',
      };
    }

    // Verify client belongs to authenticated user
    const client = await prisma.client.findFirst({
      where: { id: clientId, userId },
    });
    if (!client) {
      throw { statusCode: 400, message: 'Invalid client selected or client does not belong to user.' };
    }

    // If projectId provided, verify it belongs to user AND is associated with this client
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: { id: projectId, userId },
      });
      if (!project) {
        throw { statusCode: 400, message: 'Invalid project selected or project does not belong to user.' };
      }
      if (project.clientId !== clientId) {
        throw { statusCode: 400, message: 'Selected project does not belong to the selected client.' };
      }
    }

    // Generate automatic invoice number if not provided
    let finalInvoiceNumber = invoiceNumber?.trim();
    if (!finalInvoiceNumber) {
      const paymentCount = await prisma.payment.count({ where: { userId } });
      finalInvoiceNumber = `INV-${String(paymentCount + 1).padStart(4, '0')}`;
    }

    // Verify invoice number uniqueness for this user
    const existing = await prisma.payment.findFirst({
      where: { userId, invoiceNumber: finalInvoiceNumber },
    });
    if (existing) {
      throw {
        statusCode: 409,
        message: `Invoice number "${finalInvoiceNumber}" is already in use. Please provide a unique invoice number.`,
      };
    }

    const payment = await prisma.payment.create({
      data: {
        userId,
        clientId,
        projectId: projectId || null,
        invoiceNumber: finalInvoiceNumber,
        title: title.trim(),
        amount: parseFloat(amount),
        currency: currency || client.currency || 'USD',
        status: status || 'DRAFT',
        paymentMethod: paymentMethod || 'BANK_TRANSFER',
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        dueDate: new Date(dueDate),
        paidAt: status === 'PAID' ? new Date() : null,
        notes: notes?.trim() || null,
      },
      include: {
        client: true,
        project: true,
      },
    });

    return payment;
  }

  static async updatePayment(userId, paymentId, data) {
    const {
      clientId,
      projectId,
      invoiceNumber,
      title,
      amount,
      currency,
      status,
      paymentMethod,
      issueDate,
      dueDate,
      paidAt,
      notes,
    } = data;

    const existing = await prisma.payment.findFirst({
      where: { id: paymentId, userId },
    });

    if (!existing) {
      throw { statusCode: 404, message: 'Payment record not found.' };
    }

    // Determine target client and project
    const targetClientId = clientId || existing.clientId;
    const targetProjectId = projectId !== undefined ? (projectId || null) : existing.projectId;

    // 1. If clientId is changed, verify new client belongs to authenticated user
    if (clientId && clientId !== existing.clientId) {
      const client = await prisma.client.findFirst({
        where: { id: clientId, userId },
      });
      if (!client) {
        throw { statusCode: 400, message: 'Invalid client selected or client does not belong to user.' };
      }
    }

    // 2. If targetProjectId is present, verify it belongs to user AND is associated with targetClientId
    if (targetProjectId) {
      const project = await prisma.project.findFirst({
        where: { id: targetProjectId, userId },
      });
      if (!project) {
        throw { statusCode: 400, message: 'Invalid project selected or project does not belong to user.' };
      }
      if (project.clientId !== targetClientId) {
        throw { statusCode: 400, message: 'Selected project does not belong to the selected client.' };
      }
    }

    // 3. If invoiceNumber changed, verify uniqueness for this user
    if (invoiceNumber && invoiceNumber.trim() !== existing.invoiceNumber) {
      const duplicate = await prisma.payment.findFirst({
        where: {
          userId,
          invoiceNumber: invoiceNumber.trim(),
          id: { not: paymentId },
        },
      });
      if (duplicate) {
        throw {
          statusCode: 409,
          message: `Invoice number "${invoiceNumber.trim()}" is already in use.`,
        };
      }
    }

    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        ...(clientId && { clientId }),
        ...(projectId !== undefined && { projectId: projectId || null }),
        ...(invoiceNumber && { invoiceNumber: invoiceNumber.trim() }),
        ...(title && { title: title.trim() }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(currency && { currency }),
        ...(status && {
          status,
          paidAt: status === 'PAID' && !existing.paidAt ? new Date() : existing.paidAt,
        }),
        ...(paymentMethod && { paymentMethod }),
        ...(issueDate && { issueDate: new Date(issueDate) }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(paidAt !== undefined && { paidAt: paidAt ? new Date(paidAt) : null }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
      },
      include: {
        client: true,
        project: true,
      },
    });

    return updated;
  }

  static async updatePaymentStatus(userId, paymentId, status) {
    const existing = await prisma.payment.findFirst({
      where: { id: paymentId, userId },
    });

    if (!existing) {
      throw { statusCode: 404, message: 'Payment record not found.' };
    }

    return await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        paidAt: status === 'PAID' ? new Date() : null,
      },
    });
  }

  static async deletePayment(userId, paymentId) {
    const existing = await prisma.payment.findFirst({
      where: { id: paymentId, userId },
    });

    if (!existing) {
      throw { statusCode: 404, message: 'Payment record not found.' };
    }

    await prisma.payment.delete({
      where: { id: paymentId },
    });

    return { message: 'Invoice / payment deleted successfully.' };
  }
}

