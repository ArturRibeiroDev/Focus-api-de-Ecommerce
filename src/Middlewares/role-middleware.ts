import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";

export function roleMiddleware(...permitedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!permitedRoles.includes(req.user.role)) {
            throw new AppError("Permissão negada!", 403);
        }

        next();
    };
}
