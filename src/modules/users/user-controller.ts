import { Request, Response } from "express";
import { userService } from "./user-service.js";
import { AppError } from "../../errors/AppError.js";

const userController = {
    async me(req: Request, res: Response) {

        const user = await userService.getUser({
            id: req.user.id,
        });

        return res.status(200).json({
            user,
        });
    },

    async him(req: Request, res: Response) {
        const id = req.params.id;

        if (typeof id !== "string") {
            throw new AppError("ID inválido", 400);
        }

        const user = await userService.getUser({
            id,
        });

        return res.status(200).json({
            user,
        });
    },
};

export { userController };
