import { Router } from "express";

import { userController } from "./user-controller.js";
import { authMiddleware } from "../../Middlewares/jwt-middleware.js";

export const userRoutes = Router();

userRoutes.get("/me", authMiddleware, userController.me);
