import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ApiError } from "../utils/apiError";

export const validateRequest = (schema: ZodSchema, source: 'body' | 'query' | 'params' | 'all' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      let data;
      
      // Determine which part of request to validate
      if (source === 'all') {
        data = { ...req.params, ...req.query, ...req.body };
      } else {
        data = req[source];
      }
      
      // Debug logging
      console.log(`Validating ${source}:`, JSON.stringify(data, null, 2));
      
      const validated = schema.parse(data);
      
      // Update the appropriate request property with validated data
      if (source === 'body') {
        req.body = validated;
      } else if (source === 'query') {
        // req.query is read-only, use Object.assign
        Object.assign(req.query, validated);
      } else if (source === 'params') {
        req.params = validated as any;
      } else if (source === 'all') {
        req.body = validated;
      }
      
      next();
    } catch (error: any) {
      // Zod validation errors
      if (error.errors || error.issues) {
        const zodErrors = error.errors || error.issues;
        const errors = zodErrors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        console.error('Validation failed:', errors);
        throw new ApiError(400, "Validation failed", errors);
      }
      
      // Log the actual error for debugging
      console.error('Validation error:', error);
      throw new ApiError(400, error.message || "Invalid request data");
    }
  };
};
