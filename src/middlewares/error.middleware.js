import { sendError } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  // 1. Prisma unique constraint violation (409 Conflict)
  if (err.code === 'P2002') {
    const fields = err.meta?.target
      ? (Array.isArray(err.meta.target) ? err.meta.target.join(', ') : err.meta.target)
      : 'field';
    return sendError(res, `A record with this ${fields} already exists.`, 409);
  }

  // 2. Prisma foreign key constraint violation (400 Bad Request)
  if (err.code === 'P2003') {
    return sendError(
      res,
      'Cannot complete operation due to an associated record restriction. The referenced record does not exist or has related dependencies.',
      400
    );
  }

  // 3. Prisma record not found (404 Not Found)
  if (err.code === 'P2025') {
    return sendError(res, 'Requested resource was not found.', 404);
  }

  // 4. JWT authentication errors (401 Unauthorized)
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid authentication token.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Authentication token has expired. Please log in again.', 401);
  }

  const statusCode = err.statusCode || 500;

  // Log only unexpected server errors and HTTP 500-level errors (avoid logging ordinary 4xx validation errors)
  if (statusCode >= 500) {
    console.error('Unhandled Server Error:', err);
  }

  const isProd = process.env.NODE_ENV === 'production';
  const message = statusCode >= 500 && isProd
    ? 'Internal Server Error'
    : (err.message || 'Internal Server Error');

  const errorDetails = !isProd && err.stack ? err.stack : null;

  return sendError(res, message, statusCode, errorDetails);
};

