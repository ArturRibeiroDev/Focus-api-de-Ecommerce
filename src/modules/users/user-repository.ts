import { prisma } from "../../config/prisma.js";

interface CreateUserData {
    name: string;
    email: string;
    passwordHash: string;
}

const userRepository = {
    async findbyEmail(email: string) {
        return prisma.user.findUnique({
            where: {
                email,
            },
        });
    },

    async create(data: CreateUserData) {
        return prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: data.passwordHash,
            },
        });
    },

    async find() {
        return prisma.user.findMany()
    }
};

export { userRepository };
