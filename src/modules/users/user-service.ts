import { userRepository } from "./user-repository.js";
import { AppError } from "../../errors/AppError.js";

interface UserRequest {
    id: string;
}

export const userService = {
    async getUser({ id }: UserRequest) {
        const user = await userRepository.findbyId(id);

        if (!user) {
            throw new AppError("Usuário não encontrado", 404);
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            // role: user.role,
            createdAt: user.createdAt,
        };
    },
};

