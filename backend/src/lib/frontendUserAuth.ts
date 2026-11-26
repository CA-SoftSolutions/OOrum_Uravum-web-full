import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { prisma } from './prisma';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FrontendUserPayload {
  userId: string;
  email: string;
  name: string;
}

export interface FrontendUserRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  avatarUrl: string | null;
}

export interface FrontendAuthenticatedRequest extends Request {
  frontendUser?: FrontendUserRecord;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set');
  return secret;
}

/**
 * Verifies the Bearer token and resolves it to an active FrontendUser row.
 * Returns null when the token is missing, invalid, expired, or does not belong
 * to an active public-site user (admin tokens are rejected because their
 * userId does not exist in frontend_users).
 */
export async function resolveFrontendUser(
  req: Request,
): Promise<FrontendUserRecord | null> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;

  let decoded: FrontendUserPayload;
  try {
    decoded = jwt.verify(header.slice(7), getSecret(), {
      algorithms: ['HS256'],
    }) as FrontendUserPayload;
  } catch {
    return null;
  }

  if (!decoded?.userId) return null;

  const user = await prisma.frontendUser.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      avatarUrl: true,
      active: true,
    },
  });

  if (!user || !user.active) return null;

  const { active: _active, ...record } = user;
  return record;
}

/**
 * Middleware that requires a valid public-site user token.
 * Attaches the user record to `req.frontendUser`.
 */
export async function requireFrontendUser(
  req: FrontendAuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await resolveFrontendUser(req);
    if (!user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Login is required to perform this action',
        },
      });
      return;
    }
    req.frontendUser = user;
    next();
  } catch (err) {
    console.error('[frontendUserAuth] auth error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Authentication failed' },
    });
  }
}
