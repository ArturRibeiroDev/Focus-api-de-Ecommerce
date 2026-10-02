import { Router } from "express";
import { authRoutes } from "./modules/auth/auth-routes.js";
import { userRepository } from "./modules/users/user-repository.js";
import { userRoutes } from "./modules/users/user-routes.js";

const routes = Router()

routes.use("/auth", authRoutes)
routes.use("/users", userRoutes)

export { routes }