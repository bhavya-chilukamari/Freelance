import prisma from '../../config/db.js';
import { hashPassword, comparePassword } from '../../utils/password.js';

export class UsersService {
  static async updateProfile(userId, data) {
    const {
      fullName,
      businessName,
      professionalTitle,
      hourlyRate,
      currency,
      phone,
      address,
      taxId,
      avatarUrl,
    } = data;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName && { fullName: fullName.trim() }),
        ...(businessName !== undefined && { businessName: businessName?.trim() || null }),
        ...(professionalTitle !== undefined && { professionalTitle: professionalTitle?.trim() || null }),
        ...(hourlyRate !== undefined && { hourlyRate: hourlyRate !== null ? parseFloat(hourlyRate) : 0 }),
        ...(currency && { currency }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
        ...(address !== undefined && { address: address?.trim() || null }),
        ...(taxId !== undefined && { taxId: taxId?.trim() || null }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        businessName: true,
        professionalTitle: true,
        avatarUrl: true,
        hourlyRate: true,
        currency: true,
        phone: true,
        address: true,
        taxId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  static async updatePassword(userId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      throw { statusCode: 400, message: 'Current password and new password are required.' };
    }

    if (newPassword.length < 6) {
      throw { statusCode: 400, message: 'New password must be at least 6 characters long.' };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw { statusCode: 404, message: 'User not found.' };
    }

    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw { statusCode: 400, message: 'Current password does not match.' };
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password updated successfully' };
  }
}

