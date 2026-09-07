import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

// Common Postgres error codes we handle specially.
// Full list: https://www.postgresql.org/docs/current/errcodes-appendix.html
const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';
const PG_NOT_NULL_VIOLATION = '23502';

export const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.status || 500;
  let message = err.message || 'An unexpected error occurred on the server.';
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let details: any = undefined;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Data validation failed.';
    code = 'VALIDATION_ERROR';
    details = err.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
  }

  // node-postgres attaches the Postgres error code as `err.code` on the
  // driver error (a plain string like '23505'), not a typed class like
  // Prisma's — so we switch on that instead.
  else if (err.code === PG_UNIQUE_VIOLATION) {
    statusCode = 409;
    code = 'DB_UNIQUE_CONSTRAINT_VIOLATION';
    message = `A record with this value already exists${err.detail ? `: ${err.detail}` : '.'}`;
  } else if (err.code === PG_FOREIGN_KEY_VIOLATION) {
    statusCode = 409;
    code = 'DB_FOREIGN_KEY_VIOLATION';
    message = 'This record is referenced elsewhere and cannot be modified this way.';
  } else if (err.code === PG_NOT_NULL_VIOLATION) {
    statusCode = 400;
    code = 'DB_NOT_NULL_VIOLATION';
    message = `Missing required field${err.column ? `: ${err.column}` : '.'}`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
