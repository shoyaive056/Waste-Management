import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { signToken } from '../middleware/auth.js';
import { AppError, asyncHandler } from '../utils/AppError.js';
import { userOut } from '../utils/serialize.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, address, password } = req.body;
  if (await prisma.user.findUnique({ where: { email } })) throw new AppError(409, 'An account with this email already exists.');
  const user = await prisma.user.create({ data: { name, email, phone, address, passwordHash: await bcrypt.hash(password, 12), role: 'citizen' } });
  res.status(201).json({ token: signToken(user), user: userOut(user) });
});

export const login = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { email: req.body.email } });
  // Same message for unknown email and wrong password to avoid revealing which accounts exist.
  if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) throw new AppError(401, 'Incorrect email or password.');
  if (!user.active) throw new AppError(403, 'This account is deactivated. Contact an administrator.');
  res.json({ token: signToken(user), user: userOut(user) });
});

export const logout = (_req, res) => res.json({ message: 'Logged out. Discard the token on the client.' }); // JWT is stateless
export const me = (req, res) => res.json({ user: userOut(req.user) });
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.update({ where: { id: req.user.id }, data: req.body });
  res.json({ user: userOut(user) });
});
