import { Router } from "express";

import { productController } from "./product-controller.js";
import { productSchema, productUpdateSchema, productIdSchema } from "./product-schema.js";

import { validate } from "../../Middlewares/validate-middleware.js";
import { jwtMiddleware } from "../../Middlewares/jwt-middleware.js";

export const productsRoutes = Router()

productsRoutes.get("/", productController.get)
productsRoutes.get("/:id", validate(productIdSchema), productController.find)
productsRoutes.post("/", jwtMiddleware, validate(productSchema), productController.create)
productsRoutes.put("/:id", jwtMiddleware, validate(productSchema), validate(productIdSchema), productController.update)
productsRoutes.patch("/:id", jwtMiddleware, validate(productUpdateSchema), validate(productIdSchema), productController.update)
productsRoutes.delete("/:id", jwtMiddleware, validate(productIdSchema), productController.delete)


