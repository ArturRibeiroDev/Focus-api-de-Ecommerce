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

type UpdateProductData = Partial<CreateProductData>;

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

    async findById(id: string) {

        const product = await productRepository.findById(id)

        if (!product) {
            throw new AppError("Produto não existe!", 400)
        }

        return productRepository.findById(id)
    },

    async update(data: UpdateProductData, id: string) {
        const product = await productRepository.findById(id)

        if (!product) {
            throw new AppError("Produto não encontrado!", 400)
        }

        if (data.categoryId !== undefined) {
            const category = await categoryRepository.findById(data.categoryId);

            if (!category) {
                throw new AppError("Categoria não existe!", 400);
            }
        }

        return productRepository.update(data, id)
    },

    async delete(id: string) {
        const product = await productRepository.findById(id)

        if(!product) {
            throw new AppError("Produto não encontrado!", 400)
        }

        return productRepository.delete(id)
    }
};
