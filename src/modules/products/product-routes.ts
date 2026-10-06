import { Router } from "express";

import { productController } from "./product-controller.js";
import { productSchema } from "./product-schema.js";

import { validate } from "../../Middlewares/validate-middleware.js";
import { jwtMiddleware } from "../../Middlewares/jwt-middleware.js";
import { roleMiddleware } from "../../Middlewares/role-middleware.js";

export const productsRoutes = Router()

productsRoutes.get("/", productController.get)
productsRoutes.post("/", jwtMiddleware, validate(productSchema), roleMiddleware("USER"), productController.create)



