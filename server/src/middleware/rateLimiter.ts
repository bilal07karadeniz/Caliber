import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    console.warn(
      `[RateLimit] generalLimiter blocked | IP: ${req.ip} | ${req.method} ${req.originalUrl} | Limit: ${options.max} requests per 15min`
    );
    res.status(options.statusCode).json(options.message);
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    console.warn(
      `[RateLimit] authLimiter blocked | IP: ${req.ip} | ${req.method} ${req.originalUrl} | Limit: ${options.max} requests per 15min`
    );
    res.status(options.statusCode).json(options.message);
  },
});
