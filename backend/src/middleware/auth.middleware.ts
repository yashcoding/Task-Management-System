import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Access token is required', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.name === 'TokenExpiredError') {
        sendError(res, 'Access token has expired', 401, 'TOKEN_EXPIRED');
        return;
      }
      if (err.name === 'JsonWebTokenError') {
        sendError(res, 'Invalid access token', 401, 'TOKEN_INVALID');
        return;
      }
    }
    sendError(res, 'Authentication failed', 401);
  }
}
