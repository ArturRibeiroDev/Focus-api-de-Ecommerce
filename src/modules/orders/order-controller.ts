import { Request, Response } from "express";
import { orderService } from "./order-service.js";

export const orderController = {
  async findByUserId(req: Request, res: Response) {
    const orders = await orderService.findByUserId(
      req.user.id
    );

    return res.status(200).json(orders);
  },
};
