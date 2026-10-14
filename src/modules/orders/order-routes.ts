import { Router } from "express";
import { jwtMiddleware } from "../../Middlewares/jwt-middleware.js";
import { orderController } from "./order-controller.js";

export const orderRoutes = Router();

orderRoutes.get(
  "/",
  jwtMiddleware,
  orderController.findByUserId
);
