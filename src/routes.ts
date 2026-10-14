import { Router } from "express";
import { authRoutes } from "./modules/auth/auth-routes.js";
import { userRoutes } from "./modules/users/user-routes.js";
import { productsRoutes } from "./modules/products/product-routes.js";
import { checkoutRoutes } from "./modules/checkout/checkout-routes.js";
import { orderRoutes } from "./modules/orders/order-routes.js";
import { cartRoutes } from "./modules/carts/cart-routes.js";

const routes = Router()

routes.use("/auth", authRoutes)
routes.use("/users", userRoutes)
routes.use("/products", productsRoutes)

routes.use("/cart", cartRoutes);

routes.use("/checkout", checkoutRoutes);

routes.use("/orders", orderRoutes);

export { routes }