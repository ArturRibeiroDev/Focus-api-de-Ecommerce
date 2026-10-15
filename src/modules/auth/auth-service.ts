import { userRepository } from "../users/user-repository.js";
import { AppError } from "../../errors/AppError.js";
import bcrypt from "bcrypt";
import { generateToken } from "../../utils/jwt.js";
import { Prisma } from "../../generated/prisma/index.js";

interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

interface LoginRequest {
    email: string;
    password: string;
}

export const authService = {
    async register({ name, email, password }: RegisterRequest) {
        const existingUser = await userRepository.findbyEmail(email);

        if (existingUser) {
            throw new AppError("E-mail já cadastrado!", 409, "EMAIL_ALREADY_EXISTS");
        }

        const rounds = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
        const passwordHash = await bcrypt.hash(password, rounds);

        let user;
        try {
            user = await userRepository.create({ name, email, passwordHash });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                throw new AppError("E-mail já cadastrado!", 409, "EMAIL_ALREADY_EXISTS");
            }
            throw error;
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
        };
    },

    async login({ email, password }: LoginRequest) {
        const user = await userRepository.findbyEmail(email);

        if (!user) {
            throw new AppError("E-mail ou senha inválidos!", 401, "INVALID_CREDENTIALS");
        }

        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
            throw new AppError("E-mail ou senha inválidos!", 401, "INVALID_CREDENTIALS");
        }

        const token = generateToken(user.id, user.userRole);

        return { accessToken: token, tokenType: "Bearer" };
    },
};


