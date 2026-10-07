import { Request, Response } from "express";
import { productService } from "./product-service.js";
import { AppError } from "../../errors/AppError.js";

export const productController = {
    async create(req: Request, res: Response) {
        const product = await productService.create(req.body);

        return res.status(201).json(product);
    },

    async get(req: Request, res: Response) {
        const products = await productService.findAll();

        return res.json(products);
    },

    async find(req: Request, res: Response) {
        const id = req.params.id;

        if (typeof id !== "string") {
            throw new AppError("ID inválido", 400);
        }

        const product = await productService.findById(id);

        return res.json(product);
    },

    async update( req: Request, res: Response) {
        const id = req.params.id

        if (typeof id !== "string") {
            throw new AppError("ID inválido", 400);
        }

        const product = await productService.update(req.body, id)

        return res.json(product)
        
    },

    async delete(req: Request, res: Response) {
        const id = req.params.id

        if (typeof id !== "string") {
            throw new AppError("ID inválido", 400);
        }

        const product = await productService.delete(id)

        return res.json(product)
    }
};
