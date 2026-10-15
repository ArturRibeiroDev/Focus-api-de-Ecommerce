import { prisma } from "../../config/prisma.js"
import { Prisma } from "../../generated/prisma/index.js";
import type { ProductQuery } from "./product-schema.js";

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

  async findById(id: number) {
    return prisma.product.findFirst({
        where: {
        id,
        isActive: true,
        },
        include: {
        category: true,
        },
    });
  },
  
async findAll({ page, limit, search }: ProductQuery) {
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(search
      ? {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }
      : {}),
  };

  const skip = (page - 1) * limit;

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,

      skip,
      take: limit,

      include: {
        category: true,
      },

      orderBy: [
        { createdAt: "desc" },
        { id: "desc" },
      ],
    }),

    prisma.product.count({
      where,
    }),
  ]);

  return {
    products,
    total,
  };
},


  async update(data: UpdateProductData, id: number) {
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

  async delete(id: number) {
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