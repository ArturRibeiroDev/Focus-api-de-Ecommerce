import { Request, Response } from "express";
import { productService } from "./product-service.js";
import { AppError } from "../../errors/AppError.js";
import { productQuerySchema } from "./product-schema.js";

export const productController = {
    async create(req: Request, res: Response) {
        const product = await productService.create(req.body);

        return res.status(201).json(product);
    },

    async get(req: Request, res: Response) {
        const query = productQuerySchema.parse(req.query);

        const result = await productService.findAll(query);

        return res.status(200).json(result);
    },

    async find(req: Request, res: Response) {
        const id = Number(req.params.id)

        const product = await productService.findById(id);

        return res.json(product);
    },

    async update(req: Request, res: Response) {
        const id = Number(req.params.id)

        const product = await productService.update(req.body, id);

        return res.json(product);
    },

    async delete(req: Request, res: Response) {
        const id = Number(req.params.id)

        const product = await productService.delete(id);

        return res.json(product);
    },
};
