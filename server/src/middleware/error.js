import multer from 'multer';
import { ZodError } from 'zod';

export const notFound = (_req, res) => res.status(404).json({ message: 'Route not found.' });
// Centralised error handler: never leaks stack traces or internals.
export const errorHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) return res.status(400).json({ message: err.issues[0].message, errors: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })) });
  if (err instanceof multer.MulterError) return res.status(400).json({ message: err.code === 'LIMIT_FILE_SIZE' ? 'Photo must be smaller than 5 MB.' : 'Invalid file upload.' });
  if (err.code === 'P2002') return res.status(409).json({ message: 'That value is already in use.' });
  if (err.code === 'P2025') return res.status(404).json({ message: 'Record not found.' });
  if (err.status) return res.status(err.status).json({ message: err.message });
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on our side. Please try again.' });
};
