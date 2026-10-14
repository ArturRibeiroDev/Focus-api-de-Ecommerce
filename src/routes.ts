import { Router } from "express";
import { authRoutes } from "./modules/auth/auth-routes.js";
import { userRoutes } from "./modules/users/user-routes.js";
import { productsRoutes } from "./modules/products/product-routes.js";
import { checkoutRoutes } from "./modules/checkout/checkout-routes.js";

const routes = Router()

routes.use("/auth", authRoutes)
routes.use("/users", userRoutes)
routes.use("/products", productsRoutes)

routes.use("/checkout", checkoutRoutes);

export { routes }