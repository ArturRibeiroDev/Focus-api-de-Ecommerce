import { Router } from "express";

import { validate } from "../../Middlewares/validate-middleware.js";
import { jwtMiddleware } from "../../Middlewares/jwt-middleware.js";
import { userController } from "./user-controller.js";
import { getUserSchema } from "./user-schema.js";


export const userRoutes = Router();

userRoutes.get("/me", jwtMiddleware, userController.me);

userRoutes.get(
    "/:id",
    jwtMiddleware,
    // User records are private; only the authenticated owner may read them.
    validate(getUserSchema),
    userController.him,
);
