import { cartRepository } from "./cart-repository.js";
import { productRepository } from "../products/product-repository.js";
import { AppError } from "../../errors/AppError.js";
import { Prisma } from "../../generated/prisma/browser.js";
import { prisma } from "../../config/prisma.js";

interface AddCartItemData {
    productId: number;
    quantity: number;
}

export const cartService = {
    async getCart(userId: number) {
        const cart = await cartRepository.findbyUserId(userId);

        if (!cart) {
            throw new AppError("Carrinho não encontrado!", 404);
        }

        const itens = cart.items.map((item) => {
            const unitPrice = item.unitPrice;

            return {
                productId: item.productId,
                name: item.product.name,
                quantity: item.quantity,
                unitPrice: unitPrice.toString(),
                subtotal: unitPrice.mul(item.quantity).toString(),
            };
        });

        const total = cart.items.reduce(
            (sum, item) => sum.plus(item.unitPrice.mul(item.quantity)),
            new Prisma.Decimal(0),
        );

        return {
            itens,
            total: total.toString(),
        };
    },

    async addItem(userId: number, data: AddCartItemData) {
        const { productId, quantity } = data;

        const cart = await cartRepository.findbyUserId(userId);

        if (!cart) {
            throw new AppError("Carrinho não encontrado", 404);
        }

        const product = await productRepository.findById(productId);

        if (!product || !product.isActive) {
            throw new AppError("Produto não encontrado", 404);
        }

        const existingItem = await cartRepository.findItem(cart.id, productId);

        const newQuantity = (existingItem?.quantity ?? 0) + quantity;

        if (newQuantity > product.stock) {
            throw new AppError("Estoque insuficiente", 400);
        }

        if (existingItem) {
            return cartRepository.updateItem(existingItem.id, newQuantity);
        }

        return cartRepository.addItem(
            cart.id,
            productId,
            quantity,
            product.price.toString(),
        );
    },

    async updateItem(userId: number, productId: number, quantity: number) {
        const cart = await cartRepository.findbyUserId(userId);

        if (!cart) {
            throw new AppError(
                "Carrinho não encontrado",
                404,
                "CART_NOT_FOUND",
            );
        }

        const item = await cartRepository.findItem(cart.id, productId);

        if (!item) {
            throw new AppError(
                "Item não encontrado",
                404,
                "CART_ITEM_NOT_FOUND",
            );
        }

        const product = await productRepository.findById(productId);

        if (!product || !product.isActive) {
            throw new AppError(
                "Produto não encontrado",
                404,
                "PRODUCT_NOT_FOUND",
            );
        }

        if (quantity > product.stock) {
            throw new AppError(
                "Estoque insuficiente",
                400,
                "INSUFFICIENT_STOCK",
            );
        }

        return cartRepository.updateItem(item.id, quantity);
    },

    async removeItem(userId: number, productId: number) {
        const cart = await cartRepository.findbyUserId(userId);

        if (!cart) {
            throw new AppError(
                "Carrinho não encontrado",
                404,
                "CART_NOT_FOUND",
            );
        }

        const item = await cartRepository.findItem(cart.id, productId);

        if (!item) {
            throw new AppError(
                "Item não encontrado",
                404,
                "CART_ITEM_NOT_FOUND",
            );
        }

        await cartRepository.removeItem(item.id);
    },
};
