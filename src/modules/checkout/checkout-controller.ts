import { Request, Response } from "express";
import { checkoutService } from "./checkout-service.js";

export const checkoutController = {
  async execute(req: Request, res: Response) {
    const order = await checkoutService.execute(
      req.user.id
    );

    return res.status(201).json(order);
  },
};