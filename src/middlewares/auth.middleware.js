import { verifyToken } from '../utils/jwt.js';
import prisma from '../config/db.js';
import { sendError } from '../utils/response.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authentication required. No token provided.', 401);
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return sendError(res, 'Invalid authorization format. Expected "Bearer <token>".', 401);
  }

  // 1. Verify and decode JWT token
  let decoded;
  try {
    decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return sendError(res, 'Invalid or corrupted token.', 401);
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Session expired. Please log in again.', 401);
    }
    return sendError(res, 'Invalid authentication token.', 401);
  }

  // 2. Fetch authenticated user from database
  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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
      return sendError(res, 'User account associated with this token no longer exists.', 401);
    }

    req.user = user;
    next();
  } catch (dbError) {
    // Forward database and infrastructure errors to central error middleware
    next(dbError);
  }
};

