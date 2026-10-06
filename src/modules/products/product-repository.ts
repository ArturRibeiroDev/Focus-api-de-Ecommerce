import { prisma } from "../../config/prisma.js"

interface CreateProductData {
  name: string;
  description: string;
  price: number;
  stock?: number;
  categoryId: number;
}

export const productRepository = {
  async create(data: CreateProductData) {
    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        category: {
            connect: {
                id: data.categoryId
            }
        },
      },
      include: {
        category: true
      }
    });
  },

  async findById(id: string) {
    return prisma.product.findUnique({
        where: {
            id
        },
    })
  },

  async findAll() {
    return prisma.product.findMany({
        where: {
            isActive: true
        },

        include: {
            category: true
        },

        orderBy: {
            createdAt: "desc",
        },
    })
  }
};