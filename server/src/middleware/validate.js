import { removeUpload } from './upload.js';

// validate(schema) parses req.body; validate(schema, 'query') parses req.query into req.q.
export const validate = (schema, where = 'body') => (req, _res, next) => {
  const r = schema.safeParse(where === 'body' ? req.body : req.query);
  if (!r.success) { if (req.file) removeUpload(req.file.filename); return next(r.error); }
  if (where === 'body') req.body = r.data; else req.q = r.data;
  next();
};
