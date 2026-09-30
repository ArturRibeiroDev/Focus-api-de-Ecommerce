import { userRepository } from "./user-repository.js";
import { AppError } from "../../errors/AppError.js";
import bcrypt from "bcrypt";

interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

const authService = {
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
            createdAt: user.createdAt
        }
    },

    async findALl(){
        const users = await userRepository.find()

        return { users }
    }
};

export { authService }
