import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export function validate(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
        });

        if (!result.success) return next(result.error);

        const parsed = result.data as {
            body?: unknown;
            params?: unknown;
            query?: unknown;
        };
        if (parsed.body) req.body = parsed.body;
        if (parsed.params) Object.assign(req.params, parsed.params);
        if (parsed.query) Object.assign(req.query, parsed.query);

        next();
    };
}
