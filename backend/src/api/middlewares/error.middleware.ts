import { Request, Response, NextFunction } from 'express';
import Boom from '@hapi/boom';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  console.error('❌ Error:', err);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const boomError = Boom.badRequest('File size exceeds the limit of 50MB');
    res.status(boomError.output.statusCode).json(boomError.output.payload);
    return;
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const boomError = Boom.badRequest('Unexpected file field');
    res.status(boomError.output.statusCode).json(boomError.output.payload);
    return;
  }

  // Boom errors
  if (Boom.isBoom(err)) {
    res.status(err.output.statusCode).json(err.output.payload);
    return;
  }

  // Generic errors
  const error = Boom.internal('Internal server error');
  res.status(error.output.statusCode).json(error.output.payload);
}
