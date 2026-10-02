import { z } from "zod";

export const registerSchema = z.object({
    body: z.object({
        name: z
            .string()
            .trim()
            .min(3, "O nome precisa ter pelo menos 3 carácteres."),
        email: z.string().email("E-mail inválido."),
        password: z
            .string()
            .trim()
            .min(8, "A senha tem que ter pelo menos 8 carácteres."),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(1),
    }),
});
