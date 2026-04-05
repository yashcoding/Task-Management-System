import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../utils/jwt';
import { sendSuccess, sendError, sendCreated } from '../utils/response';
import { RegisterDto, LoginDto } from '../types';

const SALT_ROUNDS = 12;

// ─── POST /auth/register ──────────────────────────────────────────────────────

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body as RegisterDto;

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      sendError(res, 'An account with this email already exists', 409);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    // Issue tokens
    const payload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token in DB
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    sendCreated(res, { user, accessToken, refreshToken }, 'Account created successfully');
  } catch (err) {
    console.error('[register]', err);
    sendError(res, 'Registration failed. Please try again.', 500);
  }
}

// ─── POST /auth/login ─────────────────────────────────────────────────────────

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body as LoginDto;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    // Issue tokens
    const payload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    const { password: _pw, ...safeUser } = user;
    sendSuccess(res, { user: safeUser, accessToken, refreshToken }, 'Login successful');
  } catch (err) {
    console.error('[login]', err);
    sendError(res, 'Login failed. Please try again.', 500);
  }
}

// ─── POST /auth/refresh ───────────────────────────────────────────────────────

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body as { refreshToken: string };

    if (!refreshToken) {
      sendError(res, 'Refresh token is required', 400);
      return;
    }

    // Verify JWT signature & expiry
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      sendError(res, 'Invalid or expired refresh token', 401);
      return;
    }

    // Check if token exists in DB (not yet rotated/logged out)
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { select: { id: true, email: true } } },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      sendError(res, 'Refresh token is invalid or has been revoked', 401);
      return;
    }

    // Token rotation: delete old, issue new pair
    await prisma.refreshToken.delete({ where: { token: refreshToken } });

    const newPayload = { userId: storedToken.user.id, email: storedToken.user.email };
    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: storedToken.userId,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    sendSuccess(res, { accessToken: newAccessToken, refreshToken: newRefreshToken }, 'Tokens refreshed');
  } catch (err) {
    console.error('[refresh]', err);
    sendError(res, 'Token refresh failed', 500);
  }
}

// ─── POST /auth/logout ────────────────────────────────────────────────────────

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body as { refreshToken: string };

    if (refreshToken) {
      // Revoke this specific refresh token
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }

    sendSuccess(res, null, 'Logged out successfully');
  } catch (err) {
    console.error('[logout]', err);
    sendError(res, 'Logout failed', 500);
  }
}

// ─── GET /auth/me ─────────────────────────────────────────────────────────────

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.userId as number;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
    });

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, { user });
  } catch (err) {
    console.error('[getMe]', err);
    sendError(res, 'Failed to fetch user profile', 500);
  }
}
