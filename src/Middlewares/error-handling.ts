import { ZodError } from "zod";
import { AppError } from "../errors/AppError.js";
import { Request, Response, NextFunction } from "express";

function errorHandling(
    error: any,
    request: Request,
    response: Response,
    _: NextFunction,
) {
    if (error instanceof AppError) {
        return response.status(error.statusCode).json({
            error: {
                code: error.code,
                message: error.message,
            },
        });
    }

    if (error instanceof ZodError) {
        return response.status(400).json({
            error: {
                code: "VALIDATION_ERROR",
                message: "Dados inválidos.",
                details: error.flatten(),
            },
        });
    }

    console.error("Internal error:", error);

    return response.status(500).json({
        error: {
            code: "INTERNAL_ERROR",
            message: "Erro interno do servidor.",
        },
    });
}

export { errorHandling };
