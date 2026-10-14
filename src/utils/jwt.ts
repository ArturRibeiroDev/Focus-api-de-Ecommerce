import jwt, { JwtPayload } from "jsonwebtoken";
import { authConfig } from "../config/auth.js";

const { secret, expiresIn } = authConfig.jwt;

interface TokenPayload {
    role: string;
}

export function generateToken(userId: number, role: string) {
    return jwt.sign(
        {
            role,
        },
        secret,
        {
            subject: String(userId),
            expiresIn: expiresIn,
        },
    );
}

export function verifyToken(token: string) {
    const payload = jwt.verify(token, secret);

    if (typeof payload === "string") {
        throw new Error("Token inválido");
    }

    return payload as JwtPayload & TokenPayload;
}
