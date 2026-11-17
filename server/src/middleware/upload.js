import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
fs.mkdirSync(env.uploadDir, { recursive: true });

export const uploadPhoto = multer({
  storage: multer.diskStorage({ destination: env.uploadDir, filename: (_r, f, cb) => cb(null, crypto.randomUUID() + EXT[f.mimetype]) }), // random name, extension from validated MIME
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_r, f, cb) => (EXT[f.mimetype] ? cb(null, true) : cb(new AppError(400, 'Photo must be a JPG, PNG or WebP image.'))),
}).single('photo');

// The MIME type comes from the client, so also check the file's real signature.
export function verifyImageSignature(file) {
  if (!file) return;
  const b = Buffer.alloc(12); const fd = fs.openSync(file.path, 'r');
  try { fs.readSync(fd, b, 0, 12, 0); } finally { fs.closeSync(fd); }
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ok = (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) || b.subarray(0, 8).equals(png) || (b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP');
  if (!ok) { removeUpload(file.filename); throw new AppError(400, 'That file is not a valid image.'); }
}
export const removeUpload = (name) => name && fs.unlink(path.join(env.uploadDir, path.basename(name)), () => {});
