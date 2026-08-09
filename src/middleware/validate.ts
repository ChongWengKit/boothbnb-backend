import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

type RequestPart = 'body' | 'query' | 'params';

interface ValidationOptions {
  body?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
}

export const validate = (options: ValidationOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parts: RequestPart[] = ['body', 'query', 'params'];

    for (const part of parts) {
      const schema = options[part];
      if (!schema) continue;

      const result = schema.safeParse(req[part]);
      if (!result.success) {
        const firstError = result.error.issues[0];
        const message = firstError?.message || 'Invalid request data';
        return res.status(400).json({ success: false, message });
      }

      if (part === 'query') {
        Object.defineProperty(req, 'query', {
          value: result.data,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      } else if (part === 'body') {
        req.body = result.data;
      } else {
        req.params = result.data as any;
      }
    }

    next();
  };
};