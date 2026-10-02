import { userRepository } from "./user-repository.js";
import { AppError } from "../../errors/AppError.js";

interface UserRequest {
    id: string;
}

const userService = {
    async getUser({ id }: UserRequest) {
        const user = await userRepository.findbyId(id);

        if (!user) {
            throw new AppError("Usuário não encontrado", 400);
        }

        return {
            user,
        };
    },
};

export { userService };
