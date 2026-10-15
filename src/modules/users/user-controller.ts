import { Request, Response } from "express";
import { userService } from "./user-service.js";
import { AppError } from "../../errors/AppError.js";

export const userController = {
    async me(req: Request, res: Response) {

        const user = await userService.getUser({
            id: req.user.id,
        });

        return res.json({
            user,
        });
    },

    async him(req: Request, res: Response) {
        const id = Number(req.params.id)

        if (id !== req.user.id) {
            throw new AppError("Usuário não encontrado", 404, "USER_NOT_FOUND");
        }

        const user = await userService.getUser({
            id,
        });

        return res.status(200).json({
            user,
        });
    },
};


