import { productRepository } from "./product-repository.js";
import { AppError } from "../../errors/AppError.js";
import { categoryRepository } from "./category-repository.js";

interface CreateProductData {
  name: string;
  description: string;
  price: number;
  stock?: number;
  categoryId: number;
}

export const productService = {
    async create(data: CreateProductData) {

        const category = await categoryRepository.findById(data.categoryId);

        if(!category) {
            throw new AppError("Categoria não existe!", 400);
        }

        return productRepository.create(data);
    },

    async findAll() {
        return productRepository.findAll();
    },
};
