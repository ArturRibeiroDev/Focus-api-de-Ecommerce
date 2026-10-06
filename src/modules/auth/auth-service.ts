import { userRepository } from "../users/user-repository.js";
import { AppError } from "../../errors/AppError.js";
import bcrypt from "bcrypt";
import { generateToken } from "../../utils/jwt.js";

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
            throw new AppError("E-mail já cadastrado!", 409);
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await userRepository.create({
            name,
            email,
            passwordHash,
        });

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
            throw new AppError("E-mail ou senha inválidos!", 401);
        }

        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
            throw new AppError("E-mail ou senha inválidos", 401);
        }

        const token = generateToken(user.id, user.userRole);

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.userRole,
            },
            token,
        };
    },
};


