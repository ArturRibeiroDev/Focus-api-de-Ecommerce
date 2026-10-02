import { Router } from "express";

import { userController } from "./user-controller.js";
import { jwtMiddleware } from "../../Middlewares/jwt-middleware.js";
import { roleMiddleware } from "../../Middlewares/role-middleware.js";
import { validate } from "../../Middlewares/validate-middleware.js";
import { userSchema } from "./user-schema.js";

export const userRoutes = Router();

userRoutes.get("/me", jwtMiddleware, userController.me);

userRoutes.get(
    "/:id",
    jwtMiddleware,
    roleMiddleware("USER"),
    validate(userSchema),
    userController.him,
);
