
import { prisma } from "../../config/prisma.js";
import { Prisma } from "../../generated/prisma/index.js";
import { AppError } from "../../errors/AppError.js";

export const checkoutService = {
  async execute(userId: number) {
    return prisma.$transaction(
      async (tx) => {
        const cart = await tx.cart.update({
          where: { userId },
          data: { updatedAt: new Date() },
        });

        const items = await tx.cartItem.findMany({
          where: { cartId: cart.id },
          include: { product: true },
          orderBy: { productId: "asc" },
        });

        if (items.length === 0) {
          throw new AppError(
            "Carrinho vazio",
            400,
            "EMPTY_CART"
          );
        }

        let total = new Prisma.Decimal(0);

        for (const item of items) {
          const product = item.product;

          if (!product.isActive) {
            throw new AppError(
              "Produto indisponível",
              400,
              "PRODUCT_UNAVAILABLE"
            );
          }

          const result = await tx.product.updateMany({
            where: {
              id: product.id,
              isActive: true,
              stock: { gte: item.quantity },
            },
            data: {
              stock: { decrement: item.quantity },
            },
          });

          if (result.count !== 1) {
            throw new AppError(
              `Estoque insuficiente para ${product.name}`,
              400,
              "INSUFFICIENT_STOCK"
            );
          }

          total = total.plus(
            product.price.mul(item.quantity)
          );
        }

        const order = await tx.order.create({
          data: {
            userId,
            status: "PAID",
            totalAmount: total,
            items: {
              create: items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price,
              })),
            },
          },
          include: { items: true },
        });

        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });

        return order;
      },
      {
        maxWait: 5000,
        timeout: 10000,
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      }
    );
  },
};
