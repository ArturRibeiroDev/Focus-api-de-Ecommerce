import { Router } from "express";

import { productController } from "./product-controller.js";
import { productSchema, productUpdateSchema } from "./product-schema.js";

import { validate } from "../../Middlewares/validate-middleware.js";
import { jwtMiddleware } from "../../Middlewares/jwt-middleware.js";
import { roleMiddleware } from "../../Middlewares/role-middleware.js";

export const productsRoutes = Router()

productsRoutes.get("/", productController.get)
productsRoutes.get("/:id", productController.find)
productsRoutes.post("/", jwtMiddleware, validate(productSchema), roleMiddleware("USER"), productController.create)
productsRoutes.put("/:id", jwtMiddleware, validate(productSchema), roleMiddleware("USER"), productController.update)
productsRoutes.patch("/:id", jwtMiddleware, validate(productUpdateSchema), roleMiddleware("USER"), productController.update)
productsRoutes.delete("/:id", jwtMiddleware, roleMiddleware("USER"), productController.delete)


