import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { AppError, asyncHandler } from '../utils/AppError.js';

export const signToken = (user) => jwt.sign({ sub: String(user.id), role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

// Verifies the JWT, then reloads the user so deactivation and role changes apply immediately.
export const authenticate = asyncHandler(async (req, _res, next) => {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) throw new AppError(401, 'Please log in to continue.');
  let payload;
  try { payload = jwt.verify(h.slice(7), env.jwtSecret); } catch { throw new AppError(401, 'Your session has expired. Please log in again.'); }
  const user = await prisma.user.findUnique({ where: { id: Number(payload.sub) } });
  if (!user || !user.active) throw new AppError(401, 'This account is not active.');
  req.user = user; next();
});
export const authorize = (...roles) => (req, _res, next) => (roles.includes(req.user.role) ? next() : next(new AppError(403, 'You do not have permission to do this.')));
