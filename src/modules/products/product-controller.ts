import { Request, Response } from "express";
import { productService } from "./product-service.js";

export const productController = {
    async create(req: Request, res: Response) {
        const product = await productService.create(req.body);

        return res.status(201).json(product);
    },

    async get(_req: Request, res: Response) {
        const products = await productService.findAll();

        return res.json(products);
    },
};