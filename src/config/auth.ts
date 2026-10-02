import type { SignOptions } from "jsonwebtoken";

const secret = process.env.JWT_SECRET;

if (!secret) {
    throw new Error("JWT_SECRET não configurado");
}

export const authConfig = {
    jwt: {
        secret,
        expiresIn: (process.env.JWT_EXPIRES_IN ||
            "1d") as SignOptions["expiresIn"],
    },
};
