import { Router } from "express";

import { validate } from "../../Middlewares/validate-middleware.js";
import { jwtMiddleware } from "../../Middlewares/jwt-middleware.js";
import { roleMiddleware } from "../../Middlewares/role-middleware.js";
import { userController } from "./user-controller.js";
import { getUserSchema } from "./user-schema.js";


export const userRoutes = Router();

userRoutes.get("/me", jwtMiddleware, userController.me);

userRoutes.get(
    "/:id",
    jwtMiddleware,
    roleMiddleware("USER"),
    validate(getUserSchema),
    userController.him,
);
