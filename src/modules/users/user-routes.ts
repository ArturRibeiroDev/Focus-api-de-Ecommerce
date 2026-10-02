import { Router } from "express";

import { userController } from "./user-controller.js";
import { jwtMiddleware } from "../../Middlewares/jwt-middleware.js";
import { AllowMiddleware } from "../../Middlewares/auth-middleware.js";
import { validate } from "../../Middlewares/validate-middleware.js";
import { userSchema } from "./user-schema.js";


export const userRoutes = Router();

userRoutes.get(
    "/me",
    jwtMiddleware,
    userController.me,
);

userRoutes.get(
    "/him/:id",
    jwtMiddleware,
    AllowMiddleware("USER"),
    validate(userSchema),
    userController.him,
);
