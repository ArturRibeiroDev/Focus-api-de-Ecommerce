import { Request, Response, NextFunction } from "express";
import { authService } from "./auth-service.js";

const authController = {
    async register(req: Request, res: Response) {
        const { name, email, password } = req.body;

        const user = await authService.register({
            name,
            email,
            password,
        });

        return res.status(201).json({
            user
        })
    },

    async find(req: Request, res: Response) {
        const users = await authService.findALl()

        return res.status(200).json({
            users
        })
    }
};

export { authController}
