import { Request, Response, NextFunction } from "express";
import { userService } from "./user-service.js";

const userController = {
    async me(req: Request, res: Response) {
        

        const user = await userService.getUser({
            id: req.user.id,
        });

        return res.status(200).json({
            user,
        });
    },
};

export { userController };
