import { Request, Response } from "express";
import { cartService } from "./cart-service.js";
import { AppError } from "../../errors/AppError.js";

export const cartController = {
    async get(req: Request, res: Response) {
        const cart = await cartService.getCart(req.user.id)

        return res.json(cart)
    },

    async addItem(req: Request, res: Response) {
        const item = await cartService.addItem(
            req.user.id,
            req.body
        )

        return res.json(item)
    },

    async updateItem(req: Request, res: Response) {
        const productId = Number(req.params.productId)

        const item = await cartService.updateItem(
            req.user.id,
            productId,
            req.body.quantity
        )

        return res.json(item)
    },

    async removeItem(req: Request, res: Response) {
        const productId = Number(req.params.productId)

        await cartService.removeItem(
            req.user.id,
            productId
        )

        return res.status(404).send()
    }
}
