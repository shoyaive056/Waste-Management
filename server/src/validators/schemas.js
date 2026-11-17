import { z } from 'zod';
import { STATUS_LABELS } from '../utils/enums.js';

// Strip angle brackets from free text so stored values can never carry markup.
const text = (min, max, msg) => z.string().trim().min(min, msg || `Use at least ${min} characters`).max(max).transform((s) => s.replace(/[<>]/g, ''));
const phone = z.string().trim().regex(/^[+\d][\d\s-]{6,19}$/, 'Enter a valid phone number');

export const registerSchema = z.object({
  name: text(2, 80), email: z.string().trim().toLowerCase().email('Enter a valid email address'), phone, address: text(5, 200),
  password: z.string().min(8, 'Use at least 8 characters').max(72).regex(/[A-Z]/, 'Add an uppercase letter').regex(/[a-z]/, 'Add a lowercase letter').regex(/\d/, 'Add a number').regex(/[^\w\s]/, 'Add a symbol'),
});
export const loginSchema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) });
export const profileSchema = z.object({ name: text(2, 80), phone, address: text(3, 200) });

export const complaintCreateSchema = z.object({
  title: text(5, 100), description: text(20, 2000), categoryId: z.coerce.number().int().positive(), severity: z.enum(['low', 'medium', 'high']),
  address: text(5, 200), contact: text(7, 30), latitude: z.coerce.number().min(-90).max(90), longitude: z.coerce.number().min(-180).max(180),
});
export const complaintUpdateSchema = z.object({ title: text(5, 100).optional(), description: text(20, 2000).optional(), address: text(5, 200).optional(), contact: text(7, 30).optional() });
export const statusSchema = z.object({ status: z.enum(STATUS_LABELS), remarks: text(0, 500).optional() });
export const prioritySchema = z.object({ priority: z.enum(['High', 'Medium', 'Low']) });
export const assignSchema = z.object({ teamId: z.coerce.number().int().positive(), remarks: text(0, 500).optional() });
export const noteSchema = z.object({ text: text(1, 1000) });
export const teamSchema = z.object({ name: text(3, 80), leader: text(2, 80), phone, email: z.string().trim().toLowerCase().email(), area: text(2, 120), available: z.boolean().optional() });
export const categorySchema = z.object({ name: text(2, 60) });

export const listQuerySchema = z.object({
  q: z.string().trim().max(100).optional(), status: z.enum(STATUS_LABELS).optional().or(z.literal('')),
  statusIn: z.string().optional(), priority: z.enum(['High', 'Medium', 'Low']).optional().or(z.literal('')),
  categoryId: z.coerce.number().int().optional().or(z.literal('')), teamId: z.coerce.number().int().optional().or(z.literal('')),
  location: z.string().trim().max(100).optional(), from: z.string().optional(), to: z.string().optional(),
  sort: z.enum(['newest', 'oldest', 'priority']).default('newest'),
  page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(10000).default(10),
});
export const rangeSchema = z.object({ from: z.string().optional(), to: z.string().optional() });
