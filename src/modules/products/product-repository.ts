import { prisma } from "../../config/prisma.js"

interface CreateProductData {
  name: string;
  description: string;
  price: number;
  stock?: number;
  categoryId: number;
}

type UpdateProductData = Partial<CreateProductData>;

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
  },

  async update(data: UpdateProductData, id: string) {
    const updateData: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      category?: { connect: { id: number } };
    } = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    if (data.price !== undefined) {
      updateData.price = data.price;
    }

    if (data.stock !== undefined) {
      updateData.stock = data.stock;
    }

    if (data.categoryId !== undefined) {
      updateData.category = {
        connect: {
          id: data.categoryId,
        },
      };
    }

    return prisma.product.update({
      where: { id },
      data: updateData,
    });
  },

  async delete(id: string) {
    return prisma.product.update({
        where: {
            id
        },
        data: {
            isActive: false
        }
    })
  }
};