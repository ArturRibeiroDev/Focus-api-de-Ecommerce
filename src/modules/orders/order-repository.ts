import { prisma } from "../../config/prisma.js";

export const orderRepository = {
  async findByUserId(userId: number) {
    return prisma.order.findMany({
      where: {
        userId,
      },

      include: {
        items: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            price: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  },
};
