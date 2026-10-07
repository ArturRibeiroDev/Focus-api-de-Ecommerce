import { Router } from "express";
import { authRoutes } from "./modules/auth/auth-routes.js";
import { userRoutes } from "./modules/users/user-routes.js";
import { productsRoutes } from "./modules/products/product-routes.js";

const routes = Router()

routes.use("/auth", authRoutes)
routes.use("/users", userRoutes)
routes.use("/products", productsRoutes)

export { routes }