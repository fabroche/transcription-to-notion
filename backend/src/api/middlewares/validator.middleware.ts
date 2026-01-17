import { Request, Response, NextFunction } from 'express';
import Boom from '@hapi/boom';
import Joi from 'joi';

export function validatorHandler(schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const data = req[property];
    const { error } = schema.validate(data, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      next(Boom.badRequest('Validation error', { errors }));
    } else {
      next();
    }
  };
}
