import { prisma } from "../../config/prisma.js";


export const cartRepository = {
    async findbyUserId(userId : number) {
        return prisma.cart.findUnique({
            where: {
                userId
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }

        })
    },

    async findItem(cartId: number, productId: number) {
        return prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId,
                    productId
                }
            }
        })
    },

    async addItem(
        cartId: number,
        productId: number,
        quantity: number,
        unitPrice: string
    ) {
        return prisma.cartItem.create({
            data: {
                cartId,
                productId,
                quantity,
                unitPrice
            }
        })
    },

    async updateItem(itemId: number, quantity: number) {
        return prisma.cartItem.update({
            where: {
                id: itemId
            },
            data: {
                quantity
            }
        })
    },

    async removeItem(itemId: number) {
        return prisma.cartItem.delete({
            where: {
                id: itemId
            }
        })
    }
}