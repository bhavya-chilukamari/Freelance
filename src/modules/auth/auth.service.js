import prisma from '../../config/db.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { signToken } from '../../utils/jwt.js';

export class AuthService {
  static async register(data) {
    const { email, password, fullName, businessName, professionalTitle, currency } = data;

    if (!email || !password || !fullName) {
      throw { statusCode: 400, message: 'Full name, email, and password are required.' };
    }

    if (password.length < 6) {
      throw { statusCode: 400, message: 'Password must be at least 6 characters long.' };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw { statusCode: 409, message: 'An account with this email already exists.' };
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        fullName: fullName.trim(),
        businessName: businessName?.trim() || null,
        professionalTitle: professionalTitle?.trim() || null,
        currency: currency || 'USD',
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        businessName: true,
        professionalTitle: true,
        hourlyRate: true,
        currency: true,
        createdAt: true,
      },
    });

    const token = signToken({ userId: user.id });

    return { user, token };
  }

  static async login(email, password) {
    if (!email || !password) {
      throw { statusCode: 400, message: 'Email and password are required.' };
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw { statusCode: 401, message: 'Invalid email or password.' };
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw { statusCode: 401, message: 'Invalid email or password.' };
    }

    const token = signToken({ userId: user.id });

    // Exclude passwordHash from returned object
    const { passwordHash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  static async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      },
    });

    if (!user) {
      throw { statusCode: 404, message: 'User not found.' };
    }

    return user;
  }
}

