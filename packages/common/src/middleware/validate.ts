import { RequestHandler } from 'express';
import { ZodType, ZodError } from 'zod';

interface ValidationSchema {
  body?: any;
  query?: any;
  params?: any;
}

export const validateRequest = (schema: ValidationSchema): RequestHandler => {
  return async (req, res, next) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query) as any;
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params) as any;
      }
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: 'Validation failed',
          errors: error.issues,
        });
        return;
      }
      next(error);
    }
  };
};
