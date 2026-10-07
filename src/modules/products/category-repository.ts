import { prisma } from "../../config/prisma.js"

interface CategoryData {
    name: string;
}

export const categoryRepository = {
    async findById(id: number) {
        return await prisma.category.findUnique({
            where: { id },
        })
    },

    async create(data: CategoryData) {
        return prisma.category.create({ data });
    },
}