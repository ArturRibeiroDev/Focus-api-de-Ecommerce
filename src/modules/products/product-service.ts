import { productRepository } from "./product-repository.js";
import { AppError } from "../../errors/AppError.js";
import { categoryRepository } from "./category-repository.js";
import { ProductQuery } from "./product-schema.js";

interface CreateProductData {
    name: string;
    description: string;
    price: number;
    stock?: number;
    categoryId: number;
}

type UpdateProductData = Partial<CreateProductData>;

export const productService = {
    async create(data: CreateProductData) {
        const category = await categoryRepository.findById(data.categoryId);

        if (!category) {
            throw new AppError("Categoria não existe!", 404);
        }

        return productRepository.create(data);
    },

    async findAll(query: ProductQuery) {
        const { page, limit } = query;

        const { products, total } = await productRepository.findAll(query);

        const totalPages = Math.ceil(total / limit);

        return {
            data: products,

            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1 && totalPages > 0,
            },
        };
    },

    async findById(id: number) {
        const product = await productRepository.findById(id);

        if (!product) {
            throw new AppError("Produto não encontrado!", 404);
        }

        return product;
    },

    async update(data: UpdateProductData, id: number) {
        const product = await productRepository.findById(id);

        if (!product) {
            throw new AppError("Produto não encontrado!", 404);
        }

        if (data.categoryId !== undefined) {
            const category = await categoryRepository.findById(data.categoryId);

            if (!category) {
                throw new AppError("Categoria não existe!", 404);
            }
        }

        return productRepository.update(data, id);
    },

    async delete(id: number) {
        const product = await productRepository.findById(id);

        if (!product) {
            throw new AppError("Produto não encontrado!", 404);
        }

        return productRepository.delete(id);
    },
};
