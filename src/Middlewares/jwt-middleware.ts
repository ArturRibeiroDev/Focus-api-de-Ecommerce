import {
  NextFunction,
  Request,
  Response,
} from "express";

import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../errors/AppError.js";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorization =
    req.headers.authorization;

  if (!authorization) {
    throw new AppError(
      "Token não informado",
      401
    );
  }

  const [type, token] =
    authorization.split(" ");

  if (type !== "Bearer" || !token) {
    throw new AppError(
      "Token inválido",
      401
    );
  }

  try {
    const payload = verifyToken(token);

    if (!payload.sub) {
      throw new AppError(
        "Token inválido",
        401
      );
    }

    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch {
    throw new AppError(
      "Token inválido ou expirado",
      401
    );
  }
}