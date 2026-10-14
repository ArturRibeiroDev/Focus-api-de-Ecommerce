import { orderRepository } from "./order-repository.js";

export const orderService = {
  async findByUserId(userId: number) {
    const orders = await orderRepository.findByUserId(userId);

    return {
      orders: orders.map((order) => ({
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount.toString(),
        createdAt: order.createdAt.toISOString(),

        items: order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price.toString(),
        })),
      })),
    };
  },
};
