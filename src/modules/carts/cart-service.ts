import { cartRepository } from "./cart-repository.js";

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

        const items = cart.items.map((item) => {
            return {
                productId: item.productId,
                name: item.product.name,
                quantity: item.quantity,
                unitPrice: item.product.price.toString(),
                subtotal: item.product.price.mul(item.quantity).toString(),
            };
        });

        const total = cart.items.reduce(
            (sum, item) => sum.plus(item.product.price.mul(item.quantity)),
            new Prisma.Decimal(0),
        );

        return {
            items,
            total: total.toString(),
        };
    },

    async addItem(userId: number, data: AddCartItemData) {
        const { productId, quantity } = data;

        return prisma.$transaction(async (tx) => {
            const carts = await tx.cart.findUnique({ where: { userId } });
            if (!carts)
                throw new AppError(
                    "Carrinho não encontrado",
                    404,
                    "CART_NOT_FOUND",
                );
            await tx.$queryRaw`SELECT id FROM carts WHERE id = ${carts.id} FOR UPDATE`;
            const product = await tx.product.findFirst({
                where: { id: productId, isActive: true },
            });
            if (!product)
                throw new AppError(
                    "Produto não encontrado",
                    404,
                    "PRODUCT_NOT_FOUND",
                );
            const existing = await tx.cartItem.findUnique({
                where: { cartId_productId: { cartId: carts.id, productId } },
            });
            const nextQuantity = (existing?.quantity ?? 0) + quantity;
            if (nextQuantity > product.stock)
                throw new AppError(
                    "Estoque insuficiente",
                    400,
                    "INSUFFICIENT_STOCK",
                );
            if (existing)
                return tx.cartItem.update({
                    where: { id: existing.id },
                    data: { quantity: nextQuantity },
                });
            return tx.cartItem.create({
                data: {
                    cartId: carts.id,
                    productId,
                    quantity,
                    unitPrice: product.price,
                },
            });
        });
    },

    async updateItem(userId: number, productId: number, quantity: number) {
        return prisma.$transaction(async (tx) => {
            const cart = await tx.cart.findUnique({ where: { userId } });
            if (!cart)
                throw new AppError(
                    "Carrinho não encontrado",
                    404,
                    "CART_NOT_FOUND",
                );
            await tx.$queryRaw`SELECT id FROM carts WHERE id = ${cart.id} FOR UPDATE`;
            const item = await tx.cartItem.findUnique({
                where: { cartId_productId: { cartId: cart.id, productId } },
            });
            if (!item)
                throw new AppError(
                    "Item não encontrado",
                    404,
                    "CART_ITEM_NOT_FOUND",
                );
            const product = await tx.product.findFirst({
                where: { id: productId, isActive: true },
            });
            if (!product)
                throw new AppError(
                    "Produto não encontrado",
                    404,
                    "PRODUCT_NOT_FOUND",
                );
            if (quantity > product.stock)
                throw new AppError(
                    "Estoque insuficiente",
                    400,
                    "INSUFFICIENT_STOCK",
                );
            return tx.cartItem.update({
                where: { id: item.id },
                data: { quantity },
            });
        });
    },

    async removeItem(userId: number, productId: number) {
        await prisma.$transaction(async (tx) => {
            const cart = await tx.cart.findUnique({ where: { userId } });
            if (!cart)
                throw new AppError(
                    "Carrinho não encontrado",
                    404,
                    "CART_NOT_FOUND",
                );
            await tx.$queryRaw`SELECT id FROM carts WHERE id = ${cart.id} FOR UPDATE`;
            const item = await tx.cartItem.findUnique({
                where: { cartId_productId: { cartId: cart.id, productId } },
            });
            if (!item)
                throw new AppError(
                    "Item não encontrado",
                    404,
                    "CART_ITEM_NOT_FOUND",
                );
            await tx.cartItem.delete({ where: { id: item.id } });
        });
    },
};
