import { Request, Response, NextFunction } from 'express';

const sanitizeValue = (value: any): any => {
  if (typeof value === 'string') {
    return value.replace(/[\$\{\}]/g, '').replace(/(<script.*?>.*?<\/script>)/gi, '');
  }
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === 'object') {
    const sanitized: any = {};
    for (const key of Object.keys(value)) {
      sanitized[key] = sanitizeValue(value[key]);
    }
    return sanitized;
  }
  return value;
};

export const sanitize = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query) as any;
  if (req.params) req.params = sanitizeValue(req.params);
  next();
};
