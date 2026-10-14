
import { Router } from "express";

import { jwtMiddleware } from "../../Middlewares/jwt-middleware.js";
import { validate } from "../../Middlewares/validate-middleware.js";

import { cartController } from "./cart-controller.js";

import {
  addCartItemSchema,
  updateCartItemSchema,
  removeCartItemSchema,
} from "./cart-schema.js";

export const cartRoutes = Router();

cartRoutes.use(jwtMiddleware);

cartRoutes.get("/", cartController.get);

cartRoutes.post(
  "/items",
  validate(addCartItemSchema),
  cartController.addItem
);

cartRoutes.put(
  "/items/:productId",
  validate(updateCartItemSchema),
  cartController.updateItem
);

cartRoutes.delete(
  "/items/:productId",
  validate(removeCartItemSchema),
  cartController.removeItem
);
