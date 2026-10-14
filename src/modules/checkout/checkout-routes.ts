import { Router } from "express";
import { jwtMiddleware } from "../../Middlewares/jwt-middleware.js";
import { checkoutController } from "./checkout-controller.js";

export const checkoutRoutes = Router();

checkoutRoutes.post(
  "/",
  jwtMiddleware,
  checkoutController.execute
);